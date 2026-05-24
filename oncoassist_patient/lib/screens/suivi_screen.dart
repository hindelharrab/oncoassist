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

  // ── Icône PRO + couleur selon le type d'étape ──────────
  _EtapeStyle _styleForEtape(String etape) {
    final e = etape.toLowerCase();
    if (e.contains('mammo')) {
      return const _EtapeStyle(
          Icons.radio_button_checked_rounded, Color(0xFF7E57C2));
    }
    if (e.contains('echo')) {
      return const _EtapeStyle(Icons.graphic_eq_rounded, Color(0xFF26A69A));
    }
    if (e.contains('irm') || e.contains('rm')) {
      return const _EtapeStyle(Icons.blur_circular_rounded, Color(0xFF5C6BC0));
    }
    if (e.contains('biopsie')) {
      return const _EtapeStyle(Icons.biotech_rounded, Color(0xFFEC407A));
    }
    if (e.contains('consult')) {
      return const _EtapeStyle(Icons.event_available_rounded, Color(0xFF42A5F5));
    }
    if (e.contains('examen')) {
      return const _EtapeStyle(
          Icons.medical_services_rounded, Color(0xFF42A5F5));
    }
    if (e.contains('chimio')) {
      return const _EtapeStyle(Icons.medication_rounded, Color(0xFFFFA726));
    }
    if (e.contains('tamox') || e.contains('hormono')) {
      return const _EtapeStyle(
          Icons.medication_liquid_rounded, Color(0xFFFF7043));
    }
    if (e.contains('radio')) {
      return const _EtapeStyle(Icons.flare_rounded, Color(0xFFEF5350));
    }
    if (e.contains('chirurg') || e.contains('opér')) {
      return const _EtapeStyle(Icons.healing_rounded, Color(0xFF66BB6A));
    }
    if (e.contains('document') || e.contains('résultat')) {
      return const _EtapeStyle(
          Icons.description_rounded, Color(0xFF8D6E63));
    }
    return const _EtapeStyle(Icons.local_hospital_rounded, Color(0xFFB39DDB));
  }

  // ── Couleur du dot selon le type (comme React) ──────────
  Color _dotColor(String etape) {
    final e = etape.toLowerCase();
    if (e.contains('biopsie') || e.contains('document')) {
      return const Color(0xFFF8BBD0); // rose
    }
    if (e.contains('mammo') || e.contains('examen')) {
      return const Color(0xFFB39DDB); // mauve
    }
    if (e.contains('tamox') || e.contains('hormono') || e.contains('chimio')) {
      return const Color(0xFFD1C4E9); // lavande
    }
    if (e.contains('consult') || e.contains('echo') || e.contains('irm')) {
      return const Color(0xFFB3E5FC); // bleu
    }
    return const Color(0xFFFFF9C4); // jaune (défaut)
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
              child: const Text(
                'Chronologique',
                style: TextStyle(
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

          // ── TIMELINE (style React : ligne pointillée à gauche) ──
          else
            _buildTimeline(),
      ],
    );
  }

  // ── Timeline avec ligne verticale pointillée ────────────
  Widget _buildTimeline() {
    return Stack(
      children: [
        // Ligne verticale pointillée (left-2)
        Positioned(
          left: 8,
          top: 8,
          bottom: 8,
          child: _DashedLine(color: const Color(0xFFB39DDB)),
        ),
        // Liste des événements (pl-6)
        Padding(
          padding: const EdgeInsets.only(left: 24),
          child: Column(
            children: List.generate(_plans.length, (index) {
              final plan = _plans[index];
              final isLatest = index == 0 && plan.statut == 'fait';

              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Dot indicateur (-left-6, top-1)
                    Positioned(
                      left: -24,
                      top: 4,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: _dotColor(plan.etape),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 3,
                            ),
                          ],
                        ),
                      ),
                    ),

                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Date + badge
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              plan.dateFormatee,
                              style: const TextStyle(
                                fontSize: 9.5,
                                color: Color(0xFF9E9E9E),
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: isLatest
                                    ? const Color(0xFFFCE4EC)
                                    : const Color(0xFFF5F5F5),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                plan.badge,
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.bold,
                                  color: isLatest
                                      ? const Color(0xFFE91E8C)
                                      : const Color(0xFF757575),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),

                        // Carte blanche
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border:
                            Border.all(color: const Color(0xFFEDE7F6)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Titre avec icône pro colorée
                              Row(
                                crossAxisAlignment:
                                CrossAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 30,
                                    height: 30,
                                    decoration: BoxDecoration(
                                      color: _styleForEtape(plan.etape)
                                          .color
                                          .withOpacity(0.12),
                                      borderRadius:
                                      BorderRadius.circular(9),
                                    ),
                                    child: Icon(
                                      _styleForEtape(plan.etape).icon,
                                      color:
                                      _styleForEtape(plan.etape).color,
                                      size: 17,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      plan.etape,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                        color: Color(0xFF2D2D2D),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 3),
                              // Sous-titre (médecin)
                              Text(
                                plan.medecinLabel,
                                style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF757575)),
                              ),
                              const SizedBox(height: 5),
                              // Date de l'examen avec icône calendrier
                              Row(
                                children: [
                                  Icon(
                                    Icons.calendar_today_rounded,
                                    size: 11,
                                    color: _styleForEtape(plan.etape).color,
                                  ),
                                  const SizedBox(width: 5),
                                  Text(
                                    plan.dateFormatee,
                                    style: TextStyle(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w600,
                                      color: _styleForEtape(plan.etape).color,
                                    ),
                                  ),
                                ],
                              ),
                              // Description (italique encadrée) si présente
                              if (plan.description.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFAFAFA)
                                        .withOpacity(0.5),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(
                                        color: const Color(0xFFEDE7F6)
                                            .withOpacity(0.3)),
                                  ),
                                  child: Text(
                                    plan.description,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: Color(0xFF616161),
                                      fontStyle: FontStyle.italic,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
          ),
        ),
      ],
    );
  }
}

