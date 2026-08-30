from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Standardize all exception responses to:
    {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable detail",
            "details": {...}
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        code = getattr(exc, 'default_code', 'API_ERROR').upper()
        
        # Extract message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
                details = {k: v for k, v in response.data.items() if k != 'detail'}
            else:
                message = "Validation or processing error occurred."
                details = response.data
        elif isinstance(response.data, list):
            message = response.data[0] if response.data else "An error occurred."
            details = {"errors": response.data}
        else:
            message = str(response.data)
            details = {}

        response.data = {
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": details if details else None
            }
        }

    return response
