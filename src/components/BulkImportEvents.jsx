import React, { useState } from "react";
import studentApiService from '../services/studentApiService';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  writeBatch 
} from "firebase/firestore";
import * as XLSX from "xlsx";

const BulkImportEvents = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState([]);
  const [step, setStep] = useState(1);
  const [showManualMapping, setShowManualMapping] = useState(false);
  
  // Field mapping based on your Excel structure
  const availableFields = [
    { name: "sNo", label: "S.No", type: "number", required: false },
    { name: "title", label: "Title", type: "text", required: false },
    { name: "resourcePersonName", label: "Resource Person Name", type: "text", required: false },
    { name: "coordinators", label: "Coordinators", type: "text", required: false },
    { name: "date", label: "Date", type: "date", required: false },
    { name: "academicYear", label: "Academic Year", type: "text", required: false },
    { name: "type", label: "Type", type: "text", required: false },
    { name: "totalParticipants", label: "Total No. of Participants", type: "number", required: false },
    { name: "yearOfStudents", label: "Year of Students", type: "text", required: false }
  ];

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      alert('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    if (uploadedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFile(uploadedFile);
    processFile(uploadedFile);
  };

  const processFile = (uploadedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        
        // Enhanced Excel reading with better options for formatted files
        const workbook = XLSX.read(data, { 
          type: 'array', 
          cellDates: true, 
          cellNF: false, 
          cellText: false,
          cellStyles: false,
          cellFormula: false,
          cellHTML: false,
          cellFormat: false,
          cellValue: true,
          cellError: false,
          cellHidden: false,
          cellProtection: false,
          cellComment: false,
          cellRichText: false,
          cellMerge: false,
          cellHyperlink: false,
          cellDataValidation: false,
          cellConditionalFormatting: false,
          cellDataValidationList: false,
          cellDataValidationCustom: false,
          cellDataValidationDate: false,
          cellDataValidationTime: false,
          cellDataValidationTextLength: false,
          cellDataValidationWhole: false,
          cellDataValidationDecimal: false
        });
        
        console.log('Available sheets:', workbook.SheetNames);
        
        // Process first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        console.log('Processing sheet:', sheetName);
        console.log('Sheet range:', worksheet['!ref']);
        
        // Find the actual data range - look for the first non-empty row
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        let headerRowIndex = 0;
        
        // Scan through the first 10 rows to find the header row
        for (let row = 0; row < Math.min(10, range.e.r + 1); row++) {
          const rowData = [];
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[cellAddress];
            if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
              rowData.push(cell.v);
            } else {
              rowData.push('');
            }
          }
          
          // Check if this row has meaningful headers
          const hasHeaders = rowData.some(cell => {
            const cellStr = cell.toString().toLowerCase();
            return cellStr.includes('s.no') || cellStr.includes('title') || 
                   cellStr.includes('resource') || cellStr.includes('coordinator') ||
                   cellStr.includes('date') || cellStr.includes('academic') ||
                   cellStr.includes('type') || cellStr.includes('participant') ||
                   cellStr.includes('year');
          });
          
          if (hasHeaders) {
            headerRowIndex = row;
            console.log(`Found headers at row ${row + 1}:`, rowData);
            break;
          }
        }
        
        console.log(`Using header row index: ${headerRowIndex}`);
        
        // Create a new range starting from the header row
        const newRange = {
          s: { r: headerRowIndex, c: range.s.c },
          e: range.e
        };
        
        console.log('New range:', XLSX.utils.encode_range(newRange));
        
        // Enhanced JSON conversion with the correct range
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          raw: false,
          dateNF: 'dd.mm.yyyy',
          defval: '',
          blankrows: false,
          range: XLSX.utils.encode_range(newRange)
        });

        console.log('Raw JSON data length:', jsonData.length);
        console.log('First few rows:', jsonData.slice(0, 3));

        if (jsonData.length < 2) {
          alert('No data found in the Excel file. Please check if the file contains data in the first sheet.');
          return;
        }

        // Get headers from the first row of the parsed data
        const headers = jsonData[0];
        
        if (!headers || headers.length === 0) {
          alert('No headers found in the Excel file. Please ensure the first row contains column headers.');
          return;
        }

        // Clean and normalize headers
        const cleanHeaders = headers.map(header => {
          if (!header) return '';
          const cleanHeader = header.toString().trim();
          console.log(`Header: "${header}" -> "${cleanHeader}"`);
          return cleanHeader;
        });

        // Get data rows (skip the header row)
        const rows = jsonData.slice(1).filter(row => {
          if (!row) return false;
          return row.some(cell => cell !== null && cell !== '' && cell !== undefined);
        });

        console.log('Filtered rows count:', rows.length);
        console.log('Sample rows:', rows.slice(0, 2));
        
        // Debug: Show all rows for validation
        console.log('=== ALL ROWS FOR VALIDATION ===');
        rows.forEach((row, index) => {
          console.log(`Row ${index + 1}:`, row);
        });
        console.log('=== END ALL ROWS ===');

        if (rows.length === 0) {
          alert('No valid data rows found in the Excel file. Please check if there is data below the headers.');
          return;
        }

        if (rows.length > 1000) {
          alert('Maximum 1000 rows allowed per import. Please split your file into smaller chunks.');
          return;
        }

        setHeaders(cleanHeaders);
        setData(rows);
        
        // Enhanced auto-mapping with exact and flexible pattern matching
        const autoMapping = {};
        cleanHeaders.forEach((header, index) => {
          if (!header) return;
          
          const cleanHeader = header.toString().toLowerCase().trim();
          console.log(`Processing header: "${header}" -> "${cleanHeader}"`);
          
          // Exact matches first (most reliable)
          if (cleanHeader === 's.no' || cleanHeader === 'sno' || cleanHeader === 'serial no' || cleanHeader === 'sl.no') {
            autoMapping.sNo = index;
            console.log(`Exact match: S.No to column ${index}`);
          } else if (cleanHeader === 'title') {
            autoMapping.title = index;
            console.log(`Exact match: Title to column ${index}`);
          } else if (cleanHeader === 'resource person name') {
            autoMapping.resourcePersonName = index;
            console.log(`Exact match: Resource Person Name to column ${index}`);
          } else if (cleanHeader === 'coordinators') {
            autoMapping.coordinators = index;
            console.log(`Exact match: Coordinators to column ${index}`);
          } else if (cleanHeader === 'date') {
            autoMapping.date = index;
            console.log(`Exact match: Date to column ${index}`);
          } else if (cleanHeader === 'academic year') {
            autoMapping.academicYear = index;
            console.log(`Exact match: Academic Year to column ${index}`);
          } else if (cleanHeader === 'type') {
            autoMapping.type = index;
            console.log(`Exact match: Type to column ${index}`);
          } else if (cleanHeader === 'total no. of participants') {
            autoMapping.totalParticipants = index;
            console.log(`Exact match: Total No. of Participants to column ${index}`);
          } else if (cleanHeader === 'year of students') {
            autoMapping.yearOfStudents = index;
            console.log(`Exact match: Year of Students to column ${index}`);
          }
          // Flexible pattern matching as fallback
          else if (cleanHeader.includes('s.no') || cleanHeader.includes('sno') || cleanHeader.includes('serial') || 
                   cleanHeader.includes('sl.no') || cleanHeader.includes('sl no') || cleanHeader.includes('s.i.') || 
                   cleanHeader.includes('s.i') || cleanHeader.includes('sl') || cleanHeader.includes('no.') ||
                   cleanHeader.includes('index') || cleanHeader.includes('sr no') || cleanHeader.includes('sr. no')) {
            autoMapping.sNo = index;
            console.log(`Pattern match: S.No to column ${index}`);
          } else if (cleanHeader.includes('title') || cleanHeader.includes('event title') || cleanHeader.includes('event name') ||
                     cleanHeader.includes('event') || cleanHeader.includes('name') || cleanHeader.includes('topic') ||
                     cleanHeader.includes('subject') || cleanHeader.includes('description')) {
            autoMapping.title = index;
            console.log(`Pattern match: Title to column ${index}`);
          } else if (cleanHeader.includes('resource person') || cleanHeader.includes('resourceperson') || 
                     cleanHeader.includes('speaker') || cleanHeader.includes('resource') || cleanHeader.includes('faculty') ||
                     cleanHeader.includes('instructor') || cleanHeader.includes('presenter') || cleanHeader.includes('trainer') ||
                     cleanHeader.includes('expert') || cleanHeader.includes('lecturer')) {
            autoMapping.resourcePersonName = index;
            console.log(`Pattern match: Resource Person Name to column ${index}`);
          } else if (cleanHeader.includes('coordinators') || cleanHeader.includes('coordinator') || 
                     cleanHeader.includes('organizer') || cleanHeader.includes('organizers') ||
                     cleanHeader.includes('contact') || cleanHeader.includes('responsible')) {
            autoMapping.coordinators = index;
            console.log(`Pattern match: Coordinators to column ${index}`);
          } else if (cleanHeader.includes('date') || cleanHeader.includes('event date') || 
                     cleanHeader.includes('schedule') || cleanHeader.includes('when') ||
                     cleanHeader.includes('time') || cleanHeader.includes('duration')) {
            autoMapping.date = index;
            console.log(`Pattern match: Date to column ${index}`);
          } else if (cleanHeader.includes('academic year') || cleanHeader.includes('academicyear') || 
                     cleanHeader.includes('academic ye') || cleanHeader.includes('academic') ||
                     cleanHeader.includes('year') || cleanHeader.includes('session') ||
                     cleanHeader.includes('semester') || cleanHeader.includes('batch')) {
            autoMapping.academicYear = index;
            console.log(`Pattern match: Academic Year to column ${index}`);
          } else if (cleanHeader.includes('type') || cleanHeader.includes('event type') || 
                     cleanHeader.includes('category') || cleanHeader.includes('classification') ||
                     cleanHeader.includes('nature') || cleanHeader.includes('kind')) {
            autoMapping.type = index;
            console.log(`Pattern match: Type to column ${index}`);
          } else if ((cleanHeader.includes('total') || cleanHeader.includes('no') || cleanHeader.includes('number')) && 
                     (cleanHeader.includes('participants') || cleanHeader.includes('participan') || 
                      cleanHeader.includes('students') || cleanHeader.includes('attendees') ||
                      cleanHeader.includes('people') || cleanHeader.includes('count'))) {
            autoMapping.totalParticipants = index;
            console.log(`Pattern match: Total No. of Participants to column ${index}`);
          } else if (cleanHeader.includes('year of students') || cleanHeader.includes('year of studen') || 
                     cleanHeader.includes('yearofstudents') || cleanHeader.includes('student year') ||
                     cleanHeader.includes('class') || cleanHeader.includes('grade') ||
                     cleanHeader.includes('level') || cleanHeader.includes('semester')) {
            autoMapping.yearOfStudents = index;
            console.log(`Pattern match: Year of Students to column ${index}`);
          }
        });
        
        console.log('Excel Headers found:', headers);
        console.log('Clean Headers:', cleanHeaders);
        console.log('Auto-mapping result:', autoMapping);
        
        // Debug: Show detailed header analysis
        console.log('=== HEADER ANALYSIS ===');
        cleanHeaders.forEach((header, index) => {
          if (header) {
            console.log(`Column ${index}: "${header}" -> "${header.toLowerCase().trim()}"`);
          }
        });
        console.log('=== END HEADER ANALYSIS ===');
        
        // If no fields were mapped, try to map at least the title field by position
        if (Object.keys(autoMapping).length === 0) {
          console.log('No fields mapped, trying position-based mapping...');
          // Map based on the expected order from the Excel file
          if (cleanHeaders.length >= 1) autoMapping.sNo = 0;
          if (cleanHeaders.length >= 2) autoMapping.title = 1;
          if (cleanHeaders.length >= 3) autoMapping.resourcePersonName = 2;
          if (cleanHeaders.length >= 4) autoMapping.coordinators = 3;
          if (cleanHeaders.length >= 5) autoMapping.date = 4;
          if (cleanHeaders.length >= 6) autoMapping.academicYear = 5;
          if (cleanHeaders.length >= 7) autoMapping.type = 6;
          if (cleanHeaders.length >= 8) autoMapping.totalParticipants = 7;
          if (cleanHeaders.length >= 9) autoMapping.yearOfStudents = 8;
          console.log('Position-based mapping result:', autoMapping);
        }
         
         // Check if we have at least the required field (title)
         if (!autoMapping.title) {
           console.warn('Title field not found in headers, showing manual mapping option');
           setShowManualMapping(true);
         }
        
        setMapping(autoMapping);
        
        // Validate mapping immediately
        if (Object.keys(autoMapping).length === 0) {
          console.error('No fields could be mapped automatically');
          alert('No fields could be mapped automatically. Please check your Excel file headers or use manual mapping.');
          return;
        }
        
        if (!autoMapping.title) {
          console.warn('Title field not found in headers, showing manual mapping option');
          setShowManualMapping(true);
        }
        
        setStep(2);
        
        // Auto-validate data when reaching step 2 with the current mapping
        setTimeout(() => {
          validateData(autoMapping);
        }, 100);

      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file. Please check the file format and try again.');
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const validateData = (currentMapping = mapping) => {
    console.log('validateData called with mapping:', currentMapping);
    console.log('Mapping keys:', Object.keys(currentMapping));
    
    const newErrors = [];
    
    // Check if any fields are mapped at all
    if (Object.keys(currentMapping).length === 0) {
      newErrors.push({
        type: 'mapping',
        message: 'No fields were mapped. Please check your Excel file headers or use manual mapping.'
      });
      setErrors(newErrors);
      return false;
    }
    
    // Check required fields (Title is now optional)
    // if (!currentMapping.title) {
    //   newErrors.push({
    //     type: 'mapping',
    //     message: 'Title is a required field'
    //   });
    // }

    // Validate data rows
    data.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      
      // Check required fields (Title is now optional)
      // if (currentMapping.title !== undefined) {
      //   const titleValue = row[currentMapping.title];
      //   if (!titleValue || titleValue.toString().trim() === '') {
      //     console.log(`Missing title in row ${rowNumber}: "${titleValue}"`);
      //     newErrors.push({
      //       type: 'validation',
      //       row: rowNumber,
      //       field: 'Title',
      //       message: `Title is required in row ${rowNumber}`
      //   });
      //   }
      // }

      // Validate date format - allow both single dates and date ranges (optional field)
      if (currentMapping.date !== undefined && row[currentMapping.date]) {
        const dateValue = row[currentMapping.date];
        if (typeof dateValue === 'string') {
          const dateStr = dateValue.toString().trim();
          
          // More flexible date validation patterns
          const singleDateRegex = /^\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}$/;
          const dateRangeRegex = /^\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}\s+to\s+\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}$/;
          const otherDateFormats = [
            /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
            /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY
            /^[A-Za-z]+\s+\d{1,2},?\s+\d{4}$/, // Month DD, YYYY
            /^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/ // DD Month YYYY
          ];
          
          const isValidDate = singleDateRegex.test(dateStr) || 
                             dateRangeRegex.test(dateStr) || 
                             otherDateFormats.some(regex => regex.test(dateStr));
          
          if (!isValidDate) {
            console.log(`Invalid date format in row ${rowNumber}: "${dateStr}"`);
            newErrors.push({
              type: 'validation',
              row: rowNumber,
              field: 'Date',
              message: `Invalid date format: "${dateStr}". Expected DD.MM.YYYY or DD.MM.YYYY to DD.MM.YYYY`
            });
          }
        }
      }

      // Validate participant count
      if (currentMapping.totalParticipants !== undefined && row[currentMapping.totalParticipants]) {
        const participants = parseInt(row[currentMapping.totalParticipants]);
        if (isNaN(participants) || participants < 0) {
          newErrors.push({
            type: 'validation',
            row: rowNumber,
            field: 'Total No. of Participants',
            message: 'Participant count must be a valid number'
          });
        }
      }
    });

    console.log('Validation completed. Errors found:', newErrors.length);
    console.log('Error details:', newErrors);
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    // Handle DD.MM.YYYY format
    if (typeof dateString === 'string' && dateString.includes('.')) {
      const parts = dateString.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Month is 0-indexed
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }
    
    // Handle other date formats
    return new Date(dateString);
  };

  const handleImport = async () => {
    if (!validateData(mapping)) {
      alert(`Please fix ${errors.length} validation errors before importing`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      let errorCount = 0;
      let currentBatch = writeBatch(db);
      let batchSize = 0;
      const maxBatchSize = 500; // Firestore batch limit

      console.log('Starting import with mapping:', mapping);
      console.log('Total rows to process:', data.length);

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        try {
          // Extract data based on mapping
          const eventData = {};
          Object.keys(mapping).forEach(fieldName => {
            const columnIndex = mapping[fieldName];
            if (columnIndex !== undefined && row[columnIndex] !== undefined) {
              let value = row[columnIndex];
              
              // Log raw value for debugging (only for first few rows)
              if (i < 3) {
                console.log(`Row ${i + 1}, Field: ${fieldName}, Raw value:`, value);
              }

              // Handle specific field types based on your Excel format
              if (fieldName === 'totalParticipants') {
                // Convert to number, handle cases like "55", "480", "70"
                value = parseInt(value) || 0;
              } else if (fieldName === 'sNo') {
                // Convert to number, handle cases like "1", "2", "3"
                value = parseInt(value) || 0;
              } else if (fieldName === 'date') {
                // Keep as string to handle date ranges like "19.08.2024 to 23.08.2024"
                value = value.toString().trim();
              } else {
                // All other fields as strings
                value = value.toString().trim();
              }
              
              eventData[fieldName] = value;
            }
          });
          
          // Debug: Log the processed event data for first row
          if (i === 0) {
            console.log('Sample event data processed:', eventData);
          }

          // Generate event ID
          const eventId = `event_${Date.now()}_${i}`;
          
          // Prepare final event data
          const finalEventData = {
            ...eventData,
            eventId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: "Active",
            importSource: "bulk_import",
            importDate: serverTimestamp(),
            importBatch: new Date().toISOString()
          };

          // Store in Firebase
          const eventDoc = doc(db, `events/${eventId}`);
          currentBatch.set(eventDoc, finalEventData);
          batchSize++;

          // Commit batch if it reaches the limit
          if (batchSize >= maxBatchSize) {
            console.log(`Committing batch of ${batchSize} operations...`);
            await currentBatch.commit();
            currentBatch = writeBatch(db);
            batchSize = 0;
          }

          successCount++;

        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errorCount++;
        }

        const progress = ((i + 1) / data.length) * 100;
        setUploadProgress(progress);
      }

      // Commit remaining operations
      if (batchSize > 0) {
        console.log(`Committing final batch of ${batchSize} operations...`);
        await currentBatch.commit();
      }

      console.log(`Import completed: ${successCount} successful, ${errorCount} failed`);

      const message = `Import completed!\n\n✅ Successfully imported: ${successCount} events\n❌ Failed: ${errorCount} events`;
      alert(message);
      
      if (onSuccess) {
        onSuccess(successCount);
      }

      setStep(4);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error.message}\n\nPlease check the browser console for more details.`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

     const downloadTemplate = () => {
     const templateData = [
       {
         'S.No': 1,
         'Title': 'How to Write a Patent Application?',
         'Resource Person Name': 'Mr. Madhu, Founder & Managing Partner @GoldenIP LLP, Patent',
         'Coordinators': 'Mr. B. Bhaskar, Mr. S. Gopalakrishnan',
         'Date': '05.08.2024',
         'Academic Year': '2024-2025',
         'Type': 'Guest Lecture',
         'Total No. of Participants': 55,
         'Year of Students': 'III'
       },
       {
         'S.No': 2,
         'Title': '5-Days International Faculty Development Programme & Short Term Training Programme on "Full Stack Data Science with Generative AI"',
         'Resource Person Name': 'Dr. Amudhavel Jayavel, Senior Lecturer in De Montfort University, United Kingdom',
         'Coordinators': 'Mrs. M. Nandhini Anusuri Krishna Veni, Mrs. B. Vidhyashree',
         'Date': '19.08.2024 to 23.08.2024',
         'Academic Year': '2024-2025',
         'Type': 'FDP',
         'Total No. of Participants': 480,
         'Year of Students': 'NA'
       },
       {
         'S.No': 3,
         'Title': 'Ethical Horizons: Navigating Responsible AI in the Modern World',
         'Resource Person Name': 'Manivannan, Practice Lead of Data Protection & Responsible AI at CPX, Abu Dhabi, United Arab Emirates',
         'Coordinators': 'Mrs. Manjula Prabakaran',
         'Date': '20.08.2024',
         'Academic Year': '2024-2025',
         'Type': 'Guest Lecture',
         'Total No. of Participants': 70,
         'Year of Students': 'IV'
       }
     ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    XLSX.writeFile(wb, "event_import_template.xlsx");
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Events Excel File</h3>
        <p className="text-gray-600 text-lg">Select an Excel file (.xlsx, .xls) or CSV file containing event data</p>
      </div>

      <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-400 hover:bg-green-50 transition-all duration-300 group">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-3">Click to upload or drag and drop</p>
          <p className="text-gray-500 mb-4">Excel files (.xlsx, .xls) or CSV files only (Max 10MB)</p>
          <div className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Choose File
          </div>
        </label>
      </div>

      <div className="flex justify-center space-x-6">
        <button
          onClick={downloadTemplate}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-semibold">Download Template</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Validate Data</h3>
        <p className="text-gray-600">Review the data mapping and validation results</p>
      </div>

      {/* Data Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h4 className="text-green-800 font-semibold">Data Summary</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.length}</div>
            <div className="text-sm text-green-700">Total Events</div>
          </div>
                     <div className="text-center">
             <div className="text-2xl font-bold text-green-600">{Object.keys(mapping).length || 0}</div>
             <div className="text-sm text-green-700">Mapped Fields</div>
           </div>
        </div>
      </div>

             {/* Manual Mapping Option */}
       {showManualMapping && (
         <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
           <div className="flex items-center mb-3">
             <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
             </svg>
             <h4 className="text-yellow-800 font-semibold">Manual Field Mapping Required</h4>
           </div>
                       <p className="text-yellow-700 text-sm mb-3">
              Some fields couldn't be automatically mapped. Please manually map the fields (all are optional):
            </p>
                       <div className="space-y-3">
              {availableFields.map(field => (
                <div key={field.name} className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700 min-w-[120px]">
                    {field.label}
                  </label>
                  <select
                    value={mapping[field.name] || ''}
                    onChange={(e) => {
                      const newMapping = { ...mapping };
                      if (e.target.value) {
                        newMapping[field.name] = parseInt(e.target.value);
                      } else {
                        delete newMapping[field.name];
                      }
                      setMapping(newMapping);
                      
                      // Re-validate after mapping change
                      setTimeout(() => {
                        validateData(newMapping);
                      }, 100);
                    }}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select column</option>
                    {headers.map((header, index) => (
                      <option key={index} value={index}>
                        Column {index + 1}: "{header || `Column ${index + 1}`}"
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            
            {/* Show all available headers for reference */}
            <div className="mt-4 p-3 bg-gray-50 rounded border">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Available Headers:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                {headers.map((header, index) => (
                  <div key={index}>
                    Column {index + 1}: "{header || `Column ${index + 1}`}"
                  </div>
                ))}
              </div>
            </div>
         </div>
       )}

       {/* Data Preview */}
       {data.length > 0 && (
         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
           <div className="flex items-center mb-3">
             <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
             </svg>
             <h4 className="text-gray-800 font-semibold">Data Preview (First 3 rows)</h4>
           </div>
           <div className="overflow-x-auto">
             <table className="min-w-full text-xs">
               <thead>
                 <tr className="bg-gray-100">
                   <th className="px-2 py-1 text-left">Row</th>
                   {headers.map((header, index) => (
                     <th key={index} className="px-2 py-1 text-left">
                       {header || `Col ${index + 1}`}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {data.slice(0, 3).map((row, rowIndex) => (
                   <tr key={rowIndex} className="border-b border-gray-200">
                     <td className="px-2 py-1 font-medium">{rowIndex + 2}</td>
                     {row.map((cell, cellIndex) => (
                       <td key={cellIndex} className="px-2 py-1">
                         {cell || '-'}
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       )}

       {/* Validation Status */}
       <div className={`border rounded-lg p-4 ${
         errors.length > 0 
           ? 'bg-red-50 border-red-200' 
           : 'bg-green-50 border-green-200'
       }`}>
        <div className="flex items-center mb-3">
          {errors.length > 0 ? (
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <h4 className={`font-semibold ${
            errors.length > 0 ? 'text-red-800' : 'text-green-800'
          }`}>
            {errors.length > 0 
              ? `${errors.length} Validation Error${errors.length !== 1 ? 's' : ''} Found` 
              : 'All Data Validated Successfully!'
            }
          </h4>
        </div>
        
        {errors.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-2">
            {errors.slice(0, 10).map((error, index) => (
              <div key={index} className="text-sm text-red-700 bg-white p-2 rounded border">
                {error.type === 'mapping' ? (
                  <div>
                    <span className="font-medium text-red-800">🔗 Mapping Error:</span> 
                    <span className="ml-1">{error.message}</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-medium text-red-800">📋 Row {error.row}:</span> 
                    <span className="ml-1">{error.message}</span>
                  </div>
                )}
              </div>
            ))}
            {errors.length > 10 && (
              <div className="text-sm text-red-600 font-medium bg-white p-2 rounded border">
                ... and {errors.length - 10} more errors
              </div>
            )}
          </div>
        )}
        
                 {errors.length === 0 && (
           <div className="text-sm text-green-700">
             <p>✅ All fields are optional and mapped</p>
             <p>✅ Data validation passed</p>
             <p>✅ Ready to import {data.length} events</p>
             <p>✅ Events will be stored in the events collection</p>
           </div>
         )}
      </div>

             <div className="flex justify-between">
         <div className="flex space-x-3">
           <button
             onClick={() => setStep(1)}
             className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
           >
             Back
           </button>
           {Object.keys(mapping).length === 0 && (
             <>
               <button
                 onClick={() => {
                   setMapping({});
                   setErrors([]);
                   setShowManualMapping(false);
                   if (file) {
                     processFile(file);
                   }
                 }}
                 className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
               >
                 Retry Mapping
               </button>
                               <button
                  onClick={() => {
                    console.log('Raw headers:', headers);
                    console.log('Headers with types:', headers.map((h, i) => ({ index: i, header: h, type: typeof h, length: h ? h.length : 0 })));
                    
                    // Show headers in a more user-friendly alert
                    const headerInfo = headers.map((h, i) => `Column ${i + 1}: "${h}" (${typeof h})`).join('\n');
                    alert(`Excel Headers Found:\n\n${headerInfo}\n\nCheck browser console for more details.`);
                  }}
                  className="px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Debug Headers
                </button>
             </>
           )}
         </div>
                 <button
           onClick={() => {
             // Re-validate before import
             const isValid = validateData(mapping);
             if (isValid) {
               handleImport();
             } else {
               // Use setTimeout to get the updated errors state
               setTimeout(() => {
                 console.log('Validation failed, errors:', errors);
               }, 100);
             }
           }}
           disabled={errors.length > 0}
           className={`px-4 py-2 rounded-lg transition-colors ${
             errors.length > 0 
               ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
               : 'bg-green-600 text-white hover:bg-green-700'
           }`}
         >
           {errors.length > 0 ? `Fix ${errors.length} Errors First` : 'Start Import'}
         </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900">Import Complete!</h3>
      <p className="text-gray-600">The bulk import has been completed successfully.</p>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            setStep(1);
            setFile(null);
            setData([]);
            setMapping({});
            setErrors([]);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Import Another File
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Importing Events</h3>
        <p className="text-gray-600">Please wait while we import your event data...</p>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${uploadProgress}%` }}
        ></div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          {Math.round(uploadProgress)}% complete
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            <strong>Processing:</strong> Storing event data in Firebase
          </p>
          <p className="text-xs text-green-600 mt-1">
            Events will be stored in the events collection
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-3">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Bulk Import Events</h2>
                <p className="text-green-100 text-sm">Import multiple events from Excel file</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-green-100 transition-colors rounded-xl hover:bg-white hover:bg-opacity-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-center mt-8">
            {[
              { number: 1, title: 'Upload File' },
              { number: 2, title: 'Validate & Import' },
              { number: 3, title: 'Complete' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= stepInfo.number 
                      ? 'bg-white text-green-600 shadow-lg scale-110' 
                      : 'bg-white bg-opacity-20 text-white'
                  }`}>
                    {stepInfo.number}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors ${
                    step >= stepInfo.number ? 'text-white' : 'text-green-100'
                  }`}>
                    {stepInfo.title}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                    step > stepInfo.number ? 'bg-white' : 'bg-white bg-opacity-30'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {isUploading ? renderProgress() : (
            <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportEvents;
