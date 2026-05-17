from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import override_settings
from rest_framework.test import APITestCase

from .models import Review


User = get_user_model()


@override_settings(
    CHANNEL_LAYERS={
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer",
        }
    }
)
class ReviewAPITests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="customer@example.com",
            username="customer",
            password="testpass123",
        )
        self.customer.profile.role = "customer"
        self.customer.profile.display_name = "Test Customer"
        self.customer.profile.save()

        self.provider = User.objects.create_user(
            email="provider@example.com",
            username="provider",
            password="testpass123",
        )
        self.provider.profile.role = "provider"
        self.provider.profile.display_name = "Test Provider"
        self.provider.profile.save()

        self.other_provider = User.objects.create_user(
            email="otherprovider@example.com",
            username="otherprovider",
            password="testpass123",
        )
        self.other_provider.profile.role = "provider"
        self.other_provider.profile.display_name = "Other Provider"
        self.other_provider.profile.save()

        self.other_customer = User.objects.create_user(
            email="othercustomer@example.com",
            username="othercustomer",
            password="testpass123",
        )
        self.other_customer.profile.role = "customer"
        self.other_customer.profile.display_name = "Other Customer"
        self.other_customer.profile.save()

        self.admin = User.objects.create_superuser(
            email="admin@example.com",
            username="admin",
            password="testpass123",
        )

    def test_customer_can_create_review_for_provider(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "provider": self.provider.id,
                "rating": 5,
                "comment": "Excellent service.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["rating"], 5)
        self.assertEqual(response.data["provider"], self.provider.id)
        self.assertEqual(response.data["customer"], self.customer.id)

    def test_provider_cannot_create_review(self):
        self.client.force_authenticate(user=self.provider)

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "provider": self.other_provider.id,
                "rating": 4,
                "comment": "Good work.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_customer_cannot_review_self(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "provider": self.customer.id,
                "rating": 5,
                "comment": "Self review.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_customer_cannot_review_non_provider_user(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "provider": self.other_customer.id,
                "rating": 5,
                "comment": "Not a provider.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_duplicate_review_is_blocked(self):
        Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="First review.",
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "provider": self.provider.id,
                "rating": 4,
                "comment": "Second review.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_guest_can_list_visible_reviews(self):
        Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Visible review.",
        )

        response = self.client.get("/api/v1/reviews/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["comment"], "Visible review.")

    def test_filter_reviews_by_provider(self):
        Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Provider review.",
        )
        Review.objects.create(
            provider=self.other_provider,
            customer=self.other_customer,
            rating=4,
            comment="Other provider review.",
        )

        response = self.client.get(f"/api/v1/reviews/?provider={self.provider.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["provider"], self.provider.id)

    def test_provider_can_respond_to_own_review(self):
        review = Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Great.",
        )

        self.client.force_authenticate(user=self.provider)

        response = self.client.patch(
            f"/api/v1/reviews/{review.id}/respond/",
            {
                "response": "Thank you for your review.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["response"], "Thank you for your review.")

    def test_other_provider_cannot_respond_to_review(self):
        review = Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Great.",
        )

        self.client.force_authenticate(user=self.other_provider)

        response = self.client.patch(
            f"/api/v1/reviews/{review.id}/respond/",
            {
                "response": "Wrong provider response.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_admin_can_soft_hide_review(self):
        review = Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Review to hide.",
        )

        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/v1/reviews/{review.id}/")

        self.assertEqual(response.status_code, 204)

        review.refresh_from_db()
        self.assertFalse(review.is_visible)

    def test_normal_user_cannot_delete_review(self):
        review = Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Review.",
        )

        self.client.force_authenticate(user=self.customer)

        response = self.client.delete(f"/api/v1/reviews/{review.id}/")

        self.assertEqual(response.status_code, 403)

    def test_review_updates_provider_rating_and_count(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "provider": self.provider.id,
                "rating": 4,
                "comment": "Good service.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.provider.profile.refresh_from_db()
        self.assertEqual(float(self.provider.profile.average_rating), 4.0)
        self.assertEqual(self.provider.profile.review_count, 1)

    def test_provider_rating_uses_only_visible_reviews(self):
        Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Visible review.",
        )

        hidden_review = Review.objects.create(
            provider=self.provider,
            customer=self.other_customer,
            rating=1,
            comment="Hidden review.",
            is_visible=False,
        )

        self.provider.profile.refresh_from_db()

        self.assertEqual(float(self.provider.profile.average_rating), 5.0)
        self.assertEqual(self.provider.profile.review_count, 1)

    def test_review_creation_creates_provider_notification(self):
        self.client.force_authenticate(user=self.customer)

        response = self.client.post(
            "/api/v1/reviews/",
            {
                "provider": self.provider.id,
                "rating": 5,
                "comment": "Excellent service.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

        self.assertTrue(
            self.provider.notifications.filter(
                type="review",
                title="New review received",
            ).exists()
        ) 
        
    def test_admin_soft_hide_updates_provider_rating(self):
        Review.objects.create(
            provider=self.provider,
            customer=self.customer,
            rating=5,
            comment="Great review.",
        )

        review_to_hide = Review.objects.create(
            provider=self.provider,
            customer=self.other_customer,
            rating=1,
            comment="Bad review to hide.",
        )

        self.provider.profile.refresh_from_db()
        self.assertEqual(float(self.provider.profile.average_rating), 3.0)
        self.assertEqual(self.provider.profile.review_count, 2)

        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(f"/api/v1/reviews/{review_to_hide.id}/")

        self.assertEqual(response.status_code, 204)

        self.provider.profile.refresh_from_db()
        self.assertEqual(float(self.provider.profile.average_rating), 5.0)
        self.assertEqual(self.provider.profile.review_count, 1)       