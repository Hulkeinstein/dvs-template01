/**
 * Default Certificate Template
 * A classic certificate design using React PDF
 */

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font,
  Image
} from '@react-pdf/renderer';

// Register fonts if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
  },
  container: {
    flex: 1,
    border: '3 solid #1a73e8',
    borderRadius: 10,
    padding: 40,
    position: 'relative',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  content: {
    textAlign: 'center',
    marginBottom: 30,
  },
  certifyText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2 solid #ddd',
  },
  courseInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  courseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 20,
  },
  completionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signature: {
    width: '45%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1 solid #333',
    marginBottom: 5,
    paddingTop: 5,
  },
  signatureName: {
    fontSize: 12,
    color: '#333',
  },
  signatureTitle: {
    fontSize: 10,
    color: '#666',
  },
  certificateNumber: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    fontSize: 10,
    color: '#999',
  },
  qrCode: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 60,
    height: 60,
  },
});

// Create Document Component
const DefaultCertificateTemplate = ({ data }) => {
  const {
    studentName,
    courseName,
    instructorName,
    completionDate,
    certificateNumber,
    qrCodeUrl,
    certificateTitle = 'Certificate of Completion'
  } = data;

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{certificateTitle}</Text>
            <Text style={styles.subtitle}>This is to certify that</Text>
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.courseInfo}>has successfully completed the course</Text>
            <Text style={styles.courseName}>{courseName}</Text>
            <Text style={styles.completionDate}>
              on {formatDate(completionDate)}
            </Text>
          </View>

          {/* Signatures */}
          <View style={styles.footer}>
            <View style={styles.signature}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>{instructorName}</Text>
              <Text style={styles.signatureTitle}>Instructor</Text>
            </View>
            <View style={styles.signature}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Platform Administrator</Text>
              <Text style={styles.signatureTitle}>DVS Learning Platform</Text>
            </View>
          </View>

          {/* Certificate Number */}
          <Text style={styles.certificateNumber}>
            Certificate No: {certificateNumber}
          </Text>

          {/* QR Code placeholder */}
          {qrCodeUrl && (
            <Image style={styles.qrCode} src={qrCodeUrl} alt="QR Code" />
          )}
        </View>
      </Page>
    </Document>
  );
};

export default DefaultCertificateTemplate;