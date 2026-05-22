import 'package:flutter/material.dart';
import '../models/models.dart';

class SuiviScreen extends StatelessWidget {
  final List<TimelineEvent> timelineEvents;
  final VoidCallback onOpenQuestionnaire;
  final Function(String) onShowToast;

  const SuiviScreen({
    Key? key,
    required this.timelineEvents,
    required this.onOpenQuestionnaire,
    required this.onShowToast,
  }) : super(key: key);

  String _emojiForType(String type) {
    switch (type) {
      case "DOCUMENT":
        return "📄";
      case "RDV":
        return "📅";
      case "TRAITEMENT":
      case "PLAN":
        return "💊";
      case "EXAMEN":
        return "🔬";
      case "QUESTIONNAIRE":
        return "📋";
      default:
        return "📄";
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [

        // ── RAPPORT HEBDO CARD ───────────────────────────────────
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
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 0.5)),
                    SizedBox(height: 4),
                    Text("Partagez en direct votre état de douleur",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
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
                onPressed: onOpenQuestionnaire,
                icon: const Icon(Icons.add, size: 12),
                label: const Text("Bilan du jour",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── TITRE PARCOURS ───────────────────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Flexible(
              child: Text("MON PARCOURS DE SOINS",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFFB39DDB), letterSpacing: 0.5)),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFEDE7F6),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Text("Chronologique",
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFB39DDB))),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // ── TIMELINE ─────────────────────────────────────────────
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: timelineEvents.length,
          itemBuilder: (ctx, index) {
            final evt = timelineEvents[index];
            final isLatest = evt.id.startsWith("t-survey-");
            final isLast = index == timelineEvents.length - 1;

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Colonne dot + ligne ──
                Column(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      margin: const EdgeInsets.only(top: 2),
                      decoration: BoxDecoration(
                        color: evt.color,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                    ),
                    if (!isLast)
                      Container(
                        width: 1.5,
                        height: 120,
                        color: const Color(0xFFB39DDB).withOpacity(0.4),
                      ),
                  ],
                ),
                const SizedBox(width: 14),

                // ── Carte événement ──
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(evt.date,
                                style: const TextStyle(fontSize: 9.5, color: Colors.grey, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: isLatest ? const Color(0xFFFCE4EC) : const Color(0xFFF5F5F5),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(evt.badge,
                                  style: TextStyle(
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                    color: isLatest ? const Color(0xFFE91E8C) : const Color(0xFF757575),
                                  )),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFEDE7F6)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_emojiForType(evt.type), style: const TextStyle(fontSize: 12)),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(evt.title,
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF2D2D2D))),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(evt.subtitle,
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF757575))),
                              if (evt.desc.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFAFAFA),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFFEDE7F6)),
                                  ),
                                  child: Text(evt.desc,
                                      style: const TextStyle(fontSize: 10, color: Color(0xFF616161), fontStyle: FontStyle.italic, height: 1.4)),
                                ),
                              ],
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