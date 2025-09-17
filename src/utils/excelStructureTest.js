// Test utility for Excel structure compatibility
export const testExcelStructure = () => {
  console.log('🧪 Testing Excel Structure Compatibility');
  
  // Your Excel headers (from the image)
  const yourExcelHeaders = [
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

  // Expected field mappings
  const expectedMappings = {
    'Roll. No': 'admissionNumber',
    'Student Name': 'name',
    'Quota': 'quota',
    'Gender': 'gender',
    'Aadhaar': 'aadhaar',
    'Student Mobile': 'studentMobile',
    'Father Mobile': 'fatherMobile',
    'Father Name': 'fatherName',
    'Mother Name': 'motherName',
    'Permanent Address': 'address'
  };

  // Test data with your structure
  const testData = [
    ['23691A3268', 'DOMMARAJULAVANYA', 'MGMT', 'Female', '606184157803', '79181665150', '9052072670', 'D Venkata Rama Raju', 'D Pramila', 'Address 1'],
    ['23691A3270', 'MACHUPALLI LIKHITHA', 'COV', 'Female', '520554166378', '7013040142', '7569590292', 'M Sreenivasulu Reddy', 'M Saradha', 'Address 2'],
    ['23691A3271', 'TEST STUDENT', 'MGMT', 'Male', '123456789012', '7702052571', '944098211', 'Test Father', 'Test Mother', 'Address 3']
  ];

  console.log('📋 Your Excel Headers:');
  yourExcelHeaders.forEach((header, index) => {
    console.log(`  ${index + 1}. "${header}"`);
  });

  console.log('\n🔗 Expected Field Mappings:');
  Object.entries(expectedMappings).forEach(([excelHeader, fieldName]) => {
    console.log(`  "${excelHeader}" → ${fieldName}`);
  });

  // Test the mapping logic
  const variations = {
    // Admission Number variations
    'admissionnumber': 'admissionNumber',
    'admissionno': 'admissionNumber',
    'admission': 'admissionNumber',
    'rollno': 'admissionNumber',
    'rollnumber': 'admissionNumber',
    'roll': 'admissionNumber',
    'roll.': 'admissionNumber',
    'roll no': 'admissionNumber',
    'roll number': 'admissionNumber',
    'rollno.': 'admissionNumber',
    'roll.number': 'admissionNumber',
    'regno': 'admissionNumber',
    'registration': 'admissionNumber',
    'studentid': 'admissionNumber',
    'id': 'admissionNumber',
    'student_id': 'admissionNumber',
    
    // Name variations
    'fullname': 'name',
    'studentname': 'name',
    'student_name': 'name',
    'name': 'name',
    'student': 'name',
    'candidate': 'name',
    'student name': 'name',
    
    // Quota variations
    'quota': 'quota',
    'category': 'quota',
    'reservation': 'quota',
    'admissionquota': 'quota',
    'admission_category': 'quota',
    
    // Gender variations
    'gender': 'gender',
    'sex': 'gender',
    
    // Aadhaar variations
    'aadhaar': 'aadhaar',
    'aadhar': 'aadhaar',
    'aadhaarnumber': 'aadhaar',
    'aadharno': 'aadhaar',
    'aadhaar_number': 'aadhaar',
    'aadhar_number': 'aadhaar',
    
    // Student Mobile variations
    'mobilenumber': 'studentMobile',
    'mobile': 'studentMobile',
    'phone': 'studentMobile',
    'contact': 'studentMobile',
    'phonenumber': 'studentMobile',
    'cell': 'studentMobile',
    'student mobile': 'studentMobile',
    'studentmobile': 'studentMobile',
    'student_mobile': 'studentMobile',
    'student_phone': 'studentMobile',
    
    // Father's Mobile variations
    'fathermobile': 'fatherMobile',
    'father_mobile': 'fatherMobile',
    'fatherphone': 'fatherMobile',
    'father_phone': 'fatherMobile',
    'father mobile': 'fatherMobile',
    'fathers_mobile': 'fatherMobile',
    'fathers_phone': 'fatherMobile',
    
    // Father's Name variations
    'fathername': 'fatherName',
    'father_name': 'fatherName',
    'father': 'fatherName',
    'fathersname': 'fatherName',
    'father name': 'fatherName',
    'fathers_name': 'fatherName',
    
    // Mother's Name variations
    'mothername': 'motherName',
    'mother_name': 'motherName',
    'mother': 'motherName',
    'mothersname': 'motherName',
    'mother name': 'motherName',
    'mothers_name': 'motherName',
    
    // Address variations
    'address': 'address',
    'addr': 'address',
    'location': 'address',
    'permanentaddress': 'address',
    'permanent_address': 'address',
    'permanent address': 'address',
    'permanentaddr': 'address',
    'permanent_addr': 'address'
  };

  // Test mapping function
  const testMapping = (headers) => {
    const autoMapping = {};
    const results = [];
    
    headers.forEach((header, index) => {
      if (!header) return;
      
      const cleanHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      const originalHeader = header.toString().toLowerCase();
      const spaceCleanedHeader = originalHeader.replace(/\s+/g, '');
      
      results.push(`Processing: "${header}"`);
      results.push(`  Cleaned: "${cleanHeader}"`);
      results.push(`  Space-cleaned: "${spaceCleanedHeader}"`);
      
      // Try exact match first
      if (variations[cleanHeader]) {
        autoMapping[variations[cleanHeader]] = index;
        results.push(`  ✅ EXACT MATCH: "${header}" → "${variations[cleanHeader]}"`);
        return;
      }
      
      // Try space-cleaned match
      if (variations[spaceCleanedHeader]) {
        autoMapping[variations[spaceCleanedHeader]] = index;
        results.push(`  ✅ SPACE MATCH: "${header}" → "${variations[spaceCleanedHeader]}"`);
        return;
      }
      
      // Try partial match
      for (const [key, fieldName] of Object.entries(variations)) {
        if (cleanHeader.includes(key) || key.includes(cleanHeader)) {
          autoMapping[fieldName] = index;
          results.push(`  ✅ PARTIAL MATCH: "${header}" → "${fieldName}" (key: "${key}")`);
          break;
        }
      }
      
      if (!Object.values(autoMapping).includes(index)) {
        results.push(`  ❌ NO MATCH FOUND for "${header}"`);
      }
    });
    
    return { autoMapping, results };
  };

  console.log('\n🔍 Testing Auto-Mapping Logic:');
  const { autoMapping, results } = testMapping(yourExcelHeaders);
  
  results.forEach(result => {
    console.log(result);
  });

  console.log('\n📊 Mapping Results:');
  console.log('Final mapping:', autoMapping);
  
  // Check required fields
  const requiredFields = ['admissionNumber', 'name'];
  const missingFields = requiredFields.filter(field => !autoMapping[field]);
  
  if (missingFields.length > 0) {
    console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
  } else {
    console.log('✅ All required fields mapped!');
  }

  // Test data cleaning
  console.log('\n🧹 Testing Data Cleaning:');
  const cleanData = (rawData) => {
    return rawData.map((row, rowIndex) => {
      const cleanedRow = [...row];
      
      // Clean phone numbers
      if (autoMapping.studentMobile !== undefined) {
        const value = cleanedRow[autoMapping.studentMobile];
        const cleanPhone = value.toString().replace(/\D/g, '');
        if (cleanPhone.length > 10) {
          cleanedRow[autoMapping.studentMobile] = cleanPhone.substring(0, 10);
          console.log(`🔧 Fixed student mobile in row ${rowIndex + 2}: ${value} → ${cleanedRow[autoMapping.studentMobile]}`);
        }
      }
      
      if (autoMapping.fatherMobile !== undefined) {
        const value = cleanedRow[autoMapping.fatherMobile];
        const cleanPhone = value.toString().replace(/\D/g, '');
        if (cleanPhone.length > 10) {
          cleanedRow[autoMapping.fatherMobile] = cleanPhone.substring(0, 10);
          console.log(`🔧 Fixed father mobile in row ${rowIndex + 2}: ${value} → ${cleanedRow[autoMapping.fatherMobile]}`);
        }
      }
      
      // Clean gender values
      if (autoMapping.gender !== undefined) {
        const value = cleanedRow[autoMapping.gender];
        if (value.toString().toLowerCase() === 'gender') {
          cleanedRow[autoMapping.gender] = '';
          console.log(`🔧 Cleared gender value in row ${rowIndex + 2}: "${value}" (header)`);
        }
      }
      
      return cleanedRow;
    });
  };

  const cleanedData = cleanData(testData);
  
  console.log('\n📋 Original vs Cleaned Data:');
  testData.forEach((row, index) => {
    console.log(`Row ${index + 2}:`);
    console.log(`  Original: ${row.join(' | ')}`);
    console.log(`  Cleaned:  ${cleanedData[index].join(' | ')}`);
  });

  // Test validation
  console.log('\n✅ Testing Validation:');
  const validateData = (data) => {
    const errors = [];
    
    data.forEach((row, rowIndex) => {
      const rowNumber = rowIndex + 2;
      
      // Validate required fields
      if (autoMapping.admissionNumber !== undefined) {
        const admissionNumber = row[autoMapping.admissionNumber];
        if (!admissionNumber || admissionNumber.toString().trim() === '') {
          errors.push({
            row: rowNumber,
            field: 'Admission Number',
            message: 'Admission Number is required',
            value: admissionNumber
          });
        }
      }
      
      if (autoMapping.name !== undefined) {
        const name = row[autoMapping.name];
        if (!name || name.toString().trim() === '') {
          errors.push({
            row: rowNumber,
            field: 'Full Name',
            message: 'Full Name is required',
            value: name
          });
        }
      }
      
      // Validate phone numbers
      if (autoMapping.studentMobile !== undefined) {
        const studentMobile = row[autoMapping.studentMobile];
        if (studentMobile) {
          const cleanPhone = studentMobile.toString().replace(/\D/g, '');
          if (cleanPhone.length !== 10) {
            errors.push({
              row: rowNumber,
              field: 'Student Mobile',
              message: `Mobile Number must be exactly 10 digits (found ${cleanPhone.length} digits)`,
              value: studentMobile
            });
          }
        }
      }
      
      if (autoMapping.fatherMobile !== undefined) {
        const fatherMobile = row[autoMapping.fatherMobile];
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
      }
    });
    
    return errors;
  };

  const originalErrors = validateData(testData);
  const cleanedErrors = validateData(cleanedData);
  
  console.log(`Original validation errors: ${originalErrors.length}`);
  console.log(`Cleaned validation errors: ${cleanedErrors.length}`);
  console.log(`Errors fixed: ${originalErrors.length - cleanedErrors.length}`);
  
  if (cleanedErrors.length > 0) {
    console.log('\n❌ Remaining validation errors:');
    cleanedErrors.forEach(error => {
      console.log(`  Row ${error.row}: ${error.field} - ${error.message}`);
    });
  } else {
    console.log('\n🎉 All validation errors fixed!');
  }

  return {
    yourExcelHeaders,
    expectedMappings,
    autoMapping,
    testData,
    cleanedData,
    originalErrors,
    cleanedErrors
  };
};

// Test field descriptions
export const testFieldDescriptions = () => {
  console.log('🧪 Testing Field Descriptions');
  
  const availableFields = [
    // Required fields
    { name: "admissionNumber", label: "Admission Number", type: "text", required: true, description: "Student's unique admission/roll number" },
    { name: "name", label: "Full Name", type: "text", required: true, description: "Student's full name" },
    
    // Your Excel fields
    { name: "quota", label: "Quota", type: "select", required: false, options: ["MGMT", "COV", "Management", "Convenor"], description: "Admission quota category" },
    { name: "gender", label: "Gender", type: "select", required: false, options: ["Male", "Female", "Other"], description: "Student's gender" },
    { name: "aadhaar", label: "Aadhaar Number", type: "text", required: false, description: "12-digit Aadhaar number" },
    { name: "studentMobile", label: "Mobile Number", type: "tel", required: false, description: "Student's 10-digit mobile number" },
    { name: "fatherMobile", label: "Father's Mobile", type: "tel", required: false, description: "Father's 10-digit mobile number" },
    { name: "fatherName", label: "Father's Name", type: "text", required: false, description: "Father's full name" },
    { name: "motherName", label: "Mother's Name", type: "text", required: false, description: "Mother's full name" },
    { name: "address", label: "Address", type: "textarea", required: false, description: "Permanent address" }
  ];

  console.log('📋 Field Descriptions:');
  availableFields.forEach(field => {
    console.log(`  ${field.label}: ${field.description}`);
  });

  return availableFields;
};

// Run tests if in browser
if (typeof window !== 'undefined') {
  console.log('🧪 Running Excel structure tests...');
  testExcelStructure();
  testFieldDescriptions();
}
