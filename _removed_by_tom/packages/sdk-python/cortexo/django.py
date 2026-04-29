"""
Cortexo Django Middleware
Usage: MIDDLEWARE = ['cortexo.django.CortexoMiddleware']
"""
import cortexo

class CortexoMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        cortexo.add_breadcrumb(f"{request.method} {request.path}", "http")
        return self.get_response(request)

    def process_exception(self, request, exception):
        cortexo.capture_exception(exception, extra={
            "request": {"method": request.method, "path": request.path}
        })
        return None
