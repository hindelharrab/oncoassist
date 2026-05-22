import 'package:flutter/material.dart';

class QuestionnaireBotSheet extends StatefulWidget {
  final Function(double, bool, bool, String, String) onSubmitted;
  const QuestionnaireBotSheet({Key? key, required this.onSubmitted}) : super(key: key);

  @override
  _QuestionnaireBotSheetState createState() => _QuestionnaireBotSheetState();
}

class _QuestionnaireBotSheetState extends State<QuestionnaireBotSheet> {
  double _painLevel = 3.0;
  bool _sympFatigue = false;
  bool _sympNausea = false;
  bool _sympSleep = false;
  bool _sympAppetite = false;
  bool _breastChange = false;
  String _breastChangeDesc = "";
  String _surveyNotes = "";

  String _getEmojiForPain(int level) {
    if (level == 0) return "😊";
    if (level <= 3) return "🙂";
    if (level <= 6) return "😔";
    return "😰";
  }

  String _getPainLabel(int level) {
    if (level == 0) return "Aucune douleur";
    if (level <= 3) return "Légère douleur";
    if (level <= 6) return "Douleur modérée";
    return "Douleur intense";
  }

  @override
  Widget build(BuildContext context) {
    final int painInt = _painLevel.toInt();

    return Container(
      margin: const EdgeInsets.all(14),
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.85),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFEDE7F6)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── HEADER ──────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Text("📋 ", style: TextStyle(fontSize: 12)),
                      const Flexible(
                        child: Text(
                          "QUESTIONNAIRE ONCOSUIVI",
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: Color(0xFFB39DDB)),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Text(" • 🎀", style: TextStyle(fontSize: 12)),
                    ],
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(color: Color(0xFFF5F5F5), shape: BoxShape.circle),
                    child: const Icon(Icons.close, size: 14, color: Color(0xFF757575)),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFEDE7F6)),

          // ── BODY (scroll) ───────────────────────────────────────
          Flexible(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [

                  // ── Slider douleur ──
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text("Niveau de douleur globale :",
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF424242))),
                      Text("$painInt / 10 (${_getEmojiForPain(painInt)} ${_getPainLabel(painInt)})",
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFFE91E8C))),
                    ],
                  ),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: const Color(0xFFB39DDB),
                      inactiveTrackColor: const Color(0xFFFCE4EC),
                      thumbColor: const Color(0xFFB39DDB),
                      trackHeight: 4,
                      overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
                    ),
                    child: Slider(
                      value: _painLevel,
                      min: 0,
                      max: 10,
                      divisions: 10,
                      onChanged: (val) => setState(() => _painLevel = val),
                    ),
                  ),
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Aucune 😊", style: TextStyle(fontSize: 9, color: Colors.grey)),
                      Text("Modérée 😔", style: TextStyle(fontSize: 9, color: Colors.grey)),
                      Text("Intense 😰", style: TextStyle(fontSize: 9, color: Colors.grey)),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // ── Symptômes checklist ──
                  const Text("Symptômes ressentis récents :",
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF424242))),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _symptomBtn("😴 Fatigue accrue", _sympFatigue, () => setState(() => _sympFatigue = !_sympFatigue))),
                      const SizedBox(width: 8),
                      Expanded(child: _symptomBtn("🤢 Nausées", _sympNausea, () => setState(() => _sympNausea = !_sympNausea))),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(child: _symptomBtn("💤 Sommeil difficile", _sympSleep, () => setState(() => _sympSleep = !_sympSleep))),
                      const SizedBox(width: 8),
                      Expanded(child: _symptomBtn("🍽️ Perte d'appétit", _sympAppetite, () => setState(() => _sympAppetite = !_sympAppetite))),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // ── Breast change toggle ──
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFCE4EC),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFF8BBD0)),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Expanded(
                              child: Text("Changement observé au niveau du sein ?",
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Color(0xFFE91E8C))),
                            ),
                            SizedBox(
                              width: 24,
                              height: 24,
                              child: Checkbox(
                                value: _breastChange,
                                activeColor: const Color(0xFFE91E8C),
                                onChanged: (val) => setState(() => _breastChange = val ?? false),
                              ),
                            ),
                          ],
                        ),
                        if (_breastChange) ...[
                          const SizedBox(height: 8),
                          TextField(
                            onChanged: (val) => _breastChangeDesc = val,
                            style: const TextStyle(fontSize: 11),
                            decoration: InputDecoration(
                              hintText: "Décrivez brièvement le changement (rougeur, gonflement)...",
                              hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
                              filled: true,
                              fillColor: Colors.white,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFEDE7F6)),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFEDE7F6)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: const BorderSide(color: Color(0xFFB39DDB)),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Free comment ──
                  const Text("Message facultatif pour votre équipe :",
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF424242))),
                  const SizedBox(height: 6),
                  TextField(
                    onChanged: (val) => _surveyNotes = val,
                    maxLines: 2,
                    style: const TextStyle(fontSize: 12),
                    decoration: InputDecoration(
                      hintText: "Un message ou symptôme pour le Dr Leila Mansouri...",
                      hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
                      filled: true,
                      fillColor: const Color(0xFFFAFAFA),
                      contentPadding: const EdgeInsets.all(10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFFEDE7F6)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFFEDE7F6)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: Color(0xFFB39DDB)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // ── Warning info ──
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFEEEEEE)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Icon(Icons.warning_amber_rounded, size: 12, color: Color(0xFFB39DDB)),
                        SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            "En validant, ces symptômes sont consignés directement dans votre dossier clinique au CHU. Si fièvre élevée, contactez de suite le 15.",
                            style: TextStyle(fontSize: 9, color: Colors.grey, height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // ── Submit button ──
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB39DDB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      ),
                      onPressed: () {
                        widget.onSubmitted(_painLevel, _sympFatigue, _sympNausea, _breastChangeDesc, _surveyNotes);
                        Navigator.pop(context);
                      },
                      child: const Text("Envoyer mon bilan 💌",
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
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

  Widget _symptomBtn(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFEDE7F6).withOpacity(0.4) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selected ? const Color(0xFFB39DDB) : const Color(0xFFE0E0E0)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Flexible(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  color: selected ? const Color(0xFFB39DDB) : const Color(0xFF757575),
                  fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (selected)
              const Icon(Icons.check_circle, size: 12, color: Color(0xFFB39DDB)),
          ],
        ),
      ),
    );
  }
}