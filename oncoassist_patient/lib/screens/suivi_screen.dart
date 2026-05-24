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
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final List<dynamic> data = await ApiService.get(
          '/plans-traitement/dossier/${widget.dossierMedicalId}');

      if (!mounted) return;

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
      if (!mounted) return;
      setState(() {
        _error = "Impossible de charger le parcours.";
        _isLoading = false;
      });
    }
  }

  // ── Icône PRO + couleur selon le type d'étape ───────────
  _EtapeStyle _styleForEtape(String etape) {
    final e = etape.toLowerCase();
    if (e.contains('mammo')) {
      return const _EtapeStyle(
          Icons.radio_button_checked_rounded, Color(0xFF7E57C2)); // violet
    }
    if (e.contains('echo')) {
      return const _EtapeStyle(
          Icons.graphic_eq_rounded, Color(0xFF26A69A)); // teal
    }
    if (e.contains('irm') || e.contains('rm')) {
      return const _EtapeStyle(
          Icons.blur_circular_rounded, Color(0xFF5C6BC0)); // indigo
    }
    if (e.contains('biopsie')) {
      return const _EtapeStyle(
          Icons.biotech_rounded, Color(0xFFEC407A)); // rose
    }
    if (e.contains('consult')) {
      return const _EtapeStyle(
          Icons.monitor_heart_rounded, Color(0xFF42A5F5)); // bleu
    }
    if (e.contains('examen')) {
      return const _EtapeStyle(
          Icons.medical_services_rounded, Color(0xFF42A5F5)); // bleu
    }
    if (e.contains('chimio')) {
      return const _EtapeStyle(
          Icons.medication_rounded, Color(0xFFFFA726)); // orange
    }
    if (e.contains('tamox') || e.contains('hormono')) {
      return const _EtapeStyle(
          Icons.medication_liquid_rounded, Color(0xFFFF7043)); // deep orange
    }
    if (e.contains('radio')) {
      return const _EtapeStyle(
          Icons.flare_rounded, Color(0xFFEF5350)); // rouge
    }
    if (e.contains('chirurg') || e.contains('opér')) {
      return const _EtapeStyle(
          Icons.healing_rounded, Color(0xFF66BB6A)); // vert
    }
    return const _EtapeStyle(
        Icons.local_hospital_rounded, Color(0xFFB39DDB)); // défaut violet
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
                        style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: Colors.grey,
                            letterSpacing: 0.5)),
                    SizedBox(height: 4),
                    Text("Partagez en direct votre état de douleur",
                        style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF2D2D2D))),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFB39DDB),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 12, vertical: 10),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  elevation: 0,
                ),
                onPressed: widget.onOpenQuestionnaire,
                icon: const Icon(Icons.add, size: 12),
                label: const Text("Bilan du jour",
                    style: TextStyle(
                        fontSize: 10, fontWeight: FontWeight.bold)),
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
                  style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFB39DDB),
                      letterSpacing: 0.5)),
            ),
            Container(
              padding:
              const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFEDE7F6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _isLoading ? 'Chargement...' : '${_plans.length} étapes',
                style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
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
                Expanded(
                    child: Text(_error!,
                        style: const TextStyle(
                            fontSize: 12, color: Color(0xFFE53935)))),
                TextButton(
                  onPressed: _fetchPlans,
                  child: const Text("Réessayer",
                      style: TextStyle(
                          fontSize: 11, color: Color(0xFFB39DDB))),
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
                final style = _styleForEtape(plan.etape);

                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Dot coloré + ligne ──
                    Column(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          margin: const EdgeInsets.only(top: 4),
                          decoration: BoxDecoration(
                            color: isFait ? style.color : Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: isFait
                                  ? style.color
                                  : const Color(0xFFB0BEC5),
                              width: 2.5,
                            ),
                          ),
                        ),
                        if (!isLast)
                          Container(
                            width: 2,
                            height: 110,
                            color: const Color(0xFFB39DDB).withOpacity(0.25),
                          ),
                      ],
                    ),
                    const SizedBox(width: 14),

                    // ── Carte ──
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Badge date + statut (ligne du haut)
                            Row(
                              children: [
                                Text(
                                  isFait
                                      ? plan.dateFormatee.toUpperCase()
                                      : 'EN ATTENTE',
                                  style: const TextStyle(
                                      fontSize: 10,
                                      color: Color(0xFF9E9E9E),
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 0.3),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: isFait
                                        ? style.color.withOpacity(0.12)
                                        : const Color(0xFFF5F5F5),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    isFait ? 'Effectué' : 'À venir',
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                      color: isFait
                                          ? style.color
                                          : const Color(0xFF9E9E9E),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),

                            // Carte blanche avec icône pro colorée
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: const Color(0xFFEDE7F6),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.03),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Icône dans pastille colorée
                                  Container(
                                    width: 42,
                                    height: 42,
                                    decoration: BoxDecoration(
                                      color: style.color.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(style.icon,
                                        color: style.color, size: 22),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          plan.etape,
                                          style: const TextStyle(
                                            fontSize: 13.5,
                                            fontWeight: FontWeight.w800,
                                            color: Color(0xFF2D2D2D),
                                          ),
                                        ),
                                        const SizedBox(height: 3),
                                        Text(
                                          plan.medecinLabel,
                                          style: const TextStyle(
                                              fontSize: 11,
                                              color: Color(0xFF9E9E9E)),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Icon(
                                    isFait
                                        ? Icons.check_circle_rounded
                                        : Icons.schedule_rounded,
                                    color: isFait
                                        ? style.color
                                        : const Color(0xFFB0BEC5),
                                    size: 20,
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

// ── Style d'étape (icône + couleur) ──────────────────────────
class _EtapeStyle {
  final IconData icon;
  final Color color;
  const _EtapeStyle(this.icon, this.color);
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
      const m = [
        'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
        'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
      ];
      return '${d.day.toString().padLeft(2, '0')} ${m[d.month - 1]} ${d.year}';
    } catch (_) {
      return raw;
    }
  }
}