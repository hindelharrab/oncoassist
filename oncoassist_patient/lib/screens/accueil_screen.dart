import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/models.dart';
import '../services/api_service.dart';

class AccueilScreen extends StatefulWidget {
  final Patient patient;
  final String clinicalStatusText;
  final String clinicalStatusTime;
  final VoidCallback onOpenQuestionnaire;
  final Function(String) onShowToast;
  final String patientId;
  final String token;

  const AccueilScreen({
    Key? key,
    required this.patient,
    required this.clinicalStatusText,
    required this.clinicalStatusTime,
    required this.onOpenQuestionnaire,
    required this.onShowToast,
    required this.patientId,
    required this.token,
  }) : super(key: key);

  @override
  State<AccueilScreen> createState() => _AccueilScreenState();
}

class _AccueilScreenState extends State<AccueilScreen> {
  int _currentQuoteIndex = 0;
  bool _surveyBannerVisible = true;

  // ── Données backend ──────────────────────────────
  bool _isLoading = true;
  String _statusText = "Chargement...";
  String _statusTime = "...";
  Color _statusColor = const Color(0xFFE91E8C);
  int _nombreDocuments = 0;
  int _nombreExamens = 0;

  // Prochain RDV
  String? _prochainRdvDate;
  String? _prochainRdvMedecin;
  String? _prochainRdvSpecialite;
  String? _prochainRdvDans;

