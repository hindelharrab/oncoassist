import 'package:flutter/material.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../models/models.dart';
import '../services/api_service.dart';

class ProfilScreen extends StatefulWidget {
  final Patient patient;
  final Function(String) onShowToast;
  final VoidCallback onLogout;
  final String patientId;

  const ProfilScreen({
    Key? key,
    required this.patient,
    required this.onShowToast,
    required this.onLogout,
    required this.patientId,
  }) : super(key: key);

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isEditing = false;

  String _nom = '';
  String _prenom = '';
  String _telephone = '';
  String _adresse = '';
  String _personneConfiance = '';
  String _dateNaissance = '';
  String _email = '';
  String _medecinRef = '';
  String _photoProfil = '';

  late TextEditingController _telController;
  late TextEditingController _adresseController;
  late TextEditingController _personneConfianceController;

  File? _selectedPhoto;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _telController = TextEditingController();
    _adresseController = TextEditingController();
    _personneConfianceController = TextEditingController();
    _fetchProfil();
  }

  @override
  void dispose() {
    _telController.dispose();
    _adresseController.dispose();
    _personneConfianceController.dispose();
    super.dispose();
  }

  Future<void> _fetchProfil() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final data =
      await ApiService.get('/patients/${widget.patientId}');
      if (!mounted) return;
      setState(() {
        _nom = data['nom'] ?? widget.patient.lastName;
        _prenom = data['prenom'] ?? widget.patient.firstName;
        _telephone = data['telephone'] ?? '';
        _adresse = data['adresse'] ?? '';
        _personneConfiance = data['personneConfiance'] ?? '';
        _dateNaissance = data['dateNaissance'] ?? widget.patient.birthDate;
        _email = data['email'] ?? '';
        _medecinRef = data['medecinRef'] ?? '';
        _photoProfil = data['photoProfil'] ?? '';
        _telController.text = _telephone;
        _adresseController.text = _adresse;
        _personneConfianceController.text = _personneConfiance;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<void> _pickPhoto() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 800,
        imageQuality: 85,
      );
      if (image != null && mounted) {
        setState(() => _selectedPhoto = File(image.path));
      }
    } catch (e) {
      widget.onShowToast("Impossible d'accéder à la galerie.");
    }
  }

  Future<void> _saveChanges() async {
    if (!mounted) return;
    setState(() => _isSaving = true);
    try {
      await ApiService.putMultipart(
        '/patients/${widget.patientId}/profil',
        fields: {
          'telephone': _telController.text.trim(),
          'adresse': _adresseController.text.trim(),
          'personneConfiance': _personneConfianceController.text.trim(),
        },
        photo: _selectedPhoto,
      );
      await _fetchProfil();
      if (!mounted) return;
      setState(() {
        _isEditing = false;
        _selectedPhoto = null;
      });
      widget.onShowToast("Profil mis à jour avec succès 🌸");
    } catch (e) {
      if (!mounted) return;
      widget.onShowToast("Erreur lors de la sauvegarde.");
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  String get _avatarUrl {
    if (_photoProfil.isEmpty) return '';
    if (_photoProfil.startsWith('http')) return _photoProfil;
    return 'http://10.0.2.2:8080/$_photoProfil';
  }

  String get _initials {
    final f = _prenom.isNotEmpty ? _prenom[0] : '';
    final l = _nom.isNotEmpty ? _nom[0] : '';
    return '$f$l'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
          child: CircularProgressIndicator(color: Color(0xFFB39DDB)));
    }

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [

        // ── CARTE IDENTITÉ ────────────────────────────────
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFEDE7F6), Color(0xFFFCE4EC)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
                color: const Color(0xFFB39DDB).withOpacity(0.3)),
          ),
          child: Column(
            children: [
              // Avatar
              Stack(
                alignment: Alignment.bottomRight,
                children: [
                  GestureDetector(
                    onTap: _isEditing ? _pickPhoto : null,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                            color: const Color(0xFFB39DDB), width: 2),
                      ),
                      child: ClipOval(
                        child: _selectedPhoto != null
                            ? Image.file(_selectedPhoto!, fit: BoxFit.cover)
                            : _avatarUrl.isNotEmpty
                            ? Image.network(
                          _avatarUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              _avatarFallback(),
                        )
                            : _avatarFallback(),
                      ),
                    ),
                  ),
                  if (_isEditing)
                    GestureDetector(
                      onTap: _pickPhoto,
                      child: Container(
                        width: 26,
                        height: 26,
                        decoration: const BoxDecoration(
                          color: Color(0xFFB39DDB),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.camera_alt,
                            size: 14, color: Colors.white),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                '$_prenom $_nom',
                style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF2D2D2D)),
              ),
              const SizedBox(height: 2),
              Text(
                'Fiche : ${widget.patient.folderID}',
                style: const TextStyle(
                    fontSize: 11, color: Color(0xFF757575)),
              ),
              const SizedBox(height: 4),
              if (_dateNaissance.isNotEmpty)
                Text(
                  'Née le $_dateNaissance',
                  style: const TextStyle(
                      fontSize: 10,
                      color: Color(0xFF6A1B9A),
                      fontWeight: FontWeight.bold),
                ),
              const SizedBox(height: 12),

              // Boutons Modifier / Enregistrer
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (!_isEditing)
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFB39DDB),
                        side: const BorderSide(color: Color(0xFFB39DDB)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 6),
                      ),
                      onPressed: () => setState(() => _isEditing = true),
                      icon: const Icon(Icons.edit, size: 14),
                      label: const Text('Modifier mon profil',
                          style: TextStyle(
                              fontSize: 11, fontWeight: FontWeight.bold)),
                    )
                  else ...[
                    TextButton(
                      onPressed: () => setState(() {
                        _isEditing = false;
                        _selectedPhoto = null;
                        // Rétablir les valeurs originales
                        _telController.text = _telephone;
                        _adresseController.text = _adresse;
                        _personneConfianceController.text =
                            _personneConfiance;
                      }),
                      child: const Text('Annuler',
                          style: TextStyle(
                              color: Colors.grey, fontSize: 11)),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB39DDB),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20)),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 6),
                        elevation: 0,
                      ),
                      onPressed: _isSaving ? null : _saveChanges,
                      icon: _isSaving
                          ? const SizedBox(
                          width: 12,
                          height: 12,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                          : const Icon(Icons.check, size: 14),
                      label: const Text('Enregistrer',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold)),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── INFORMATIONS MODIFIABLES ──────────────────────
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFEDE7F6)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('INFORMATIONS PERSONNELLES',
                  style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: Colors.grey,
                      letterSpacing: 1)),
              const SizedBox(height: 12),
              _infoRow(Icons.email_outlined, 'Email', _email, null),
              _divider(),
              _infoRow(Icons.phone_outlined, 'Téléphone', _telephone,
                  _isEditing ? _telController : null),
              _divider(),
              _infoRow(Icons.location_on_outlined, 'Adresse', _adresse,
                  _isEditing ? _adresseController : null),
              _divider(),
              _infoRow(
                  Icons.people_outline,
                  'Personne de confiance',
                  _personneConfiance,
                  _isEditing ? _personneConfianceController : null),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── ÉQUIPE MÉDICALE ───────────────────────────────
        if (_medecinRef.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFEDE7F6)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('ÉQUIPE MÉDICALE ACTIVE',
                    style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: Colors.grey,
                        letterSpacing: 1)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: const BoxDecoration(
                          color: Color(0xFFEDE7F6),
                          shape: BoxShape.circle),
                      child: Center(
                        child: Text(
                          _medecinRef.isNotEmpty
                              ? _medecinRef[0].toUpperCase()
                              : 'M',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFB39DDB),
                              fontSize: 14),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Dr. $_medecinRef',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  color: Color(0xFF2D2D2D))),
                          const Text('Médecin référent',
                              style: TextStyle(
                                  fontSize: 10,
                                  color: Color(0xFF757575))),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFB39DDB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                        minimumSize: Size.zero,
                      ),
                      onPressed: () =>
                          widget.onShowToast('Contacter votre médecin 👩‍⚕️'),
                      child: const Text('Contacter',
                          style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        const SizedBox(height: 12),

        // ── ACTIONS ───────────────────────────────────────
        Row(
          children: [
            Expanded(
                child: _actionBtn(
                    Icons.phone,
                    'Téléphone',
                    const Color(0xFFB39DDB),
                        () => widget.onShowToast('Appel au secrétariat... 📞'))),
            const SizedBox(width: 8),
            Expanded(
                child: _actionBtn(
                    Icons.calendar_month,
                    'Demande RDV',
                    const Color(0xFFE91E8C),
                        () => widget
                        .onShowToast('Demande de rendez-vous...'))),
            const SizedBox(width: 8),
            Expanded(
                child: _actionBtn(
                    Icons.share,
                    'Partager',
                    const Color(0xFF64B5F6),
                        () =>
                        widget.onShowToast('Partage du dossier... 📤'))),
          ],
        ),
        const SizedBox(height: 16),

        // ── DÉCONNEXION ───────────────────────────────────
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFCE4EC),
              foregroundColor: const Color(0xFFE91E8C),
              elevation: 0,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: widget.onLogout,
            icon: const Icon(Icons.logout, size: 16),
            label: const Text('Se déconnecter',
                style:
                TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _avatarFallback() {
    return Center(
      child: Text(
        _initials,
        style: const TextStyle(
            fontWeight: FontWeight.bold,
            color: Color(0xFFE91E8C),
            fontSize: 22),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value,
      TextEditingController? controller) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xFFB39DDB)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(
                        fontSize: 9,
                        color: Colors.grey,
                        fontWeight: FontWeight.bold)),
                const SizedBox(height: 3),
                controller != null
                    ? TextField(
                  controller: controller,
                  style: const TextStyle(
                      fontSize: 12, color: Color(0xFF2D2D2D)),
                  decoration: InputDecoration(
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 6),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                          color: Color(0xFFB39DDB)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                          color: Color(0xFFB39DDB), width: 1.5),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: const BorderSide(
                          color: Color(0xFFEDE7F6)),
                    ),
                  ),
                )
                    : Text(
                  value.isNotEmpty ? value : '—',
                  style: TextStyle(
                    fontSize: 12,
                    color: value.isNotEmpty
                        ? const Color(0xFF2D2D2D)
                        : Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _divider() =>
      const Divider(height: 1, color: Color(0xFFF5F5F5));

  Widget _actionBtn(IconData icon, String label, Color iconColor,
      VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
        const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFEDE7F6)),
        ),
        child: Column(
          children: [
            Icon(icon, size: 16, color: iconColor),
            const SizedBox(height: 4),
            Text(label,
                textAlign: TextAlign.center,
                style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2D2D2D))),
          ],
        ),
      ),
    );
  }
}