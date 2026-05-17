from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import ServiceRequest
from .permissions import IsCustomerOrReadOnly, IsProvider, IsRequestOwnerOrAdminOrReadOnly
from .serializers import ServiceRequestSerializer

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .filters import ServiceRequestFilter

from notifications.models import Notification
from notifications.utils import create_notification

class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ServiceRequestFilter
    search_fields = ["title", "description"]
    ordering_fields = [
        "created_at",
        "budget_min",
        "budget_max",
        "deadline",
        "response_count",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and user.is_staff:
            return ServiceRequest.objects.all()

        if self.action == "my":
            return ServiceRequest.objects.filter(customer=user)

        return ServiceRequest.objects.filter(status=ServiceRequest.STATUS_OPEN)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            permission_classes = [AllowAny]
        elif self.action == "my":
            permission_classes = [IsAuthenticated]
        elif self.action == "respond":
            permission_classes = [IsProvider]
        else:
            permission_classes = [
                IsAuthenticated,
                IsCustomerOrReadOnly,
                IsRequestOwnerOrAdminOrReadOnly,
            ]

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def perform_destroy(self, instance):
        instance.delete()

    @action(detail=False, methods=["get"], url_path="my")
    def my(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="respond")
    def respond(self, request, pk=None):
        service_request = self.get_object()

        if service_request.status != ServiceRequest.STATUS_OPEN:
            return Response(
                {
                    "detail": "You can only respond to open service requests."
                },
                status=400,
            )

        service_request.response_count += 1
        service_request.save(update_fields=["response_count"])
        
        create_notification(
           recipient=service_request.customer,
           notification_type=Notification.NotificationType.REQUEST_RESPONSE,
           title=f"New response to your request",
           body=f"{request.user.username} responded to your request: {service_request.title}",
           link=f"/requests/{service_request.id}/",
       )

        return Response(
            {
                "detail": "Response recorded successfully.",
                "request_id": service_request.id,
                "response_count": service_request.response_count,
            }
        )