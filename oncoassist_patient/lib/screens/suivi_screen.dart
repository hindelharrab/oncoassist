import 'package:flutter/material.dart';
import '../services/api_service.dart';

class SuiviScreen extends StatefulWidget {
  final VoidCallback onOpenQuestionnaire;
  final Function(String) onShowToast;
  final String patientId;
  final String dossierMedicalId;

  const SuiviScreen({
    Key? key,
    required this.onOpenQuestionnaire,
    required this.onShowToast,
    required this.patientId,
    required this.dossierMedicalId,
  }) : super(key: key);

  @override
  State<SuiviScreen> createState() => _SuiviScreenState();
}

class _SuiviScreenState extends State<SuiviScreen> {
  bool _isLoading = true;
  String? _error;
  List<_PlanItem> _plans = [];

  @override
  void initState() {
    super.initState();
    _fetchPlans();
  }

  Future<void> _fetchPlans() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final List<dynamic> data = await ApiService.get(
          '/plans-traitement/dossier/${widget.dossierMedicalId}');

      // Faits triés par date décroissante, puis à venir
      final faits = data
          .where((p) => p['statut'] == 'fait')
          .map((p) => _PlanItem.fromJson(p))
          .toList()
        ..sort((a, b) => b.rawDate.compareTo(a.rawDate));

      final aVenir = data
          .where((p) => p['statut'] != 'fait')
          .map((p) => _PlanItem.fromJson(p))
          .toList();

