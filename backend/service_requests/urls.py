from rest_framework.routers import DefaultRouter

from .views import ServiceRequestViewSet

router = DefaultRouter()
router.register("", ServiceRequestViewSet, basename="service-request")

urlpatterns = router.urls