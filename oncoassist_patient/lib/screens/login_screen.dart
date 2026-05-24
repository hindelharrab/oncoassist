import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'main_container_screen.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../widgets/ribbon_painter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _showPassword = false;
  bool _isLoading = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      _showSnack("Veuillez saisir votre email et mot de passe");
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http.post(
        Uri.parse('http://10.0.2.2:8080/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'motDePasse': password,
        }),
      );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['role'] != 'PATIENT') {
          _showSnack("Accès réservé aux patients.");
          return;
        }

        // Sauvegarder token et ID
        await StorageService.saveToken(data['token']);
        await StorageService.savePatientId(data['id']);
        ApiService.setToken(data['token']);

        _showSnack("Connexion réussie ! Bienvenue ${data['prenom']} 🌸");

        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => MainContainerScreen(
              patientNom:       data['nom']              ?? '',
              patientPrenom:    data['prenom']            ?? '',
              patientId:        data['id']                ?? '',
              token:            data['token']             ?? '',
              dossierMedicalId: data['dossierMedicalId']  ?? '',
              folderCode:       data['folderCode']        ?? '#DOSS-0000',
              dateNaissance:    data['dateNaissance']     ?? '',
            ),
            transitionsBuilder: (_, anim, __, child) =>
                FadeTransition(opacity: anim, child: child),
            transitionDuration: const Duration(milliseconds: 400),
          ),
        );

      } else if (response.statusCode == 401) {
        _showSnack("Email ou mot de passe incorrect.");
      } else {
        _showSnack("Erreur serveur (${response.statusCode}).");
      }

    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      _showSnack("Erreur réseau. Vérifiez votre connexion.");
    }
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
        backgroundColor: const Color(0xFF2D2D2D),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final isKeyboardOpen = mediaQuery.viewInsets.bottom > 0;

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SingleChildScrollView(
          child: SizedBox(
            height: mediaQuery.size.height,
            child: Column(
              children: [

                // ── HEADER IMAGE ─────────────────────────────────
                AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  height: isKeyboardOpen
                      ? mediaQuery.size.height * 0.25
                      : mediaQuery.size.height * 0.40,
                  width: double.infinity,
                  child: Stack(
                    children: [
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, 3))],
                            borderRadius: const BorderRadius.only(
                              bottomLeft: Radius.circular(36),
                              bottomRight: Radius.circular(36),
                            ),
                            image: const DecorationImage(
                              image: NetworkImage('https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1600'),
                              fit: BoxFit.cover,
                            ),
                          ),
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: const BorderRadius.only(
                                bottomLeft: Radius.circular(36),
                                bottomRight: Radius.circular(36),
                              ),
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  Colors.black.withOpacity(0.2),
                                  Colors.transparent,
                                  Colors.black.withOpacity(0.55),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Badge OncoAssist
                      Positioned(
                        bottom: 20, left: 0, right: 0,
                        child: Center(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: Colors.white.withOpacity(0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 36, height: 36,
                                  padding: const EdgeInsets.all(6),
                                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                                  child: CustomPaint(
                                    painter: RibbonPainter(color: const Color(0xFFE91E8C)),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                const Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text("OncoAssist",
                                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
                                    Text("ESPACE PATIENT SÉCURISÉ",
                                        style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 7.5, letterSpacing: 0.8)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // ── FORMULAIRE ───────────────────────────────────
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [

                        // Titre
                        const Column(
                          children: [
                            Text("Bonjour & Bienvenue",
                                style: TextStyle(color: Colors.grey, fontSize: 11.5, fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text("CONNEXION À VOTRE ESPACE",
                                style: TextStyle(color: Color(0xFF2D2D2D), fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                            SizedBox(height: 4),
                            Text("CHU DE SÉNOLOGIE • OncoAssist",
                                style: TextStyle(color: Color(0xFFB39DDB), fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                          ],
                        ),

                        // Champs + bouton
                        Column(
                          children: [
                            // Email
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFEDE7F6)),
                                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 5, offset: Offset(0, 2))],
                              ),
                              child: TextField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                textInputAction: TextInputAction.next,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                decoration: InputDecoration(
                                  hintText: "Adresse e-mail",
                                  hintStyle: TextStyle(color: Colors.grey.shade400, fontWeight: FontWeight.bold, fontSize: 12),
                                  prefixIcon: const Icon(Icons.mail_outline, color: Colors.grey, size: 20),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),

                            // Mot de passe
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: const Color(0xFFEDE7F6)),
                                boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 5, offset: Offset(0, 2))],
                              ),
                              child: TextField(
                                controller: _passwordController,
                                obscureText: !_showPassword,
                                textInputAction: TextInputAction.done,
                                onSubmitted: (_) => _handleLogin(),
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                decoration: InputDecoration(
                                  hintText: "Mot de passe",
                                  hintStyle: TextStyle(color: Colors.grey.shade400, fontWeight: FontWeight.bold, fontSize: 12),
                                  prefixIcon: const Icon(Icons.lock_outline, color: Colors.grey, size: 20),
                                  suffixIcon: IconButton(
                                    icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility, color: Colors.grey, size: 18),
                                    onPressed: () => setState(() => _showPassword = !_showPassword),
                                  ),
                                  border: InputBorder.none,
                                  contentPadding: const EdgeInsets.symmetric(vertical: 14),
                                ),
                              ),
                            ),
                            const SizedBox(height: 14),

                            // Bouton connexion
                            GestureDetector(
                              onTap: _isLoading ? null : _handleLogin,
                              child: Container(
                                width: double.infinity,
                                height: 50,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(colors: [Color(0xFFB39DDB), Color(0xFFFCE4EC)]),
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [BoxShadow(color: const Color(0xFFB39DDB).withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
                                ),
                                child: Center(
                                  child: _isLoading
                                      ? const SizedBox(width: 20, height: 20,
                                      child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white))
                                      : const Text("Se connecter à mon suivi",
                                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),

                            GestureDetector(
                              onTap: () => _showSnack("Un lien de réinitialisation sera envoyé par e-mail 📧"),
                              child: const Text("Mot de passe oublié ?",
                                  style: TextStyle(fontSize: 10, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold,
                                      decoration: TextDecoration.underline)),
                            ),
                          ],
                        ),

                        // Triple action
                        Row(
                          children: [
                            Expanded(child: _actionTile(Icons.phone_in_talk, Colors.redAccent, "Urgence",
                                    () => _showSnack("Appel d'urgence CHU... 📞"))),
                            Expanded(child: _actionTile(Icons.gpp_maybe_outlined, const Color(0xFFB39DDB), "Hors-ligne",
                                    () => _showSnack("Mode Hors-ligne disponible 👍"))),
                            Expanded(child: _actionTile(Icons.language, Colors.blueAccent, "Français",
                                    () => _showSnack("OncoAssist configuré en Français 🇫🇷"))),
                          ],
                        ),

                        // Footer
                        const Column(
                          children: [
                            Text("🎀 OncoAssist Spécialisé",
                                style: TextStyle(fontSize: 9.5, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
                            SizedBox(height: 1),
                            Text("© 2026 Espace Patient Sécurisé • v1.1.14",
                                style: TextStyle(fontSize: 8, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _actionTile(IconData icon, Color color, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFEDE7F6)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(height: 3),
            Text(label, style: const TextStyle(fontSize: 8.5, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
          ],
        ),
      ),
    );
  }
}