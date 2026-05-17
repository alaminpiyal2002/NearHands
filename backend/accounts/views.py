from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from .models import Profile

from .serializers import (
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
    PublicProfileSerializer
)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "status": "success",
                    "data": {
                        "user": UserSerializer(user).data,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "status": "error",
                "code": "VALIDATION_ERROR",
                "detail": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class PublicProfileDetailView(RetrieveAPIView):
    serializer_class = PublicProfileSerializer
    permission_classes = [AllowAny]
    lookup_field = "user_id"

    def get_queryset(self):
        return Profile.objects.select_related("user").filter(role="provider")
    

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "status": "success",
                    "data": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                        "user": UserSerializer(user).data,
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": "error",
                "code": "AUTHENTICATION_FAILED",
                "detail": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {
                    "status": "error",
                    "code": "REFRESH_TOKEN_REQUIRED",
                    "detail": "Refresh token is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            return Response(
                {
                    "status": "error",
                    "code": "INVALID_REFRESH_TOKEN",
                    "detail": "Refresh token is invalid or already blacklisted.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "status": "success",
                "data": {
                    "message": "Logged out successfully.",
                },
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "status": "success",
                "data": {
                    "user": UserSerializer(request.user).data,
                },
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user.profile,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": "success",
                    "data": {
                        "user": UserSerializer(request.user).data,
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": "error",
                "code": "VALIDATION_ERROR",
                "detail": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )







User = get_user_model()


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    "status": "error",
                    "code": "VALIDATION_ERROR",
                    "detail": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)

            reset_link = (
                f"{settings.FRONTEND_URL}/password-reset/confirm"
                f"?uid={uid}&token={token}"
            )

            send_mail(
                subject="Reset your NearHands password",
                message=(
                    "You requested a password reset for your NearHands account.\n\n"
                    f"Reset link: {reset_link}\n\n"
                    "If you did not request this, you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(
            {
                "status": "success",
                "data": {
                    "message": "If an account exists with this email, a password reset link has been sent.",
                },
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "status": "success",
                    "data": {
                        "message": "Password has been reset successfully.",
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "status": "error",
                "code": "VALIDATION_ERROR",
                "detail": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
