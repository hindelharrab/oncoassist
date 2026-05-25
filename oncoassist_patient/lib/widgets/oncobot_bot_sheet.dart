import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class OncoBotBotSheet extends StatefulWidget {
  final Function(String) onShowToast;

  const OncoBotBotSheet({Key? key, required this.onShowToast}) : super(key: key);

  @override
  _OncoBotBotSheetState createState() => _OncoBotBotSheetState();
}

class _OncoBotBotSheetState extends State<OncoBotBotSheet> {
  // ── URL du microservice RAG ─────────────────────────────
  // 10.0.2.2 = localhost depuis l'émulateur Android
  static const String _botUrl = 'http://10.0.2.2:8002/chat';

  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  // ── Messages affichés ───────────────────────────────────
  final List<Map<String, dynamic>> _messages = [
    {
      "role": "bot",
      "text":
      "Bonjour 🌸 ! Je suis OncoBot, votre assistant OncoAssist.\n\nJe réponds à vos questions générales sur le cancer du sein.\nJe ne pose jamais de diagnostic — votre médecin reste décideur.",
      "sources": [],
    }
  ];

  // Historique envoyé au backend pour le contexte multi-tour
  final List<Map<String, String>> _history = [];

  bool _isLoading = false;

  // Suggestions rapides
  final List<String> _suggestions = [
    "C'est quoi une mammographie ?",
    "Effets du Tamoxifène",
    "Gérer la fatigue",
    "Score BI-RADS ?",
  ];

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  // ── Scroll automatique vers le bas ─────────────────────
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ── Envoyer un message au microservice RAG ──────────────
  Future<void> _sendMessage(String text) async {
    final trimmed = text.trim();
    if (trimmed.isEmpty || _isLoading) return;

    _controller.clear();

    // Ajouter le message utilisateur à l'affichage
    if (!mounted) return;
    setState(() {
      _messages.add({"role": "user", "text": trimmed, "sources": []});
      _isLoading = true;
    });
    _scrollToBottom();

    try {
      // Construire le body avec l'historique
      final body = jsonEncode({
        "message": trimmed,
        "history": _history,
      });

      final response = await http.post(
        Uri.parse(_botUrl),
        headers: {"Content-Type": "application/json"},
        body: body,
      ).timeout(const Duration(seconds: 30));

      if (!mounted) return;

      if (response.statusCode == 200) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        final botReply = data["response"] ?? "Je n'ai pas de réponse.";
        final sources = (data["sources"] as List<dynamic>?) ?? [];

        // Mettre à jour l'historique pour le prochain tour
        _history.add({"role": "user", "content": trimmed});
        _history.add({"role": "assistant", "content": botReply});

        setState(() {
          _messages.add({
            "role": "bot",
            "text": botReply,
            "sources": sources,
          });
          _isLoading = false;
        });
      } else {
        _handleError("Erreur serveur (${response.statusCode}).");
      }
    } catch (e) {
      _handleError("Impossible de joindre OncoBot. Vérifiez votre connexion.");
    }

