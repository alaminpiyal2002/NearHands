from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Convert DRF errors into the NearHands standard API error format.
    """

    response = exception_handler(exc, context)

    if response is None:
        return response

    error_code = getattr(exc, "default_code", "error")

    response.data = {
        "status": "error",
        "code": str(error_code).upper(),
        "detail": response.data,
    }

    return response