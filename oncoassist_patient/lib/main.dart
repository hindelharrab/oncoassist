import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'screens/login_screen.dart';
import 'services/api_service.dart';
import 'services/storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Vérifier si un token existe déjà (session persistante)
  final token = await StorageService.getToken();
  if (token != null && token.isNotEmpty) {
    ApiService.setToken(token);
  }

  runApp(const OncoAssistApp());
}

class OncoAssistApp extends StatelessWidget {
  const OncoAssistApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OncoAssist',
      debugShowCheckedModeBanner: false,
      scrollBehavior: const MaterialScrollBehavior().copyWith(
        dragDevices: {
          PointerDeviceKind.mouse,
          PointerDeviceKind.touch,
          PointerDeviceKind.stylus,
          PointerDeviceKind.unknown,
        },
      ),
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFFFAFAFA),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFB39DDB),
          primary: const Color(0xFFB39DDB),
          secondary: const Color(0xFFF8BBD0),
          surface: const Color(0xFFFFFFFF),
          background: const Color(0xFFFAFAFA),
        ),
        useMaterial3: true,
      ),
      home: const LoginScreen(),
    );
  }
}