      setState(() {
        _plans = [...faits, ...aVenir];
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _error = "Impossible de charger le parcours."; _isLoading = false; });
    }
  }

  String _emojiForEtape(String etape) {
    final e = etape.toLowerCase();
    if (e.contains('mammo'))    return '🔬';
    if (e.contains('echo'))     return '📡';
    if (e.contains('irm') || e.contains('rm')) return '🧲';
    if (e.contains('biopsie'))  return '🧬';
    if (e.contains('examen'))   return '🩺';
    if (e.contains('chimio'))   return '💊';
    if (e.contains('radio'))    return '☢️';
    return '🏥';
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [

        // ── RAPPORT HEBDO ─────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFEDE7F6)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("RAPPORT HEBDOMADAIRE",
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800,
                            color: Colors.grey, letterSpacing: 0.5)),
                    SizedBox(height: 4),
                    Text("Partagez en direct votre état de douleur",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold,
                            color: Color(0xFF2D2D2D))),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB39DDB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  elevation: 0,
                ),
                onPressed: widget.onOpenQuestionnaire,
                icon: const Icon(Icons.add, size: 12),
                label: const Text("Bilan du jour",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── TITRE ─────────────────────────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Flexible(
              child: Text("MON PARCOURS DE SOINS",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold,
                      color: Color(0xFFB39DDB), letterSpacing: 0.5)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFEDE7F6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _isLoading ? 'Chargement...' : '${_plans.length} étapes',
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold,
                    color: Color(0xFFB39DDB)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // ── LOADING ───────────────────────────────────────────
        if (_isLoading)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(40),
              child: CircularProgressIndicator(
                  color: Color(0xFFB39DDB), strokeWidth: 2),
            ),
          )

        // ── ERREUR ────────────────────────────────────────────
        else if (_error != null)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFFFEBEE),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFEF9A9A)),
            ),
            child: Row(
              children: [
                const Icon(Icons.warning_amber_rounded,
                    color: Color(0xFFE53935), size: 18),
                const SizedBox(width: 8),
                Expanded(child: Text(_error!,
                    style: const TextStyle(fontSize: 12, color: Color(0xFFE53935)))),
                TextButton(
                  onPressed: _fetchPlans,
                  child: const Text("Réessayer",
                      style: TextStyle(fontSize: 11, color: Color(0xFFB39DDB))),
                ),
              ],
            ),
          )

        // ── VIDE ──────────────────────────────────────────────
        else if (_plans.isEmpty)
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFEDE7F6)),
              ),
              child: const Center(
                child: Text("Aucune étape dans votre parcours",
                    style: TextStyle(fontSize: 12, color: Colors.grey)),
              ),
            )

          // ── TIMELINE ──────────────────────────────────────────
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _plans.length,
              itemBuilder: (ctx, index) {
                final plan = _plans[index];
                final isFait = plan.statut == 'fait';
                final isLast = index == _plans.length - 1;

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Dot + ligne ──
                    Column(
                      children: [
                        Container(
                          width: 12, height: 12,
                          margin: const EdgeInsets.only(top: 4),
                          decoration: BoxDecoration(
                            color: isFait
                                ? const Color(0xFFE91E8C)
                                : const Color(0xFFB0BEC5),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 2),
                          ),
                        ),
                        if (!isLast)
                          Container(
                            width: 1.5, height: 90,
                            color: const Color(0xFFB39DDB).withOpacity(0.3),
                          ),
                      ],
                    ),
                    const SizedBox(width: 14),

                    // ── Carte ──
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Badge statut + date
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isFait
                                        ? const Color(0xFFE8F5E9)
                                        : const Color(0xFFF5F5F5),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    isFait ? 'FAIT' : 'À VENIR',
                                    style: TextStyle(
                                      fontSize: 8,
                                      fontWeight: FontWeight.w800,
                                      color: isFait
                                          ? const Color(0xFF388E3C)
                                          : const Color(0xFF757575),
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  isFait ? plan.dateFormatee : 'En attente',
                                  style: const TextStyle(
                                      fontSize: 10, color: Colors.grey,
                                      fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),

                            // Carte blanche
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isFait
                                      ? const Color(0xFFEDE7F6)
                                      : const Color(0xFFEEEEEE),
                                ),
                              ),
                              child: Row(
                                children: [
                                  // Emoji étape
                                  Text(_emojiForEtape(plan.etape),
                                      style: const TextStyle(fontSize: 20)),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          plan.etape.toUpperCase(),
                                          style: const TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w800,
                                            color: Color(0xFF2D2D2D),
                                            letterSpacing: 0.3,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          plan.medecinLabel,
                                          style: const TextStyle(
                                              fontSize: 11,
                                              color: Color(0xFF757575)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  // Icône état
                                  Icon(
                                    isFait
                                        ? Icons.check_circle
                                        : Icons.schedule,
                                    color: isFait
                                        ? const Color(0xFF81C784)
                                        : const Color(0xFFB0BEC5),
                                    size: 18,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
      ],
    );
  }
}

// ── Modèle local ─────────────────────────────────────────────
class _PlanItem {
  final String id;
  final String etape;
  final String statut;
  final String dateFormatee;
  final String rawDate;
  final String medecinLabel;

  _PlanItem({
    required this.id,
    required this.etape,
    required this.statut,
    required this.dateFormatee,
    required this.rawDate,
    required this.medecinLabel,
  });

  factory _PlanItem.fromJson(Map<String, dynamic> json) {
    final rawDate = json['dateConsultation'] ?? '';
    return _PlanItem(
      id: json['id']?.toString() ?? '',
      etape: json['etape'] ?? 'Examen',
      statut: json['statut'] ?? 'à venir',
      dateFormatee: _fmtDate(rawDate),
      rawDate: rawDate,
      medecinLabel: json['auteurPrenom'] != null
          ? 'Dr. ${json['auteurPrenom']} ${json['auteurNom'] ?? ''}'
          : 'Médecin référent',
    );
  }

  static String _fmtDate(String? raw) {
    if (raw == null || raw.isEmpty) return 'En attente';
    try {
      final d = DateTime.parse(raw);
      const m = ['Jan','Fév','Mar','Avr','Mai','Jun',
        'Jul','Aoû','Sep','Oct','Nov','Déc'];
      return '${d.day.toString().padLeft(2,'0')}/${m[d.month-1]}/${d.year}';
    } catch (_) { return raw; }
  }
}