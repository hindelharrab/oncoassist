import 'package:flutter/material.dart';
import '../services/api_service.dart';

class QuestionnaireBotSheet extends StatefulWidget {
  final Function(double, bool, bool, String, String) onSubmitted;
  final String patientId;

  const QuestionnaireBotSheet({
    Key? key,
    required this.onSubmitted,
    required this.patientId,
  }) : super(key: key);

  @override
  _QuestionnaireBotSheetState createState() => _QuestionnaireBotSheetState();
}

class _QuestionnaireBotSheetState extends State<QuestionnaireBotSheet> {
  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;

  // Questions chargées depuis le backend
  List<_Question> _questions = [];

  // Réponses QCM : questionId -> choix sélectionné
  final Map<String, String?> _reponses = {};

  // Slider douleur/fatigue (question globale spéciale)
  double _douleurLevel = 3.0;
  String? _douleurQuestionId;

  @override
  void initState() {
    super.initState();
    _fetchQuestions();
  }

  // ── Charger les questions du patient depuis la BDD ───────
  Future<void> _fetchQuestions() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final List<dynamic> data = await ApiService.get(
          '/questionnaire/patient/${widget.patientId}');

      if (!mounted) return;

      final questions = data.map((q) => _Question.fromJson(q)).toList();
      questions.sort((a, b) => a.ordre.compareTo(b.ordre));

      // Identifier la question douleur/fatigue -> devient le slider
      final douleurQ = questions.firstWhere(
            (q) =>
        q.texte.toLowerCase().contains('douleur') ||
            q.texte.toLowerCase().contains('fatigue'),
        orElse: () =>
            _Question(id: '', texte: '', choix: [], ordre: 0, globale: true),
      );

