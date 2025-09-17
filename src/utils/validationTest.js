// Test utility for validation fixes
export const testValidationFixes = () => {
  console.log('🧪 Testing Validation Fixes');
  
  // Test data with the exact issues from your Excel file
  const testData = [
    // Row 37 - 11 digit phone number
    ['23691A3268', 'DOMMARAJULAVANYA', 'MGMT', 'Female', '606184157803', '79181665150', '9052072670', 'D Venkata Rama Raju', 'D Pramila', 'Address 1'],
    
    // Row 131 - Year as "A" (should be section)
    ['23691A3270', 'MACHUPALLI LIKHITHA', 'COV', 'Female', '520554166378', '7013040142', '7569590292', 'M Sreenivasulu Reddy', 'M Saradha', 'Address 2'],
    
    // Row 156 - 9 digit phone number
    ['23691A3271', 'TEST STUDENT', 'MGMT', 'Male', '123456789012', '7702052571', '944098211', 'Test Father', 'Test Mother', 'Address 3'],
    
    // Row 205 - 9 digit phone number
    ['23691A3272', 'ANOTHER STUDENT', 'COV', 'Female', '987654321098', '901003996', '9876543210', 'Another Father', 'Another Mother', 'Address 4'],
    
    // Row 274 - Year as "A"
    ['23691A3273', 'YEAR TEST', 'MGMT', 'Male', '111111111111', '8888888888', '7777777777', 'Year Father', 'Year Mother', 'Address 5'],
    
    // Row 338 - Year as "B"
    ['23691A3274', 'SECTION TEST', 'COV', 'Female', '222222222222', '9999999999', '6666666666', 'Section Father', 'Section Mother', 'Address 6'],
    
    // Row 402 - Year as "C"
    ['23691A3275', 'LETTER TEST', 'MGMT', 'Male', '333333333333', '5555555555', '4444444444', 'Letter Father', 'Letter Mother', 'Address 7'],
    
    // Row 498 - Gender as "Gender" (header)
    ['23691A3276', 'HEADER TEST', 'COV', 'Gender', '444444444444', '3333333333', '2222222222', 'Header Father', 'Header Mother', 'Address 8'],
    
    // Row 499 - Gender as "Gender" (header)
    ['23691A3277', 'FINAL TEST', 'MGMT', 'Gender', '555555555555', '1111111111', '0000000000', 'Final Father', 'Final Mother', 'Address 9']
  ];

  const testHeaders = [
    'Roll. No',
    'Student Name', 
    'Quota',
    'Gender',
    'Aadhaar',
    'Student Mobile',
    'Father Mobile',
    'Father Name',
    'Mother Name',
    'Permanent Address'
  ];

  const mapping = {
    admissionNumber: 0,
    name: 1,
    quota: 2,
    gender: 3,
    aadhaar: 4,
    studentMobile: 5,
    fatherMobile: 6,
    fatherName: 7,
    motherName: 8,
    address: 9
  };

  // Test data cleaning function
  const cleanData = (rawData) => {
    return rawData.map((row, rowIndex) => {
      const cleanedRow = [...row];
      
      // Clean each cell in the row
      Object.keys(mapping).forEach(fieldName => {
        const columnIndex = mapping[fieldName];
        if (columnIndex !== undefined && cleanedRow[columnIndex] !== undefined) {
          let value = cleanedRow[columnIndex];
          
          // Clean phone numbers - remove extra digits if more than 10
          if (fieldName === 'studentMobile' || fieldName === 'fatherMobile') {
            const cleanPhone = value.toString().replace(/\D/g, '');
            if (cleanPhone.length > 10) {
              // Take only the first 10 digits
              cleanedRow[columnIndex] = cleanPhone.substring(0, 10);
              console.log(`🔧 Fixed phone number in row ${rowIndex + 2}: ${value} → ${cleanedRow[columnIndex]}`);
            }
          }
          
          // Clean year values - if it's a single letter (A, B, C), it's likely a section, not year
          if (fieldName === 'year') {
            const yearValue = value.toString().trim();
            if (yearValue.length === 1 && /^[A-Z]$/.test(yearValue)) {
              // This is likely a section, not a year - clear it
              cleanedRow[columnIndex] = '';
              console.log(`🔧 Cleared year value in row ${rowIndex + 2}: "${value}" (likely a section)`);
            }
          }
          
          // Clean gender values - remove header-like values
          if (fieldName === 'gender') {
            const genderValue = value.toString().trim();
            if (genderValue.toLowerCase() === 'gender') {
              cleanedRow[columnIndex] = '';
              console.log(`🔧 Cleared gender value in row ${rowIndex + 2}: "${value}" (header)`);
            }
          }
        }
      });
      
      return cleanedRow;
    });
  };

  // Test validation function
  const validateData = (data) => {
    const errors = [];
    
    data.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      
      // Validate phone numbers
      const studentMobile = row[mapping.studentMobile];
      const fatherMobile = row[mapping.fatherMobile];
      
      if (studentMobile) {
        const cleanPhone = studentMobile.toString().replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          errors.push({
            row: rowNumber,
            field: 'Student Mobile',
            message: `Mobile Number must be exactly 10 digits (found ${cleanPhone.length} digits)`,
            value: studentMobile
          });
        } else if (!/^[6-9]/.test(cleanPhone)) {
          errors.push({
            row: rowNumber,
            field: 'Student Mobile',
            message: `Mobile Number must start with 6, 7, 8, or 9`,
            value: studentMobile
          });
        }
      }
      
      if (fatherMobile) {
        const cleanPhone = fatherMobile.toString().replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
          errors.push({
            row: rowNumber,
            field: 'Father Mobile',
            message: `Father's Mobile must be exactly 10 digits (found ${cleanPhone.length} digits)`,
            value: fatherMobile
          });
        }
      }
      
      // Validate gender
      const gender = row[mapping.gender];
      if (gender && gender.toString().toLowerCase() === 'gender') {
        errors.push({
          row: rowNumber,
          field: 'Gender',
          message: `Gender value appears to be a header`,
          value: gender
        });
      }
    });
    
    return errors;
  };

  console.log('📋 Original test data:');
  testData.forEach((row, index) => {
    console.log(`Row ${index + 2}:`, row);
  });

  console.log('\n🧹 Cleaning data...');
  const cleanedData = cleanData(testData);
  
  console.log('\n📋 Cleaned data:');
  cleanedData.forEach((row, index) => {
    console.log(`Row ${index + 2}:`, row);
  });

  console.log('\n✅ Validating cleaned data...');
  const originalErrors = validateData(testData);
  const cleanedErrors = validateData(cleanedData);
  
  console.log('\n📊 Results:');
  console.log(`Original errors: ${originalErrors.length}`);
  console.log(`Cleaned errors: ${cleanedErrors.length}`);
  console.log(`Errors fixed: ${originalErrors.length - cleanedErrors.length}`);
  
  if (cleanedErrors.length > 0) {
    console.log('\n❌ Remaining errors:');
    cleanedErrors.forEach(error => {
      console.log(`Row ${error.row}: ${error.field} - ${error.message} (Value: ${error.value})`);
    });
  } else {
    console.log('\n🎉 All validation errors fixed!');
  }
  
  return {
    originalErrors,
    cleanedErrors,
    fixedCount: originalErrors.length - cleanedErrors.length
  };
};

// Test year detection from sheet names
export const testYearDetection = () => {
  console.log('🧪 Testing Year Detection from Sheet Names');
  
  const testSheetNames = [
    'II A',
    'III B', 
    'IV C',
    '2nd Year A',
    'Third Year B',
    '1st Year C',
    'V A',
    'VI B'
  ];
  
  testSheetNames.forEach(sheetName => {
    const yearMatch = sheetName.match(/^(I{1,3}|IV|V|VI|VII|VIII|IX|X|XI|XII|1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th|First|Second|Third|Fourth|Fifth|Sixth|Seventh|Eighth|Ninth|Tenth|Eleventh|Twelfth)/i);
    
    if (yearMatch) {
      const detectedYear = yearMatch[1];
      console.log(`✅ Sheet: "${sheetName}" → Year: "${detectedYear}"`);
    } else {
      console.log(`❌ Sheet: "${sheetName}" → No year detected`);
    }
  });
};

// Run tests if in browser
if (typeof window !== 'undefined') {
  console.log('🧪 Running validation tests...');
  testValidationFixes();
  testYearDetection();
}
