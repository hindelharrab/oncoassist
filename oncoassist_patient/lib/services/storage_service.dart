import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static const _keyToken = 'jwt_token';
  static const _keyPatientId = 'patient_id';

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, token);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyToken);
  }

  static Future<void> savePatientId(String id) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyPatientId, id);
  }

  static Future<String?> getPatientId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyPatientId);
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}