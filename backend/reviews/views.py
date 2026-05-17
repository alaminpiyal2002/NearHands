from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import Review
from .permissions import IsAdminOnly, IsCustomerOrReadOnly, IsReviewProviderOrAdmin
from .serializers import ReviewResponseSerializer, ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsCustomerOrReadOnly]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = Review.objects.select_related(
            "provider",
            "customer",
        )

        if self.request.user.is_authenticated and self.request.user.is_staff:
            return queryset

        return queryset.filter(is_visible=True)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticatedOrReadOnly()]

        if self.action == "respond":
            return [IsReviewProviderOrAdmin()]

        if self.action == "destroy":
            return [IsAdminOnly()]

        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def list(self, request, *args, **kwargs):
        provider_id = request.query_params.get("provider")

        queryset = self.filter_queryset(self.get_queryset())

        if provider_id:
            queryset = queryset.filter(provider_id=provider_id)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="respond")
    def respond(self, request, pk=None):
        review = self.get_object()
        self.check_object_permissions(request, review)

        serializer = ReviewResponseSerializer(
            review,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            ReviewSerializer(review, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        review.is_visible = False
        review.save(update_fields=["is_visible"])

        return Response(status=status.HTTP_204_NO_CONTENT)