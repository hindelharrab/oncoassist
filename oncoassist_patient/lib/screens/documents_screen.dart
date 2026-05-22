import 'package:flutter/material.dart';
import '../models/models.dart';

class DocumentsScreen extends StatefulWidget {
  final Function(String) onShowToast;
  const DocumentsScreen({Key? key, required this.onShowToast}) : super(key: key);

  @override
  _DocumentsScreenState createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  String _searchQuery = "";
  String _selectedCategory = "Tous";

  final List<DocumentItem> _allDocs = const [
    DocumentItem(
      name: "Compte-rendu Mammographie Mars 2026.pdf",
      date: "10 Mars 2026",
      size: "1.8 MB",
      category: "Résultats",
      isSharedByDoctor: true,
    ),
    DocumentItem(
      name: "Prescription Tamoxifène 20mg Adjuvant.pdf",
      date: "10 Mars 2026",
      size: "750 KB",
      category: "Ordonnances",
      isSharedByDoctor: true,
    ),
    DocumentItem(
      name: "Analyse Histologique Post-chirurgicale.pdf",
      date: "08 Avril 2026",
      size: "3.2 MB",
      category: "Résultats",
      isSharedByDoctor: false,
    ),
    DocumentItem(
      name: "Livret de conseils de nutrition après chimio.pdf",
      date: "15 Mai 2026",
      size: "4.1 MB",
      category: "Dossier",
      isSharedByDoctor: false,
    ),
  ];

  // Contenu fictif affiché dans la modal d'aperçu
  String _previewContent(DocumentItem d) {
    return "RAPPORT CLINIQUE CONFIDENTIEL —\n"
        "SERVICE DE SÉNOLOGIE ONCOLOGIE\n\n"
        "Patiente : Sarah Benali (42 ans)\n"
        "Statut post-opératoire : Stable.\n\n"
        "Examen : ${d.name}\n"
        "Date d'édition : ${d.date}\n\n"
        "CONCLUSION :\n"
        "Les résultats confirment une évolution favorable. "
        "Les berges chirurgicales sont saines. Le suivi par "
        "hormonothérapie adjuvante (Tamoxifène 20mg) est bien toléré.\n\n"
        "RECOMMANDATIONS :\n"
        "- Poursuite du traitement hormonal pour 5 ans.\n"
        "- Contrôle mammographique tous les 6 mois.\n"
        "- Surveillance clinique régulière au CHU.\n\n"
        "Document signé électroniquement par le Dr Leila Mansouri, "
        "Oncologue référente, Service de Sénologie du CHU.";
  }

  void _openPreviewModal(DocumentItem d) {
    showDialog(
      context: context,
      barrierColor: const Color(0xFF2D2D2D).withOpacity(0.6),
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 80),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(ctx).size.height * 0.6,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // ── Header ──
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Expanded(
                        child: Text("AFFICHEUR SÉCURISÉ DE DOCUMENT",
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFFB39DDB), letterSpacing: 0.5)),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pop(ctx),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(color: Color(0xFFF5F5F5), shape: BoxShape.circle),
                          child: const Icon(Icons.close, size: 16, color: Color(0xFF757575)),
                        ),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1, color: Color(0xFFEDE7F6)),

                // ── Contenu scrollable ──
                Flexible(
                  child: Container(
                    margin: const EdgeInsets.all(12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFAFAFA),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFEDE7F6)),
                    ),
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text("📄 ", style: TextStyle(fontSize: 13)),
                              Expanded(
                                child: Text(d.name,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text("Date d'édition : ${d.date}",
                              style: const TextStyle(fontSize: 10, color: Colors.grey)),
                          const SizedBox(height: 12),
                          Text(
                            _previewContent(d),
                            style: const TextStyle(fontSize: 11, color: Color(0xFF424242), height: 1.5, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // ── Boutons ──
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        style: TextButton.styleFrom(
                          backgroundColor: const Color(0xFFF5F5F5),
                          foregroundColor: const Color(0xFF757575),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () {
                          Navigator.pop(ctx);
                          widget.onShowToast("Document partagé 📤");
                        },
                        child: const Text("Partager", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFB39DDB),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                        onPressed: () {
                          Navigator.pop(ctx);
                          widget.onShowToast("Téléchargement de : ${d.name} lancé 📥");
                        },
                        icon: const Icon(Icons.download_outlined, size: 14),
                        label: const Text("Télécharger", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final docs = _allDocs.where((d) {
      final matchesSearch = d.name.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesCat = _selectedCategory == "Tous" || d.category == _selectedCategory;
      return matchesSearch && matchesCat;
    }).toList();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("MON DOSSIER D'EXAMENS", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFB39DDB))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFFFCE4EC), borderRadius: BorderRadius.circular(12)),
                child: Text("${docs.length} Fichiers", style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFE91E8C))),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Search Field
          TextField(
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: "Rechercher un document...",
              prefixIcon: const Icon(Icons.search, color: Color(0xFFB39DDB)),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: const BorderSide(color: Color(0xFFEDE7F6))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: const BorderSide(color: Color(0xFFEDE7F6))),
            ),
          ),
          const SizedBox(height: 12),

          // Categories selector
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ["Tous", "Résultats", "Ordonnances", "Dossier"].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 6.0),
                  child: FilterChip(
                    selected: isSelected,
                    label: Text(cat, style: TextStyle(fontSize: 11, color: isSelected ? Colors.white : const Color(0xFFB39DDB))),
                    selectedColor: const Color(0xFFB39DDB),
                    backgroundColor: Colors.white,
                    checkmarkColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFFEDE7F6))),
                    onSelected: (selected) {
                      setState(() {
                        _selectedCategory = cat;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),

          // Docs list
          Expanded(
            child: docs.isNotEmpty
                ? ListView.builder(
              itemCount: docs.length,
              itemBuilder: (ctx, index) {
                final d = docs[index];
                return Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFEDE7F6)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(color: const Color(0xFFFCE4EC), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.picture_as_pdf, color: Color(0xFFE91E8C), size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(d.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 2),
                            Text(d.date + " • " + d.size, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                            if (d.isSharedByDoctor) ...[
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(color: const Color(0xFFEDE7F6), borderRadius: BorderRadius.circular(4)),
                                child: const Text("Partagé par votre médecin", style: TextStyle(fontSize: 8, color: Color(0xFFB39DDB), fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ],
                        ),
                      ),
                      // ── Icône APERÇU (œil) ──
                      IconButton(
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.all(6),
                        onPressed: () => _openPreviewModal(d),
                        icon: const Icon(Icons.visibility_outlined, color: Color(0xFFB39DDB), size: 20),
                      ),
                      // ── Icône TÉLÉCHARGER ──
                      IconButton(
                        constraints: const BoxConstraints(),
                        padding: const EdgeInsets.all(6),
                        onPressed: () => widget.onShowToast("Téléchargement de : " + d.name + " lancé 📥"),
                        icon: const Icon(Icons.download_outlined, color: Color(0xFF757575), size: 20),
                      ),
                    ],
                  ),
                );
              },
            )
                : const Center(
              child: Text("Aucun document trouvé", style: TextStyle(color: Colors.grey, fontSize: 12)),
            ),
          ),
        ],
      ),
    );
  }
}