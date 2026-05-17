from urllib.parse import parse_qs, urlparse

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings

from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Profile


User = get_user_model()


class AuthAPITests(APITestCase):
    def authenticate_user(self, user):
        refresh = RefreshToken.for_user(user)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
        )

        return refresh

    def test_register_provider_success(self):
        payload = {
            "email": "provider_test@nearhands.local",
            "username": "provider_test",
            "password": "testpass123",
            "role": "provider",
            "display_name": "Test Provider",
            "location": "Dhaka",
        }

        response = self.client.post(
            "/api/v1/auth/register/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["user"]["email"], payload["email"])
        self.assertEqual(response.data["data"]["user"]["profile"]["role"], "provider")

    def test_register_duplicate_email_fails(self):
        User.objects.create_user(
            email="duplicate@nearhands.local",
            username="duplicate_user",
            password="testpass123",
        )

        payload = {
            "email": "duplicate@nearhands.local",
            "username": "new_user",
            "password": "testpass123",
            "role": "customer",
            "display_name": "New User",
            "location": "Dhaka",
        }

        response = self.client.post(
            "/api/v1/auth/register/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["status"], "error")

    def test_login_with_email_success(self):
        user = User.objects.create_user(
            email="login_email@nearhands.local",
            username="login_email_user",
            password="testpass123",
        )

        Profile.objects.filter(user=user).update(
            role=Profile.Role.PROVIDER,
            display_name="Login Email User",
            location="Dhaka",
        )

        payload = {
            "identifier": "login_email@nearhands.local",
            "password": "testpass123",
        }

        response = self.client.post(
            "/api/v1/auth/login/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        self.assertIn("access", response.data["data"])
        self.assertIn("refresh", response.data["data"])

    def test_login_with_username_success(self):
        User.objects.create_user(
            email="login_username@nearhands.local",
            username="login_username_user",
            password="testpass123",
        )

        payload = {
            "identifier": "login_username_user",
            "password": "testpass123",
        }

        response = self.client.post(
            "/api/v1/auth/login/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        self.assertIn("access", response.data["data"])

    def test_profile_requires_authentication(self):
        response = self.client.get("/api/v1/auth/profile/")

        self.assertEqual(response.status_code, 401)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_request_sends_email(self):
        User.objects.create_user(
            email="reset_user@nearhands.local",
            username="reset_user",
            password="OldPass123!",
        )

        payload = {
            "email": "reset_user@nearhands.local",
        }

        response = self.client.post(
            "/api/v1/auth/password-reset/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Reset your NearHands password", mail.outbox[0].subject)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_password_reset_confirm_changes_password(self):
        user = User.objects.create_user(
            email="confirm_reset@nearhands.local",
            username="confirm_reset",
            password="OldPass123!",
        )

        request_payload = {
            "email": "confirm_reset@nearhands.local",
        }

        self.client.post(
            "/api/v1/auth/password-reset/",
            request_payload,
            format="json",
        )

        email_body = mail.outbox[0].body

        reset_link = email_body.split("Reset link: ")[1].split("\n")[0]
        query_params = parse_qs(urlparse(reset_link).query)

        uid = query_params["uid"][0]
        token = query_params["token"][0]

        confirm_payload = {
            "uid": uid,
            "token": token,
            "new_password": "NewStrongPass123!",
        }

        response = self.client.post(
            "/api/v1/auth/password-reset/confirm/",
            confirm_payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")

        user.refresh_from_db()
        self.assertTrue(user.check_password("NewStrongPass123!"))

    def test_profile_get_authenticated_success(self):
        user = User.objects.create_user(
            email="profile_get@nearhands.local",
            username="profile_get",
            password="testpass123",
        )

        Profile.objects.filter(user=user).update(
            role=Profile.Role.CUSTOMER,
            display_name="Profile Get User",
            location="Dhaka",
        )

        self.authenticate_user(user)

        response = self.client.get("/api/v1/auth/profile/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["user"]["email"], user.email)
        self.assertEqual(
            response.data["data"]["user"]["profile"]["display_name"],
            "Profile Get User",
        )

    def test_profile_patch_updates_profile(self):
        user = User.objects.create_user(
            email="profile_patch@nearhands.local",
            username="profile_patch",
            password="testpass123",
        )

        self.authenticate_user(user)

        payload = {
            "display_name": "Updated Name",
            "location": "Chittagong",
            "bio": "Updated profile bio.",
        }

        response = self.client.patch(
            "/api/v1/auth/profile/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(
            response.data["data"]["user"]["profile"]["display_name"],
            "Updated Name",
        )
        self.assertEqual(
            response.data["data"]["user"]["profile"]["location"],
            "Chittagong",
        )
        self.assertEqual(
            response.data["data"]["user"]["profile"]["bio"],
            "Updated profile bio.",
        )

    def test_logout_success(self):
        user = User.objects.create_user(
            email="logout_user@nearhands.local",
            username="logout_user",
            password="testpass123",
        )

        refresh = self.authenticate_user(user)

        payload = {
            "refresh": str(refresh),
        }

        response = self.client.post(
            "/api/v1/auth/logout/",
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "success")