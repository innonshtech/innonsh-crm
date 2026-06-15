const { schemas, validate } = require('./src/lib/validators.js');
const fs = require('fs');

// Quoted comma splitter helper
const splitCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, '').trim());
};

const localToUTCISO = (localTimeStr) => {
  if (!localTimeStr) return null;
  const date = new Date(localTimeStr);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

function main() {
  const csvPath = 'C:/Users/Dell/Downloads/testing1.csv';
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found');
    return;
  }

  const text = fs.readFileSync(csvPath, 'utf-8');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const headers = splitCSVLine(lines[0]);

  const getIndex = (name) => {
    return headers.findIndex(h => h.toLowerCase().replace(/[\s_-]/g, '') === name.toLowerCase().replace(/[\s_-]/g, ''));
  };

  const idxFirstName = getIndex('First Name');
  const idxLastName = getIndex('Last Name');
  const idxCompany = getIndex('Company');
  const idxDesignation = getIndex('Designation');
  const idxEmail = getIndex('Email');
  const idxPhone = getIndex('Phone');
  const idxWhatsApp = getIndex('WhatsApp');
  const idxCity = getIndex('City');
  const idxState = getIndex('State');
  const idxCountry = getIndex('Country');
  const idxPriority = getIndex('Priority');
  const idxStatus = getIndex('Lead Status');
  const idxSource = getIndex('Lead Source');
  const idxLostReason = getIndex('Lost Reason');
  const idxProduct = getIndex('Interested Product');
  const idxFollowUpType = getIndex('Follow-up Type');
  const idxFollowUpDate = getIndex('Next Follow-up Date');
  const idxIndustry = getIndex('Industry');
  const idxRevenue = getIndex('Estimated Revenue');
  const idxEmployees = getIndex('Employee Count');
  const idxRequirements = getIndex('Requirements');

  const standardIndices = [
    idxFirstName, idxLastName, idxCompany, idxDesignation, idxEmail,
    idxPhone, idxWhatsApp, idxCity, idxState, idxCountry, idxPriority,
    idxStatus, idxSource, idxLostReason, idxProduct, idxFollowUpType,
    idxFollowUpDate, idxIndustry, idxRevenue, idxEmployees, idxRequirements
  ].filter(idx => idx !== -1);

  // Test Row 2
  for (let i = 1; i < lines.length; i++) {
    const columns = splitCSVLine(lines[i]);
    if (columns.length < 2) continue;

    const leadBody = {
      firstName: idxFirstName !== -1 && columns[idxFirstName] ? columns[idxFirstName] : 'Unknown',
      lastName: idxLastName !== -1 && columns[idxLastName] ? columns[idxLastName] : '',
      company: idxCompany !== -1 && columns[idxCompany] ? columns[idxCompany] : 'Offline Campaign',
      designation: idxDesignation !== -1 && columns[idxDesignation] ? columns[idxDesignation] : '',
      email: idxEmail !== -1 && columns[idxEmail] ? columns[idxEmail] : '',
      phone: idxPhone !== -1 && columns[idxPhone] ? columns[idxPhone] : '',
      whatsapp: idxWhatsApp !== -1 && columns[idxWhatsApp] ? columns[idxWhatsApp] : '',
      city: idxCity !== -1 && columns[idxCity] ? columns[idxCity] : '',
      state: idxState !== -1 && columns[idxState] ? columns[idxState] : '',
      country: idxCountry !== -1 && columns[idxCountry] ? columns[idxCountry] : 'India',
      priority: idxPriority !== -1 && columns[idxPriority] ? columns[idxPriority] : 'Warm',
      status: idxStatus !== -1 && columns[idxStatus] ? columns[idxStatus] : 'New',
      source: idxSource !== -1 && columns[idxSource] ? columns[idxSource] : 'Other',
      lostReason: idxLostReason !== -1 && columns[idxLostReason] ? columns[idxLostReason] : '',
      interestedProduct: idxProduct !== -1 && columns[idxProduct] ? columns[idxProduct] : '',
      followUpType: idxFollowUpType !== -1 && columns[idxFollowUpType] ? columns[idxFollowUpType] : 'None',
      nextFollowUpDate: idxFollowUpDate !== -1 && columns[idxFollowUpDate] ? localToUTCISO(columns[idxFollowUpDate]) : null,
      industry: idxIndustry !== -1 && columns[idxIndustry] ? columns[idxIndustry] : '',
      annualRevenue: idxRevenue !== -1 && Number(columns[idxRevenue]) ? Number(columns[idxRevenue]) : 0,
      employeeCount: idxEmployees !== -1 && Number(columns[idxEmployees]) ? Number(columns[idxEmployees]) : 0,
      requirements: idxRequirements !== -1 && columns[idxRequirements] ? columns[idxRequirements] : 'Uploaded via Bulk Import CSV Campaign.',
      customFields: [],
      custom_data: {}
    };

    const parsed = validate(schemas.createLead, leadBody);
    console.log(`Row ${i + 1} (${leadBody.firstName}): Validation success = ${parsed.success}`);
    if (!parsed.success) {
      console.log(`  ❌ Error: ${parsed.error}`);
    }
  }
}

main();
