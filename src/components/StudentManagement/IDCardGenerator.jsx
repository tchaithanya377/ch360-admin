import React, { useState, useEffect, useRef } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faDownload,
  faPrint,
  faEye,
  faPlus,
  faSearch,
  faFilter,
  faQrcode,
  faBarcode,
  faTimes,
  faPalette,
  faCog,
  faImage,
  faFont,
  faShapes,
  faSave,
  faUndo,
  faRedo,
  faUpload,
  faCamera,
  faMagic,
  faLayerGroup,
  faTextHeight,
  faBorderStyle,
  faFillDrip,
  faEyeSlash,
  faCheck,
  faSpinner,
  faFilePdf,
  faBars,
  faCog as faSettings
} from "@fortawesome/free-solid-svg-icons";
import { 
  collection, 
  collectionGroup, 
  getDocs, 
  query, 
  where,
  addDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const IDCardGenerator = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedStudentForPreview, setSelectedStudentForPreview] = useState(null);
  const [customizationMode, setCustomizationMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [generatingCards, setGeneratingCards] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [selectedSavedTemplate, setSelectedSavedTemplate] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customization, setCustomization] = useState({
    // Basic Settings
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#1e40af',
    borderWidth: 3,
    borderRadius: 8,
    fontSize: 14,
    headerFontSize: 18,
    cardWidth: 400,
    cardHeight: 250,
    
    // Advanced Settings
    logoUrl: '',
    institutionName: 'UNIVERSITY STUDENT IDENTITY CARD',
    institutionLogo: '',
    showQRCode: true,
    showBarcode: false,
    showPhoto: true,
    showWatermark: false,
    watermarkText: 'STUDENT ID',
    watermarkOpacity: 0.1,
    
    // Layout Settings
    photoSize: 100,
    photoPosition: 'left', // left, right, center
    qrCodeSize: 80,
    qrCodePosition: 'bottom-right', // top-right, bottom-right, bottom-left
    
    // Typography
    fontFamily: 'Arial',
    fontWeight: 'normal',
    lineHeight: 1.2,
    letterSpacing: 0.5,
    
    // Effects
    shadow: true,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowBlur: 10,
    gradient: false,
    gradientType: 'linear', // linear, radial
    
    // Fields to include
    includeFields: {
      name: true,
      rollNo: true,
      department: true,
      year: true,
      section: true,
      email: true,
      mobile: true,
      address: true,
      bloodGroup: true,
      emergencyContact: true,
      dateOfBirth: true,
      gender: true,
      fatherName: true,
      motherName: true
    },
    
    // Field Labels
    fieldLabels: {
      name: 'Full Name',
      rollNo: 'Roll Number',
      department: 'Department',
      year: 'Year',
      section: 'Section',
      email: 'Email',
      mobile: 'Mobile',
      address: 'Address',
      bloodGroup: 'Blood Group',
      emergencyContact: 'Emergency Contact',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      fatherName: "Father's Name",
      motherName: "Mother's Name"
    }
  });

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    loadSavedTemplates();
    loadCustomization();
  }, []);

  const loadSavedTemplates = async () => {
    try {
      const templatesRef = collection(db, "idCardTemplates");
      const templatesSnapshot = await getDocs(templatesRef);
      const templates = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedTemplates(templates);
    } catch (error) {
      console.error("Error loading saved templates:", error);
    }
  };

  const saveTemplateToFirebase = async (templateName) => {
    try {
      const templateData = {
        name: templateName,
        customization: customization,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await addDoc(collection(db, "idCardTemplates"), templateData);
      await loadSavedTemplates();
      alert('Template saved successfully!');
    } catch (error) {
      console.error("Error saving template:", error);
      alert('Error saving template');
    }
  };

  const loadTemplateFromFirebase = async (templateId) => {
    try {
      const template = savedTemplates.find(t => t.id === templateId);
      if (template) {
        setCustomization(template.customization);
        setSelectedSavedTemplate(template);
      }
    } catch (error) {
      console.error("Error loading template:", error);
    }
  };

  const deleteTemplateFromFirebase = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteDoc(doc(db, "idCardTemplates", templateId));
        await loadSavedTemplates();
        alert('Template deleted successfully!');
      } catch (error) {
        console.error("Error deleting template:", error);
        alert('Error deleting template');
      }
    }
  };

  const uploadLogo = async (file) => {
    try {
      const storageRef = ref(storage, `id-card-logos/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setCustomization(prev => ({ ...prev, logoUrl: downloadURL }));
      return downloadURL;
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert('Error uploading logo');
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadLogo(file);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collectionGroup(db, "students"));
      const fetchedStudents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(fetchedStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo?.toString().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesYear = !filterYear || student.Year === filterYear;
    const matchesSection = !filterSection || student.Section === filterSection;
    const matchesDepartment = !filterDepartment || student.department === filterDepartment;

    return matchesSearch && matchesYear && matchesSection && matchesDepartment;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const generateQRCode = async (studentData) => {
    try {
      const qrData = JSON.stringify({
        id: studentData.id,
        name: studentData.name,
        rollNo: studentData.rollNo,
        department: studentData.department,
        year: studentData.Year,
        section: studentData.Section
      });
      return await QRCode.toDataURL(qrData, { width: 80, margin: 1 });
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const generateIDCard = async (student) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = customization.cardWidth;
    canvas.height = customization.cardHeight;

    // Background
    ctx.fillStyle = customization.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    if (customization.borderWidth > 0) {
      ctx.strokeStyle = customization.borderColor;
      ctx.lineWidth = customization.borderWidth;
      ctx.strokeRect(
        customization.borderWidth/2, 
        customization.borderWidth/2, 
        canvas.width - customization.borderWidth, 
        canvas.height - customization.borderWidth
      );
    }

    // Apply template-specific styling
    switch (selectedTemplate) {
      case 'modern':
        await drawModernTemplate(ctx, student, canvas);
        break;
      case 'classic':
        await drawClassicTemplate(ctx, student, canvas);
        break;
      case 'minimal':
        await drawMinimalTemplate(ctx, student, canvas);
        break;
      case 'corporate':
        await drawCorporateTemplate(ctx, student, canvas);
        break;
      case 'elegant':
        await drawElegantTemplate(ctx, student, canvas);
        break;
      case 'sporty':
        await drawSportyTemplate(ctx, student, canvas);
        break;
      default:
        await drawModernTemplate(ctx, student, canvas);
    }

    return canvas.toDataURL();
  };

  const drawModernTemplate = async (ctx, student, canvas) => {
    const { width, height } = canvas;
    
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, customization.primaryColor);
    gradient.addColorStop(1, customization.secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 60);

    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${customization.headerFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(customization.institutionName, width/2, 35);

    // Student photo placeholder
    if (customization.showPhoto) {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(20, 80, 100, 120);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO', 70, 140);
    }

    // Student Information
    let yPos = 80;
    ctx.fillStyle = customization.textColor;
    ctx.textAlign = 'left';

    if (customization.includeFields.name) {
      ctx.font = `bold ${customization.fontSize}px Arial`;
      ctx.fillText('Name:', 140, yPos);
      ctx.font = `${customization.fontSize}px Arial`;
      ctx.fillText(student.name || 'N/A', 200, yPos);
      yPos += 25;
    }

    if (customization.includeFields.rollNo) {
      ctx.font = `bold ${customization.fontSize}px Arial`;
      ctx.fillText('Roll No:', 140, yPos);
      ctx.font = `${customization.fontSize}px Arial`;
      ctx.fillText(student.rollNo || 'N/A', 200, yPos);
      yPos += 25;
    }

    if (customization.includeFields.department) {
      ctx.font = `bold ${customization.fontSize}px Arial`;
      ctx.fillText('Department:', 140, yPos);
      ctx.font = `${customization.fontSize}px Arial`;
      ctx.fillText(student.department || 'N/A', 200, yPos);
      yPos += 25;
    }

    if (customization.includeFields.year) {
      ctx.font = `bold ${customization.fontSize}px Arial`;
      ctx.fillText('Year:', 140, yPos);
      ctx.font = `${customization.fontSize}px Arial`;
      ctx.fillText(student.Year || 'N/A', 200, yPos);
      yPos += 25;
    }

    if (customization.includeFields.section) {
      ctx.font = `bold ${customization.fontSize}px Arial`;
      ctx.fillText('Section:', 140, yPos);
      ctx.font = `${customization.fontSize}px Arial`;
      ctx.fillText(student.Section || 'N/A', 200, yPos);
      yPos += 25;
    }

    if (customization.includeFields.email) {
      ctx.font = `bold ${customization.fontSize}px Arial`;
      ctx.fillText('Email:', 140, yPos);
      ctx.font = `${customization.fontSize}px Arial`;
      ctx.fillText(student.email || 'N/A', 200, yPos);
      yPos += 25;
    }

    // QR Code
    if (customization.showQRCode) {
      const qrCodeDataURL = await generateQRCode(student);
      if (qrCodeDataURL) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataURL;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, width - 100, 80, 80, 80);
            resolve();
          };
        });
      }
    }

    // Footer
    ctx.fillStyle = customization.primaryColor;
    ctx.fillRect(0, height - 40, width, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Valid for Academic Year 2024-25', width/2, height - 15);
  };

  const drawClassicTemplate = async (ctx, student, canvas) => {
    const { width, height } = canvas;
    
    // Classic header with border
    ctx.fillStyle = customization.primaryColor;
    ctx.fillRect(0, 0, width, 50);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${customization.headerFontSize}px Times New Roman`;
    ctx.textAlign = 'center';
    ctx.fillText(customization.institutionName, width/2, 30);

    // Student photo
    if (customization.showPhoto) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 70, 90, 110);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(20, 70, 90, 110);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Times New Roman';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO', 65, 125);
    }

    // Information in classic style
    let yPos = 80;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';

    const fields = [
      { label: 'Name', value: student.name },
      { label: 'Roll No', value: student.rollNo },
      { label: 'Department', value: student.department },
      { label: 'Year', value: student.Year },
      { label: 'Section', value: student.Section },
      { label: 'Email', value: student.email }
    ];

    fields.forEach(field => {
      if (customization.includeFields[field.label.toLowerCase().replace(' ', '')]) {
        ctx.font = `bold ${customization.fontSize}px Times New Roman`;
        ctx.fillText(`${field.label}:`, 130, yPos);
        ctx.font = `${customization.fontSize}px Times New Roman`;
        ctx.fillText(field.value || 'N/A', 220, yPos);
        yPos += 22;
      }
    });

    // QR Code
    if (customization.showQRCode) {
      const qrCodeDataURL = await generateQRCode(student);
      if (qrCodeDataURL) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataURL;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, width - 90, 70, 70, 70);
            resolve();
          };
        });
      }
    }

    // Classic footer
    ctx.fillStyle = customization.primaryColor;
    ctx.fillRect(0, height - 35, width, 35);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Times New Roman';
    ctx.textAlign = 'center';
    ctx.fillText('This card is valid for the academic year 2024-25', width/2, height - 12);
  };

  const drawMinimalTemplate = async (ctx, student, canvas) => {
    const { width, height } = canvas;
    
    // Minimal design with subtle colors
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Simple header line
    ctx.strokeStyle = customization.primaryColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(width, 40);
    ctx.stroke();

    // Institution name
    ctx.fillStyle = customization.primaryColor;
    ctx.font = `bold ${customization.headerFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(customization.institutionName, width/2, 25);

    // Student photo (minimal style)
    if (customization.showPhoto) {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(30, 60, 80, 100);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 60, 80, 100);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO', 70, 110);
    }

    // Information in minimal style
    let yPos = 70;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'left';

    const fields = [
      { label: 'Name', value: student.name },
      { label: 'Roll No', value: student.rollNo },
      { label: 'Department', value: student.department },
      { label: 'Year', value: student.Year },
      { label: 'Section', value: student.Section },
      { label: 'Email', value: student.email }
    ];

    fields.forEach(field => {
      if (customization.includeFields[field.label.toLowerCase().replace(' ', '')]) {
        ctx.font = `600 ${customization.fontSize}px Arial`;
        ctx.fillText(field.label, 140, yPos);
        ctx.font = `${customization.fontSize}px Arial`;
        ctx.fillText(field.value || 'N/A', 200, yPos);
        yPos += 24;
      }
    });

    // QR Code (minimal style)
    if (customization.showQRCode) {
      const qrCodeDataURL = await generateQRCode(student);
      if (qrCodeDataURL) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataURL;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, width - 85, 60, 75, 75);
            resolve();
          };
        });
      }
    }

    // Minimal footer
    ctx.fillStyle = '#64748b';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Valid 2024-25', width/2, height - 15);
  };

  const drawCorporateTemplate = async (ctx, student, canvas) => {
    const { width, height } = canvas;
    
    // Corporate gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(0.3, '#334155');
    gradient.addColorStop(1, '#475569');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Corporate header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, 45);
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${customization.headerFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(customization.institutionName, width/2, 28);

    // Main content area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 55, width - 20, height - 75);

    // Student photo with border
    if (customization.showPhoto) {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(25, 75, 90, 110);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 75, 90, 110);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO', 70, 130);
    }

    // Information in corporate style
    let yPos = 85;
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'left';

    const fields = [
      { label: 'Name', value: student.name },
      { label: 'Roll No', value: student.rollNo },
      { label: 'Department', value: student.department },
      { label: 'Year', value: student.Year },
      { label: 'Section', value: student.Section },
      { label: 'Email', value: student.email }
    ];

    fields.forEach(field => {
      if (customization.includeFields[field.label.toLowerCase().replace(' ', '')]) {
        ctx.font = `bold ${customization.fontSize}px Arial`;
        ctx.fillText(field.label, 140, yPos);
        ctx.font = `${customization.fontSize}px Arial`;
        ctx.fillText(field.value || 'N/A', 220, yPos);
        yPos += 26;
      }
    });

    // QR Code
    if (customization.showQRCode) {
      const qrCodeDataURL = await generateQRCode(student);
      if (qrCodeDataURL) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataURL;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, width - 95, 75, 80, 80);
            resolve();
          };
        });
      }
    }

    // Corporate footer
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, height - 35, width - 20, 25);
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Academic Year 2024-25', width/2, height - 18);
  };

  const drawElegantTemplate = async (ctx, student, canvas) => {
    const { width, height } = canvas;
    
    // Elegant background with subtle pattern
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, width, height);
    
    // Elegant header with gold accent
    const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
    headerGradient.addColorStop(0, '#2c3e50');
    headerGradient.addColorStop(1, '#34495e');
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, 50);
    
    // Gold accent line
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, 50, width, 3);

    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${customization.headerFontSize}px Georgia`;
    ctx.textAlign = 'center';
    ctx.fillText(customization.institutionName, width/2, 30);

    // Student photo with elegant border
    if (customization.showPhoto) {
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(25, 70, 90, 110);
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 70, 90, 110);
      ctx.fillStyle = '#95a5a6';
      ctx.font = '12px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO', 70, 125);
    }

    // Information in elegant style
    let yPos = 80;
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'left';

    const fields = [
      { label: 'Name', value: student.name },
      { label: 'Roll No', value: student.rollNo },
      { label: 'Department', value: student.department },
      { label: 'Year', value: student.Year },
      { label: 'Section', value: student.Section },
      { label: 'Email', value: student.email }
    ];

    fields.forEach(field => {
      if (customization.includeFields[field.label.toLowerCase().replace(' ', '')]) {
        ctx.font = `bold ${customization.fontSize}px Georgia`;
        ctx.fillText(field.label, 140, yPos);
        ctx.font = `${customization.fontSize}px Georgia`;
        ctx.fillText(field.value || 'N/A', 220, yPos);
        yPos += 24;
      }
    });

    // QR Code
    if (customization.showQRCode) {
      const qrCodeDataURL = await generateQRCode(student);
      if (qrCodeDataURL) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataURL;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, width - 90, 70, 75, 75);
            resolve();
          };
        });
      }
    }

    // Elegant footer
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, height - 30, width, 30);
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(0, height - 30, width, 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('Valid for Academic Year 2024-25', width/2, height - 12);
  };

  const drawSportyTemplate = async (ctx, student, canvas) => {
    const { width, height } = canvas;
    
    // Sporty background with dynamic gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e74c3c');
    gradient.addColorStop(0.5, '#f39c12');
    gradient.addColorStop(1, '#e67e22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Sporty header
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, width, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${customization.headerFontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(customization.institutionName, width/2, 25);

    // Main content area with rounded corners
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 50, width - 20, height - 60);

    // Student photo with sporty border
    if (customization.showPhoto) {
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(20, 70, 80, 100);
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 3;
      ctx.strokeRect(20, 70, 80, 100);
      ctx.fillStyle = '#95a5a6';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO', 60, 120);
    }

    // Information in sporty style
    let yPos = 80;
    ctx.fillStyle = '#2c3e50';
    ctx.textAlign = 'left';

    const fields = [
      { label: 'Name', value: student.name },
      { label: 'Roll No', value: student.rollNo },
      { label: 'Department', value: student.department },
      { label: 'Year', value: student.Year },
      { label: 'Section', value: student.Section },
      { label: 'Email', value: student.email }
    ];

    fields.forEach(field => {
      if (customization.includeFields[field.label.toLowerCase().replace(' ', '')]) {
        ctx.font = `bold ${customization.fontSize}px Arial`;
        ctx.fillText(field.label, 120, yPos);
        ctx.font = `${customization.fontSize}px Arial`;
        ctx.fillText(field.value || 'N/A', 200, yPos);
        yPos += 22;
      }
    });

    // QR Code
    if (customization.showQRCode) {
      const qrCodeDataURL = await generateQRCode(student);
      if (qrCodeDataURL) {
        const qrImage = new Image();
        qrImage.src = qrCodeDataURL;
        await new Promise((resolve) => {
          qrImage.onload = () => {
            ctx.drawImage(qrImage, width - 85, 70, 70, 70);
            resolve();
          };
        });
      }
    }

    // Sporty footer
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(10, height - 25, width - 20, 15);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('STUDENT ID CARD 2024-25', width/2, height - 10);
  };

  const downloadIDCard = async (student) => {
    const dataURL = await generateIDCard(student);
    const link = document.createElement('a');
    link.download = `ID_Card_${student.rollNo || student.name}.png`;
    link.href = dataURL;
    link.click();
  };

  const downloadMultipleIDCards = async () => {
    setGeneratingCards(true);
    try {
      for (let i = 0; i < selectedStudents.length; i++) {
        const studentId = selectedStudents[i];
        const student = students.find(s => s.id === studentId);
        if (student) {
          setTimeout(() => downloadIDCard(student), i * 300);
        }
      }
    } finally {
      setGeneratingCards(false);
    }
  };

  const generatePDF = async (students) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const cardsPerPage = 2;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const cardWidth = 80;
    const cardHeight = 50;
    const margin = 20;
    const spacing = 10;

    for (let i = 0; i < students.length; i += cardsPerPage) {
      if (i > 0) pdf.addPage();
      
      for (let j = 0; j < cardsPerPage && i + j < students.length; j++) {
        const student = students[i + j];
        const dataURL = await generateIDCard(student);
        
        const x = margin + (j % 2) * (cardWidth + spacing);
        const y = margin + Math.floor(j / 2) * (cardHeight + spacing);
        
        pdf.addImage(dataURL, 'PNG', x, y, cardWidth, cardHeight);
      }
    }
    
    pdf.save('student_id_cards.pdf');
  };

  const downloadSelectedAsPDF = async () => {
    setGeneratingCards(true);
    try {
      const selectedStudentData = students.filter(s => selectedStudents.includes(s.id));
      await generatePDF(selectedStudentData);
    } finally {
      setGeneratingCards(false);
    }
  };

  const printIDCard = async (student) => {
    const dataURL = await generateIDCard(student);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>ID Card - ${student.name}</title>
          <style>
            body { margin: 0; padding: 20px; background: #f5f5f5; }
            .card-container { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
            }
            img { 
              max-width: 100%; 
              height: auto; 
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
            }
            @media print {
              body { background: white; }
              .card-container { min-height: auto; }
            }
          </style>
        </head>
        <body>
          <div class="card-container">
            <img src="${dataURL}" alt="Student ID Card" />
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const previewIDCard = async (student) => {
    setSelectedStudentForPreview(student);
    setPreviewMode(true);
  };

  const saveCustomization = () => {
    localStorage.setItem('idCardCustomization', JSON.stringify(customization));
    alert('Customization settings saved!');
  };

  const loadCustomization = () => {
    const saved = localStorage.getItem('idCardCustomization');
    if (saved) {
      setCustomization(JSON.parse(saved));
    }
  };

  const resetCustomization = () => {
    setCustomization({
      primaryColor: '#1e40af',
      secondaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#1e40af',
      borderWidth: 3,
      borderRadius: 8,
      fontSize: 14,
      headerFontSize: 18,
      logoUrl: '',
      institutionName: 'UNIVERSITY STUDENT IDENTITY CARD',
      showQRCode: true,
      showBarcode: false,
      showPhoto: true,
      cardWidth: 400,
      cardHeight: 250,
      includeFields: {
        name: true,
        rollNo: true,
        department: true,
        year: true,
        section: true,
        email: true,
        mobile: true,
        address: true,
        bloodGroup: true,
        emergencyContact: true
      }
    });
  };

  useEffect(() => {
    loadCustomization();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Enhanced ID Card Generator</h2>
          <p className="text-gray-600">Generate and customize student identity cards with advanced templates and options</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => setCustomizationMode(!customizationMode)}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faPalette} />
            <span>Advanced Customize</span>
          </button>
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FontAwesomeIcon icon={faSettings} />
            <span>More Options</span>
          </button>
          <button
            onClick={downloadMultipleIDCards}
            disabled={selectedStudents.length === 0 || generatingCards}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              selectedStudents.length > 0 && !generatingCards
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {generatingCards ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faDownload} />
            )}
            <span>
              {generatingCards ? 'Generating...' : `Download Selected (${selectedStudents.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Advanced Options Panel */}
      {showAdvancedOptions && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Advanced Options</h3>
            <button
              onClick={() => setShowAdvancedOptions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={downloadSelectedAsPDF}
              disabled={selectedStudents.length === 0 || generatingCards}
              className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                selectedStudents.length > 0 && !generatingCards
                  ? 'border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-300 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faFilePdf} className="text-2xl mb-2 text-blue-600" />
                <div className="font-medium">Download as PDF</div>
                <div className="text-sm text-gray-600">Generate PDF with multiple cards</div>
              </div>
            </button>
            <button
              onClick={() => {
                const templateName = prompt('Enter template name:');
                if (templateName) saveTemplateToFirebase(templateName);
              }}
              className="p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-400 bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faSave} className="text-2xl mb-2 text-green-600" />
                <div className="font-medium">Save Template</div>
                <div className="text-sm text-gray-600">Save current settings as template</div>
              </div>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-400 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="text-center">
                <FontAwesomeIcon icon={faUpload} className="text-2xl mb-2 text-purple-600" />
                <div className="font-medium">Upload Logo</div>
                <div className="text-sm text-gray-600">Add custom logo to cards</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Customization Panel */}
      {customizationMode && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Customization Options</h3>
            <div className="flex space-x-2">
              <button
                onClick={saveCustomization}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" />
                Save
              </button>
              <button
                onClick={resetCustomization}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <FontAwesomeIcon icon={faUndo} className="mr-1" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template Style</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="modern">Modern</option>
                <option value="classic">Classic</option>
                <option value="minimal">Minimal</option>
                <option value="corporate">Corporate</option>
                <option value="elegant">Elegant</option>
                <option value="sporty">Sporty</option>
              </select>
            </div>

            {/* Saved Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Saved Templates</label>
              <select
                value={selectedSavedTemplate?.id || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    loadTemplateFromFirebase(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a saved template</option>
                {savedTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Institution Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
              <input
                type="text"
                value={customization.institutionName}
                onChange={(e) => setCustomization(prev => ({ ...prev, institutionName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter institution name"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <input
                type="color"
                value={customization.primaryColor}
                onChange={(e) => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <input
                type="color"
                value={customization.secondaryColor}
                onChange={(e) => setCustomization(prev => ({ ...prev, secondaryColor: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <input
                type="color"
                value={customization.backgroundColor}
                onChange={(e) => setCustomization(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <input
                type="color"
                value={customization.textColor}
                onChange={(e) => setCustomization(prev => ({ ...prev, textColor: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
              <input
                type="color"
                value={customization.borderColor}
                onChange={(e) => setCustomization(prev => ({ ...prev, borderColor: e.target.value }))}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            {/* Font Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <input
                type="range"
                min="10"
                max="20"
                value={customization.fontSize}
                onChange={(e) => setCustomization(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{customization.fontSize}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Header Font Size</label>
              <input
                type="range"
                min="14"
                max="24"
                value={customization.headerFontSize}
                onChange={(e) => setCustomization(prev => ({ ...prev, headerFontSize: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{customization.headerFontSize}px</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Width</label>
              <input
                type="range"
                min="0"
                max="8"
                value={customization.borderWidth}
                onChange={(e) => setCustomization(prev => ({ ...prev, borderWidth: parseInt(e.target.value) }))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{customization.borderWidth}px</span>
            </div>

            {/* Institution Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
              <input
                type="text"
                value={customization.institutionName}
                onChange={(e) => setCustomization(prev => ({ ...prev, institutionName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter institution name"
              />
            </div>

            {/* Toggle Options */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-3">Display Options</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customization.showQRCode}
                    onChange={(e) => setCustomization(prev => ({ ...prev, showQRCode: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">QR Code</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customization.showPhoto}
                    onChange={(e) => setCustomization(prev => ({ ...prev, showPhoto: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Photo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customization.showBarcode}
                    onChange={(e) => setCustomization(prev => ({ ...prev, showBarcode: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Barcode</span>
                </label>
              </div>
            </div>

            {/* Field Selection */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-3">Include Fields</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(customization.includeFields).map(([field, checked]) => (
                  <label key={field} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setCustomization(prev => ({
                        ...prev,
                        includeFields: {
                          ...prev.includeFields,
                          [field]: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, roll no, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              <option value="I">1st Year</option>
              <option value="II">2nd Year</option>
              <option value="III">3rd Year</option>
              <option value="IV">4th Year</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Roll No</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Year & Section</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span>Loading students...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{student.rollNo}</td>
                    <td className="py-4 px-6 text-gray-600">{student.department}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.Year} Year
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {student.Section}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => previewIDCard(student)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Preview ID Card"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button
                          onClick={() => downloadIDCard(student)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                          title="Download ID Card"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                        <button
                          onClick={() => printIDCard(student)}
                          className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Print ID Card"
                        >
                          <FontAwesomeIcon icon={faPrint} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewMode && selectedStudentForPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">ID Card Preview</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={generateIDCard(selectedStudentForPreview)}
                    alt="Student ID Card"
                    className="border border-gray-300 rounded-lg shadow-lg"
                  />
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => downloadIDCard(selectedStudentForPreview)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => printIDCard(selectedStudentForPreview)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faPrint} />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input for logo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="hidden"
      />
    </div>
  );
};

export default IDCardGenerator;
