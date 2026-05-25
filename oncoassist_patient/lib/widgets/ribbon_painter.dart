import 'package:flutter/material.dart';

class RibbonPainter extends CustomPainter {
  final Color color;
  const RibbonPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = size.width * 0.12
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final path = Path();
    path.moveTo(size.width * 0.5, size.width * 0.2);
    path.cubicTo(size.width * 0.35, size.width * 0.2, size.width * 0.25, size.width * 0.35, size.width * 0.25, size.width * 0.5);
    path.cubicTo(size.width * 0.25, size.width * 0.65, size.width * 0.35, size.width * 0.8, size.width * 0.5, size.width * 0.95);
    path.cubicTo(size.width * 0.65, size.width * 0.8, size.width * 0.75, size.width * 0.65, size.width * 0.75, size.width * 0.5);
    path.cubicTo(size.width * 0.75, size.width * 0.35, size.width * 0.65, size.width * 0.2, size.width * 0.5, size.width * 0.2);
    canvas.drawPath(path, paint);

    final pathTail = Path();
    pathTail.moveTo(size.width * 0.35, size.width * 0.88);
    pathTail.lineTo(size.width * 0.5, size.width * 0.68);
    pathTail.lineTo(size.width * 0.65, size.width * 0.88);
    canvas.drawPath(pathTail, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}