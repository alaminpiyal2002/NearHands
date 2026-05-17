from django.db.models import F
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category, Service, Tag
from .permissions import IsProviderOrReadOnly, IsServiceOwnerOrAdminOrReadOnly
from .serializers import CategorySerializer, ServiceSerializer, TagSerializer

from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from .filters import ServiceFilter

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    filter_backends = [
       DjangoFilterBackend,
       SearchFilter,
       OrderingFilter,
    ]
    filterset_class = ServiceFilter
    search_fields = [
       "title",
       "description",
       ]
    ordering_fields = [
       "created_at",
       "price",
       "provider__profile__average_rating",
       "view_count",
    ]
    ordering = ["-created_at"]

    permission_classes = [
        IsProviderOrReadOnly,
        IsServiceOwnerOrAdminOrReadOnly,
    ]

    def get_queryset(self):
        queryset = (
            Service.objects
            .select_related("provider", "provider__profile", "category")
            .prefetch_related("tags")
        )

        if self.action == "my":
            return queryset.filter(
                provider=self.request.user,
                is_deleted=False,
            )

        if self.action in ["list", "retrieve"]:
            return queryset.filter(
                is_active=True,
                is_deleted=False,
            )

        return queryset.filter(is_deleted=False)

    def get_permissions(self):
        if self.action == "my":
            return [IsAuthenticated()]

        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(provider=self.request.user)

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.is_active = False
        instance.save(update_fields=["is_deleted", "is_active", "updated_at"])

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        Service.objects.filter(pk=instance.pk).update(
            view_count=F("view_count") + 1
        )

        instance.refresh_from_db(fields=["view_count"])

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="my")
    def my(self, request):
        profile = getattr(request.user, "profile", None)

        if not request.user.is_staff and (
            profile is None or profile.role != "provider"
        ):
            raise PermissionDenied(
                "Only providers can view their own service listings."
            )

        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)

        return Response(
            {
                "status": "success",
                "data": serializer.data,
            },
            status=status.HTTP_200_OK,
        )