    _scrollToBottom();
  }

  void _handleError(String msg) {
    if (!mounted) return;
    setState(() {
      _messages.add({
        "role": "bot",
        "text": "⚠️ $msg",
        "sources": [],
        "isError": true,
      });
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final double height = MediaQuery.of(context).size.height * 0.82;

    return Container(
      height: height,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [

          // ── HEADER ──────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEDE7F6),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.smart_toy_outlined,
                      color: Color(0xFFB39DDB), size: 20),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "OncoBot",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF2D2D2D),
                        ),
                      ),
                      Text(
                        "Assistant cancer du sein • Powered by RAG",
                        style: TextStyle(
                            fontSize: 9.5, color: Color(0xFFB39DDB)),
                      ),
                    ],
                  ),
                ),
                // Badge IA
                Container(
                  padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEDE7F6),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text("IA 🤖",
                      style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFB39DDB))),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.grey, size: 20),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFEDE7F6)),

          // ── MESSAGES ────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              itemCount: _messages.length + (_isLoading ? 1 : 0),
              itemBuilder: (ctx, i) {
                // Bulle de chargement
                if (_isLoading && i == _messages.length) {
                  return _buildTypingIndicator();
                }
                final m = _messages[i];
                final isBot = m["role"] == "bot";
                final isError = m["isError"] == true;

                return Column(
                  crossAxisAlignment: isBot
                      ? CrossAxisAlignment.start
                      : CrossAxisAlignment.end,
                  children: [
                    // Bulle message
                    Align(
                      alignment: isBot
                          ? Alignment.centerLeft
                          : Alignment.centerRight,
                      child: Container(
                        constraints: BoxConstraints(
                          maxWidth:
                          MediaQuery.of(context).size.width * 0.78,
                        ),
                        margin: const EdgeInsets.only(bottom: 4),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: isError
                              ? const Color(0xFFFFEBEE)
                              : isBot
                              ? const Color(0xFFEDE7F6).withOpacity(0.5)
                              : const Color(0xFFFCE4EC),
                          borderRadius: BorderRadius.circular(16).copyWith(
                            topLeft: isBot
                                ? Radius.zero
                                : const Radius.circular(16),
                            topRight: isBot
                                ? const Radius.circular(16)
                                : Radius.zero,
                          ),
                          border: Border.all(
                            color: isError
                                ? const Color(0xFFEF9A9A)
                                : isBot
                                ? const Color(0xFFEDE7F6)
                                : const Color(0xFFF8BBD0),
                            width: 1,
                          ),
                        ),
                        child: Text(
                          m["text"] as String,
                          style: TextStyle(
                            fontSize: 12,
                            color: isError
                                ? const Color(0xFFE53935)
                                : const Color(0xFF2D2D2D),
                            height: 1.4,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 8),
                  ],
                );
              },
            ),
          ),

          // ── SUGGESTIONS RAPIDES ──────────────────────────
          if (_messages.length <= 2)
            Padding(
              padding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _suggestions.map((s) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ActionChip(
                        label: Text(s,
                            style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFF757575))),
                        backgroundColor:
                        const Color(0xFFEDE7F6).withOpacity(0.4),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                        side: const BorderSide(color: Color(0xFFEDE7F6)),
                        onPressed: () => _sendMessage(s),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

          const Divider(height: 1, color: Color(0xFFEDE7F6)),

          // ── CHAMP DE SAISIE ──────────────────────────────
          Padding(
            padding: EdgeInsets.only(
              left: 14,
              right: 8,
              top: 10,
              bottom: MediaQuery.of(context).viewInsets.bottom + 12,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFFEDE7F6)),
                    ),
                    child: TextField(
                      controller: _controller,
                      textInputAction: TextInputAction.send,
                      onSubmitted: _sendMessage,
                      style: const TextStyle(
                          fontSize: 12.5, color: Color(0xFF2D2D2D)),
                      decoration: const InputDecoration(
                        hintText: "Posez votre question sur le cancer du sein...",
                        hintStyle: TextStyle(
                            fontSize: 11.5, color: Color(0xFFBDBDBD)),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                GestureDetector(
                  onTap: () => _sendMessage(_controller.text),
                  child: Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: _isLoading
                          ? const Color(0xFFD1C4E9)
                          : const Color(0xFFB39DDB),
                      shape: BoxShape.circle,
                    ),
                    child: _isLoading
                        ? const Padding(
                      padding: EdgeInsets.all(12),
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                        : const Icon(Icons.send_rounded,
                        color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Indicateur de frappe du bot ─────────────────────────
  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFEDE7F6).withOpacity(0.5),
          borderRadius: BorderRadius.circular(16)
              .copyWith(topLeft: Radius.zero),
          border: Border.all(color: const Color(0xFFEDE7F6)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _dot(0),
            const SizedBox(width: 4),
            _dot(150),
            const SizedBox(width: 4),
            _dot(300),
          ],
        ),
      ),
    );
  }

  Widget _dot(int delayMs) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.4, end: 1.0),
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOut,
      builder: (_, val, __) => Opacity(
        opacity: val,
        child: Container(
          width: 7,
          height: 7,
          decoration: const BoxDecoration(
            color: Color(0xFFB39DDB),
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}