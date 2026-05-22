import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import 'screens/main_container_screen.dart';

void main() {
  runApp(const OncoSuiviApp());
}

class OncoSuiviApp extends StatelessWidget {
  const OncoSuiviApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OncoSuivi',
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
        fontFamily: 'Nunito', // Warm, rounded font adapted for healthcare
        scaffoldBackgroundColor: const Color(0xFFFAFAFA),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFB39DDB), // Soft mauve
          primary: const Color(0xFFB39DDB),
          secondary: const Color(0xFFF8BBD0), // Baby pink
          surface: const Color(0xFFFFFFFF),
          background: const Color(0xFFFAFAFA),
        ),
        useMaterial3: true,
      ),
      home: const MainContainerScreen(),
    );
  }
}