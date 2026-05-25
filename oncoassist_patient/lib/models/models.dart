import 'package:flutter/material.dart';

class Patient {
  final String firstName;
  final String lastName;
  final String birthDate;
  final String bloodType;
  final String allergies;
  final String folderID;

  const Patient({
    required this.firstName,
    required this.lastName,
    required this.birthDate,
    required this.bloodType,
    required this.allergies,
    required this.folderID,
  });
}

class DocumentItem {
  final String name;
  final String date;
  final String size;
  final String category;
  final bool isSharedByDoctor;

  const DocumentItem({
    required this.name,
    required this.date,
    required this.size,
    required this.category,
    required this.isSharedByDoctor,
  });
}

class TimelineEvent {
  final String id;
  final String type;
  final String title;
  final String subtitle;
  final String date;
  final String? rawDate;   // ← AJOUT pour le tri chronologique
  final String badge;
  final Color color;
  final String desc;


  const TimelineEvent({
    required this.id,
    required this.type,
    required this.title,
    required this.subtitle,
    required this.date,
    this.rawDate,           // ← optionnel
    required this.badge,
    required this.color,
    required this.desc,
  });
}