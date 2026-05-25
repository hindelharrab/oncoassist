import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8080/api';
  static String? _token;

  static void setToken(String token) => _token = token;
  static String get token => _token ?? '';

  static Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_token != null && _token!.isNotEmpty)
      'Authorization': 'Bearer $_token',
  };

  // ── GET ───────────────────────────────────────────
  static Future<dynamic> get(String endpoint) async {
    final response = await http.get(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
    );
    return _handle(response);
  }

  // ── POST ──────────────────────────────────────────
  static Future<dynamic> post(
      String endpoint, Map<String, dynamic> body) async {
    final response = await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handle(response);
  }

  // ── PUT JSON ──────────────────────────────────────
  static Future<dynamic> put(
      String endpoint, Map<String, dynamic> body) async {
    final response = await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
      body: jsonEncode(body),
    );
    return _handle(response);
  }

  // ── PUT Multipart (photo profil + champs texte) ───
  static Future<dynamic> putMultipart(
      String endpoint, {
        Map<String, String>? fields,
        File? photo,
      }) async {
    final uri = Uri.parse('$baseUrl$endpoint');
    final request = http.MultipartRequest('PUT', uri);

    if (_token != null && _token!.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $_token';
    }

    if (fields != null) {
      fields.forEach((key, value) {
        if (value.isNotEmpty) request.fields[key] = value;
      });
    }

    if (photo != null) {
      final ext = photo.path.split('.').last.toLowerCase();
      final mime = ext == 'png' ? 'image/png' : 'image/jpeg';
      final multipartFile = await http.MultipartFile.fromPath(
        'photo',
        photo.path,
      );
      request.files.add(multipartFile);
      request.headers['Content-Type'] = 'multipart/form-data';
    }

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    return _handle(response);
  }

  // ── DELETE ────────────────────────────────────────
  static Future<dynamic> delete(String endpoint) async {
    final response = await http.delete(
      Uri.parse('$baseUrl$endpoint'),
      headers: _headers,
    );
    return _handle(response);
  }

  // ── Handler ───────────────────────────────────────
  static dynamic _handle(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(utf8.decode(response.bodyBytes));
    } else if (response.statusCode == 401) {
      throw Exception('Non autorisé — token invalide');
    } else if (response.statusCode == 403) {
      throw Exception('Accès refusé');
    } else if (response.statusCode == 404) {
      throw Exception('Ressource non trouvée');
    } else {
      throw Exception(
          'Erreur serveur (${response.statusCode}): ${response.body}');
    }
  }
}