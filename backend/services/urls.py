from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ServiceViewSet, TagViewSet

router = DefaultRouter()

router.register("services", ServiceViewSet, basename="service")
router.register("categories", CategoryViewSet, basename="category")
router.register("tags", TagViewSet, basename="tag")

urlpatterns = router.urls