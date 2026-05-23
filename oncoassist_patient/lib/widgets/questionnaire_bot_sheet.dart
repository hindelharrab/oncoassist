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

  List<_Question> _questions = [];
  final Map<String, String?> _reponses = {};

  double _fatigueLevel = 3.0;
  String? _fatigueQuestionId;

  @override
  void initState() {
    super.initState();
    _fetchQuestions();
  }

  // ── Charger les questions du patient ─────────────────────
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

      final fatigueQ = questions.firstWhere(
            (q) => q.texte.toLowerCase().contains('fatigue'),
        orElse: () =>
            _Question(id: '', texte: '', choix: [], ordre: 0, globale: true),
      );

      setState(() {
        _questions = questions;
        _fatigueQuestionId = fatigueQ.id.isNotEmpty ? fatigueQ.id : null;
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

  // ── Soumettre les réponses ────────────────────────────────
  Future<void> _submit() async {
    if (!mounted) return;
    setState(() => _isSubmitting = true);

    try {
      final reponses = <Map<String, dynamic>>[];

      for (final q in _questions) {
        if (q.id == _fatigueQuestionId) {
          reponses.add({
            'questionId': q.id,
            'choixSelectionne': _fatigueLevel.toInt().toString(),
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
      widget.onSubmitted(_fatigueLevel, false, false, '', '');
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

  String _emojiForFatigue(int level) {
    if (level <= 2) return "😊";
    if (level <= 5) return "😔";
    if (level <= 8) return "😣";
    return "😰";
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(14),
      constraints:
      BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.88),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFEDE7F6)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [

          // ── HEADER ──────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text("📋 ", style: TextStyle(fontSize: 13)),
                    Text(
                      "QUESTIONNAIRE DE SUIVI",
                      style: TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 11,
                        color: Color(0xFFB39DDB),
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(
                        color: Color(0xFFF5F5F5), shape: BoxShape.circle),
                    child: const Icon(Icons.close,
                        size: 14, color: Color(0xFF757575)),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFEDE7F6)),

          // ── BODY ────────────────────────────────────────────
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
                        style:
                        TextStyle(color: Color(0xFFB39DDB))),
                  ),
                ],
              ),
            )
                : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [

                  // ── Slider fatigue ──
                  if (_fatigueQuestionId != null) ...[
                    _sectionTitle("Niveau de fatigue globale"),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFAFAFA),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: const Color(0xFFEDE7F6)),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment:
                            MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "${_fatigueLevel.toInt()} / 10",
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFFB39DDB),
                                ),
                              ),
                              Text(
                                _emojiForFatigue(
                                    _fatigueLevel.toInt()),
                                style: const TextStyle(fontSize: 24),
                              ),
                            ],
                          ),
                          SliderTheme(
                            data: SliderTheme.of(context).copyWith(
                              activeTrackColor:
                              const Color(0xFFB39DDB),
                              inactiveTrackColor:
                              const Color(0xFFFCE4EC),
                              thumbColor: const Color(0xFFB39DDB),
                              trackHeight: 4,
                              overlayShape:
                              const RoundSliderOverlayShape(
                                  overlayRadius: 14),
                            ),
                            child: Slider(
                              value: _fatigueLevel,
                              min: 0,
                              max: 10,
                              divisions: 10,
                              onChanged: (val) =>
                                  setState(() => _fatigueLevel = val),
                            ),
                          ),
                          const Row(
                            mainAxisAlignment:
                            MainAxisAlignment.spaceBetween,
                            children: [
                              Text("Aucune",
                                  style: TextStyle(
                                      fontSize: 9,
                                      color: Colors.grey)),
                              Text("Modérée",
                                  style: TextStyle(
                                      fontSize: 9,
                                      color: Colors.grey)),
                              Text("Intense",
                                  style: TextStyle(
                                      fontSize: 9,
                                      color: Colors.grey)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // ── Questions QCM ──
                  ..._questions
                      .where((q) =>
                  q.id != _fatigueQuestionId &&
                      q.choix.isNotEmpty)
                      .map((q) => _buildQcmQuestion(q))
                      .toList(),

                  const SizedBox(height: 8),

                  // ── Info ──
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                          color: const Color(0xFFEEEEEE)),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.info_outline,
                            size: 12, color: Color(0xFFB39DDB)),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            "Vos réponses sont transmises directement à votre équipe médicale au CHU.",
                            style: TextStyle(
                                fontSize: 9,
                                color: Colors.grey,
                                height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Bouton soumettre ──
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB39DDB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            vertical: 14),
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
                            strokeWidth: 2),
                      )
                          : const Text(
                        "Envoyer mon bilan 💌",
                        style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13),
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

  // ── Widget QCM ───────────────────────────────────────────
  Widget _buildQcmQuestion(_Question q) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _sectionTitle(q.texte),
          const SizedBox(height: 8),
          ...q.choix.map((choix) {
            final selected = _reponses[q.id] == choix;
            return GestureDetector(
              onTap: () => setState(() => _reponses[q.id] = choix),
              child: Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 11),
                decoration: BoxDecoration(
                  color: selected
                      ? const Color(0xFFEDE7F6).withOpacity(0.6)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: selected
                        ? const Color(0xFFB39DDB)
                        : const Color(0xFFE0E0E0),
                    width: selected ? 1.5 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 18,
                      height: 18,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: selected
                            ? const Color(0xFFB39DDB)
                            : Colors.white,
                        border: Border.all(
                          color: selected
                              ? const Color(0xFFB39DDB)
                              : const Color(0xFFBDBDBD),
                          width: 1.5,
                        ),
                      ),
                      child: selected
                          ? const Icon(Icons.check,
                          size: 11, color: Colors.white)
                          : null,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        choix,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: selected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          color: selected
                              ? const Color(0xFFB39DDB)
                              : const Color(0xFF424242),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontWeight: FontWeight.bold,
        fontSize: 12,
        color: Color(0xFF424242),
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