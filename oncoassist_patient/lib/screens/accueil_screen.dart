import 'package:flutter/material.dart';
import 'dart:async';
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
  final String dossierMedicalId;

  const AccueilScreen({
    Key? key,
    required this.patient,
    required this.clinicalStatusText,
    required this.clinicalStatusTime,
    required this.onOpenQuestionnaire,
    required this.onShowToast,
    required this.patientId,
    required this.token,
    required this.dossierMedicalId,
  }) : super(key: key);

  @override
  State<AccueilScreen> createState() => _AccueilScreenState();
}

class _AccueilScreenState extends State<AccueilScreen> {
  int _currentQuoteIndex = 0;
  bool _surveyBannerVisible = true;

  bool _isLoading = true;
  Color _statusColor = const Color(0xFFE91E8C);
  String _statusText = "Suivi personnalisé actif";
  String _statusSubtitle = "Votre équipe médicale veille sur vous.";
  String _statusTime = "...";
  String _statusBadge = "STABLE";
  int _nombreDocuments = 0;
  int _nombreExamens = 0;

  // RDV
  String? _rdvDate;
  String? _rdvMedecin;
  String? _rdvSpecialite;
  String? _rdvDans;

  // 2 derniers examens
  List<Map<String, dynamic>> _dernierExamens = [];

  // Photo profil
  String _photoProfil = '';

  final List<String> _quotes = [
    "Chaque jour est une victoire 💪",
    "Vous êtes courageuse 🎀",
    "Nous sommes là pour vous ✨",
    "Prenez soin de vous aujourd'hui 🌸",
  ];

