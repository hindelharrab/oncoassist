import 'package:flutter/material.dart';
import '../models/models.dart';
import 'accueil_screen.dart';
import 'documents_screen.dart';
import 'suivi_screen.dart' as suivi;
import 'profil_screen.dart';
import '../widgets/oncobot_bot_sheet.dart';
import '../widgets/questionnaire_bot_sheet.dart';
import 'login_screen.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../widgets/ribbon_painter.dart';

class MainContainerScreen extends StatefulWidget {
  final String patientNom;
  final String patientPrenom;
  final String patientId;
  final String token;
  final String dossierMedicalId;
  final String folderCode;
  final String dateNaissance;

  const MainContainerScreen({
    Key? key,
    required this.patientNom,
    required this.patientPrenom,
    required this.patientId,
    required this.token,
    required this.dossierMedicalId,
    required this.folderCode,
    required this.dateNaissance,
  }) : super(key: key);

  @override
  _MainContainerScreenState createState() => _MainContainerScreenState();
}

class _MainContainerScreenState extends State<MainContainerScreen> {
  int _currentIndex = 0;
  String _clinicalStatusText = "Suivi régulier";
  String _clinicalStatusTime = "Mise à jour aujourd'hui";
  String _photoProfil = '';

  // ── Notifications réelles backend ────────────────────────
  List<Map<String, dynamic>> _notifications = [];
  bool _notifLoading = false;

  @override
  void initState() {
    super.initState();
    _loadPhotoProfil();
    _fetchNotifications();
  }

  Future<void> _loadPhotoProfil() async {
    try {
      final data = await ApiService.get('/patients/${widget.patientId}');
      if (mounted) setState(() => _photoProfil = data['photoProfil'] ?? '');
    } catch (_) {}
  }

