import 'package:flutter/material.dart';
import '../models/models.dart';
import 'accueil_screen.dart';
import 'documents_screen.dart';
import 'suivi_screen.dart';
import 'profil_screen.dart';
import '../widgets/oncobot_bot_sheet.dart';
import '../widgets/questionnaire_bot_sheet.dart';

class MainContainerScreen extends StatefulWidget {
  const MainContainerScreen({Key? key}) : super(key: key);

  @override
  _MainContainerScreenState createState() => _MainContainerScreenState();
}

class _MainContainerScreenState extends State<MainContainerScreen> {
  int _currentIndex = 0;
  bool _isNotifDropdownOpen = false;
  String _clinicalStatusText = "Suivi régulier";
  String _clinicalStatusTime = "Mise à jour aujourd'hui";

  final Patient _patient = const Patient(
    firstName: "Sarah 🌸",
    lastName: "Benali",
    birthDate: "15/03/1984",
    bloodType: "A+",
    allergies: "Pénicilline",
    folderID: "#DOSS-0042",
  );

  List<Map<String, dynamic>> _mockNotifications = [
    {"id": "not-1", "title": "Rendez-vous à venir", "message": "Dr. Leila Mansouri vous attend le 27 mai à 14h30 au CHU.", "time": "Il y a 2h", "isRead": false},
    {"id": "not-2", "title": "Nouveau Résultat disponible", "message": "Votre rapport de biopsie mammaire a été mis à disposition.", "time": "Hier", "isRead": false},
    {"id": "not-3", "title": "Rappel d'hormonothérapie", "message": "Avez-vous bien validé votre prise de Tamoxifène ce matin ?", "time": "Lundi 19 mai", "isRead": true},
  ];

  final List<TimelineEvent> _timelineEvents = [
    TimelineEvent(id: "t1", type: "DOCUMENT", title: "Biopsie mammaire gauche réalisée", subtitle: "Analyse d'Anatomie Pathologique", date: "18 Mai 2026", badge: "Résultat disponible", color: const Color(0xFFF8BBD0), desc: "Biopsie rassurante confirmant la régression et la stabilité chirurgicale locale."),
    TimelineEvent(id: "t2", type: "RDV", title: "Consultation de contrôle post-opératoire", subtitle: "Dr. Leila Mansouri — Oncologue référente", date: "02 Mai 2026", badge: "Effectué", color: const Color(0xFFB39DDB), desc: "Cicatrice saine, excellente tolérance à l'hormonothérapie adjuvante."),
    TimelineEvent(id: "t3", type: "PLAN", title: "Plan d'hormonothérapie initié : Tamoxifène", subtitle: "Prescription protectrice post-chirurgie", date: "10 Mars 2026", badge: "Actif pour 5 ans", color: const Color(0xFFFFB74D), desc: "20mg d'hormonothérapie par jour en prise matinale constante."),
    TimelineEvent(id: "t4", type: "EXAMEN", title: "Mammographie de contrôle de référence", subtitle: "Centre d'imagerie clinique du CHU", date: "10 Mars 2026", badge: "BIRADS 4 - Stable", color: const Color(0xFFB3E5FC), desc: "Examen de référence conservatoire suite à tumorectomie."),
  ];