  final List<int> _painLevels = [2, 3, 2, 4, 3, 3, 3];
  final List<String> _painDays = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 6), (_) {
      if (mounted) setState(() => _currentQuoteIndex = (_currentQuoteIndex + 1) % _quotes.length);
    });
    _fetchAll();
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  Future<void> _fetchAll() async {
    await Future.wait([_fetchPatient(), _fetchRdv(), _fetchExamens()]);
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _fetchPatient() async {
    try {
      final d = await ApiService.get('/patients/${widget.patientId}');
      if (!mounted) return;
      final statut = d['statut'] ?? 'EN_SUIVI';
      setState(() {
        _photoProfil      = d['photoProfil'] ?? '';
        _nombreExamens    = d['nombreExamens'] ?? 0;
        _statusText       = _labelStatut(statut);
        _statusSubtitle   = _subtitleStatut(statut);
        _statusColor      = _colorStatut(statut);
        _statusBadge      = _badgeStatut(statut);
        _statusTime       = "Mis à jour aujourd'hui";
      });
    } catch (_) {
      if (mounted) setState(() {
        _statusText = widget.clinicalStatusText;
      });
    }
  }

  Future<void> _fetchRdv() async {
    try {
      final List<dynamic> rdvs = await ApiService.get('/rendez-vous/patient/${widget.patientId}');
      final now = DateTime.now();
      final futurs = rdvs.where((r) {
        final date   = DateTime.tryParse(r['date'] ?? '');
        final statut = r['statut'] ?? '';
        return date != null && date.isAfter(now) &&
            (statut == 'PLANIFIE' || statut == 'EN_ATTENTE');
      }).toList();
      futurs.sort((a, b) => DateTime.parse(a['date']).compareTo(DateTime.parse(b['date'])));
      if (!mounted || futurs.isEmpty) return;
      final rdv  = futurs.first;
      final date = DateTime.parse(rdv['date']);
      final diff = date.difference(now).inDays;
      setState(() {
        _rdvDate       = _fmtDateTime(date);
        _rdvMedecin    = 'Dr. ${rdv['medecinPrenom'] ?? ''} ${rdv['medecinNom'] ?? ''}';
        _rdvSpecialite = rdv['medecinSpecialite'] ?? rdv['motif'] ?? 'Consultation';
        _rdvDans       = diff == 0 ? "Aujourd'hui" : diff == 1 ? "Demain" : "Dans ${diff}j";
      });
    } catch (_) {}
  }

  Future<void> _fetchExamens() async {
    // Nombre de documents via dossierMedicalId (même logique que DocumentsScreen)
    try {
      final results = await Future.wait([
        ApiService.get('/documents/dossier/${widget.dossierMedicalId}'),
        ApiService.get('/documents/dossier/${widget.dossierMedicalId}/resultats'),
        ApiService.get('/documents/dossier/${widget.dossierMedicalId}/ordonnances'),
      ]);
      final Set<String> seen = {};
      int count = 0;
      for (final list in results) {
        for (final item in list as List<dynamic>) {
          final id = item['id']?.toString() ?? '';
          if (!seen.contains(id)) { seen.add(id); count++; }
        }
      }
      if (mounted) setState(() => _nombreDocuments = count);
    } catch (_) {}

    // 2 derniers examens via dossierMedicalId
    try {
      final List<dynamic> plans = await ApiService.get('/plans-traitement/dossier/${widget.dossierMedicalId}');
      final faits = plans
          .where((p) => (p['statut'] ?? '') == 'fait' && p['dateConsultation'] != null)
          .toList();
      faits.sort((a, b) => (b['dateConsultation'] as String).compareTo(a['dateConsultation'] as String));
      if (mounted) setState(() => _dernierExamens = faits.take(2).map((p) => Map<String,dynamic>.from(p)).toList());
    } catch (_) {}
  }

  // ── Statuts bienveillants ────────────────────────────────
  String _labelStatut(String s) {
    switch (s) {
      case 'NOUVELLE':     return "Bienvenue dans votre suivi 🌸";
      case 'STABLE':       return "Tout se passe bien";
      case 'EN_SUIVI':     return "Suivi personnalisé actif";
      case 'A_SURVEILLER': return "Votre équipe est attentive";
      case 'CRITIQUE':     return "Votre équipe est mobilisée";
      case 'ARCHIVEE':     return "Parcours complété 🎉";
      default:             return "Suivi personnalisé actif";
    }
  }

  String _subtitleStatut(String s) {
    switch (s) {
      case 'NOUVELLE':     return "Votre parcours de soins commence. Bienvenue !";
      case 'STABLE':       return "Continuez sur cette belle lancée !";
      case 'EN_SUIVI':     return "Votre équipe médicale veille sur vous.";
      case 'A_SURVEILLER': return "Un suivi renforcé est mis en place pour vous.";
      case 'CRITIQUE':     return "Votre médecin est pleinement disponible pour vous.";
      case 'ARCHIVEE':     return "Vous avez terminé votre parcours de soins. Bravo !";
      default:             return "Votre équipe médicale veille sur vous.";
    }
  }

  Color _colorStatut(String s) {
    switch (s) {
      case 'CRITIQUE':     return const Color(0xFFE91E8C);
      case 'A_SURVEILLER': return const Color(0xFFB39DDB);
      case 'ARCHIVEE':     return Colors.grey;
      default:             return const Color(0xFFE91E8C);
    }
  }

  String _badgeStatut(String s) {
    switch (s) {
      case 'NOUVELLE':     return "NOUVEAU";
      case 'STABLE':       return "STABLE";
      case 'EN_SUIVI':     return "STABLE";
      case 'A_SURVEILLER': return "VIGILANCE";
      case 'CRITIQUE':     return "PRIORITÉ";
      case 'ARCHIVEE':     return "TERMINÉ";
      default:             return "STABLE";
    }
  }

  // ── Style examen ─────────────────────────────────────────
  _ExStyle _styleExamen(String etape) {
    final e = etape.toLowerCase();
    if (e.contains('mammo'))  return const _ExStyle(Icons.monitor_heart_rounded,   Color(0xFFE7F0FB), Color(0xFF3B7DD8), 'MAM');
    if (e.contains('echo'))   return const _ExStyle(Icons.graphic_eq_rounded,      Color(0xFFEDE8F8), Color(0xFF8E6FCC), 'ECH');
    if (e.contains('irm'))    return const _ExStyle(Icons.scanner_rounded,          Color(0xFFFBEFE6), Color(0xFFD9803B), 'IRM');
    if (e.contains('biopsie'))return const _ExStyle(Icons.biotech_rounded,          Color(0xFFE6F4EC), Color(0xFF2E9E5B), 'HIS');
    return                           const _ExStyle(Icons.medical_services_outlined, Color(0xFFF0ECF9), Color(0xFF7B5EA7), 'CLI');
  }

  String _fmtDateTime(DateTime d) {
    const j = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    const m = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    return '${j[d.weekday-1]} ${d.day} ${m[d.month-1]} • ${d.hour.toString().padLeft(2,'0')}:${d.minute.toString().padLeft(2,'0')}';
  }

  String _fmtDateStr(String? raw) {
    if (raw == null) return '';
    try {
      final d = DateTime.parse(raw);
      const m = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
      return '${d.day} ${m[d.month-1]} ${d.year}';
    } catch (_) { return raw; }
  }

  String get _avatarUrl {
    if (_photoProfil.isEmpty) return '';
    if (_photoProfil.startsWith('http')) return _photoProfil;
    return 'http://10.0.2.2:8080/$_photoProfil';
  }

  @override
  Widget build(BuildContext context) {
    final initiales =
        '${widget.patient.firstName.isNotEmpty ? widget.patient.firstName[0] : ''}'
        '${widget.patient.lastName.isNotEmpty  ? widget.patient.lastName[0]  : ''}';

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
              begin: Alignment.topLeft, end: Alignment.bottomRight,
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
                            style: TextStyle(color: Color(0xFFB39DDB),
                                fontWeight: FontWeight.w800, fontSize: 10, letterSpacing: 1.5)),
                        const SizedBox(height: 4),
                        Text("Bonjour, ${widget.patient.firstName} 🌸",
                            style: const TextStyle(fontSize: 19,
                                fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                        const SizedBox(height: 4),
                        Text(_quotes[_currentQuoteIndex],
                            style: const TextStyle(fontSize: 12,
                                color: Color(0xFFE91E8C), fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Photo profil ou initiales
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8BBD0),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: ClipOval(
                      child: _avatarUrl.isNotEmpty
                          ? Image.network(_avatarUrl, fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Center(
                              child: Text(initiales.toUpperCase(),
                                  style: const TextStyle(fontWeight: FontWeight.bold,
                                      color: Color(0xFFE91E8C), fontSize: 14))))
                          : Center(
                          child: Text(initiales.toUpperCase(),
                              style: const TextStyle(fontWeight: FontWeight.bold,
                                  color: Color(0xFFE91E8C), fontSize: 14))),
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
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold,
                            color: Color(0xFFB39DDB), fontFamily: 'monospace')),
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
                    Row(children: [
                      Container(width: 6, height: 6,
                          decoration: BoxDecoration(color: _statusColor, shape: BoxShape.circle)),
                      const SizedBox(width: 6),
                      const Text("MON SUIVI",
                          style: TextStyle(fontSize: 9, color: Color(0xFF757575),
                              fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                    ]),
                    const SizedBox(height: 4),
                    Text(_statusText,
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: _statusColor)),
                    const SizedBox(height: 2),
                    Text(_statusSubtitle,
                        style: const TextStyle(fontSize: 10, color: Color(0xFF757575),
                            fontStyle: FontStyle.italic, height: 1.3)),
                  ],
                ),
              ),
              Column(children: [
                Container(
                  width: 52, height: 52,
                  decoration: BoxDecoration(
                    color: Colors.white, shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFE1F5FE), width: 2),
                  ),
                  child: Icon(Icons.favorite, color: _statusColor, size: 21),
                ),
                const SizedBox(height: 4),
                Text(_statusBadge,
                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold,
                        color: Color(0xFF757575), letterSpacing: 1)),
              ]),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── MINI STATS ───────────────────────────────────────────
        Row(children: [
          Expanded(
            child: GestureDetector(
              onTap: () => widget.onShowToast("Ouverture des documents 📁"),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEDE7F6))),
                child: Column(children: [
                  Container(padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(color: Color(0xFFEDE7F6), shape: BoxShape.circle),
                      child: const Icon(Icons.folder_outlined, size: 18, color: Color(0xFFB39DDB))),
                  const SizedBox(height: 6),
                  Text(_isLoading ? '...' : _nombreDocuments.toString(),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                  const Text("Documents dispo",
                      style: TextStyle(fontSize: 10, color: Color(0xFF757575), fontWeight: FontWeight.bold)),
                ]),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: GestureDetector(
              onTap: () => widget.onShowToast("Ouverture du suivi d'examens 🩺"),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFEDE7F6))),
                child: Column(children: [
                  Container(padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(color: Color(0xFFFCE4EC), shape: BoxShape.circle),
                      child: const Icon(Icons.show_chart, size: 18, color: Color(0xFFE91E8C))),
                  const SizedBox(height: 6),
                  Text(_isLoading ? '...' : _nombreExamens.toString(),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                  const Text("Examens & Suivi",
                      style: TextStyle(fontSize: 10, color: Color(0xFF757575), fontWeight: FontWeight.bold)),
                ]),
              ),
            ),
          ),
        ]),
        const SizedBox(height: 12),

        // ── PROCHAIN RDV ─────────────────────────────────────────
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [
          Text("PROCHAIN RENDEZ-VOUS",
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
                  color: Color(0xFF757575), letterSpacing: 0.5)),
          Text("CHU", style: TextStyle(fontSize: 10, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
        ]),
        const SizedBox(height: 6),
        _isLoading ? _skeleton() : _rdvDate != null ? _rdvCard() : _rdvVide(),
        const SizedBox(height: 12),

        // ── 2 DERNIERS EXAMENS ───────────────────────────────────
        if (!_isLoading && _dernierExamens.isNotEmpty) ...[
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: const [
            Text("EXAMENS RÉCENTS",
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold,
                    color: Color(0xFF757575), letterSpacing: 0.5)),
            Text("Voir parcours →",
                style: TextStyle(fontSize: 10, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
          ]),
          const SizedBox(height: 6),
          ..._dernierExamens.map((ex) {
            final etape   = ex['etape'] ?? 'Examen';
            final date    = _fmtDateStr(ex['dateConsultation']);
            final medecin = ex['auteurPrenom'] != null
                ? 'Dr. ${ex['auteurPrenom']} ${ex['auteurNom'] ?? ''}'
                : 'Médecin référent';
            final s = _styleExamen(etape);
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFEDE7F6))),
              child: Row(children: [
                Container(width: 40, height: 40,
                    decoration: BoxDecoration(color: s.bg, borderRadius: BorderRadius.circular(11)),
                    child: Icon(s.icon, color: s.color, size: 20)),
                const SizedBox(width: 10),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(etape.toUpperCase(),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                  const SizedBox(height: 1),
                  Text(medecin, style: const TextStyle(fontSize: 10, color: Color(0xFF757575))),
                  if (date.isNotEmpty)
                    Text(date, style: const TextStyle(fontSize: 10, color: Color(0xFFB39DDB), fontWeight: FontWeight.w600)),
                ])),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: s.bg, borderRadius: BorderRadius.circular(20)),
                  child: Text(s.badge,
                      style: TextStyle(fontSize: 8, fontWeight: FontWeight.w800, color: s.color)),
                ),
              ]),
            );
          }).toList(),
          const SizedBox(height: 4),
        ],

        // ── BANNIÈRE QUESTIONNAIRE ───────────────────────────────
        if (_surveyBannerVisible)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFCE4EC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFB39DDB).withOpacity(0.4)),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.assignment_outlined, size: 16, color: Color(0xFFB39DDB)),
                ),
                const SizedBox(width: 10),
                const Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text("Questionnaire du jour",
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                  SizedBox(height: 4),
                  Text("Partagez comment vous vous sentez — cela aide votre équipe de sénologie au CHU.",
                      style: TextStyle(fontSize: 11, color: Colors.black87, height: 1.3)),
                ])),
              ]),
              const SizedBox(height: 12),
              Row(mainAxisAlignment: MainAxisAlignment.end, children: [
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
              ]),
            ]),
          ),
        const SizedBox(height: 12),

        // ── SUIVI DOULEUR ────────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFEDE7F6))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text("SUIVI HEBDOMADAIRE DE LA DOULEUR",
                style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold,
                    color: Color(0xFF757575), letterSpacing: 0.5)),
            const SizedBox(height: 10),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(7, (i) {
                  final level = _painLevels[i];
                  Color bgColor;
                  Color textColor;
                  if (level > 5)      { bgColor = const Color(0xFFEF9A9A); textColor = Colors.white; }
                  else if (level > 3) { bgColor = const Color(0xFFFFF9C4); textColor = const Color(0xFF795548); }
                  else                { bgColor = const Color(0xFFEDE7F6); textColor = const Color(0xFFB39DDB); }
                  return Expanded(child: Column(children: [
                    Container(
                      height: 28, margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(6)),
                      child: Center(child: Text("$level",
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: textColor))),
                    ),
                    const SizedBox(height: 4),
                    Text(_painDays[i], style: const TextStyle(fontSize: 8, color: Colors.grey)),
                  ]));
                })),
          ]),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _rdvCard() => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE7F6))),
    child: Row(children: [
      Container(width: 40, height: 40,
          decoration: BoxDecoration(color: const Color(0xFFFCE4EC), borderRadius: BorderRadius.circular(10)),
          child: const Icon(Icons.calendar_month, color: Color(0xFFE91E8C), size: 20)),
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(_rdvDate ?? '', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
        const SizedBox(height: 2),
        Text(_rdvMedecin ?? '', style: const TextStyle(fontSize: 11, color: Color(0xFF757575))),
        const SizedBox(height: 1),
        Text(_rdvSpecialite ?? '', style: const TextStyle(fontSize: 11, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
      ])),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: const Color(0xFFEDE7F6), borderRadius: BorderRadius.circular(20)),
        child: Text(_rdvDans ?? '',
            style: const TextStyle(fontSize: 10, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
      ),
    ]),
  );

  Widget _rdvVide() => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE7F6))),
    child: const Center(child: Text("Aucun rendez-vous planifié",
        style: TextStyle(fontSize: 12, color: Colors.grey))),
  );

  Widget _skeleton() => Container(
    height: 70, padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE7F6))),
    child: const Center(child: SizedBox(width: 20, height: 20,
        child: CircularProgressIndicator(color: Color(0xFFB39DDB), strokeWidth: 2))),
  );
}

class _ExStyle {
  final IconData icon;
  final Color bg;
  final Color color;
  final String badge;
  const _ExStyle(this.icon, this.bg, this.color, this.badge);
}