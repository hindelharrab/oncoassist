import 'package:flutter/material.dart';

class OncoBotBotSheet extends StatefulWidget {
  final Function(String) onShowToast;
  const OncoBotBotSheet({Key? key, required this.onShowToast}) : super(key: key);

  @override
  _OncoBotBotSheetState createState() => _OncoBotBotSheetState();
}

class _OncoBotBotSheetState extends State<OncoBotBotSheet> {
  final List<Map<String, String>> _messages = [
    {
      "role": "bot",
      "text": "Bonjour Sarah 🌸 ! Je suis OncoBot, votre assistant d'onco-suivi. Comment désirez-vous prendre soin de vous aujourd'hui ?"
    }
  ];

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height * 0.75;
    return Container(
      height: height,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: const [
                  Icon(Icons.smart_toy_outlined, color: Color(0xFFB39DDB), size: 24),
                  SizedBox(width: 8),
                  Text(
                    "OncoBot - Écoute active",
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D)),
                  ),
                ],
              ),
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.close, color: Colors.grey),
              ),
            ],
          ),
          const Divider(color: Color(0xFFEDE7F6)),

          // Messages
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (ctx, i) {
                final m = _messages[i];
                final isBot = m["role"] == "bot";
                return Align(
                  alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isBot ? const Color(0xFFEDE7F6) : const Color(0xFFFCE4EC),
                      borderRadius: BorderRadius.circular(16).copyWith(
                        topLeft: isBot ? Radius.zero : const Radius.circular(16),
                        topRight: isBot ? const Radius.circular(16) : Radius.zero,
                      ),
                    ),
                    child: Text(
                      m["text"]!,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF2D2D2D)),
                    ),
                  ),
                );
              },
            ),
          ),

          // Quick Suggestion Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ["Gérer la fatigue", "Vérifier mes RDV", "Conseils Tamoxifène"].map((chip) {
                return Padding(
                  padding: const EdgeInsets.only(right: 6.0),
                  child: ActionChip(
                    label: Text(chip, style: const TextStyle(fontSize: 11, color: Color(0xFF757575))),
                    backgroundColor: const Color(0xFFEDE7F6).withOpacity(0.4),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    onPressed: () {
                      setState(() {
                        _messages.add({"role": "user", "text": chip});
                        _messages.add({
                          "role": "bot",
                          "text": "Je formule des conseils adaptés pour: '$chip'. Prenez un instant pour respirer."
                        });
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 8),

          Row(
            children: [
              const Expanded(
                child: TextField(
                  decoration: InputDecoration(
                    hintText: "Saisir votre question de santé...",
                    hintStyle: TextStyle(fontSize: 12, color: Colors.grey),
                    filled: true,
                    fillColor: Color(0xFFFAFAFA),
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    border: OutlineInputBorder(borderSide: BorderSide.none),
                  ),
                ),
              ),
              IconButton(
                onPressed: () => widget.onShowToast("Message OncoBot enregistré !"),
                icon: const Icon(Icons.send, color: Color(0xFFB39DDB)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}