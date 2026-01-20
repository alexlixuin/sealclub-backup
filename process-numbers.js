const fs = require('fs');

// Country codes mapping - supporting both country codes and full names
const COUNTRY_MAPPING = {
  // Country codes
  "AU": "+61",
  "US": "+1", 
  "CA": "+1",
  "GB": "+44",
  "NZ": "+64",
  "DE": "+49",
  "FR": "+33",
  "IT": "+39",
  "ES": "+34",
  "NL": "+31",
  "BE": "+32",
  "CH": "+41",
  "IL": "+972",
  "MN": "+976",
  "SE": "+46",
  "NO": "+47",
  "SG": "+65",
  "SA": "+966",
  // Full country names
  "AUSTRALIA": "+61",
  "UNITED STATES": "+1",
  "CANADA": "+1",
  "UNITED KINGDOM": "+44",
  "NEW ZEALAND": "+64",
  "GERMANY": "+49",
  "FRANCE": "+33",
  "ITALY": "+39",
  "SPAIN": "+34",
  "NETHERLANDS": "+31",
  "BELGIUM": "+32",
  "SWITZERLAND": "+41",
  "ISRAEL": "+972",
  "MONGOLIA": "+976",
  "SWEDEN": "+46",
  "NORWAY": "+47",
  "SINGAPORE": "+65",
  "SAUDI ARABIA": "+966",
  "PORTUGAL": "+351",
  "SERBIA": "+381"
};

function isValidPhoneLength(phone, countryCode) {
  const phoneDigits = phone.replace(/[^\d]/g, '');
  const length = phoneDigits.length;
  
  // Country-specific length validation
  switch(countryCode) {
    case 'AU': // Australia: 9 digits after +61
      return length >= 10 && length <= 11; // 04xxxxxxxx or 61xxxxxxxxx
    case 'US': case 'CA': // US/Canada: 10 digits after +1
      return length === 10 || length === 11;
    case 'GB': // UK: 10-11 digits after +44
      return length >= 10 && length <= 11;
    case 'NZ': // New Zealand: 8-9 digits after +64
      return length >= 8 && length <= 10;
    case 'DE': // Germany: 10-12 digits after +49
      return length >= 10 && length <= 12;
    case 'FR': // France: 9 digits after +33
      return length === 9 || length === 10;
    case 'IT': // Italy: 9-10 digits after +39
      return length >= 9 && length <= 10;
    case 'IL': // Israel: 9 digits after +972
      return length === 9 || length === 10;
    case 'SG': // Singapore: 8 digits after +65
      return length === 8;
    case 'SE': // Sweden: 9 digits after +46
      return length === 9 || length === 10;
    case 'NO': // Norway: 8 digits after +47
      return length === 8;
    default:
      return length >= 7 && length <= 15; // General international range
  }
}

function formatPhoneNumber(phone, country) {
  // Skip "Not provided" phones
  if (phone === "Not provided" || !phone || phone.trim() === "") {
    return null;
  }

  // Get country dial code - try both country code and full name
  const countryKey = country.toUpperCase().trim();
  const dialCode = COUNTRY_MAPPING[countryKey];
  
  if (!dialCode) {
    console.log(`Unknown country: ${country}, skipping phone: ${phone}`);
    return null;
  }

  // Clean phone number - remove all non-digits
  let cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Skip if no digits found
  if (!cleanPhone) {
    return null;
  }

  // Skip obviously invalid numbers (too short or too long)
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    console.log(`Invalid length for ${phone} (${cleanPhone.length} digits), skipping`);
    return null;
  }

  // If phone already has country code, validate and return
  if (cleanPhone.startsWith(dialCode.replace('+', ''))) {
    const formattedPhone = `+${cleanPhone}`;
    const countryCode = countryKey.length === 2 ? countryKey : 
      countryKey === 'AUSTRALIA' ? 'AU' :
      countryKey === 'UNITED STATES' ? 'US' :
      countryKey === 'UNITED KINGDOM' ? 'GB' :
      countryKey === 'NEW ZEALAND' ? 'NZ' :
      countryKey === 'CANADA' ? 'CA' : null;
    
    if (countryCode && !isValidPhoneLength(formattedPhone, countryCode)) {
      console.log(`Invalid phone length for ${formattedPhone} in ${country}, skipping`);
      return null;
    }
    return formattedPhone;
  }

  // For Australian/NZ numbers, remove leading 0 if present
  if ((countryKey === 'AU' || countryKey === 'AUSTRALIA' || countryKey === 'NZ' || countryKey === 'NEW ZEALAND') && cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }

  const formattedPhone = `${dialCode}${cleanPhone}`;
  
  // Final validation
  const countryCode = countryKey.length === 2 ? countryKey : 
    countryKey === 'AUSTRALIA' ? 'AU' :
    countryKey === 'UNITED STATES' ? 'US' :
    countryKey === 'UNITED KINGDOM' ? 'GB' :
    countryKey === 'NEW ZEALAND' ? 'NZ' :
    countryKey === 'CANADA' ? 'CA' : null;
  
  if (countryCode && !isValidPhoneLength(formattedPhone, countryCode)) {
    console.log(`Invalid phone length for ${formattedPhone} in ${country}, skipping`);
    return null;
  }

  return formattedPhone;
}

// Read and process numbers.json
const data = JSON.parse(fs.readFileSync('numbers.json', 'utf8'));
const phoneNumbers = new Set();

data.forEach((entry, index) => {
  try {
    const billingInfo = entry.billing_info;
    
    if (billingInfo?.phone && billingInfo?.address?.country) {
      const formattedPhone = formatPhoneNumber(billingInfo.phone, billingInfo.address.country);
      if (formattedPhone) {
        phoneNumbers.add(formattedPhone);
      }
    }
  } catch (error) {
    console.error(`Error processing entry ${index}:`, error);
  }
});

const uniquePhones = Array.from(phoneNumbers).sort();

console.log('Formatted Phone Numbers:');
console.log(JSON.stringify(uniquePhones, null, 2));
console.log(`\nTotal unique phone numbers: ${uniquePhones.length}`);

// Save to file
fs.writeFileSync('formatted-phones.json', JSON.stringify(uniquePhones, null, 2));
console.log('Saved to formatted-phones.json');