  Future<void> _fetchNotifications() async {
    if (!mounted) return;
    setState(() => _notifLoading = true);
    try {
      final List<dynamic> data = await ApiService.get(
          '/notifications/patient/${widget.patientId}');
      if (!mounted) return;
      setState(() {
        _notifications = data.map((n) => Map<String, dynamic>.from(n)).toList();
        _notifLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _notifLoading = false);
    }
  }

  Future<void> _markAllRead() async {
    try {
      await ApiService.put(
          '/notifications/patient/${widget.patientId}/toutes-lues', {});
      await _fetchNotifications();
      _showToast("Toutes les notifications sont lues 🎀");
    } catch (_) {
      _showToast("Toutes les notifications sont lues 🎀");
    }
  }

  Future<void> _markOneRead(String notifId) async {
    try {
      await ApiService.put('/notifications/$notifId/lue', {});
    } catch (_) {}
    if (mounted) {
      setState(() {
        for (var n in _notifications) {
          if (n['id'] == notifId) n['lue'] = true;
        }
      });
    }
  }

  bool get _hasUnread => _notifications.any((n) => n['lue'] == false);

  String get _avatarUrl {
    if (_photoProfil.isEmpty) return '';
    if (_photoProfil.startsWith('http')) return _photoProfil;
    return 'http://10.0.2.2:8080/$_photoProfil';
  }

  // ── Helpers notif ─────────────────────────────────────────
  String _notifIcon(Map<String, dynamic> n) {
    final cat = n['categorie'] ?? '';
    switch (cat) {
      case 'rdv':     return '📅';
      case 'dossier': return '📄';
      case 'patient': return '👩‍⚕️';
      default:        return '🔔';
    }
  }

  String _notifTime(Map<String, dynamic> n) {
    final raw = n['dateCreation'];
    if (raw == null) return '';
    try {
      final d    = DateTime.parse(raw);
      final diff = DateTime.now().difference(d);
      if (diff.inMinutes < 60)  return 'Il y a ${diff.inMinutes}min';
      if (diff.inHours < 24)    return 'Il y a ${diff.inHours}h';
      if (diff.inDays == 1)     return 'Hier';
      return 'Il y a ${diff.inDays}j';
    } catch (_) { return ''; }
  }

  void _showToast(String text) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(width: 16, height: 16, margin: const EdgeInsets.only(right: 8),
                child: CustomPaint(painter: RibbonPainter(color: const Color(0xFFE91E8C)))),
            Expanded(child: Text(text,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white))),
          ],
        ),
        backgroundColor: const Color(0xFF2D2D2D),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.all(12),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _handleLogout() async {
    await StorageService.clear();
    ApiService.setToken('');
    _showToast("Déconnexion réussie. À bientôt ! 🌸");
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const LoginScreen(),
        transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  // ── Icône de chat AI (cercle + bulle + badge IA) ─────────
  Widget _buildChatAiIcon() {
    return GestureDetector(
      onTap: _openChatBotModal,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        // left: 12 -> décale l'icône vers la droite (pas collée au bord)
        padding: const EdgeInsets.only(left: 12, top: 8, bottom: 8, right: 4),
        child: Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.center,
          children: [
            // Cercle rose/mauve clair avec la bulle de chat
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: Color(0xFFF3E5F5),
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Icon(
                  Icons.chat_bubble_outline_rounded,
                  color: Color(0xFFB39DDB),
                  size: 20,
                ),
              ),
            ),
            // Badge "IA" en haut à gauche
            Positioned(
              top: -2,
              left: -2,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: const Color(0xFFE91E8C),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  "IA",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 8,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openNotificationsDropdown() {
    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => Align(
          alignment: Alignment.topRight,
          child: Padding(
            padding: const EdgeInsets.only(top: 70, right: 8),
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: 280,
                constraints: const BoxConstraints(maxHeight: 380),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFEDE7F6)),
                  boxShadow: [BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 16,
                      offset: const Offset(0, 4))],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("MES NOTIFICATIONS",
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800,
                                  color: Color(0xFFB39DDB))),
                          GestureDetector(
                            onTap: () {
                              Navigator.pop(ctx);
                              _markAllRead();
                            },
                            child: const Text("Tout lire",
                                style: TextStyle(fontSize: 11, color: Color(0xFFE91E8C),
                                    fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xFFEDE7F6)),

                    // Corps
                    _notifLoading
                        ? const Padding(
                        padding: EdgeInsets.all(24),
                        child: CircularProgressIndicator(
                            color: Color(0xFFB39DDB), strokeWidth: 2))
                        : _notifications.isEmpty
                        ? const Padding(
                      padding: EdgeInsets.all(24),
                      child: Column(children: [
                        Text("🔔", style: TextStyle(fontSize: 28)),
                        SizedBox(height: 8),
                        Text("Aucune notification",
                            style: TextStyle(fontSize: 12, color: Colors.grey)),
                      ]),
                    )
                        : Flexible(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(8),
                        shrinkWrap: true,
                        itemCount: _notifications.length,
                        itemBuilder: (_, i) {
                          final notif = _notifications[i];
                          final bool unread = notif['lue'] == false;
                          final String id = notif['id'] ?? '';
                          return GestureDetector(
                            onTap: () {
                              Navigator.pop(ctx);
                              _markOneRead(id);
                              _showToast(notif['titre'] ?? 'Notification');
                            },
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.all(9),
                              decoration: BoxDecoration(
                                color: unread
                                    ? const Color(0xFFFCE4EC)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border(
                                    left: BorderSide(
                                        color: unread
                                            ? const Color(0xFFE91E8C)
                                            : Colors.transparent,
                                        width: 2)),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_notifIcon(notif),
                                      style: const TextStyle(fontSize: 16)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                notif['titre'] ?? '',
                                                style: TextStyle(
                                                    fontWeight: FontWeight.w800,
                                                    fontSize: 10,
                                                    color: unread
                                                        ? const Color(0xFF2D2D2D)
                                                        : Colors.grey),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            Text(_notifTime(notif),
                                                style: const TextStyle(
                                                    fontSize: 8, color: Colors.grey)),
                                          ],
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          notif['message'] ?? '',
                                          style: TextStyle(
                                              fontSize: 9.5,
                                              color: unread
                                                  ? const Color(0xFF616161)
                                                  : Colors.grey,
                                              height: 1.3),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _openChatBotModal() {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (ctx) => OncoBotBotSheet(onShowToast: _showToast),
    );
  }

  void _openQuestionnaireForm() {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (ctx) => QuestionnaireBotSheet(
        patientId: widget.patientId,
        onSubmitted: (pain, fatigue, nausea, description, notes) {
          setState(() {
            _clinicalStatusText = "Bilan soumis • Stable";
            _clinicalStatusTime = "Validé à l'instant";
          });
          _showToast("Votre bilan a bien été enregistré ! 💌");
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final patient = Patient(
      firstName: widget.patientPrenom,
      lastName: widget.patientNom,
      birthDate: widget.dateNaissance,
      bloodType: "A+",
      allergies: "",
      folderID: widget.folderCode.isNotEmpty ? widget.folderCode : "#DOSS-0000",
    );

    final List<Widget> pages = [
      AccueilScreen(
        patient: patient,
        clinicalStatusText: _clinicalStatusText,
        clinicalStatusTime: _clinicalStatusTime,
        onOpenQuestionnaire: _openQuestionnaireForm,
        onShowToast: _showToast,
        patientId: widget.patientId,
        token: widget.token,
        dossierMedicalId: widget.dossierMedicalId,
      ),
      suivi.SuiviScreen(
        onOpenQuestionnaire: _openQuestionnaireForm,
        onShowToast: _showToast,
        patientId: widget.patientId,
        dossierMedicalId: widget.dossierMedicalId,
      ),
      DocumentsScreen(
        onShowToast: _showToast,
        dossierMedicalId: widget.dossierMedicalId,
        patientNom: widget.patientNom,
        patientPrenom: widget.patientPrenom,
      ),
      ProfilScreen(
        patient: patient,
        onShowToast: _showToast,
        onLogout: _handleLogout,
        patientId: widget.patientId,
      ),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leadingWidth: 60,
        leading: _buildChatAiIcon(),
        title: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text("OncoAssist",
                    style: TextStyle(fontWeight: FontWeight.w800,
                        color: Color(0xFFB39DDB), fontSize: 22)),
                const SizedBox(width: 8),
                SizedBox(width: 24, height: 24,
                    child: CustomPaint(
                        painter: RibbonPainter(color: const Color(0xFFE91E8C)))),
              ],
            ),
            const Text("Mon parcours de soins",
                style: TextStyle(fontSize: 10, color: Color(0xFF757575),
                    fontWeight: FontWeight.normal)),
          ],
        ),
        actions: [
          // ── Cloche notifications ──────────────────────────
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_outlined,
                    color: Color(0xFFB39DDB)),
                onPressed: _openNotificationsDropdown,
              ),
              if (_hasUnread)
                Positioned(
                  right: 10, top: 10,
                  child: Container(
                      width: 8, height: 8,
                      decoration: const BoxDecoration(
                          color: Color(0xFFE91E8C), shape: BoxShape.circle)),
                ),
            ],
          ),
          // ── Menu hamburger ────────────────────────────────
          Builder(
            builder: (ctx) => IconButton(
              icon: const Icon(Icons.menu, color: Colors.grey),
              onPressed: () => Scaffold.of(ctx).openEndDrawer(),
            ),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: const Color(0xFFEDE7F6), height: 1.0),
        ),
      ),

      endDrawer: Drawer(
        width: MediaQuery.of(context).size.width * 0.8,
        backgroundColor: Colors.white,
        shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.horizontal(left: Radius.circular(24))),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(children: [
                        const Text("OncoAssist",
                            style: TextStyle(fontWeight: FontWeight.bold,
                                fontSize: 16, color: Color(0xFFE91E8C))),
                        const SizedBox(width: 6),
                        SizedBox(width: 16, height: 16,
                            child: CustomPaint(
                                painter: RibbonPainter(color: const Color(0xFFE91E8C)))),
                      ]),
                      GestureDetector(
                        onTap: () => Navigator.pop(context),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                              color: Color(0xFFFAFAFA), shape: BoxShape.circle),
                          child: const Icon(Icons.close, size: 16, color: Color(0xFF757575)),
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: Color(0xFFEDE7F6)),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEDE7F6).withOpacity(0.5),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40, height: 40,
                        decoration: const BoxDecoration(
                            color: Color(0xFFFCE4EC), shape: BoxShape.circle),
                        child: ClipOval(
                          child: _avatarUrl.isNotEmpty
                              ? Image.network(_avatarUrl, fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => Center(
                                child: Text(
                                  "${widget.patientPrenom.isNotEmpty ? widget.patientPrenom[0] : ''}"
                                      "${widget.patientNom.isNotEmpty ? widget.patientNom[0] : ''}",
                                  style: const TextStyle(fontWeight: FontWeight.bold,
                                      fontSize: 12, color: Color(0xFFE91E8C)),
                                ),
                              ))
                              : Center(
                            child: Text(
                              "${widget.patientPrenom.isNotEmpty ? widget.patientPrenom[0] : ''}"
                                  "${widget.patientNom.isNotEmpty ? widget.patientNom[0] : ''}",
                              style: const TextStyle(fontWeight: FontWeight.bold,
                                  fontSize: 12, color: Color(0xFFE91E8C)),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("${widget.patientPrenom} ${widget.patientNom}",
                                style: const TextStyle(fontSize: 12,
                                    fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                  color: const Color(0xFFFCE4EC),
                                  borderRadius: BorderRadius.circular(20)),
                              child: const Text("Patiente",
                                  style: TextStyle(fontSize: 9,
                                      fontWeight: FontWeight.bold, color: Color(0xFFE91E8C))),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _drawerLink("Mon profil patient",
                        () { Navigator.pop(context); setState(() => _currentIndex = 3); }),
                _drawerLink("Mes prochains rendez-vous",
                        () { Navigator.pop(context); setState(() => _currentIndex = 0); }),
                _drawerLink("Dossier d'examens",
                        () { Navigator.pop(context); setState(() => _currentIndex = 2); }),
                _drawerLink("Historique & Symptômes",
                        () { Navigator.pop(context); setState(() => _currentIndex = 1); }),
                const SizedBox(height: 8),
                const Divider(height: 1, color: Color(0xFFEDE7F6)),
                const SizedBox(height: 8),
                _drawerTextLink("⚙️ Paramètres de l'application",
                        () { Navigator.pop(context); _showToast("Paramètres OncoAssist v1.2 ⚙️"); }),
                _drawerTextLink("💡 Aide & Support client",
                        () { Navigator.pop(context); _showToast("Aide et Support 24h/24 🎀"); }),
                const Spacer(),
                const Divider(height: 1, color: Color(0xFFEDE7F6)),
                const SizedBox(height: 12),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: const [
                  Text("OncoAssist Premium v1.2",
                      style: TextStyle(fontSize: 10, color: Color(0xFF757575))),
                  SizedBox(width: 4),
                  Text("🎀", style: TextStyle(fontSize: 10)),
                ]),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFCE4EC),
                      foregroundColor: const Color(0xFFE91E8C),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () { Navigator.pop(context); _handleLogout(); },
                    child: const Text("Se déconnecter",
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),

      body: pages[_currentIndex],

      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: const Color(0xFFB39DDB),
        unselectedItemColor: Colors.grey,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: "Accueil"),
          BottomNavigationBarItem(icon: Icon(Icons.monitor_heart_outlined), label: "Suivi"),
          BottomNavigationBarItem(icon: Icon(Icons.folder_outlined), label: "Dossier"),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: "Profil"),
        ],
      ),
    );
  }

  Widget _drawerLink(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12,
                fontWeight: FontWeight.w500, color: Color(0xFF2D2D2D))),
            const Icon(Icons.chevron_right, size: 16, color: Color(0xFFB39DDB)),
          ],
        ),
      ),
    );
  }

  Widget _drawerTextLink(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        child: Text(label, style: const TextStyle(fontSize: 12,
            fontWeight: FontWeight.w500, color: Color(0xFF757575))),
      ),
    );
  }
}