  final List<String> _quotes = [
    "Chaque jour est une victoire 💪",
    "Vous êtes courageuse 🎀",
    "Nous sommes là pour vous ✨",
    "Prenez soin de vous aujourd'hui 🌸",
  ];

  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 6), (timer) {
      if (mounted) {
        setState(() {
          _currentQuoteIndex = (_currentQuoteIndex + 1) % _quotes.length;
        });
      }
    });
    _fetchData();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  // ── Fetch données patient + RDV ──────────────────
  Future<void> _fetchData() async {
    try {
      await Future.wait([
        _fetchPatientDetail(),
        _fetchProchainRdv(),
      ]);
    } catch (e) {
      // silencieux
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchPatientDetail() async {
    try {
      final data = await ApiService.get('/patients/${widget.patientId}');
      if (!mounted) return;
      setState(() {
        _nombreExamens = data['nombreExamens'] ?? 0;
        _statusText = _getStatusText(data['statut'] ?? 'EN_SUIVI');
        _statusColor = _getStatusColor(data['statut'] ?? 'EN_SUIVI');
        _statusTime = "Mis à jour aujourd'hui";
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _statusText = widget.clinicalStatusText;
          _statusColor = const Color(0xFFE91E8C);
        });
      }
    }
  }

  Future<void> _fetchProchainRdv() async {
    try {
      final List<dynamic> rdvs = await ApiService.get(
        '/rendez-vous/patient/${widget.patientId}',
      );

      // Filtrer RDV futurs planifiés ou en attente
      final now = DateTime.now();
      final futurs = rdvs.where((rdv) {
        if (rdv['date'] == null) return false;
        final date = DateTime.tryParse(rdv['date']);
        if (date == null) return false;
        final statut = rdv['statut'] ?? '';
        return date.isAfter(now) &&
            (statut == 'PLANIFIE' || statut == 'EN_ATTENTE');
      }).toList();

      // Trier par date croissante
      futurs.sort((a, b) {
        final da = DateTime.parse(a['date']);
        final db = DateTime.parse(b['date']);
        return da.compareTo(db);
      });

      if (!mounted) return;
      if (futurs.isNotEmpty) {
        final rdv = futurs.first;
        final date = DateTime.parse(rdv['date']);
        final diff = date.difference(now).inDays;

        setState(() {
          _prochainRdvDate = _formatDate(date);
          _prochainRdvMedecin =
          'Dr. ${rdv['medecinPrenom'] ?? ''} ${rdv['medecinNom'] ?? ''}';
          _prochainRdvSpecialite =
              rdv['medecinSpecialite'] ?? rdv['motif'] ?? 'Consultation';
          _prochainRdvDans = diff == 0
              ? "Aujourd'hui"
              : diff == 1
              ? "Demain"
              : "Dans ${diff}j";
        });
      }
    } catch (e) {
      // pas de RDV — silencieux
    }
  }

  // ── Helpers statut ───────────────────────────────
  String _getStatusText(String statut) {
    switch (statut) {
      case 'NOUVELLE':     return "Nouveau dossier";
      case 'STABLE':       return "Suivi stable";
      case 'EN_SUIVI':     return "Suivi régulier";
      case 'A_SURVEILLER': return "À surveiller";
      case 'CRITIQUE':     return "Attention requise";
      case 'ARCHIVEE':     return "Dossier archivé";
      default:             return "Suivi régulier";
    }
  }

  Color _getStatusColor(String statut) {
    switch (statut) {
      case 'CRITIQUE':     return const Color(0xFFE53935);
      case 'A_SURVEILLER': return const Color(0xFFFF8F00);
      case 'NOUVELLE':     return const Color(0xFFB39DDB);
      case 'ARCHIVEE':     return Colors.grey;
      default:             return const Color(0xFFE91E8C);
    }
  }

  String _formatDate(DateTime date) {
    const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    final heure = '${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
    return '${jours[date.weekday - 1]} ${date.day} ${mois[date.month - 1]} • $heure';
  }

  final List<int> _painLevels = [2, 3, 2, 4, 3, 3, 3];
  final List<String> _painDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [

        // ── HEADER CARD ──────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFEDE7F6), Color(0xFFFCE4EC), Colors.white],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFB39DDB).withOpacity(0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("ESPACE PATIENTE",
                            style: TextStyle(color: Color(0xFFB39DDB), fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 1.5)),
                        const SizedBox(height: 4),
                        Text("Bonjour, ${widget.patient.firstName}",
                            style: const TextStyle(fontSize: 19, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                        const SizedBox(height: 4),
                        Text(_quotes[_currentQuoteIndex],
                            style: const TextStyle(fontSize: 12, color: Color(0xFFE91E8C), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: const Color(0xFFF8BBD0),
                    child: Text(
                      "${widget.patient.firstName.isNotEmpty ? widget.patient.firstName[0] : ''}${widget.patient.lastName.isNotEmpty ? widget.patient.lastName[0] : ''}",
                      style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE91E8C), fontSize: 14),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(height: 1, color: const Color(0xFFB39DDB).withOpacity(0.2)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text("📅 Date de suivi : aujourd'hui",
                      style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.w500)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFEDE7F6)),
                    ),
                    child: Text(widget.patient.folderID,
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFB39DDB), fontFamily: 'monospace')),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── STATUT CLINIQUE ──────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFB39DDB).withOpacity(0.4)),
          ),
          child: _isLoading
              ? const Center(child: Padding(
              padding: EdgeInsets.all(8),
              child: CircularProgressIndicator(color: Color(0xFFB39DDB), strokeWidth: 2)))
              : Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(width: 6, height: 6,
                            decoration: BoxDecoration(color: _statusColor, shape: BoxShape.circle)),
                        const SizedBox(width: 6),
                        const Text("STATUT CLINIQUE DE SUIVI",
                            style: TextStyle(fontSize: 9, color: Color(0xFF757575), fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(_statusText,
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _statusColor)),
                    const SizedBox(height: 2),
                    Text(_statusTime,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF757575), fontStyle: FontStyle.italic)),
                  ],
                ),
              ),
              Column(
                children: [
                  Container(
                    width: 52, height: 52,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE1F5FE), width: 2),
                    ),
                    child: Icon(Icons.favorite, color: _statusColor, size: 21),
                  ),
                  const SizedBox(height: 4),
                  Text(_getStatusBadge(_statusText),
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF757575), letterSpacing: 1)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── MINI STATS ───────────────────────────────────────────
        Row(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => widget.onShowToast("Ouverture des documents 📁"),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEDE7F6)),
                  ),
                  child: Column(
                    children: [
                      Container(padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(color: Color(0xFFEDE7F6), shape: BoxShape.circle),
                          child: const Icon(Icons.folder_outlined, size: 18, color: Color(0xFFB39DDB))),
                      const SizedBox(height: 6),
                      Text(_nombreDocuments.toString(),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                      const Text("Documents dispo",
                          style: TextStyle(fontSize: 10, color: Color(0xFF757575), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: GestureDetector(
                onTap: () => widget.onShowToast("Ouverture du suivi d'examens 🩺"),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEDE7F6)),
                  ),
                  child: Column(
                    children: [
                      Container(padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(color: Color(0xFFFCE4EC), shape: BoxShape.circle),
                          child: const Icon(Icons.show_chart, size: 18, color: Color(0xFFE91E8C))),
                      const SizedBox(height: 6),
                      Text(_nombreExamens.toString(),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                      const Text("Examens & Suivi",
                          style: TextStyle(fontSize: 10, color: Color(0xFF757575), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // ── PROCHAIN RDV ─────────────────────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text("PROCHAIN RENDEZ-VOUS",
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF757575), letterSpacing: 0.5)),
            Text("CHU", style: TextStyle(fontSize: 10, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 6),
        _isLoading
            ? _rdvSkeleton()
            : _prochainRdvDate != null
            ? _rdvCard()
            : _rdvVide(),
        const SizedBox(height: 12),

        // ── BANNIÈRE QUESTIONNAIRE ───────────────────────────────
        if (_surveyBannerVisible)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFCE4EC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFB39DDB).withOpacity(0.4)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.assignment_outlined, size: 16, color: Color(0xFFB39DDB)),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Questionnaire du jour",
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                          SizedBox(height: 4),
                          Text("Partagez comment vous vous sentez — cela aide votre équipe de sénologie au CHU à mieux vous accompagner.",
                              style: TextStyle(fontSize: 11, color: Colors.black87, height: 1.3)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () {
                        setState(() => _surveyBannerVisible = false);
                        widget.onShowToast("Bannière masquée temporairement. 🌸");
                      },
                      child: const Text("Plus tard",
                          style: TextStyle(color: Color(0xFF757575), fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB39DDB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                      onPressed: widget.onOpenQuestionnaire,
                      child: const Text("Remplir maintenant",
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        const SizedBox(height: 12),

        // ── SUIVI DOULEUR SEMAINE ────────────────────────────────
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFEDE7F6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("SUIVI HEBDOMADAIRE DE LA DOULEUR",
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFF757575), letterSpacing: 0.5)),
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(7, (i) {
                  final level = _painLevels[i];
                  Color bgColor;
                  Color textColor;
                  if (level > 5) { bgColor = const Color(0xFFEF9A9A); textColor = Colors.white; }
                  else if (level > 3) { bgColor = const Color(0xFFFFF9C4); textColor = const Color(0xFF795548); }
                  else { bgColor = const Color(0xFFEDE7F6); textColor = const Color(0xFFB39DDB); }
                  return Expanded(
                    child: Column(
                      children: [
                        Container(
                          height: 28,
                          margin: const EdgeInsets.symmetric(horizontal: 2),
                          decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(6)),
                          child: Center(child: Text("$level", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor))),
                        ),
                        const SizedBox(height: 4),
                        Text(_painDays[i], style: const TextStyle(fontSize: 8, color: Colors.grey)),
                      ],
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  // ── Widgets helpers ──────────────────────────────
  String _getStatusBadge(String statusText) {
    if (statusText.contains("Attention") || statusText.contains("critique")) return "ALERTE";
    if (statusText.contains("surveiller")) return "VIGILANCE";
    if (statusText.contains("archivé")) return "ARCHIVÉ";
    return "STABLE";
  }

  Widget _rdvCard() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE7F6)),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: const Color(0xFFFCE4EC), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.calendar_month, color: Color(0xFFE91E8C), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(_prochainRdvDate ?? '',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                const SizedBox(height: 2),
                Text(_prochainRdvMedecin ?? '',
                    style: const TextStyle(fontSize: 11, color: Color(0xFF757575))),
                const SizedBox(height: 1),
                Text(_prochainRdvSpecialite ?? '',
                    style: const TextStyle(fontSize: 11, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: const Color(0xFFEDE7F6), borderRadius: BorderRadius.circular(20)),
            child: Text(_prochainRdvDans ?? '',
                style: const TextStyle(fontSize: 10, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _rdvVide() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE7F6)),
      ),
      child: const Center(
        child: Text("Aucun rendez-vous planifié",
            style: TextStyle(fontSize: 12, color: Colors.grey)),
      ),
    );
  }

  Widget _rdvSkeleton() {
    return Container(
      height: 70,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE7F6)),
      ),
      child: const Center(
        child: SizedBox(width: 20, height: 20,
            child: CircularProgressIndicator(color: Color(0xFFB39DDB), strokeWidth: 2)),
      ),
    );
  }

  Widget _examItem(String emoji, String title, String date, String badge, Color badgeBg, Color badgeText) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEDE7F6)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 16)),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                  Text(date, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(color: badgeBg, borderRadius: BorderRadius.circular(20)),
            child: Text(badge, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: badgeText)),
          ),
        ],
      ),
    );
  }
}