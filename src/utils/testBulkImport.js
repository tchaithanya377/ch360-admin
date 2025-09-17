// Test utility for bulk import mapping
export const testBulkImportMapping = () => {
  // Exact headers from the user's Excel file
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

  console.log('🔍 Testing headers:', testHeaders);

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
    'regno': 'admissionNumber',
    'registration': 'admissionNumber',
    'studentid': 'admissionNumber',
    'id': 'admissionNumber',
    
    // Name variations
    'fullname': 'name',
    'studentname': 'name',
    'student_name': 'name',
    'name': 'name',
    'student': 'name',
    'candidate': 'name',
    
    // Mobile variations
    'mobilenumber': 'studentMobile',
    'mobile': 'studentMobile',
    'phone': 'studentMobile',
    'contact': 'studentMobile',
    'phonenumber': 'studentMobile',
    'cell': 'studentMobile',
    
    // Gender variations
    'gender': 'gender',
    'sex': 'gender',
    
    // Father's name variations
    'fathername': 'fatherName',
    'father_name': 'fatherName',
    'father': 'fatherName',
    'fathersname': 'fatherName',
    
    // Father's mobile variations
    'fathermobile': 'fatherMobile',
    'father_mobile': 'fatherMobile',
    'fatherphone': 'fatherMobile',
    'father_phone': 'fatherMobile',
    
    // Mother's name variations
    'mothername': 'motherName',
    'mother_name': 'motherName',
    'mother': 'motherName',
    'mothersname': 'motherName',
    
    // Address variations
    'address': 'address',
    'addr': 'address',
    'location': 'address',
    'permanentaddress': 'address',
    'permanent_address': 'address',
    
    // Aadhaar variations
    'aadhaar': 'aadhaar',
    'aadhar': 'aadhaar',
    'aadhaarnumber': 'aadhaar',
    'aadharno': 'aadhaar',
    
    // Quota variations
    'quota': 'quota',
    'category': 'quota',
    'reservation': 'quota'
  };

  const autoMapping = {};
  
  testHeaders.forEach((header, index) => {
    if (!header) return;
    
    console.log(`\n🔍 Processing header: "${header}"`);
    
    const cleanHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const originalHeader = header.toString().toLowerCase();
    
    console.log(`   Cleaned header: "${cleanHeader}"`);
    console.log(`   Original header: "${originalHeader}"`);
    
    // Try exact match first
    if (variations[cleanHeader]) {
      autoMapping[variations[cleanHeader]] = index;
      console.log(`✅ EXACT MATCH: "${header}" → "${variations[cleanHeader]}"`);
      return;
    }
    
    // Try partial match
    for (const [key, fieldName] of Object.entries(variations)) {
      if (cleanHeader.includes(key) || key.includes(cleanHeader)) {
        autoMapping[fieldName] = index;
        console.log(`✅ PARTIAL MATCH: "${header}" → "${fieldName}" (key: "${key}")`);
        break;
      }
    }
    
    // If no match found, try with spaces
    if (!autoMapping[Object.values(variations).find(v => autoMapping[v] === index)]) {
      const spaceCleanedHeader = originalHeader.replace(/\s+/g, '');
      console.log(`   Space-cleaned header: "${spaceCleanedHeader}"`);
      
      if (variations[spaceCleanedHeader]) {
        autoMapping[variations[spaceCleanedHeader]] = index;
        console.log(`✅ SPACE MATCH: "${header}" → "${variations[spaceCleanedHeader]}"`);
      }
    }
  });

  console.log('\n📋 Final mapping:', autoMapping);
  
  // Check for required fields
  const requiredFields = ['admissionNumber', 'name'];
  const missingFields = requiredFields.filter(field => !autoMapping[field]);
  
  if (missingFields.length > 0) {
    console.log('❌ Missing required fields:', missingFields);
  } else {
    console.log('✅ All required fields mapped!');
  }
  
  return autoMapping;
};

// Enhanced mapping function that handles edge cases
export const enhancedMapping = (headers) => {
  const variations = {
    // Admission Number variations - more comprehensive
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
    'studentid': 'admissionNumber',
    
    // Name variations
    'fullname': 'name',
    'studentname': 'name',
    'student_name': 'name',
    'name': 'name',
    'student': 'name',
    'candidate': 'name',
    'student name': 'name',
    
    // Mobile variations
    'mobilenumber': 'studentMobile',
    'mobile': 'studentMobile',
    'phone': 'studentMobile',
    'contact': 'studentMobile',
    'phonenumber': 'studentMobile',
    'cell': 'studentMobile',
    'student mobile': 'studentMobile',
    'studentmobile': 'studentMobile',
    
    // Gender variations
    'gender': 'gender',
    'sex': 'gender',
    
    // Father's name variations
    'fathername': 'fatherName',
    'father_name': 'fatherName',
    'father': 'fatherName',
    'fathersname': 'fatherName',
    'father name': 'fatherName',
    
    // Father's mobile variations
    'fathermobile': 'fatherMobile',
    'father_mobile': 'fatherMobile',
    'fatherphone': 'fatherMobile',
    'father_phone': 'fatherMobile',
    'father mobile': 'fatherMobile',
    
    // Mother's name variations
    'mothername': 'motherName',
    'mother_name': 'motherName',
    'mother': 'motherName',
    'mothersname': 'motherName',
    'mother name': 'motherName',
    
    // Address variations
    'address': 'address',
    'addr': 'address',
    'location': 'address',
    'permanentaddress': 'address',
    'permanent_address': 'address',
    'permanent address': 'address',
    
    // Aadhaar variations
    'aadhaar': 'aadhaar',
    'aadhar': 'aadhaar',
    'aadhaarnumber': 'aadhaar',
    'aadharno': 'aadhaar',
    
    // Quota variations
    'quota': 'quota',
    'category': 'quota',
    'reservation': 'quota'
  };

  const autoMapping = {};
  
  headers.forEach((header, index) => {
    if (!header) return;
    
    const cleanHeader = header.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const originalHeader = header.toString().toLowerCase();
    const spaceCleanedHeader = originalHeader.replace(/\s+/g, '');
    
    // Try exact match first
    if (variations[cleanHeader]) {
      autoMapping[variations[cleanHeader]] = index;
      return;
    }
    
    // Try space-cleaned match
    if (variations[spaceCleanedHeader]) {
      autoMapping[variations[spaceCleanedHeader]] = index;
      return;
    }
    
    // Try partial match
    for (const [key, fieldName] of Object.entries(variations)) {
      if (cleanHeader.includes(key) || key.includes(cleanHeader)) {
        autoMapping[fieldName] = index;
        break;
      }
    }
  });
  
  return autoMapping;
};

// Test the mapping
if (typeof window !== 'undefined') {
  console.log('🧪 Testing bulk import mapping...');
  testBulkImportMapping();
}
