import React, { useState, useEffect, useRef } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faIdCard,
  faDownload,
  faPrint,
  faEye,
  faSearch,
  faFilter,
  faQrcode,
  faTimes,
  faPalette,
  faSave,
  faUndo,
  faUpload,
  faSpinner
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

const EnhancedIDCardGenerator = () => {
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
  
  const [customization, setCustomization] = useState({
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
    logoUrl: '',
    institutionName: 'UNIVERSITY STUDENT IDENTITY CARD',
    showQRCode: true,
    showBarcode: false,
    showPhoto: true,
    showWatermark: false,
    watermarkText: 'STUDENT ID',
    watermarkOpacity: 0.1,
    photoSize: 100,
    qrCodeSize: 80,
    fontFamily: 'Arial',
    shadow: true,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowBlur: 10,
    gradient: false,
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

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    loadSavedTemplates();
    loadCustomization();
  }, []);

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
        section: studentData.Section,
        email: studentData.email
      });
      return await QRCode.toDataURL(qrData, { 
        width: customization.qrCodeSize, 
        margin: 1,
        color: {
          dark: customization.textColor,
          light: customization.backgroundColor
        }
      });
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
    if (customization.gradient) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, customization.primaryColor);
      gradient.addColorStop(1, customization.secondaryColor);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = customization.backgroundColor;
    }
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

    // Shadow
    if (customization.shadow) {
      ctx.shadowColor = customization.shadowColor;
      ctx.shadowBlur = customization.shadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    // Watermark
    if (customization.showWatermark) {
      ctx.save();
      ctx.globalAlpha = customization.watermarkOpacity;
      ctx.font = `bold 48px ${customization.fontFamily}`;
      ctx.fillStyle = customization.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(-Math.PI/6);
      ctx.fillText(customization.watermarkText, 0, 0);
      ctx.restore();
    }

    // Draw template
    await drawTemplate(ctx, student, canvas);

    return canvas.toDataURL();
  };

  const drawTemplate = async (ctx, student, canvas) => {
    const { width, height } = canvas;
    
    // Header
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, customization.primaryColor);
    gradient.addColorStop(1, customization.secondaryColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 60);

    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${customization.headerFontSize}px ${customization.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(customization.institutionName, width/2, 35);

    // Student photo placeholder
    if (customization.showPhoto) {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(20, 80, customization.photoSize, customization.photoSize + 20);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PHOTO', 20 + customization.photoSize/2, 80 + (customization.photoSize + 20)/2);
    }

    // Student Information
    let yPos = 80;
    ctx.fillStyle = customization.textColor;
    ctx.textAlign = 'left';

    const fields = [
      { key: 'name', label: 'Name' },
      { key: 'rollNo', label: 'Roll No' },
      { key: 'department', label: 'Department' },
      { key: 'year', label: 'Year' },
      { key: 'section', label: 'Section' },
      { key: 'email', label: 'Email' }
    ];

    fields.forEach(field => {
      if (customization.includeFields[field.key]) {
        ctx.font = `bold ${customization.fontSize}px ${customization.fontFamily}`;
        ctx.fillText(`${field.label}:`, 140, yPos);
        ctx.font = `${customization.fontSize}px ${customization.fontFamily}`;
        ctx.fillText(student[field.key] || 'N/A', 220, yPos);
        yPos += 25;
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
    localStorage.setItem('enhancedIdCardCustomization', JSON.stringify(customization));
    alert('Customization settings saved!');
  };

  const loadCustomization = () => {
    const saved = localStorage.getItem('enhancedIdCardCustomization');
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
      cardWidth: 400,
      cardHeight: 250,
      logoUrl: '',
      institutionName: 'UNIVERSITY STUDENT IDENTITY CARD',
      showQRCode: true,
      showBarcode: false,
      showPhoto: true,
      showWatermark: false,
      watermarkText: 'STUDENT ID',
      watermarkOpacity: 0.1,
      photoSize: 100,
      qrCodeSize: 80,
      fontFamily: 'Arial',
      shadow: true,
      shadowColor: 'rgba(0,0,0,0.1)',
      shadowBlur: 10,
      gradient: false,
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

      {/* Customization Panel */}
      {customizationMode && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Advanced Customization Options</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const templateName = prompt('Enter template name:');
                  if (templateName) saveTemplateToFirebase(templateName);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" />
                Save Template
              </button>
              <button
                onClick={saveCustomization}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" />
                Save Settings
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

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faUpload} />
                <span>Choose Logo</span>
              </button>
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
                    checked={customization.showWatermark}
                    onChange={(e) => setCustomization(prev => ({ ...prev, showWatermark: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Watermark</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={customization.gradient}
                    onChange={(e) => setCustomization(prev => ({ ...prev, gradient: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Gradient</span>
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

export default EnhancedIDCardGenerator;
