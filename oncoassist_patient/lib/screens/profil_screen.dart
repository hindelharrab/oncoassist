import 'package:flutter/material.dart';
import '../models/models.dart';

class ProfilScreen extends StatelessWidget {
  final Patient patient;
  final Function(String) onShowToast;

  const ProfilScreen({
    Key? key,
    required this.patient,
    required this.onShowToast,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [

        // ── CARTE IDENTITÉ ───────────────────────────────────────
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFEDE7F6), Color(0xFFFCE4EC)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFB39DDB).withOpacity(0.3)),
          ),
          child: Column(
            children: [
              // Avatar
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFB39DDB), width: 2),
                ),
                child: Center(
                  child: Text(
                    "${patient.firstName[0]}${patient.lastName[0]}",
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFE91E8C), fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Text("${patient.firstName.replaceAll(' 🌸', '')} ${patient.lastName}",
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF2D2D2D))),
              const SizedBox(height: 2),
              Text("Fiche Patient : ${patient.folderID}",
                  style: const TextStyle(fontSize: 12, color: Color(0xFF757575))),
              const SizedBox(height: 4),
              Text("Née le ${patient.birthDate} (42 ans)",
                  style: const TextStyle(fontSize: 10, color: Color(0xFF6A1B9A), fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              // Badges
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 6,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFB39DDB).withOpacity(0.4)),
                    ),
                    child: Text("Groupe ${patient.bloodType} 🩸",
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFB39DDB))),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF9A9A),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text("Allergie : ${patient.allergies} ⚠️",
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white)),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // ── ACTIONS (3 boutons) ──────────────────────────────────
        Row(
          children: [
            Expanded(child: _actionBtn(Icons.phone, "Téléphone", const Color(0xFFB39DDB),
                    () => onShowToast("Appel au secrétariat du Dr Mansouri... 📞"))),
            const SizedBox(width: 8),
            Expanded(child: _actionBtn(Icons.calendar_month, "Demande RDV", const Color(0xFFE91E8C),
                    () => onShowToast("Demande de rendez-vous de contrôle..."))),
            const SizedBox(width: 8),
            Expanded(child: _actionBtn(Icons.share, "Partager", const Color(0xFF64B5F6),
                    () => onShowToast("Dossier zippé prêt pour le partage. 📤"))),
          ],
        ),
        const SizedBox(height: 16),

        // ── ÉQUIPE MÉDICALE ──────────────────────────────────────
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
              Container(
                padding: const EdgeInsets.only(bottom: 6),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFF5F5F5))),
                ),
                child: const Text("ÉQUIPE MÉDICALE ACTIVE",
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.grey, letterSpacing: 1)),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: const BoxDecoration(color: Color(0xFFEDE7F6), shape: BoxShape.circle),
                    child: const Center(
                      child: Text("LM", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFB39DDB), fontSize: 12)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Dr. Leila Mansouri",
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF2D2D2D))),
                        Text("Oncologue Référent — Centre du Sein",
                            style: TextStyle(fontSize: 10, color: Color(0xFF757575))),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFB39DDB),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      elevation: 0,
                      minimumSize: Size.zero,
                    ),
                    onPressed: () => onShowToast("Discussion médecin active en direct. 👩‍⚕️"),
                    child: const Text("Contacter", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // ── ANTÉCÉDENTS FAMILIAUX ────────────────────────────────
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
              Container(
                padding: const EdgeInsets.only(bottom: 6),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFFAFAFA))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text("Antécédents familiaux",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                    Text("Génétique",
                        style: TextStyle(fontSize: 10, color: Color(0xFFE91E8C), fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "• Mère diagnostiquée à 52 ans (cancer du sein)\n• Sœur de la grand-mère paternelle.",
                style: TextStyle(fontSize: 10, color: Color(0xFF757575), height: 1.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),

        // ── TRAITEMENT EN COURS ──────────────────────────────────
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
              Container(
                padding: const EdgeInsets.only(bottom: 6),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFFAFAFA))),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Traitement en cours",
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF8E1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text("Actif",
                          style: TextStyle(fontSize: 9, color: Color(0xFFE65100), fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                "Tamoxifène 20mg quotidien (Adjuvant M+6).\nPrescrit le 10/03/2026. Prochain contrôle gynécologique requis en septembre.",
                style: TextStyle(fontSize: 10, color: Color(0xFF616161), height: 1.5),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
      ],
    );
  }

  Widget _actionBtn(IconData icon, String label, Color iconColor, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
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
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF2D2D2D))),
          ],
        ),
      ),
    );
  }
}