  void _showToast(String text) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Container(width: 16, height: 16, margin: const EdgeInsets.only(right: 8),
                child: CustomPaint(painter: RibbonPainter(color: const Color(0xFFE91E8C)))),
            Expanded(child: Text(text, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white))),
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

  void _markAllRead() {
    setState(() {
      for (var n in _mockNotifications) {
        n["isRead"] = true;
      }
    });
    _showToast("Toutes les notifications sont lues 🎀");
  }

  void _openNotificationsDropdown() {
    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (ctx) {
        return Align(
          alignment: Alignment.topRight,
          child: Padding(
            padding: const EdgeInsets.only(top: 70, right: 8),
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: 260,
                constraints: const BoxConstraints(maxHeight: 320),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFEDE7F6)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 16, offset: const Offset(0, 4)),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("NOTIFICATIONS CLINIQUE",
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFFB39DDB))),
                          GestureDetector(
                            onTap: () { Navigator.pop(ctx); _markAllRead(); },
                            child: const Text("Tout lire",
                                style: TextStyle(fontSize: 11, color: Color(0xFFE91E8C), fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xFFEDE7F6)),
                    // List
                    Flexible(
                      child: ListView(
                        padding: const EdgeInsets.all(8),
                        shrinkWrap: true,
                        children: _mockNotifications.map((notif) {
                          final bool unread = notif["isRead"] == false;
                          return GestureDetector(
                            onTap: () {
                              setState(() => notif["isRead"] = true);
                              Navigator.pop(ctx);
                              _showToast("Notification : ${notif["title"]}");
                            },
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 6),
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: unread ? const Color(0xFFFCE4EC) : Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border(
                                  left: BorderSide(
                                    color: unread ? const Color(0xFFE91E8C) : Colors.transparent,
                                    width: 2,
                                  ),
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        child: Text(notif["title"],
                                            style: TextStyle(
                                              fontWeight: FontWeight.w800,
                                              fontSize: 10,
                                              color: unread ? const Color(0xFF2D2D2D) : Colors.grey,
                                            )),
                                      ),
                                      Text(notif["time"],
                                          style: const TextStyle(fontSize: 8, color: Colors.grey, fontFamily: 'monospace')),
                                    ],
                                  ),
                                  const SizedBox(height: 3),
                                  Text(notif["message"],
                                      style: TextStyle(
                                        fontSize: 9.5,
                                        color: unread ? const Color(0xFF616161) : Colors.grey,
                                        height: 1.3,
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
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
        onSubmitted: (pain, fatigue, nausea, description, notes) {
          setState(() {
            _clinicalStatusText = "Bilan soumis • Stable";
            _clinicalStatusTime = "Validé à l'instant";
            _timelineEvents.insert(0, TimelineEvent(
              id: "t-survey-${DateTime.now().millisecondsSinceEpoch}",
              type: "QUESTIONNAIRE",
              title: "Questionnaire OncoSuivi soumis",
              subtitle: "Douleur : $pain/10 - Bilan quotidien validé",
              date: "Aujourd'hui à ${TimeOfDay.now().format(context)}",
              badge: "Consigné",
              color: const Color(0xFFD1C4E9),
              desc: "Symptômes : Fatigue (${fatigue ? 'Oui' : 'Non'}), Nausées (${nausea ? 'Oui' : 'Non'}). Remarque : ${notes.isNotEmpty ? notes : 'Aucune'}",
            ));
          });
          _showToast("Votre bilan a bien été enregistré !");
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> _pages = [
      AccueilScreen(
        patient: _patient,
        clinicalStatusText: _clinicalStatusText,
        clinicalStatusTime: _clinicalStatusTime,
        onOpenQuestionnaire: _openQuestionnaireForm,
        onShowToast: _showToast,
      ),
      DocumentsScreen(onShowToast: _showToast),
      SuiviScreen(
        timelineEvents: _timelineEvents,
        onOpenQuestionnaire: _openQuestionnaireForm,
        onShowToast: _showToast,
      ),
      ProfilScreen(patient: _patient, onShowToast: _showToast),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFFAFAFA),

      // ── APP BAR ────────────────────────────────────────────────
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leadingWidth: 64, // un peu plus d'espace pour décaler vers la droite
        leading: GestureDetector(
          onTap: _openChatBotModal,
          child: Padding(
            // padding gauche augmenté → décale l'icône légèrement vers la droite
            padding: const EdgeInsets.only(left: 14, top: 8, bottom: 8, right: 6),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEDE7F6),
                    shape: BoxShape.circle, // fond circulaire (rond)
                  ),
                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CustomPaint(painter: ChatBubblePainter(color: Color(0xFFB39DDB))),
                    ),
                  ),
                ),
                Positioned(
                  top: -2,
                  left: -2,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE91E8C),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text("IA",
                        style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
        title: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const Text("OncoSuivi",
                    style: TextStyle(fontWeight: FontWeight.w800, color: Color(0xFFB39DDB), fontSize: 22)),
                const SizedBox(width: 8),
                SizedBox(width: 24, height: 24,
                    child: CustomPaint(painter: RibbonPainter(color: const Color(0xFFE91E8C)))),
              ],
            ),
            const Text("Mon parcours de soins",
                style: TextStyle(fontSize: 10, color: Color(0xFF757575), fontWeight: FontWeight.normal)),
          ],
        ),
        actions: [
          // Notification bell
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none_outlined, color: Color(0xFFB39DDB)),
                onPressed: _openNotificationsDropdown,
              ),
              if (_mockNotifications.any((n) => n["isRead"] == false))
                Positioned(
                  right: 10, top: 10,
                  child: Container(
                    width: 8, height: 8,
                    decoration: const BoxDecoration(color: Color(0xFFE91E8C), shape: BoxShape.circle),
                  ),
                ),
            ],
          ),
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

      // ── END DRAWER ────────────────────────────────────────────
      endDrawer: Drawer(
        width: MediaQuery.of(context).size.width * 0.8,
        backgroundColor: Colors.white,
        child: Column(
          children: [
            UserAccountsDrawerHeader(
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [Color(0xFFEDE7F6), Color(0xFFFCE4EC)]),
              ),
              currentAccountPicture: CircleAvatar(
                backgroundColor: Colors.white,
                child: Text(_patient.firstName[0],
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE91E8C), fontSize: 20)),
              ),
              accountName: Text("${_patient.firstName} ${_patient.lastName}",
                  style: const TextStyle(color: Color(0xFF2D2D2D), fontWeight: FontWeight.bold)),
              accountEmail: const Text("sarah.benali@gmail.com",
                  style: TextStyle(color: Color(0xFF757575), fontSize: 11)),
            ),
            ListTile(leading: const Icon(Icons.person_outline, color: Color(0xFFB39DDB)), title: const Text("Mon Profil Patient", style: TextStyle(fontSize: 13)), onTap: () { Navigator.pop(context); setState(() => _currentIndex = 3); }),
            ListTile(leading: const Icon(Icons.calendar_month_outlined, color: Color(0xFFB39DDB)), title: const Text("Mes rendez-vous", style: TextStyle(fontSize: 13)), onTap: () { Navigator.pop(context); setState(() => _currentIndex = 0); }),
            ListTile(leading: const Icon(Icons.settings_outlined, color: Color(0xFFB39DDB)), title: const Text("Paramètres", style: TextStyle(fontSize: 13)), onTap: () { Navigator.pop(context); _showToast("Ouverture des paramètres."); }),
            ListTile(leading: const Icon(Icons.help_outline_outlined, color: Color(0xFFB39DDB)), title: const Text("Aide & Support", style: TextStyle(fontSize: 13)), onTap: () { Navigator.pop(context); _showToast("FAQ d'OncoSuivi ouverte."); }),
            const Spacer(),
            const Divider(color: Color(0xFFEDE7F6)),
            ListTile(
              leading: const Icon(Icons.logout, color: Color(0xFFE91E63)),
              title: const Text("Déconnexion", style: TextStyle(fontSize: 13, color: Color(0xFFE91E63))),
              onTap: () { Navigator.pop(context); _showToast("Déconnexion de l'espace patient."); },
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 16.0),
              child: Column(children: [
                const Text("OncoSuivi Premium v1.2", style: TextStyle(fontSize: 10, color: Colors.grey)),
                const SizedBox(height: 4),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  SizedBox(width: 14, height: 14, child: CustomPaint(painter: RibbonPainter(color: const Color(0xFFE91E8C)))),
                  const SizedBox(width: 6),
                  const Text("Suivi post-opératoire personnalisé", style: TextStyle(fontSize: 9, color: Color(0xFFE91E8C))),
                ]),
              ]),
            ),
          ],
        ),
      ),

      // ── BODY ──────────────────────────────────────────────────
      body: _pages[_currentIndex],

      // ── BOTTOM NAV — correspond exactement au screenshot ──────
      bottomNavigationBar: Container(
        color: const Color(0xFFEDE7F6), // fond lavande autour de la barre
        padding: const EdgeInsets.only(bottom: 10, left: 8, right: 8),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(28),
              topRight: Radius.circular(28),
              bottomLeft: Radius.circular(28),
              bottomRight: Radius.circular(28),
            ),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 10),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildNavItem(0, Icons.assignment_outlined, "Accueil"),
                  _buildNavItem(1, Icons.monitor_heart_outlined, "Suivi"),
                  _buildNavItem(2, Icons.folder_outlined, "Dossier"),
                  _buildNavItem(3, Icons.person_outline, "Profil"),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ── ITEM DE NAVIGATION PERSONNALISÉ ────────────────────────────
  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isSelected = _currentIndex == index;
    final Color activeColor = const Color(0xFFB39DDB);
    final Color inactiveColor = Colors.grey;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => setState(() {
        _currentIndex = index;
        _isNotifDropdownOpen = false;
      }),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: isSelected ? activeColor : inactiveColor, size: 24),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? activeColor : inactiveColor,
            ),
          ),
          const SizedBox(height: 4),
          // Point violet sous l'item actif
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: isSelected ? activeColor : Colors.transparent,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotifItemCompact(Map<String, dynamic> notif) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 3),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: const Color(0xFFFCE4EC), borderRadius: BorderRadius.circular(8)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(notif["title"], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 9.5, color: Color(0xFF2D2D2D)), overflow: TextOverflow.ellipsis)),
              Text(notif["time"], style: const TextStyle(fontSize: 8, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 2),
          Text(notif["message"], style: const TextStyle(fontSize: 9, color: Color(0xFF757575)), maxLines: 2, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

// ── CHAT BUBBLE PAINTER ────────────────────────────────────────
class ChatBubblePainter extends CustomPainter {
  final Color color;
  const ChatBubblePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = size.width * 0.11
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Bulle ovale lisse (sans pointe triangulaire)
    final rect = Rect.fromLTWH(
      size.width * 0.12,
      size.height * 0.15,
      size.width * 0.76,
      size.height * 0.6,
    );
    final rrect = RRect.fromRectAndRadius(rect, Radius.circular(size.width * 0.3));
    canvas.drawRRect(rrect, paint);

    // Petite queue arrondie en bas à gauche (douce, pas triangulaire)
    final tail = Path();
    tail.moveTo(size.width * 0.3, size.height * 0.72);
    tail.quadraticBezierTo(
      size.width * 0.24, size.height * 0.9,
      size.width * 0.42, size.height * 0.78,
    );
    canvas.drawPath(tail, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ── RIBBON PAINTER ─────────────────────────────────────────────
class RibbonPainter extends CustomPainter {
  final Color color;
  const RibbonPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = size.width * 0.12
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final path = Path();
    path.moveTo(size.width * 0.5, size.width * 0.2);
    path.cubicTo(size.width * 0.35, size.width * 0.2, size.width * 0.25, size.width * 0.35, size.width * 0.25, size.width * 0.5);
    path.cubicTo(size.width * 0.25, size.width * 0.65, size.width * 0.35, size.width * 0.8, size.width * 0.5, size.width * 0.95);
    path.cubicTo(size.width * 0.65, size.width * 0.8, size.width * 0.75, size.width * 0.65, size.width * 0.75, size.width * 0.5);
    path.cubicTo(size.width * 0.75, size.width * 0.35, size.width * 0.65, size.width * 0.2, size.width * 0.5, size.width * 0.2);
    canvas.drawPath(path, paint);

    final pathTail = Path();
    pathTail.moveTo(size.width * 0.35, size.width * 0.88);
    pathTail.lineTo(size.width * 0.5, size.width * 0.68);
    pathTail.lineTo(size.width * 0.65, size.width * 0.88);
    canvas.drawPath(pathTail, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}