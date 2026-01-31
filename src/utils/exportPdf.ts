import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SessionAnalysis } from '@/types/quiz';

const formatTime = (seconds: number) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

const formatName = (name: string) => {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const exportSessionToPdf = (
  analysis: SessionAnalysis,
  subject: string,
  recommendations: string,
  studentName?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;

  // Header
  doc.setFillColor(99, 102, 241); // Primary purple
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('📊 Quiz Performance Report', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  doc.text(dateStr, margin, 38);
  
  yPosition = 55;

  // Student info section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Information', margin, yPosition);
  yPosition += 8;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subject: ${formatName(subject)}`, margin, yPosition);
  if (studentName) {
    doc.text(`Student: ${studentName}`, margin + 80, yPosition);
  }
  yPosition += 15;

  // Overview Stats Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPosition - 5, pageWidth - margin * 2, 35, 3, 3, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Session Overview', margin + 5, yPosition + 5);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const stats = [
    `Questions: ${analysis.totalQuestions}`,
    `Correct: ${analysis.correctAnswers}`,
    `Accuracy: ${Math.round(analysis.overallAccuracy * 100)}%`,
    `Total Time: ${formatTime(analysis.totalTimeSeconds)}`,
    `Avg/Question: ${formatTime(analysis.averageTimePerQuestion)}`
  ];
  
  const statWidth = (pageWidth - margin * 2 - 10) / stats.length;
  stats.forEach((stat, i) => {
    doc.text(stat, margin + 5 + (i * statWidth), yPosition + 20);
  });
  
  yPosition += 45;

  // Performance Grade
  const accuracy = analysis.overallAccuracy;
  let grade = 'Needs Practice';
  let gradeColor: [number, number, number] = [239, 68, 68]; // Red
  if (accuracy >= 0.9) { grade = 'Excellent!'; gradeColor = [34, 197, 94]; }
  else if (accuracy >= 0.8) { grade = 'Great Job!'; gradeColor = [34, 197, 94]; }
  else if (accuracy >= 0.7) { grade = 'Good Progress'; gradeColor = [245, 158, 11]; }
  else if (accuracy >= 0.6) { grade = 'Keep Practicing'; gradeColor = [245, 158, 11]; }

  doc.setFillColor(...gradeColor);
  doc.roundedRect(margin, yPosition - 5, pageWidth - margin * 2, 20, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Performance: ${grade}`, pageWidth / 2, yPosition + 7, { align: 'center' });
  
  yPosition += 25;
  doc.setTextColor(0, 0, 0);

  // Topic Performance Table
  if (analysis.topicAnalyses.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Topic Performance', margin, yPosition);
    yPosition += 5;

    const tableData = analysis.topicAnalyses.map(topic => [
      formatName(topic.topic),
      `${topic.questionsAttempted}`,
      `${topic.correctAnswers}`,
      `${Math.round(topic.accuracy * 100)}%`,
      formatTime(topic.averageTimeSeconds),
      topic.isStrength ? '💪 Strong' : topic.isWeakness ? '📚 Practice' : '➡️ Average'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Topic', 'Questions', 'Correct', 'Accuracy', 'Avg Time', 'Status']],
      body: tableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Strengths & Weaknesses
  if (analysis.strengths.length > 0 || analysis.weaknesses.length > 0) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Analysis', margin, yPosition);
    yPosition += 10;

    const analysisBoxWidth = (pageWidth - margin * 2 - 10) / 2;

    // Strengths box
    if (analysis.strengths.length > 0) {
      doc.setFillColor(220, 252, 231); // Green background
      doc.roundedRect(margin, yPosition - 5, analysisBoxWidth, 40, 3, 3, 'F');
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('💪 Strengths', margin + 5, yPosition + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const strengthText = analysis.strengths.map(s => formatName(s)).join(', ');
      const splitStrengths = doc.splitTextToSize(strengthText, analysisBoxWidth - 10);
      doc.text(splitStrengths, margin + 5, yPosition + 15);
    }

    // Weaknesses box
    if (analysis.weaknesses.length > 0) {
      doc.setFillColor(254, 226, 226); // Red background
      doc.roundedRect(margin + analysisBoxWidth + 10, yPosition - 5, analysisBoxWidth, 40, 3, 3, 'F');
      doc.setTextColor(153, 27, 27);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('📚 Areas to Improve', margin + analysisBoxWidth + 15, yPosition + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const weaknessText = analysis.weaknesses.map(s => formatName(s)).join(', ');
      const splitWeaknesses = doc.splitTextToSize(weaknessText, analysisBoxWidth - 10);
      doc.text(splitWeaknesses, margin + analysisBoxWidth + 15, yPosition + 15);
    }

    yPosition += 50;
  }

  // Time Analysis
  if (analysis.slowTopics.length > 0 || analysis.fastTopics.length > 0) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Time Analysis', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (analysis.fastTopics.length > 0) {
      doc.setTextColor(22, 163, 74);
      doc.text(`⚡ Quick Topics: ${analysis.fastTopics.map(s => formatName(s)).join(', ')}`, margin, yPosition);
      yPosition += 8;
    }
    
    if (analysis.slowTopics.length > 0) {
      doc.setTextColor(234, 88, 12);
      doc.text(`🐢 Topics Needing More Time: ${analysis.slowTopics.map(s => formatName(s)).join(', ')}`, margin, yPosition);
      yPosition += 8;
    }
    
    yPosition += 10;
  }

  // AI Recommendations
  if (recommendations) {
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📖 Personalized Recommendations', margin, yPosition);
    yPosition += 10;

    doc.setFillColor(238, 242, 255); // Light purple
    const recBoxWidth = pageWidth - margin * 2;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitRecs = doc.splitTextToSize(recommendations, recBoxWidth - 10);
    const recBoxHeight = Math.max(40, splitRecs.length * 5 + 15);
    
    doc.roundedRect(margin, yPosition - 5, recBoxWidth, recBoxHeight, 3, 3, 'F');
    doc.setTextColor(67, 56, 202);
    doc.text(splitRecs, margin + 5, yPosition + 5);
    
    yPosition += recBoxHeight + 10;
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated by Magic Mastery Quiz', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Report Date: ${dateStr}`, pageWidth / 2, footerY + 5, { align: 'center' });

  // Save the PDF
  const fileName = `quiz-report-${subject}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
