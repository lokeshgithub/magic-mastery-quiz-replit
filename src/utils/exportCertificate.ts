import jsPDF from 'jspdf';
import { LevelReward } from '@/data/levelRewards';

export interface CertificateData {
  studentName: string;
  level: number;
  reward: LevelReward;
  subject: string;
  date: Date;
  grade?: number;
}

export const exportCertificateToPdf = (data: CertificateData) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;

  // Background gradient effect with border
  doc.setFillColor(250, 250, 255);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative border
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Inner decorative border
  doc.setDrawColor(168, 85, 247);
  doc.setLineWidth(1);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Top decorative elements
  doc.setFillColor(99, 102, 241);
  doc.circle(30, 30, 8, 'F');
  doc.circle(pageWidth - 30, 30, 8, 'F');
  doc.circle(30, pageHeight - 30, 8, 'F');
  doc.circle(pageWidth - 30, pageHeight - 30, 8, 'F');

  // Certificate header
  let yPos = 40;
  
  // Badge emoji (as text placeholder)
  doc.setFontSize(40);
  doc.text(data.reward.badge.icon, centerX, yPos, { align: 'center' });
  yPos += 15;

  // Certificate title
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF ACHIEVEMENT', centerX, yPos, { align: 'center' });
  yPos += 12;

  // Certificate name
  doc.setTextColor(139, 92, 246);
  doc.setFontSize(18);
  doc.text(data.reward.certificate.name, centerX, yPos, { align: 'center' });
  yPos += 18;

  // Decorative line
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(1);
  doc.line(centerX - 80, yPos, centerX + 80, yPos);
  yPos += 15;

  // "This is to certify that"
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that', centerX, yPos, { align: 'center' });
  yPos += 12;

  // Student name
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(data.studentName, centerX, yPos, { align: 'center' });
  yPos += 10;

  // Underline for name
  const nameWidth = doc.getTextWidth(data.studentName);
  doc.setDrawColor(168, 85, 247);
  doc.setLineWidth(0.5);
  doc.line(centerX - nameWidth / 2, yPos, centerX + nameWidth / 2, yPos);
  yPos += 12;

  // Achievement description
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully achieved', centerX, yPos, { align: 'center' });
  yPos += 12;

  // Level and Title
  doc.setTextColor(99, 102, 241);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Level ${data.level} - ${data.reward.title}`, centerX, yPos, { align: 'center' });
  yPos += 10;

  // Subject and Grade
  doc.setTextColor(139, 92, 246);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  const subjectText = `in ${data.subject.charAt(0).toUpperCase() + data.subject.slice(1)}${data.grade ? ` (Class ${data.grade})` : ''}`;
  doc.text(subjectText, centerX, yPos, { align: 'center' });
  yPos += 15;

  // Certificate description
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.text(data.reward.certificate.description, centerX, yPos, { align: 'center' });
  yPos += 8;

  // Achievement message
  doc.setTextColor(34, 197, 94);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.text(data.reward.achievementMessage, centerX, yPos, { align: 'center' });
  yPos += 15;

  // Date
  const dateStr = data.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Awarded on ${dateStr}`, centerX, yPos, { align: 'center' });
  yPos += 20;

  // Footer
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(9);
  doc.text('Magic Mastery Quiz - Empowering Young Minds', centerX, pageHeight - 25, { align: 'center' });
  doc.text('www.scimathwizard.com', centerX, pageHeight - 20, { align: 'center' });

  // Save the PDF
  const fileName = `certificate-level${data.level}-${data.subject}-${data.studentName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