// ── Ligne verticale pointillée ───────────────────────────────
class _DashedLine extends StatelessWidget {
  final Color color;
  const _DashedLine({required this.color});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 1,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final boxHeight = constraints.maxHeight;
          const dashHeight = 4.0;
          const dashSpace = 4.0;
          final dashCount = (boxHeight / (dashHeight + dashSpace)).floor();
          return Column(
            mainAxisSize: MainAxisSize.max,
            children: List.generate(dashCount, (_) {
              return Padding(
                padding: const EdgeInsets.only(bottom: dashSpace),
                child: Container(
                  width: 1,
                  height: dashHeight,
                  color: color,
                ),
              );
            }),
          );
        },
      ),
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
  final String description;

  _PlanItem({
    required this.id,
    required this.etape,
    required this.statut,
    required this.dateFormatee,
    required this.rawDate,
    required this.medecinLabel,
    required this.description,
  });

  // Badge selon le statut
  String get badge => statut == 'fait' ? 'Effectué' : 'À venir';

  factory _PlanItem.fromJson(Map<String, dynamic> json) {
    final rawDate = (json['dateConsultation'] ?? '').toString();
    final prenom = (json['auteurPrenom'] ?? '').toString().trim();
    final nom    = (json['auteurNom']    ?? '').toString().trim();
    return _PlanItem(
      id:           (json['id']     ?? '').toString(),
      etape:        (json['etape']  ?? 'Examen').toString(),
      statut:       (json['statut'] ?? 'à venir').toString(),
      dateFormatee: _fmtDate(rawDate),
      rawDate:      rawDate,
      medecinLabel: prenom.isNotEmpty
          ? 'Dr. $prenom $nom'.trim()
          : 'Médecin référent',
      description: (json['recommandations']
          ?? json['prescription']
          ?? json['description']
          ?? '').toString(),
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