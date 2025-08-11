import Tesseract from 'tesseract.js';

interface AadharData {
  name: string;
  dob: string;
  aadhar: string;
}

export const extractAadharData = async (file: File): Promise<AadharData> => {
  try {
    // Convert file to image URL for processing
    const imageUrl = URL.createObjectURL(file);
    
    // Use Tesseract.js to extract text from the image
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
      logger: m => console.log(m) // Optional: log progress
    });
    
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
    
    // Parse the extracted text to find Aadhar details
    const extractedData = parseAadharText(text);
    
    return extractedData;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract data from the image');
  }
};

const parseAadharText = (text: string): AadharData => {
  const result: AadharData = {
    name: '',
    dob: '',
    aadhar: ''
  };
  
  // Clean and normalize the text
  const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('Extracted text:', cleanText);
  
  // Extract Aadhar number (12 digits, may have spaces or dashes)
  const aadharPatterns = [
    /\b(\d{4}[\s-]?\d{4}[\s-]?\d{4})\b/g,
    /\b(\d{12})\b/g
  ];
  
  for (const pattern of aadharPatterns) {
    const aadharMatch = cleanText.match(pattern);
    if (aadharMatch) {
      const aadharNumber = aadharMatch[0].replace(/[\s-]/g, '');
      if (aadharNumber.length === 12) {
        result.aadhar = aadharNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
        break;
      }
    }
  }
  
  // Extract Date of Birth
  const dobPatterns = [
    /DOB[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /Date of Birth[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /Birth[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/g
  ];
  
  for (const pattern of dobPatterns) {
    const dobMatch = cleanText.match(pattern);
    if (dobMatch) {
      const dateStr = dobMatch[1] || dobMatch[0];
      const parsedDate = parseDate(dateStr);
      if (parsedDate) {
        result.dob = parsedDate;
        break;
      }
    }
  }
  
  // Extract Name (usually appears after specific keywords or at the beginning)
  const namePatterns = [
    /Name[:\s]+([A-Z][A-Za-z\s]+?)(?:\s+(?:DOB|Date|Birth|Male|Female|\d))/i,
    /^([A-Z][A-Za-z\s]+?)(?:\s+(?:DOB|Date|Birth|Male|Female|\d))/i,
    /([A-Z][A-Za-z\s]{2,30})(?:\s+(?:Male|Female|DOB|Date|Birth))/i
  ];
  
  for (const pattern of namePatterns) {
    const nameMatch = cleanText.match(pattern);
    if (nameMatch) {
      let name = nameMatch[1].trim();
      // Clean up the name
      name = name.replace(/[^A-Za-z\s]/g, '').trim();
      if (name.length > 2 && name.length < 50) {
        result.name = name;
        break;
      }
    }
  }
  
  // If name extraction failed, try to get the first meaningful text
  if (!result.name) {
    const words = cleanText.split(' ').filter(word => 
      word.length > 2 && 
      /^[A-Za-z]+$/.test(word) && 
      !['DOB', 'Date', 'Birth', 'Male', 'Female', 'Government', 'India', 'Aadhaar'].includes(word)
    );
    
    if (words.length >= 2) {
      result.name = words.slice(0, 3).join(' ');
    }
  }
  
  return result;
};

const parseDate = (dateStr: string): string => {
  try {
    // Handle different date formats
    const cleanDate = dateStr.replace(/[^\d\/\-\.]/g, '');
    const parts = cleanDate.split(/[\/\-\.]/);
    
    if (parts.length === 3) {
      let day, month, year;
      
      // Determine the format based on the values
      if (parseInt(parts[2]) > 31) {
        // Format: DD/MM/YYYY or MM/DD/YYYY
        day = parseInt(parts[0]);
        month = parseInt(parts[1]);
        year = parseInt(parts[2]);
        
        // If day > 12, assume DD/MM/YYYY format
        if (day > 12) {
          [day, month] = [month, day];
        }
      } else {
        // Format: YYYY/MM/DD
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
      }
      
      // Validate the date
      if (year >= 1900 && year <= new Date().getFullYear() && 
          month >= 1 && month <= 12 && 
          day >= 1 && day <= 31) {
        
        // Format as YYYY-MM-DD for HTML date input
        const formattedMonth = month.toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');
        return `${year}-${formattedMonth}-${formattedDay}`;
      }
    }
    
    return '';
  } catch (error) {
    console.error('Date parsing error:', error);
    return '';
  }
};