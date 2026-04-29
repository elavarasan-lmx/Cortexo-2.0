/// Cortexo Flutter SDK
/// Version: 1.0.0
///
/// Error monitoring and tracking for Flutter applications.
///
/// Usage in main.dart:
/// ```dart
/// import 'package:cortexo_sdk/cortexo_sdk.dart';
///
/// void main() {
///   Cortexo.init(
///     apiKey: 'sdk_your_api_key_here',
///     environment: 'production',
///   );
///
///   // Capture all Flutter framework errors
///   FlutterError.onError = Cortexo.onFlutterError;
///
///   // Capture all Dart errors
///   runZonedGuarded(() {
///     runApp(const MyApp());
///   }, Cortexo.onDartError);
/// }
/// ```

library cortexo_sdk;

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

/// Main Cortexo SDK class
class Cortexo {
  static String? _apiKey;
  static String _endpoint = 'https://api.cortexo.io/v1/ingest/error';
  static String _environment = 'production';
  static String? _release;
  static bool _initialized = false;
  static final List<Map<String, dynamic>> _breadcrumbs = [];
  static Map<String, dynamic>? _userContext;
  static final Map<String, String> _tags = {};

  static const String _sdkVersion = '1.0.0';

  /// Initialize the Cortexo SDK.
  /// Call this early in main() before runApp().
  static void init({
    required String apiKey,
    String? endpoint,
    String environment = 'production',
    String? release,
    bool captureFlutterErrors = true,
  }) {
    _apiKey = apiKey;
    _environment = environment;
    _release = release;
    if (endpoint != null) _endpoint = endpoint;

    if (captureFlutterErrors) {
      final originalOnError = FlutterError.onError;
      FlutterError.onError = (FlutterErrorDetails details) {
        originalOnError?.call(details);
        _captureFlutterError(details);
      };
    }

    _initialized = true;
    _addBreadcrumb('Cortexo SDK initialized', category: 'sdk');

    if (kDebugMode) {
      print('[Cortexo] Initialized for $environment');
    }
  }

  /// Set the current user context (call after login)
  static void setUser({String? id, String? email, String? name}) {
    _userContext = {
      if (id != null) 'id': id,
      if (email != null) 'email': email,
      if (name != null) 'name': name,
    };
  }

  /// Add global tags included with every event
  static void setTag(String key, String value) {
    _tags[key] = value;
  }

  /// Add a breadcrumb to the trail (max 20 stored)
  static void addBreadcrumb(String message, {String? category, Map<String, dynamic>? data}) {
    _addBreadcrumb(message, category: category, data: data);
  }

  /// Flutter framework error handler — assign to FlutterError.onError
  static void onFlutterError(FlutterErrorDetails details) {
    _captureFlutterError(details);
  }

  /// Dart zone error handler — use in runZonedGuarded second argument
  static void onDartError(Object error, StackTrace stack) {
    captureException(error, stackTrace: stack);
  }

  /// Capture an exception manually
  static Future<String?> captureException(
    Object exception, {
    StackTrace? stackTrace,
    String severity = 'error',
    Map<String, dynamic>? extra,
  }) async {
    if (!_initialized || _apiKey == null) {
      debugPrint('[Cortexo] Not initialized. Call Cortexo.init() first.');
      return null;
    }

    final type = exception.runtimeType.toString();
    final message = exception.toString();
    final stack = stackTrace?.toString();

    return _send(
      type: type,
      message: message,
      stackTrace: stack,
      severity: severity,
      extra: extra,
    );
  }

  /// Capture a manual message
  static Future<String?> captureMessage(
    String message, {
    String severity = 'info',
    Map<String, dynamic>? context,
  }) async {
    if (!_initialized || _apiKey == null) return null;
    return _send(type: 'Message', message: message, severity: severity, extra: context);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  static void _captureFlutterError(FlutterErrorDetails details) {
    _send(
      type: details.exception.runtimeType.toString(),
      message: details.exceptionAsString(),
      stackTrace: details.stack?.toString(),
      severity: 'error',
    );
  }

  static void _addBreadcrumb(
    String message, {
    String? category,
    Map<String, dynamic>? data,
  }) {
    _breadcrumbs.add({
      'message': message,
      'category': category ?? 'log',
      if (data != null) 'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    });
    if (_breadcrumbs.length > 20) {
      _breadcrumbs.removeAt(0);
    }
  }

  static Future<String?> _send({
    required String type,
    required String message,
    String? stackTrace,
    String? file,
    int? line,
    String severity = 'error',
    Map<String, dynamic>? extra,
  }) async {
    try {
      final payload = <String, dynamic>{
        'type': type,
        'message': message,
        'severity': severity,
        'environment': _environment,
        if (_release != null) 'release': _release,
        if (stackTrace != null) 'stackTrace': stackTrace,
        if (file != null) 'file': file,
        if (line != null) 'line': line,
        'context': {
          ..._tags,
          ...?extra,
          'platform': _getPlatform(),
          'dartVersion': Platform.version,
          'isDebug': kDebugMode,
        },
        if (_breadcrumbs.isNotEmpty) 'breadcrumbs': List.from(_breadcrumbs),
        if (_userContext != null) 'userContext': _userContext,
        'sdkVersion': _sdkVersion,
        'serverName': Platform.localHostname,
      };

      final response = await http.post(
        Uri.parse(_endpoint),
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': _apiKey!,
          'User-Agent': 'Cortexo-Flutter/$_sdkVersion',
        },
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 202) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        return data['errorId'] as String?;
      }
    } catch (e) {
      // SDK must never crash the app
      if (kDebugMode) debugPrint('[Cortexo] Failed to send event: $e');
    }
    return null;
  }

  static String _getPlatform() {
    if (kIsWeb) return 'web';
    if (Platform.isAndroid) return 'android';
    if (Platform.isIOS) return 'ios';
    if (Platform.isLinux) return 'linux';
    if (Platform.isMacOS) return 'macos';
    if (Platform.isWindows) return 'windows';
    return 'unknown';
  }
}
