"""
Cortexo Python SDK
Error tracking for Django, Flask, and Python applications

Usage:
    import cortexo
    cortexo.init(api_key="ctx_proj_xxx", environment="production")

Django:
    MIDDLEWARE = ['cortexo.django.CortexoMiddleware']

Flask:
    from cortexo.flask import CortexoFlask
    CortexoFlask(app, api_key="ctx_proj_xxx")
"""

import sys
import os
import json
import traceback
import threading
from datetime import datetime, timezone
from urllib.request import Request, urlopen
from urllib.error import URLError
from typing import Optional, Dict, Any, List, Callable

__version__ = "1.0.0"


class _Breadcrumb:
    def __init__(self, message: str, category: str = "default", data: Optional[Dict] = None):
        self.message = message
        self.category = category
        self.data = data or {}
        self.timestamp = datetime.now(timezone.utc).isoformat()


class CortexoSDK:
    def __init__(self):
        self._api_key: str = ""
        self._endpoint: str = "https://ingest.cortexo.io/v1/errors"
        self._environment: str = "production"
        self._release: Optional[str] = None
        self._breadcrumbs: List[_Breadcrumb] = []
        self._max_breadcrumbs: int = 50
        self._user: Optional[Dict[str, Any]] = None
        self._tags: Dict[str, str] = {}
        self._initialized: bool = False
        self._before_send: Optional[Callable] = None
        self._original_excepthook = None

    def init(
        self,
        api_key: str,
        environment: str = "production",
        release: Optional[str] = None,
        endpoint: Optional[str] = None,
        max_breadcrumbs: int = 50,
        before_send: Optional[Callable] = None,
    ) -> None:
        """Initialize the Cortexo SDK."""
        self._api_key = api_key
        self._environment = environment
        self._release = release
        self._max_breadcrumbs = max_breadcrumbs
        self._before_send = before_send

        if endpoint:
            self._endpoint = endpoint

        if not self._api_key:
            print("[Cortexo] Warning: Missing API key", file=sys.stderr)
            return

        # Install global exception hook
        self._original_excepthook = sys.excepthook
        sys.excepthook = self._excepthook

        self._initialized = True
        self.add_breadcrumb("Cortexo Python SDK initialized", "sdk")

    def capture_exception(self, exc: BaseException, extra: Optional[Dict] = None) -> None:
        """Capture an exception."""
        if not self._initialized:
            return

        event = self._build_event(
            exc_type=type(exc).__name__,
            message=str(exc),
            stack_trace=traceback.format_exception(type(exc), exc, exc.__traceback__),
            severity="error",
            extra=extra,
        )
        self._send(event)

    def capture_message(self, message: str, level: str = "info") -> None:
        """Capture a message."""
        if not self._initialized:
            return

        event = self._build_event(
            exc_type="Message",
            message=message,
            severity=level,
        )
        self._send(event)

    def add_breadcrumb(self, message: str, category: str = "default", data: Optional[Dict] = None) -> None:
        """Add a breadcrumb."""
        self._breadcrumbs.append(_Breadcrumb(message, category, data))
        if len(self._breadcrumbs) > self._max_breadcrumbs:
            self._breadcrumbs = self._breadcrumbs[-self._max_breadcrumbs:]

    def set_user(self, user: Dict[str, Any]) -> None:
        """Set user context."""
        self._user = user

    def set_tag(self, key: str, value: str) -> None:
        """Set a tag."""
        self._tags[key] = value

    def set_release(self, release: str) -> None:
        """Set release version."""
        self._release = release

    # ─── Private ───

    def _excepthook(self, exc_type, exc_value, exc_tb):
        """Global exception hook."""
        self.capture_exception(exc_value)
        if self._original_excepthook:
            self._original_excepthook(exc_type, exc_value, exc_tb)

    def _build_event(
        self,
        exc_type: str,
        message: str,
        stack_trace: Optional[List[str]] = None,
        severity: str = "error",
        extra: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        return {
            "type": exc_type,
            "message": message,
            "stack_trace": "".join(stack_trace) if stack_trace else None,
            "severity": severity,
            "context": {
                "python_version": sys.version,
                "platform": sys.platform,
                "cwd": os.getcwd(),
            },
            "breadcrumbs": [
                {"message": b.message, "category": b.category, "data": b.data, "timestamp": b.timestamp}
                for b in self._breadcrumbs
            ],
            "environment": self._environment,
            "release": self._release,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "runtime": "python",
            "user": self._user,
            "tags": dict(self._tags),
            "extra": extra,
        }

    def _send(self, event: Dict[str, Any]) -> None:
        if self._before_send:
            event = self._before_send(event)
            if event is None:
                return

        def _do_send():
            try:
                payload = json.dumps(event).encode("utf-8")
                req = Request(
                    self._endpoint,
                    data=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-API-Key": self._api_key,
                    },
                    method="POST",
                )
                urlopen(req, timeout=2)
            except (URLError, Exception):
                pass  # SDK errors never crash user app

        # Send async to avoid blocking
        threading.Thread(target=_do_send, daemon=True).start()


# Singleton
_sdk = CortexoSDK()

# Module-level convenience functions
init = _sdk.init
capture_exception = _sdk.capture_exception
capture_message = _sdk.capture_message
add_breadcrumb = _sdk.add_breadcrumb
set_user = _sdk.set_user
set_tag = _sdk.set_tag
set_release = _sdk.set_release
