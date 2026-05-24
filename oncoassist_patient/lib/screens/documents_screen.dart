import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DocumentsScreen extends StatefulWidget {
  final Function(String) onShowToast;
  final String dossierMedicalId;
  final String patientNom;
  final String patientPrenom;

  const DocumentsScreen({
    Key? key,
    required this.onShowToast,
    required this.dossierMedicalId,
    this.patientNom = '',
    this.patientPrenom = '',
  }) : super(key: key);

  @override
  _DocumentsScreenState createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';
  String _selectedCategory = 'Tous';
  List<Map<String, dynamic>> _allDocs = [];

  // Palette mauve pour les boutons et accents généraux
  static const Color kPrimary     = Color(0xFFB39DDB);
  static const Color kPrimaryBg   = Color(0xFFF3EFFC);
  static const Color kPrimaryDark = Color(0xFF7E57C2);

  @override
  void initState() {
    super.initState();
    _fetchAll();
  }

  Future<void> _fetchAll() async {
    if (!mounted) return;
    setState(() { _isLoading = true; _error = null; });
    try {
      final results = await Future.wait([
        ApiService.get('/documents/dossier/${widget.dossierMedicalId}'),
        ApiService.get('/documents/dossier/${widget.dossierMedicalId}/resultats'),
        ApiService.get('/documents/dossier/${widget.dossierMedicalId}/ordonnances'),
      ]);

      final Set<String> seen = {};
      final List<Map<String, dynamic>> merged = [];

      for (final list in results) {
        for (final item in list as List<dynamic>) {
          final id = item['id']?.toString() ?? '';
          if (!seen.contains(id)) {
            seen.add(id);
            merged.add(Map<String, dynamic>.from(item));
          }
        }
      }

      merged.sort((a, b) {
        final da = a['dateAjout']?.toString() ?? '';
        final db = b['dateAjout']?.toString() ?? '';
        return db.compareTo(da);
      });

      if (!mounted) return;
      setState(() { _allDocs = merged; _isLoading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = "Impossible de charger les documents.";
        _isLoading = false;
      });
    }
  }

  void _downloadDoc(Map<String, dynamic> doc) {
    final nom = (doc['nom'] ?? 'document').toString();
    widget.onShowToast("Téléchargement de : $nom 📥");
  }

  String _categoryForType(String? type) {
    if (type == null) return 'Dossier';
    if (type == 'ORDONNANCE') return 'Ordonnances';
    if (type.startsWith('RESULTAT_')) return 'Résultats';
    return 'Dossier';
  }

  // ── Style — chaque type sa couleur douce + icône adaptée ──
  _DocStyle _styleForType(String? type) {
    switch (type) {
      case 'ORDONNANCE':
        return const _DocStyle(
          icon: Icons.receipt_long_rounded,
          bg: Color(0xFFFCE9F1),
          iconColor: Color(0xFFD81B7A),
          label: 'Ordonnance',
          badge: 'ORD',
        );
      case 'RESULTAT_MAMMOGRAPHIE':
        return const _DocStyle(
          icon: Icons.monitor_heart_rounded,
          bg: Color(0xFFE7F0FB),
          iconColor: Color(0xFF3B7DD8),
          label: 'Mammographie',
          badge: 'MAM',
        );
      case 'RESULTAT_BIOPSIE':
        return const _DocStyle(
          icon: Icons.biotech_rounded,
          bg: Color(0xFFE6F4EC),
          iconColor: Color(0xFF2E9E5B),
          label: 'Analyse tissulaire',
          badge: 'HIS',
        );
      case 'RESULTAT_ECHOGRAPHIE':
        return const _DocStyle(
          icon: Icons.graphic_eq_rounded,
          bg: Color(0xFFEDE8F8),
          iconColor: Color(0xFF8E6FCC),
          label: 'Échographie',
          badge: 'ECH',
        );
      case 'RESULTAT_IRM':
        return const _DocStyle(
          icon: Icons.scanner_rounded,
          bg: Color(0xFFFBEFE6),
          iconColor: Color(0xFFD9803B),
          label: 'Imagerie par Résonance',
          badge: 'IRM',
        );
      case 'RESULTAT_MANUEL':
        return const _DocStyle(
          icon: Icons.medical_services_rounded,
          bg: Color(0xFFF0ECF9),
          iconColor: Color(0xFF7B5EA7),
          label: 'Examen Clinique',
          badge: 'CLI',
        );
      case 'RAPPORT_FINAL':
        return const _DocStyle(
          icon: Icons.summarize_rounded,
          bg: Color(0xFFFFF4E0),
          iconColor: Color(0xFFC9921A),
          label: 'Rapport de Synthèse',
          badge: 'RPT',
        );
      default:
        return const _DocStyle(
          icon: Icons.folder_copy_rounded,
          bg: Color(0xFFF0F0F3),
          iconColor: Color(0xFF6E7891),
          label: 'Document',
          badge: 'DOC',
        );
    }
  }

  String _formatDate(String? raw) {
    if (raw == null || raw.isEmpty) return '';
    try {
      final d = DateTime.parse(raw);
      const m = ['Janv','Févr','Mars','Avr','Mai','Juin',
        'Juil','Août','Sept','Oct','Nov','Déc'];
      return '${d.day.toString().padLeft(2,'0')} ${m[d.month-1]} ${d.year}';
    } catch (_) { return raw; }
  }

  List<Map<String, dynamic>> get _filtered {
    return _allDocs.where((d) {
      final nom = (d['nom'] ?? '').toString().toLowerCase();
      final matchSearch = nom.contains(_searchQuery.toLowerCase());
      final cat = _categoryForType(d['type']?.toString());
      final matchCat =
          _selectedCategory == 'Tous' || cat == _selectedCategory;
      return matchSearch && matchCat;
    }).toList();
  }

  int _countForCat(String cat) {
    if (cat == 'Tous') return _allDocs.length;
    return _allDocs
        .where((d) => _categoryForType(d['type']?.toString()) == cat)
        .length;
  }

  // ── Parser JSON (sans paths ni résultats IA) ──────────────
  List<MapEntry<String, String>> _parseContent(String raw) {
    if (!raw.trim().startsWith('{')) return [];
    final Map<String, String> result = {};

    const excluded = {
      'cheminImage','cheminGradCam','imageRadio','heatmapUrl',
      'fichierImage','fichierDicom','fichierSVS','cheminFichier',
      'predictionIA','scoreRisqueIA','scoreBenignMalin',
      'scoreTypeConfiance','confidencePct','classeBinaire',
      'recommendationIA','biradsDescription','isAnalysed',
      'imagesAnalysees','id','dossierMedicalId','patientId',
      'visiblePatient','auteurId',
    };

    final regex = RegExp(
        r'"(\w+)"\s*:\s*("([^"]*)"|(true|false|null|-?\d+\.?\d*))');
    for (final match in regex.allMatches(raw)) {
      final key = match.group(1) ?? '';
      final val = (match.group(3) ?? match.group(4) ?? '').trim();
      if (key.isEmpty || excluded.contains(key)) continue;
      if (val == 'null' || val.isEmpty) continue;
      if (val.contains('/') || val.contains('\\')) continue;
      result[_humanizeKey(key)] = _formatValue(val);
    }

    return result.entries.toList();
  }

  String _humanizeKey(String key) {
    const map = {
      'scoreBIRADS'        : 'Score BI-RADS',
      'siteAnatomique'     : 'Site anatomique',
      'typeStructure'      : 'Type de structure',
      'seinExamine'        : 'Sein examiné',
      'quadrant'           : 'Quadrant',
      'typeTumeur'         : 'Type histologique',
      'grossissement'      : 'Grossissement',
      'dateExamen'         : 'Date examen',
      'sequences'          : 'Séquences',
      'produitContraste'   : 'Produit de contraste',
      'massePalpee'        : 'Masse palpée',
      'localisationDeMasse': 'Localisation',
      'aspectPeau'         : 'Aspect peau',
      'adenopathies'       : 'Adénopathies',
      'date'               : 'Date',
      'auteurNom'          : 'Médecin',
      'auteurPrenom'       : 'Prénom médecin',
      'forme'              : 'Forme',
      'orientation'        : 'Orientation',
      'contours'           : 'Contours',
      'echostructure'      : 'Échostructure',
      'distanceMamelon'    : 'Distance mamelon (cm)',
      'tailleAxe1'         : 'Taille axe 1 (mm)',
      'tailleAxe2'         : 'Taille axe 2 (mm)',
      'tailleAxe3'         : 'Taille axe 3 (mm)',
      'calcificationsPresentes': 'Calcifications',
      'adenopathieAxillaire'   : 'Adéno. axillaire',
      'signalT2'               : 'Signal T2',
      'restrictionDiffusion'   : 'Restriction diffusion',
      'notes'                  : 'Notes cliniques',
      'recommandation'         : 'Recommandation',
      'resultatDetaille'       : 'Observations',
      'description'            : 'Description',
      'contenu'                : 'Contenu',
    };
    return map[key] ?? key
        .replaceAllMapped(RegExp(r'[A-Z]'), (m) => ' ${m.group(0)}')
        .trim()
        .capitalize();
  }

  String _formatValue(String val) {
    if (val == 'true')  return 'Oui';
    if (val == 'false') return 'Non';
    return val;
  }

  Widget _chip(String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
          color: bg, borderRadius: BorderRadius.circular(8)),
      child: Text(text,
          style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              color: fg,
              letterSpacing: 0.2)),
    );
  }

  // ── Modal aperçu ──────────────────────────────────────────
  void _openPreview(Map<String, dynamic> doc) {
    final style   = _styleForType(doc['type']?.toString());
    final nom     = (doc['nom'] ?? 'Document').toString();
    final contenu = (doc['contenu'] ?? '').toString();
    final date    = _formatDate(doc['dateAjout']?.toString());
    final type    = doc['type']?.toString() ?? '';
    final isJson  = contenu.trim().startsWith('{');
    final rows    = _parseContent(contenu);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(ctx).size.height * 0.9,
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 10),
              width: 36, height: 4,
              decoration: BoxDecoration(
                  color: kPrimaryBg,
                  borderRadius: BorderRadius.circular(2)),
            ),
            const SizedBox(height: 14),

            // Header modal — accent = couleur du type
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(
                    width: 54, height: 54,
                    decoration: BoxDecoration(
                      color: style.bg,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(style.icon,
                        color: style.iconColor, size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(nom,
                            style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF2D2D2D)),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 6),
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          children: [
                            _chip(style.label, style.bg,
                                style.iconColor),
                            if (date.isNotEmpty)
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                      Icons.calendar_today_rounded,
                                      size: 10,
                                      color: Color(0xFF9E9E9E)),
                                  const SizedBox(width: 4),
                                  Text(date,
                                      style: const TextStyle(
                                          fontSize: 10,
                                          color: Color(0xFF757575),
                                          fontWeight: FontWeight.w600)),
                                ],
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(ctx),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: const BoxDecoration(
                          color: kPrimaryBg, shape: BoxShape.circle),
                      child: const Icon(Icons.close,
                          size: 16, color: Color(0xFF757575)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const Divider(height: 1, color: Color(0xFFEDE7F6)),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.description_rounded,
                            size: 13, color: style.iconColor),
                        const SizedBox(width: 6),
                        Text(
                          type == 'ORDONNANCE'
                              ? 'PRESCRIPTION MÉDICALE'
                              : 'COMPTE RENDU',
                          style: TextStyle(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w800,
                            color: style.iconColor,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFFBFAFF),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                            color: const Color(0xFFEEEAF6)),
                      ),
                      child: contenu.isEmpty
                          ? _emptyWidget(style)
                          : isJson && rows.isNotEmpty
                          ? _jsonWidget(rows)
                          : _textWidget(contenu),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: kPrimaryBg,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: kPrimary.withOpacity(0.3)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified_rounded,
                              size: 13, color: kPrimaryDark),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Document certifié • Centre de Sénologie OncoAssist',
                              style: TextStyle(
                                fontSize: 9,
                                color: Color(0xFF7E57C2),
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Actions — TOUJOURS mauve
            Container(
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
              decoration: const BoxDecoration(
                border: Border(
                    top: BorderSide(color: Color(0xFFEDE7F6))),
                color: Colors.white,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: kPrimary,
                        side: const BorderSide(color: kPrimary),
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        widget.onShowToast("Document partagé 📤");
                      },
                      icon: const Icon(Icons.ios_share_rounded,
                          size: 16, color: kPrimary),
                      label: const Text("Partager",
                          style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: kPrimary)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: kPrimary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        _downloadDoc(doc);
                      },
                      icon: const Icon(Icons.download_rounded, size: 16),
                      label: const Text("Télécharger",
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _textWidget(String text) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.local_hospital_rounded,
                  size: 11, color: kPrimaryDark),
              const SizedBox(width: 6),
              const Text(
                'CENTRE DE SÉNOLOGIE • OncoAssist',
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: FontWeight.w800,
                  color: kPrimaryDark,
                  letterSpacing: 0.4,
                ),
              ),
            ],
          ),
          const Divider(height: 14, color: Color(0xFFEDE7F6)),
          Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              color: Color(0xFF2D2D2D),
              height: 1.8,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    );
  }

  Widget _jsonWidget(List<MapEntry<String, String>> rows) {
    return Column(
      children: rows.asMap().entries.map((entry) {
        final i      = entry.key;
        final row    = entry.value;
        final isLast = i == rows.length - 1;
        return Container(
          padding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
          decoration: BoxDecoration(
            border: isLast
                ? null
                : const Border(
                bottom: BorderSide(color: Color(0xFFEEEAF6))),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 130,
                child: Text(
                  row.key.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF9E9E9E),
                    letterSpacing: 0.3,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  row.value,
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2D2D2D),
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _emptyWidget(_DocStyle style) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(style.icon, size: 40,
              color: style.iconColor.withOpacity(0.2)),
          const SizedBox(height: 12),
          const Text(
            'Aperçu non disponible.\nTéléchargez le document pour le consulter.',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 12, color: Colors.grey, height: 1.5),
          ),
        ],
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final docs = _filtered;
    final initiales =
        '${widget.patientPrenom.isNotEmpty ? widget.patientPrenom[0] : ''}'
        '${widget.patientNom.isNotEmpty ? widget.patientNom[0] : ''}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [

        // ── HEADER avec infos patient (comme chez médecin) ──
        Container(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
                bottom: BorderSide(color: Color(0xFFEDE7F6))),
          ),
          child: Column(
            children: [
              // Bandeau identité patient
              Row(
                children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFB39DDB), Color(0xFF9575CD)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Center(
                      child: Text(
                        initiales.isEmpty ? 'OA' : initiales.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${widget.patientPrenom} ${widget.patientNom}'.trim().isEmpty
                              ? 'Mon Dossier Médical'
                              : '${widget.patientPrenom} ${widget.patientNom}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                            color: Color(0xFF2D2D2D),
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'CENTRE DE SÉNOLOGIE • OncoAssist',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: kPrimaryDark,
                            letterSpacing: 0.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                        color: kPrimaryBg,
                        borderRadius: BorderRadius.circular(20)),
                    child: Text(
                      _isLoading
                          ? '...'
                          : '${_allDocs.length} doc${_allDocs.length > 1 ? 's' : ''}',
                      style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: kPrimaryDark),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Barre recherche
              Container(
                height: 40,
                decoration: BoxDecoration(
                    color: kPrimaryBg,
                    borderRadius: BorderRadius.circular(20)),
                child: TextField(
                  onChanged: (val) =>
                      setState(() => _searchQuery = val),
                  style: const TextStyle(fontSize: 12),
                  decoration: const InputDecoration(
                    hintText: "Rechercher un document...",
                    hintStyle: TextStyle(
                        fontSize: 12, color: Color(0xFFB39DDB)),
                    prefixIcon: Icon(Icons.search_rounded,
                        color: kPrimary, size: 18),
                    border: InputBorder.none,
                    contentPadding:
                    EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Filtres
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    'Tous', 'Résultats', 'Ordonnances', 'Dossier'
                  ].map((cat) {
                    final isSelected = _selectedCategory == cat;
                    final count = _countForCat(cat);
                    return GestureDetector(
                      onTap: () =>
                          setState(() => _selectedCategory = cat),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? kPrimary : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? kPrimary
                                : const Color(0xFFEDE7F6),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(cat,
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected
                                        ? Colors.white
                                        : const Color(0xFF757575))),
                            if (count > 0 && !_isLoading) ...[
                              const SizedBox(width: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 5, vertical: 1),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? Colors.white.withOpacity(0.3)
                                      : kPrimaryBg,
                                  borderRadius:
                                  BorderRadius.circular(10),
                                ),
                                child: Text('$count',
                                    style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: isSelected
                                            ? Colors.white
                                            : kPrimaryDark)),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),

        // ── LISTE ───────────────────────────────────────────
        Expanded(
          child: _isLoading
              ? const Center(
              child: CircularProgressIndicator(
                  color: kPrimary, strokeWidth: 2))
              : _error != null
              ? Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.cloud_off_outlined,
                    color: kPrimary, size: 48),
                const SizedBox(height: 12),
                Text(_error!,
                    style: const TextStyle(
                        fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 12),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kPrimary,
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                        borderRadius:
                        BorderRadius.circular(20)),
                  ),
                  onPressed: _fetchAll,
                  child: const Text("Réessayer"),
                ),
              ],
            ),
          )
              : docs.isEmpty
              ? Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.folder_open_outlined,
                    color: kPrimary.withOpacity(0.4),
                    size: 56),
                const SizedBox(height: 12),
                const Text(
                    "Aucun document disponible",
                    style: TextStyle(
                        color: Colors.grey,
                        fontSize: 13)),
              ],
            ),
          )
              : ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: docs.length,
            separatorBuilder: (_, __) =>
            const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final d     = docs[i];
              final style =
              _styleForType(d['type']?.toString());
              final nom =
              (d['nom'] ?? 'Document').toString();
              final date = _formatDate(
                  d['dateAjout']?.toString());
              final partage =
                  d['partagePatient'] == true;

              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                  BorderRadius.circular(18),
                  border: Border.all(
                      color: const Color(0xFFEDE7F6)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black
                          .withOpacity(0.03),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            width: 50, height: 50,
                            decoration: BoxDecoration(
                              color: style.bg,
                              borderRadius:
                              BorderRadius.circular(14),
                            ),
                            child: Icon(style.icon,
                                color: style.iconColor,
                                size: 24),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                              CrossAxisAlignment.start,
                              children: [
                                Text(nom,
                                    style: const TextStyle(
                                      fontWeight:
                                      FontWeight.w700,
                                      fontSize: 12.5,
                                      color:
                                      Color(0xFF2D2D2D),
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow
                                        .ellipsis),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    _chip(style.badge,
                                        style.bg,
                                        style.iconColor),
                                    if (date
                                        .isNotEmpty) ...[
                                      const SizedBox(
                                          width: 8),
                                      const Icon(
                                        Icons
                                            .calendar_today_rounded,
                                        size: 11,
                                        color: Color(
                                            0xFF9E9E9E),
                                      ),
                                      const SizedBox(
                                          width: 3),
                                      Text(date,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: Color(
                                                0xFF757575),
                                            fontWeight:
                                            FontWeight
                                                .w600,
                                          )),
                                    ],
                                    if (partage) ...[
                                      const SizedBox(
                                          width: 6),
                                      const Icon(
                                          Icons
                                              .verified_rounded,
                                          size: 13,
                                          color: kPrimary),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      decoration: const BoxDecoration(
                        border: Border(
                            top: BorderSide(
                                color:
                                Color(0xFFEDE7F6))),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () =>
                                  _openPreview(d),
                              child: Container(
                                padding:
                                const EdgeInsets
                                    .symmetric(
                                    vertical: 12),
                                decoration:
                                const BoxDecoration(
                                  border: Border(
                                      right: BorderSide(
                                          color: Color(
                                              0xFFEDE7F6))),
                                  borderRadius:
                                  BorderRadius.only(
                                    bottomLeft:
                                    Radius.circular(
                                        18),
                                  ),
                                ),
                                child: const Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment
                                      .center,
                                  children: [
                                    Icon(
                                      Icons
                                          .visibility_rounded,
                                      size: 15,
                                      color: kPrimary,
                                    ),
                                    SizedBox(width: 6),
                                    Text("Aperçu",
                                        style: TextStyle(
                                          fontSize: 11.5,
                                          fontWeight:
                                          FontWeight
                                              .w700,
                                          color: kPrimary,
                                        )),
                                  ],
                                ),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () =>
                                  _downloadDoc(d),
                              child: Container(
                                padding:
                                const EdgeInsets
                                    .symmetric(
                                    vertical: 12),
                                decoration:
                                const BoxDecoration(
                                  borderRadius:
                                  BorderRadius.only(
                                    bottomRight:
                                    Radius.circular(
                                        18),
                                  ),
                                ),
                                child: const Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment
                                      .center,
                                  children: [
                                    Icon(
                                      Icons
                                          .download_rounded,
                                      size: 15,
                                      color: kPrimary,
                                    ),
                                    SizedBox(width: 6),
                                    Text("Télécharger",
                                        style: TextStyle(
                                          fontSize: 11.5,
                                          fontWeight:
                                          FontWeight
                                              .w700,
                                          color: kPrimary,
                                        )),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

extension StringCap on String {
  String capitalize() =>
      isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
}

class _DocStyle {
  final IconData icon;
  final Color bg;
  final Color iconColor;
  final String label;
  final String badge;

  const _DocStyle({
    required this.icon,
    required this.bg,
    required this.iconColor,
    required this.label,
    required this.badge,
  });
}