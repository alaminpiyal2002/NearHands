from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase

from services.models import Category
from .models import ServiceRequest
from .tasks import expire_old_service_requests

from django.test import override_settings

User = get_user_model()


@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }
)

class ServiceRequestAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name="Home Services",
            slug="home-services",
        )

        self.customer = User.objects.create_user(
            email="customer@example.com",
            username="customer",
            password="TestPass123",
        )
        self.customer.profile.role = "customer"
        self.customer.profile.display_name = "Test Customer"
        self.customer.profile.location = "Dhaka"
        self.customer.profile.save()

        self.provider = User.objects.create_user(
            email="provider@example.com",
            username="provider",
            password="TestPass123",
        )
        self.provider.profile.role = "provider"
        self.provider.profile.display_name = "Test Provider"
        self.provider.profile.location = "Dhaka"
        self.provider.profile.save()

        self.other_customer = User.objects.create_user(
            email="other@example.com",
            username="othercustomer",
            password="TestPass123",
        )
        self.other_customer.profile.role = "customer"
        self.other_customer.profile.display_name = "Other Customer"
        self.other_customer.profile.location = "Chittagong"
        self.other_customer.profile.save()

        self.request_payload = {
            "title": "Need a plumber",
            "description": "Kitchen sink is leaking.",
            "category": self.category.id,
            "budget_min": "500.00",
            "budget_max": "1500.00",
            "deadline": (timezone.localdate() + timedelta(days=7)).isoformat(),
        }

    def test_customer_can_create_service_request(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post("/api/v1/requests/", self.request_payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["title"], "Need a plumber")
        self.assertEqual(response.data["status"], ServiceRequest.STATUS_OPEN)
        self.assertEqual(ServiceRequest.objects.count(), 1)
        self.assertEqual(ServiceRequest.objects.first().customer, self.customer)

    def test_provider_cannot_create_service_request(self):
        self.client.force_authenticate(user=self.provider)

        response = self.client.post("/api/v1/requests/", self.request_payload, format="json")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(ServiceRequest.objects.count(), 0)

    def test_guest_can_list_open_service_requests(self):
        ServiceRequest.objects.create(
            customer=self.customer,
            title="Need electrician",
            description="Fan installation needed.",
            category=self.category,
            budget_min="700.00",
            budget_max="1800.00",
            deadline=timezone.localdate() + timedelta(days=10),
        )

        response = self.client.get("/api/v1/requests/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)

    def test_my_requests_returns_only_logged_in_customers_requests(self):
        own_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Own request",
            description="This belongs to customer.",
            category=self.category,
        )
        ServiceRequest.objects.create(
            customer=self.other_customer,
            title="Other request",
            description="This belongs to another customer.",
            category=self.category,
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.get("/api/v1/requests/my/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        #self.assertEqual(len(response.data), 1)

    def test_owner_can_update_service_request(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need plumber",
            description="Leak repair.",
            category=self.category,
            budget_min="500.00",
            budget_max="1000.00",
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.patch(
            f"/api/v1/requests/{service_request.id}/",
            {"budget_max": "1200.00"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["budget_max"], "1200.00")

    def test_non_owner_cannot_update_service_request(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need plumber",
            description="Leak repair.",
            category=self.category,
        )

        self.client.force_authenticate(user=self.other_customer)

        response = self.client.patch(
            f"/api/v1/requests/{service_request.id}/",
            {"title": "Changed title"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_customer_can_mark_request_fulfilled(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need cleaner",
            description="Apartment cleaning.",
            category=self.category,
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.patch(
            f"/api/v1/requests/{service_request.id}/",
            {"status": ServiceRequest.STATUS_FULFILLED},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], ServiceRequest.STATUS_FULFILLED)

    def test_customer_cannot_manually_expire_request(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need cleaner",
            description="Apartment cleaning.",
            category=self.category,
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.patch(
            f"/api/v1/requests/{service_request.id}/",
            {"status": ServiceRequest.STATUS_EXPIRED},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_provider_can_respond_to_open_request(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need electrician",
            description="Fan installation.",
            category=self.category,
        )

        self.client.force_authenticate(user=self.provider)

        response = self.client.post(f"/api/v1/requests/{service_request.id}/respond/")

        service_request.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(service_request.response_count, 1)

    def test_customer_cannot_respond_to_request(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need electrician",
            description="Fan installation.",
            category=self.category,
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.post(f"/api/v1/requests/{service_request.id}/respond/")

        self.assertEqual(response.status_code, 403)

    def test_provider_cannot_respond_to_fulfilled_request(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need electrician",
            description="Fan installation.",
            category=self.category,
            status=ServiceRequest.STATUS_FULFILLED,
        )

        self.client.force_authenticate(user=self.provider)

        response = self.client.post(f"/api/v1/requests/{service_request.id}/respond/")

        self.assertEqual(response.status_code, 404)

    def test_budget_max_must_be_greater_than_or_equal_to_budget_min(self):
        self.client.force_authenticate(user=self.customer)

        payload = {
            **self.request_payload,
            "budget_min": "2000.00",
            "budget_max": "1000.00",
        }

        response = self.client.post("/api/v1/requests/", payload, format="json")

        self.assertEqual(response.status_code, 400)

    def test_deadline_must_be_future_date(self):
        self.client.force_authenticate(user=self.customer)

        payload = {
            **self.request_payload,
            "deadline": timezone.localdate().isoformat(),
        }

        response = self.client.post("/api/v1/requests/", payload, format="json")

        self.assertEqual(response.status_code, 400)

    def test_search_service_requests_by_title(self):
        ServiceRequest.objects.create(
            customer=self.customer,
            title="Need plumber urgently",
            description="Kitchen sink repair.",
            category=self.category,
        )
        ServiceRequest.objects.create(
            customer=self.customer,
            title="Need tutor",
            description="Math lessons.",
            category=self.category,
        )

        response = self.client.get("/api/v1/requests/?search=plumber")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Need plumber urgently")
    
    def test_expire_old_service_requests_marks_only_expired_open_requests(self):
        old_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Old request",
            description="This request should expire.",
            category=self.category,
            expires_at=timezone.now() - timedelta(days=1),
        )
    
        future_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Future request",
            description="This request should stay open.",
            category=self.category,
            expires_at=timezone.now() + timedelta(days=1),
        )
    
        fulfilled_old_request = ServiceRequest.objects.create(
                customer=self.customer,
            title="Already fulfilled request",
            description="This request should not be changed.",
            category=self.category,
            status=ServiceRequest.STATUS_FULFILLED,
            expires_at=timezone.now() - timedelta(days=1),
        )

        updated_count = expire_old_service_requests()
        self.assertTrue(
            self.customer.notifications.filter(
                type="expiry_warning",
                title="Service request expired",
            ).exists()
        )

        old_request.refresh_from_db()
        future_request.refresh_from_db()
        fulfilled_old_request.refresh_from_db()

        self.assertEqual(updated_count, 1)
        self.assertEqual(old_request.status, ServiceRequest.STATUS_EXPIRED)
        self.assertEqual(future_request.status, ServiceRequest.STATUS_OPEN)
        self.assertEqual(fulfilled_old_request.status, ServiceRequest.STATUS_FULFILLED)

    def test_provider_response_creates_customer_notification(self):
        service_request = ServiceRequest.objects.create(
            customer=self.customer,
            title="Need electrician",
            description="Fix wiring issue.",
            category=self.category,
            budget_min=500,
            budget_max=1500,
        )

        self.client.force_authenticate(user=self.provider)

        response = self.client.post(
            f"/api/v1/requests/{service_request.id}/respond/"
        )

        self.assertEqual(response.status_code, 200)

        self.assertTrue(
            self.customer.notifications.filter(
                type="request_response",
                title="New response to your request",
            ).exists()
        )        