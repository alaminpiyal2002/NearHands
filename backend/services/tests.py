from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Service, Tag


User = get_user_model()


class ServiceAPITests(APITestCase):
    def setUp(self):
        self.provider = User.objects.create_user(
            email="provider@example.com",
            username="provideruser",
            password="StrongPass123",
        )
        self.provider.profile.role = "provider"
        self.provider.profile.display_name = "Rahim Electrician"
        self.provider.profile.location = "Dhaka"
        self.provider.profile.save()

        self.other_provider = User.objects.create_user(
            email="other@example.com",
            username="otherprovider",
            password="StrongPass123",
        )
        self.other_provider.profile.role = "provider"
        self.other_provider.profile.save()

        self.customer = User.objects.create_user(
            email="customer@example.com",
            username="customeruser",
            password="StrongPass123",
        )
        self.customer.profile.role = "customer"
        self.customer.profile.save()

        self.category = Category.objects.create(
            name="Home Services",
            icon="home",
        )

        self.tag = Tag.objects.create(name="Electrician")

        self.service_payload = {
            "title": "Electrical repair and home wiring",
            "category_id": self.category.id,
            "description": "Safe electrical repair, wiring checks, and fan installation.",
            "pricing_type": "fixed",
            "price": "800.00",
            "location": "Dhaka",
            "tag_ids": [self.tag.id],
            "is_active": True,
        }

    def test_provider_can_create_service(self):
        self.client.force_authenticate(user=self.provider)

        response = self.client.post(
            reverse("service-list"),
            self.service_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Service.objects.count(), 1)
        self.assertEqual(Service.objects.first().provider, self.provider)

    def test_customer_cannot_create_service(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            reverse("service-list"),
            self.service_payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Service.objects.count(), 0)

    def test_guest_can_list_services(self):
        Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Electrical repair",
            description="Home electrical repair service.",
            pricing_type="fixed",
            price="800.00",
            location="Dhaka",
        )

        response = self.client.get(reverse("service-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_owner_can_update_service(self):
        service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Electrical repair",
            description="Home electrical repair service.",
            pricing_type="fixed",
            price="800.00",
            location="Dhaka",
        )

        self.client.force_authenticate(user=self.provider)

        response = self.client.patch(
            reverse("service-detail", args=[service.id]),
            {
                "price": "950.00",
            },
            format="json",
        )

        service.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(service.price), "950.00")

    def test_non_owner_cannot_update_service(self):
        service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Electrical repair",
            description="Home electrical repair service.",
            pricing_type="fixed",
            price="800.00",
            location="Dhaka",
        )

        self.client.force_authenticate(user=self.other_provider)

        response = self.client.patch(
            reverse("service-detail", args=[service.id]),
            {
                "price": "950.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_soft_delete_hides_service_from_public_list(self):
        service = Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Electrical repair",
            description="Home electrical repair service.",
            pricing_type="fixed",
            price="800.00",
            location="Dhaka",
        )

        self.client.force_authenticate(user=self.provider)

        delete_response = self.client.delete(
            reverse("service-detail", args=[service.id])
        )

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        service.refresh_from_db()

        self.assertTrue(service.is_deleted)
        self.assertFalse(service.is_active)

        self.client.force_authenticate(user=None)

        list_response = self.client.get(reverse("service-list"))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data["results"]), 0)

    def test_filter_services_by_location(self):
        Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Electrical repair",
            description="Home electrical repair service.",
            pricing_type="fixed",
            price="800.00",
            location="Dhaka",
        )

        Service.objects.create(
            provider=self.provider,
            category=self.category,
            title="Plumbing service",
            description="Bathroom plumbing support.",
            pricing_type="fixed",
            price="500.00",
            location="Chittagong",
        )

        response = self.client.get(
            reverse("service-list"),
            {
                "location": "dhaka",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["location"], "Dhaka")