      setState(() {
        _questions = questions;
        _douleurQuestionId = douleurQ.id.isNotEmpty ? douleurQ.id : null;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = "Impossible de charger les questions.";
        _isLoading = false;
      });
    }
  }

  // ── Soumettre les réponses au backend ───────────────────
  Future<void> _submit() async {
    if (!mounted) return;
    setState(() => _isSubmitting = true);

    try {
      final reponses = <Map<String, dynamic>>[];

      for (final q in _questions) {
        if (q.id == _douleurQuestionId) {
          // Slider -> valeur numérique
          reponses.add({
            'questionId': q.id,
            'choixSelectionne': _douleurLevel.toInt().toString(),
          });
        } else {
          final rep = _reponses[q.id];
          if (rep != null) {
            reponses.add({
              'questionId': q.id,
              'choixSelectionne': rep,
            });
          }
        }
      }

      await ApiService.post(
        '/reponses/patient/${widget.patientId}/soumettre',
        {
          'attributionId': null,
          'reponses': reponses,
        },
      );

      if (!mounted) return;
      widget.onSubmitted(_douleurLevel, false, false, '', '');
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Erreur lors de l'envoi. Réessayez."),
          backgroundColor: Color(0xFFE53935),
        ),
      );
    }
  }

  // ── Icône par choix de symptôme ─────────────────────────
  IconData _iconForChoix(String c) {
    final l = c.toLowerCase();
    if (l.contains('fatigue')) return Icons.battery_2_bar_rounded;
    if (l.contains('nausée') || l.contains('nausee')) return Icons.sick_outlined;
    if (l.contains('sommeil')) return Icons.bedtime_outlined;
    if (l.contains('appétit') || l.contains('appetit')) {
      return Icons.no_meals_outlined;
    }
    if (l.contains('douleur')) return Icons.healing_outlined;
    if (l.contains('aucun') || l.contains('non')) {
      return Icons.check_circle_outline;
    }
    return Icons.circle_outlined;
  }

  String _douleurEmoji(int level) {
    if (level <= 2) return "😊";
    if (level <= 4) return "😉";
    if (level <= 6) return "😔";
    if (level <= 8) return "😣";
    return "😰";
  }

  String _douleurLabel(int level) {
    if (level <= 2) return "Très légère";
    if (level <= 4) return "Légère douleur";
    if (level <= 6) return "Modérée";
    if (level <= 8) return "Forte";
    return "Très intense";
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(14),
      constraints:
      BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.88),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFEDE7F6)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [

          // ── HEADER ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(18, 16, 14, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Flexible(
                  child: Row(
                    children: [
                      Text("📋 ", style: TextStyle(fontSize: 14)),
                      Flexible(
                        child: Text(
                          "QUESTIONNAIRE ONCOSUIVI",
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 12,
                            color: Color(0xFFB39DDB),
                            letterSpacing: 0.4,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(" • 🎀", style: TextStyle(fontSize: 13)),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(
                        color: Color(0xFFF5F5F5), shape: BoxShape.circle),
                    child: const Icon(Icons.close,
                        size: 15, color: Color(0xFF757575)),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFEDE7F6)),

          // ── BODY ────────────────────────────────────────
          Flexible(
            child: _isLoading
                ? const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: CircularProgressIndicator(
                    color: Color(0xFFB39DDB), strokeWidth: 2),
              ),
            )
                : _error != null
                ? Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: Color(0xFFE53935), size: 32),
                  const SizedBox(height: 8),
                  Text(
                    _error!,
                    style: const TextStyle(
                        fontSize: 12, color: Color(0xFFE53935)),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: _fetchQuestions,
                    child: const Text("Réessayer",
                        style: TextStyle(color: Color(0xFFB39DDB))),
                  ),
                ],
              ),
            )
                : SingleChildScrollView(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [

                  // ── 1. SLIDER DOULEUR (question globale) ──
                  if (_douleurQuestionId != null) ...[
                    _buildDouleurSection(),
                    const SizedBox(height: 24),
                  ],

                  // ── 2. QCM SYMPTÔMES (depuis backend) ──
                  ..._questions
                      .where((q) =>
                  q.id != _douleurQuestionId &&
                      q.choix.isNotEmpty)
                      .map((q) => _buildQcmQuestion(q))
                      .toList(),

                  // ── INFO ──
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(10),
                      border:
                      Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.warning_amber_rounded,
                            size: 14, color: Color(0xFFB39DDB)),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            "En validant, ces symptômes sont consignés directement dans votre dossier clinique au CHU. Si fièvre élevée, contactez de suite le 15.",
                            style: TextStyle(
                                fontSize: 9.5,
                                color: Color(0xFF9E9E9E),
                                height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  // ── BOUTON SOUMETTRE ──
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB39DDB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            vertical: 15),
                        shape: RoundedRectangleBorder(
                            borderRadius:
                            BorderRadius.circular(30)),
                        elevation: 0,
                      ),
                      onPressed: _isSubmitting ? null : _submit,
                      child: _isSubmitting
                          ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2))
                          : const Text(
                        "Envoyer mon bilan 💌",
                        style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Section slider douleur ──────────────────────────────
  Widget _buildDouleurSection() {
    final douleurInt = _douleurLevel.toInt();
    // Récupérer le texte réel de la question depuis le backend
    final douleurQ = _questions.firstWhere(
          (q) => q.id == _douleurQuestionId,
      orElse: () => _Question(
          id: '', texte: 'Niveau de douleur globale', choix: [], ordre: 0, globale: true),
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                "${douleurQ.texte} :",
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12.5,
                  color: Color(0xFF2D2D2D),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                "$douleurInt / 10 (${_douleurEmoji(douleurInt)} ${_douleurLabel(douleurInt)})",
                textAlign: TextAlign.right,
                style: const TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 12.5,
                  color: Color(0xFFE91E8C),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: const Color(0xFFB39DDB),
            inactiveTrackColor: const Color(0xFFEDE7F6),
            thumbColor: const Color(0xFFB39DDB),
            trackHeight: 5,
            overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 9),
          ),
          child: Slider(
            value: _douleurLevel,
            min: 0,
            max: 10,
            divisions: 10,
            onChanged: (val) => setState(() => _douleurLevel = val),
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Aucune 😊",
                  style:
                  TextStyle(fontSize: 9.5, color: Color(0xFF9E9E9E))),
              Text("Modérée 😣",
                  style:
                  TextStyle(fontSize: 9.5, color: Color(0xFF9E9E9E))),
              Text("Intense 😰",
                  style:
                  TextStyle(fontSize: 9.5, color: Color(0xFF9E9E9E))),
            ],
          ),
        ),
      ],
    );
  }

  // ── Question QCM (grille 2 colonnes) ────────────────────
  Widget _buildQcmQuestion(_Question q) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "${q.texte} :",
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12.5,
              color: Color(0xFF2D2D2D),
            ),
          ),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 8,
            crossAxisSpacing: 8,
            childAspectRatio: 3.4,
            children: q.choix.map((c) => _buildChoixChip(q, c)).toList(),
          ),
        ],
      ),
    );
  }

  // ── Chip de choix (grille) ──────────────────────────────
  Widget _buildChoixChip(_Question q, String choix) {
    final selected = _reponses[q.id] == choix;
    return GestureDetector(
      onTap: () => setState(() => _reponses[q.id] = choix),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: selected
              ? const Color(0xFFEDE7F6).withOpacity(0.6)
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
            selected ? const Color(0xFFB39DDB) : const Color(0xFFE0E0E0),
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              _iconForChoix(choix),
              size: 16,
              color: selected
                  ? const Color(0xFFB39DDB)
                  : const Color(0xFF9E9E9E),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                choix,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: selected ? FontWeight.bold : FontWeight.w500,
                  color: selected
                      ? const Color(0xFFB39DDB)
                      : const Color(0xFF424242),
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (selected)
              const Icon(Icons.check_circle,
                  size: 14, color: Color(0xFFB39DDB)),
          ],
        ),
      ),
    );
  }
}

// ── Modèle local ─────────────────────────────────────────────
class _Question {
  final String id;
  final String texte;
  final List<String> choix;
  final int ordre;
  final bool globale;

  _Question({
    required this.id,
    required this.texte,
    required this.choix,
    required this.ordre,
    required this.globale,
  });

  factory _Question.fromJson(Map<String, dynamic> json) {
    return _Question(
      id: json['id']?.toString() ?? '',
      texte: json['texte'] ?? '',
      choix: (json['choix'] as List<dynamic>?)
          ?.map((c) => c.toString())
          .toList() ??
          [],
      ordre: json['ordre'] ?? 0,
      globale: json['globale'] ?? true,
    );
  }
}