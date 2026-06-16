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
  const csvPath = 'C:/Users/Dell/Downloads/HRM (CRM leads) - leads_import_template (1).csv (1).csv';
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

    const cleanCSVValue = (val) => {
      if (!val) return '';
      const clean = val.trim();
      const lower = clean.toLowerCase();
      if (lower === 'na' || lower === 'n/a' || lower === 'null' || lower === 'undefined') {
        return '';
      }
      return clean;
    };

    const getVal = (idx, fallback = '') => {
      if (idx === -1 || !columns[idx]) return fallback;
      return cleanCSVValue(columns[idx]) || fallback;
    };

    const normalizePriority = (val) => {
      const clean = (val || '').trim();
      const lower = clean.toLowerCase();
      if (lower === 'hot') return 'Hot';
      if (lower === 'cold') return 'Cold';
      return 'Warm'; // default / fallback
    };

    const normalizeStatus = (val) => {
      const clean = (val || '').trim();
      const lower = clean.toLowerCase();
      if (lower === 'contacted') return 'Contacted';
      if (lower === 'attempted') return 'Attempted';
      if (lower === 'qualified') return 'Qualified';
      if (lower === 'lost') return 'Lost';
      return 'New'; // default / fallback
    };

    const normalizeSource = (val) => {
      const clean = (val || '').trim();
      const lower = clean.toLowerCase().replace(/[\s_-]/g, '');
      const sourcesMap = {
        website: 'Website',
        referral: 'Referral',
        linkedin: 'LinkedIn',
        coldcall: 'Cold Call',
        emailcampaign: 'Email Campaign',
        socialmedia: 'Social Media',
        tradeshow: 'Trade Show',
        other: 'Other'
      };
      return sourcesMap[lower] || 'Other'; // default / fallback
    };

    // Smart Multi-contact Parser
    const parseEmails = (emailStr) => {
      const clean = cleanCSVValue(emailStr);
      if (!clean) return { primary: '', alternatives: [] };
      const parts = clean.split(/[,\;\n\/|]+/).map(e => e.trim()).filter(Boolean);
      
      const parsedParts = [];
      const originalParts = [];
      for (const part of parts) {
        // Strip text in parentheses, e.g. "email (descr)" -> "email"
        const stripped = part.replace(/\s*\(.*?\)\s*/g, '').trim();
        if (stripped) {
          parsedParts.push(stripped);
          originalParts.push(part);
        }
      }
      
      const validEmails = parsedParts.filter(e => e.includes('@'));
      if (validEmails.length === 0) {
        return { primary: '', alternatives: parts };
      }
      
      const primaryEmail = validEmails[0];
      const primaryIndex = parsedParts.indexOf(primaryEmail);
      const alternatives = originalParts.filter((_, idx) => idx !== primaryIndex);
      
      return {
        primary: primaryEmail,
        alternatives: alternatives
      };
    };

    const parsePhones = (phoneStr) => {
      const clean = cleanCSVValue(phoneStr);
      if (!clean) return { primary: '', alternatives: [] };
      const parts = clean.split(/[,\;\n]+/).map(p => p.trim()).filter(Boolean);
      
      const cleanedParts = [];
      const originalParts = [];
      for (const part of parts) {
        const digitsOnly = part.replace(/[^\d+]+/g, '');
        if (digitsOnly) {
          cleanedParts.push(digitsOnly);
          originalParts.push(part);
        }
      }
      
      if (cleanedParts.length === 0) return { primary: '', alternatives: [] };
      
      const primary = cleanedParts[0].substring(0, 20);
      const alternatives = originalParts.slice(1);
      
      if (originalParts[0].length > 20 && originalParts[0] !== primary) {
        alternatives.unshift(originalParts[0]);
      }
      
      return { primary, alternatives };
    };

    const parsedEmails = parseEmails(idxEmail !== -1 ? columns[idxEmail] : '');
    const parsedPhones = parsePhones(idxPhone !== -1 ? columns[idxPhone] : '');

    const leadBody = {
      firstName: getVal(idxFirstName, 'Unknown'),
      lastName: getVal(idxLastName),
      company: getVal(idxCompany, 'Offline Campaign'),
      designation: getVal(idxDesignation),
      email: parsedEmails.primary,
      phone: parsedPhones.primary,
      whatsapp: getVal(idxWhatsApp),
      city: getVal(idxCity),
      state: getVal(idxState),
      country: getVal(idxCountry, 'India'),
      priority: normalizePriority(columns[idxPriority]),
      status: normalizeStatus(columns[idxStatus]),
      source: normalizeSource(columns[idxSource]),
      lostReason: getVal(idxLostReason),
      interestedProduct: getVal(idxProduct),
      followUpType: getVal(idxFollowUpType, 'None'),
      nextFollowUpDate: idxFollowUpDate !== -1 && columns[idxFollowUpDate] ? localToUTCISO(columns[idxFollowUpDate]) : null,
      industry: getVal(idxIndustry),
      annualRevenue: idxRevenue !== -1 && Number(columns[idxRevenue]) ? Number(columns[idxRevenue]) : 0,
      employeeCount: idxEmployees !== -1 && Number(columns[idxEmployees]) ? Number(columns[idxEmployees]) : 0,
      requirements: getVal(idxRequirements, 'Uploaded via Bulk Import CSV Campaign.'),
      customFields: [],
      custom_data: {}
    };

    if (parsedEmails.alternatives.length > 0) {
      const valStr = parsedEmails.alternatives.join(', ');
      leadBody.customFields.push({ label: 'Alternative Email', value: valStr });
      leadBody.custom_data['Alternative Email'] = valStr;
    }
    if (parsedPhones.alternatives.length > 0) {
      const valStr = parsedPhones.alternatives.join(', ');
      leadBody.customFields.push({ label: 'Alternative Phone', value: valStr });
      leadBody.custom_data['Alternative Phone'] = valStr;
    }

    const parsed = validate(schemas.createLead, leadBody);
    if (parsed.success) {
      successRows.push({ rowNum: i + 1, name: leadBody.firstName });
    } else {
      failedRows.push({ rowNum: i + 1, name: leadBody.firstName, error: parsed.error, emailVal: leadBody.email, phoneVal: leadBody.phone });
    }
  }

  console.log('\n======================================');
  console.log('       CSV VALIDATION SUMMARY         ');
  console.log('======================================');
  console.log(`Total Rows Processed: ${lines.length - 1}`);
  console.log(`Success Count: ${successRows.length}`);
  console.log(`Failed Count:  ${failedRows.length}`);
  console.log('======================================\n');

  if (failedRows.length > 0) {
    console.log('❌ TOP 20 VALIDATION FAILURES (Sample):');
    failedRows.slice(0, 20).forEach(row => {
      console.log(`Row ${row.rowNum}: Name="${row.name}" | Error: ${row.error} | Email="${row.emailVal}" | Phone="${row.phoneVal}"`);
    });

    // Error categorizations
    const categories = {};
    failedRows.forEach(row => {
      const errType = row.error.split(':')[0] || 'Unknown';
      if (!categories[errType]) categories[errType] = 0;
      categories[errType]++;
    });
    console.log('\n📊 ERROR CATEGORIES BREAKDOWN:');
    Object.keys(categories).forEach(cat => {
      console.log(`  • ${cat}: ${categories[cat]} occurrences`);
    });
  } else {
    console.log('🎉 Excellent! All rows passed validation successfully.');
  }
}

const successRows = [];
const failedRows = [];

main();
