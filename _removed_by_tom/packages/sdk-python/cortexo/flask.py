"""
Cortexo Flask Integration
Usage:
    from cortexo.flask import CortexoFlask
    CortexoFlask(app, api_key="ctx_proj_xxx")
"""
import cortexo

class CortexoFlask:
    def __init__(self, app=None, api_key=None, environment="production"):
        if app and api_key:
            self.init_app(app, api_key, environment)

    def init_app(self, app, api_key, environment="production"):
        cortexo.init(api_key=api_key, environment=environment)
        app.before_request(self._before_request)
        app.teardown_appcontext(self._teardown)
        if hasattr(app, 'errorhandler'):
            @app.errorhandler(Exception)
            def handle_exception(e):
                cortexo.capture_exception(e)
                raise e

    def _before_request(self):
        from flask import request
        cortexo.add_breadcrumb(f"{request.method} {request.path}", "http")

    def _teardown(self, exception):
        if exception:
            cortexo.capture_exception(exception)
