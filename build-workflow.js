// build-workflow.js
// Run: node build-workflow.js
// Output: n8n-biodata-workflow.json
'use strict';
const fs = require('fs');
const crypto = require('crypto');

const htmlTemplate = fs.readFileSync('./biodata-template.html', 'utf8');

function uid() { return crypto.randomUUID(); }

// ─── NODE 1: Tally Trigger ────────────────────────────────────────────────────
const tallyTriggerNode = {
  id: uid(),
  name: 'Tally Trigger',
  type: 'n8n-nodes-base.tallyTrigger',
  typeVersion: 1,
  position: [240, 300],
  parameters: {},
  webhookId: uid(),
};

// ─── NODE 2: Parse Payload ────────────────────────────────────────────────────
const parsePayloadCode = `
// Maps Tally webhook fields to named template placeholders
const raw = $input.first().json;
const d = Array.isArray(raw) ? raw[0] : raw;

// DEBUG — remove after confirming SG record field resolves
console.log('DEBUG raw type:', Array.isArray(raw) ? 'array[' + raw.length + ']' : typeof raw);
console.log('DEBUG question_Q0Jlj8:', JSON.stringify(d['question_Q0Jlj8']));

function val(field) {
  if (!d[field]) return null;
  const v = d[field].value;
  return (v !== undefined && v !== null) ? v : null;
}
function text(field) {
  const v = val(field);
  if (v === null || String(v).trim() === '') return 'NIL';
  return String(v);
}
function yesClass(field) { return val(field) === 'Yes' ? 'yes-marked' : ''; }
function noClass(field)  { return val(field) === 'No'  ? 'no-marked'  : ''; }
// Tally FILE_UPLOAD: live webhook returns [{url,name,mimeType}], test payload may be a bare string/data-URI
function fileUrl(field) {
  var v = val(field);
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v[0]) return v[0].url || '';
  if (typeof v === 'object' && v.url) return v.url;
  return '';
}

// Age + birthday formatted (Asia/Singapore UTC+8)
const birthdayStr = val('question_xZP709') || '';
let age = '';
let BIRTHDAY = '';
if (birthdayStr) {
  const parts = birthdayStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  BIRTHDAY = String(parseInt(parts[2])).padStart(2,'0') + ' ' + months[parseInt(parts[1])-1] + ' ' + parts[0];
  const bDate = new Date(birthdayStr + 'T00:00:00+08:00');
  age = Math.floor((Date.now() - bDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

// Helper Status — Tally CHECKBOXES sends a comma-separated string e.g. "Fresh,Ex Singapore"
const rawStatus = val('question_rEdQ0L');
const statusArray = rawStatus
  ? String(rawStatus).split(',').map(function(s) { return s.trim(); }).filter(Boolean)
  : [];
const statusOrder = ['Ex Singapore', 'Now In Singapore', 'Ex Malaysia', 'Ex Hong Kong', 'Ex Taiwan', 'Ex Middle East', 'Fresh'];
statusArray.sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));
const HELPER_STATUS = statusArray.map(function(s) { return s.toUpperCase(); }).join(', ');

// Category mapping: highest-priority status drives the Sanity category
function mapCategory(arr) {
  var m = {
    'Ex Singapore':    'ex-singapore',
    'Now In Singapore':'now-in-singapore',
    'Ex Malaysia':     'ex-abroad',
    'Ex Hong Kong':    'ex-abroad',
    'Ex Taiwan':       'ex-abroad',
    'Ex Middle East':  'ex-abroad',
    'Fresh':           'fresh-helpers'
  };
  return (arr[0] && m[arr[0]]) || 'fresh-helpers';
}

// Work experience blocks (employers 1-10, skip if country is null)
const employerFields = [
  {country:'question_xZP79E',race:'question_ZJzAPA',houseType:'question_N0Jx8N',numMaids:'question_qPKqj8',numAdults:'question_Q0Jq8l',numKidsAges:'question_9lEY2K',dailyLanguage:'question_eE7G9J',jobScope:'question_W0M6lL',workLength:'question_aGD1ZW',reason:'question_6xOYro'},
  {country:'question_7ZVY46',race:'question_bO8MN0',houseType:'question_A8qYWo',numMaids:'question_BBQYA4',numAdults:'question_kZ74Kd',numKidsAges:'question_v2OaEX',dailyLanguage:'question_K0J4vz',jobScope:'question_L0Jjvz',workLength:'question_pV7NRy',reason:'question_1EJYD4'},
  {country:'question_M5J2vE',race:'question_J0JrXz',houseType:'question_g47VYM',numMaids:'question_yDEbj6',numAdults:'question_XqM71e',numKidsAges:'question_8ePYAk',dailyLanguage:'question_0PJY1P',jobScope:'question_zerA2Z',workLength:'question_52GY8v',reason:'question_dPDoKD'},
  {country:'question_YdMbpz',race:'question_DeJoAX',houseType:'question_lR7jKV',numMaids:'question_RLJQvv',numAdults:'question_oO7ZK5',numKidsAges:'question_G0JVXQ',dailyLanguage:'question_O0JZdk',jobScope:'question_V8MavN',workLength:'question_P0XNvP',reason:'question_E0JGvA'},
  {country:'question_rEdQGp',race:'question_4joYAd',houseType:'question_jx7r5Y',numMaids:'question_2rJY1g',numAdults:'question_xZP74E',numKidsAges:'question_ZJzAvA',dailyLanguage:'question_N0JxMN',jobScope:'question_qPKqo8',workLength:'question_Q0Jqvl',reason:'question_9lEYpK'},
  {country:'question_eE7GKJ',race:'question_W0M6DL',houseType:'question_aGD1KW',numMaids:'question_6xOYAo',numAdults:'question_7ZVY16',numKidsAges:'question_bO8MK0',dailyLanguage:'question_A8qYAo',jobScope:'question_BBQYj4',workLength:'question_kZ74Jd',reason:'question_v2OaJX'},
  {country:'question_K0J4Wz',race:'question_L0Jjaz',houseType:'question_pV7NJy',numMaids:'question_1EJYN4',numAdults:'question_M5J26E',numKidsAges:'question_J0Jrez',dailyLanguage:'question_g47VJM',jobScope:'question_yDEbo6',workLength:'question_XqM78e',reason:'question_8ePY6k'},
  {country:'question_0PJYZP',race:'question_zerAGZ',houseType:'question_52GYev',numMaids:'question_dPDo8D',numAdults:'question_YdMbJz',numKidsAges:'question_DeJoxX',dailyLanguage:'question_lR7jYV',jobScope:'question_RLJQbv',workLength:'question_oO7Z55',reason:'question_G0JVqQ'},
  {country:'question_O0JZbk',race:'question_V8MabN',houseType:'question_P0XNbP',numMaids:'question_E0JGZA',numAdults:'question_rEdQJp',numKidsAges:'question_4joY9d',dailyLanguage:'question_jx7rJY',jobScope:'question_2rJYlg',workLength:'question_xZP7RE',reason:'question_RLJQbQ'},
  {country:'question_oO7Z5N',race:'question_G0JVqO',houseType:'question_O0JZbM',numMaids:'question_V8Mab6',numAdults:'question_P0XNbx',numKidsAges:'question_E0JGZ2',dailyLanguage:'question_rEdQJX',jobScope:'question_4joY95',workLength:'question_jx7rJ1',reason:'question_2rJYlM'},
];

let WORK_EXPERIENCE_BLOCKS = '';
employerFields.forEach(function(emp, i) {
  if (!val(emp.country)) return;
  WORK_EXPERIENCE_BLOCKS +=
    '<div class="employer-block">' +
    '<div class="employer-title">Employer ' + (i + 1) + '</div>' +
    '<table class="employer-table">' +
    '<tr><td class="label">Country</td><td>'                   + (val(emp.country)       || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Race</td><td>'                      + (val(emp.race)          || 'NIL') + '</td></tr>' +
    '<tr><td class="label">House Type</td><td>'                + (val(emp.houseType)     || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Number of Maids</td><td>'           + (val(emp.numMaids)      || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Number of Adults</td><td>'          + (val(emp.numAdults)     || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Number of Kids and Ages</td><td>'   + (val(emp.numKidsAges)   || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Daily Language</td><td>'            + (val(emp.dailyLanguage) || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Job Scope</td><td>'                 + (val(emp.jobScope)      || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Work Length</td><td>'               + (val(emp.workLength)    || 'NIL') + '</td></tr>' +
    '<tr><td class="label">Reason of Not Continuing</td><td>'  + (val(emp.reason)        || 'NIL') + '</td></tr>' +
    '</table></div>';
});

// SG record URL (plain — template renders the <img> tag directly)

// Next birthday (first occurrence on or after tomorrow, formatted as YYYY-MM-DD)
const pad = n => String(n).padStart(2, '0');
let NEXT_BIRTHDAY = '';
let NEXT_BIRTHDAY_PLUS_ONE = '';
if (birthdayStr) {
  const bParts = birthdayStr.split('-');
  const bMonth = parseInt(bParts[1]) - 1;
  const bDay   = parseInt(bParts[2]);
  const today  = new Date();
  let nextBD   = new Date(today.getFullYear(), bMonth, bDay);
  if (nextBD <= today) nextBD = new Date(today.getFullYear() + 1, bMonth, bDay);
  NEXT_BIRTHDAY = nextBD.getFullYear() + '-' + pad(nextBD.getMonth() + 1) + '-' + pad(nextBD.getDate());
  const endDay  = new Date(nextBD); endDay.setDate(endDay.getDate() + 1);
  NEXT_BIRTHDAY_PLUS_ONE = endDay.getFullYear() + '-' + pad(endDay.getMonth() + 1) + '-' + pad(endDay.getDate());
}

const parsed = {
  FULL_NAME:              (val('question_4joY1o') || '').toUpperCase(),
  HELPER_STATUS:          HELPER_STATUS,
  FIN_NUMBER:             text('question_jx7r09'),
  NATIONALITY:            text('question_2rJYbb'),
  BIRTHDAY:               BIRTHDAY,
  AGE:                    age,
  HEIGHT_CM:              text('question_ZJzAGv'),
  WEIGHT_KG:              text('question_N0Jx4b'),
  ORIGIN_CITY:            text('question_qPKqYk'),
  HOME_ADDRESS:           text('question_Q0Jqxk'),
  NEAREST_AIRPORT:        text('question_9lEY64'),
  RELIGION:               text('question_eE7GNo'),
  EDUCATION:              text('question_W0M6eQ'),
  MARITAL_STATUS:         text('question_aGD1jy'),
  NUM_KIDS:               text('question_6xOY15'),
  KIDS_AGES:              text('question_7ZVYJz'),
  KIDS_CARETAKER:         text('question_bO8M2E'),
  PHOTO_URL:              fileUrl('question_A8qY6N'),
  ALLERGIES:              text('question_BBQYLY'),
  MENTAL_YES_CLASS:       yesClass('question_2rJdYe'),
  MENTAL_NO_CLASS:        noClass('question_2rJdYe'),
  EPILEPSY_YES_CLASS:     yesClass('question_xZPb7d'),
  EPILEPSY_NO_CLASS:      noClass('question_xZPb7d'),
  ASTHMA_YES_CLASS:       yesClass('question_8ePDbz'),
  ASTHMA_NO_CLASS:        noClass('question_8ePDbz'),
  DIABETES_YES_CLASS:     yesClass('question_0PJ0qB'),
  DIABETES_NO_CLASS:      noClass('question_0PJ0qB'),
  HYPERTENSION_YES_CLASS: yesClass('question_zerB8M'),
  HYPERTENSION_NO_CLASS:  noClass('question_zerB8M'),
  TBC_YES_CLASS:          yesClass('question_52G0aZ'),
  TBC_NO_CLASS:           noClass('question_52G0aZ'),
  HEART_YES_CLASS:        yesClass('question_dPDGJd'),
  HEART_NO_CLASS:         noClass('question_dPDGJd'),
  MALARIA_YES_CLASS:      yesClass('question_YdMB7W'),
  MALARIA_NO_CLASS:       noClass('question_YdMB7W'),
  OPERASI_YES_CLASS:      yesClass('question_DeJORN'),
  OPERASI_NO_CLASS:       noClass('question_DeJORN'),
  OTHER_CONDITIONS:       text('question_yDEb0W'),
  PREFERRED_SALARY:       text('question_XqM7RV'),
  OFF_DAYS:               text('question_8ePYjo'),
  OK_ANIMALS:             text('question_lR728N'),
  OK_BIG_HOUSE:           text('question_RLJeq4'),
  OK_COOK_PORK:           text('question_oO7N8O'),
  CAN_EAT_PORK:           text('question_G0JEOL'),
  SHOLAT_PREFERENCE:      text('question_O0JqxY'),
  BABY_CARE_WILLING:      text('question_V8M7WM'),
  BABY_CARE_EXPERIENCE:   text('question_lR7jV6'),
  BABY_CARE_REMARKS:      text('question_RLJQ8P'),
  KIDS_CARE_WILLING:      text('question_P0XQZB'),
  KIDS_CARE_EXPERIENCE:   text('question_G0JVYz'),
  KIDS_CARE_REMARKS:      text('question_O0JZ8A'),
  ELDERLY_CARE_WILLING:   text('question_P0XQJe'),
  ELDERLY_CARE_EXPERIENCE:text('question_P0XN80'),
  ELDERLY_CARE_REMARKS:   text('question_E0JG8L'),
  DISABLED_CARE_WILLING:  text('question_E0JVoB'),
  DISABLED_CARE_EXPERIENCE:text('question_4joYPo'),
  DISABLED_CARE_REMARKS:  text('question_jx7rG9'),
  HOUSEWORK_WILLING:      text('question_rEd982'),
  HOUSEWORK_EXPERIENCE:   text('question_xZP799'),
  HOUSEWORK_REMARKS:      text('question_RLJQ8v'),
  COOKING_WILLING:        text('question_4jo0lA'),
  COOKING_EXPERIENCE:     text('question_G0JVYQ'),
  COOKING_REMARKS:        text('question_O0JZ8k'),
  COOK_PORK_WILLING:      text('question_jx748J'),
  COOK_PORK_EXPERIENCE:   text('question_P0XN8P'),
  COOK_PORK_REMARKS:      text('question_E0JG8A'),
  PETS_WILLING:           text('question_2rJd9D'),
  PETS_EXPERIENCE:        text('question_4joYPd'),
  PETS_REMARKS:           text('question_jx7rGY'),
  OTHER_SKILLS:           text('question_2rJYOg'),
  WORK_EXPERIENCE_BLOCKS: WORK_EXPERIENCE_BLOCKS,
  SINGAPORE_RECORD_URL:   fileUrl('question_Q0Jlj8'),
  // Fields used by Sanity document creation (not template placeholders)
  full_name:              (val('question_4joY1o') || '').toUpperCase(),
  category:               mapCategory(statusArray),
  summary_salary:         String(val('question_XqM7RV') || ''),
  summary_off_days:       String(val('question_8ePYjo') || ''),
  NEXT_BIRTHDAY:          NEXT_BIRTHDAY,
  NEXT_BIRTHDAY_PLUS_ONE: NEXT_BIRTHDAY_PLUS_ONE,
  summary_skills: (function() {
    var skills = [];
    if (val('question_V8M7WM') === 'Yes') skills.push('Infant Care');
    if (val('question_P0XQZB') === 'Yes') skills.push('Childcare');
    if (val('question_P0XQJe') === 'Yes') skills.push('Elderly Care');
    if (val('question_E0JVoB') === 'Yes') skills.push('Disabled Care');
    if (val('question_rEd982') === 'Yes') skills.push('Housework');
    if (val('question_4jo0lA') === 'Yes') skills.push('Cooking');
    if (val('question_2rJd9D') === 'Yes') skills.push('Pet Care');
    var other = val('question_2rJYOg');
    if (other && other !== 'NIL') skills.push(other);
    return skills;
  })(),
};
return [{ json: parsed }];
`;

const parsePayloadNode = {
  id: uid(),
  name: 'Parse Payload',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [480, 300],
  parameters: { jsCode: parsePayloadCode, mode: 'runOnceForAllItems' },
};

// ─── NODE 3: Fill Template ────────────────────────────────────────────────────
// JSON.stringify(htmlTemplate) is evaluated NOW (build time), safely embedding
// the full HTML template as a valid JS string literal inside the Code node.
const fillTemplateCode = `
// Fills every {{PLACEHOLDER}} in the biodata HTML template
const TEMPLATE = ${JSON.stringify(htmlTemplate)};
const data = $input.first().json;
let html = TEMPLATE;
const keys = Object.keys(data);
for (let i = 0; i < keys.length; i++) {
  const key = keys[i];
  const placeholder = '{{' + key + '}}';
  const value = (data[key] === null || data[key] === undefined) ? '' : String(data[key]);
  html = html.split(placeholder).join(value);
}
// Clean up any remaining unfilled tokens
html = html.replace(/\\{\\{[^}]+\\}\\}/g, '');
return [{ json: { html_content: html } }];
`;

const fillTemplateNode = {
  id: uid(),
  name: 'Fill Template',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [720, 300],
  parameters: { jsCode: fillTemplateCode, mode: 'runOnceForAllItems' },
};

// ─── NODE 4: HTML to PDF (PDFShift) ──────────────────────────────────────────
const htmlToPdfNode = {
  id: uid(),
  name: 'HTML to PDF',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [960, 300],
  parameters: {
    method: 'POST',
    url: 'https://api.pdfshift.io/v3/convert/pdf',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpBasicAuth',
    sendBody: true,
    contentType: 'json',
    bodyParameters: {
      parameters: [
        { name: 'source', value: '={{ $json.html_content }}' },
        { name: 'format', value: 'A4' },
        { name: 'margin', value: '20mm' },
      ],
    },
    options: {
      response: {
        response: {
          responseFormat: 'file',
          outputPropertyName: 'biodata',
        },
      },
    },
  },
  credentials: {
    httpBasicAuth: { id: 'PDFShift API', name: 'PDFShift API' },
  },
};

// ─── NODE 5: Upload PDF to Sanity ─────────────────────────────────────────────
// Sends the biodata binary (from HTML to PDF) as a raw file upload to Sanity.
// n8n uses the binary's mimeType (application/pdf) as the Content-Type header.
// Response: { document: { _id: "file-hash-pdf", url: "..." } }
const uploadPdfNode = {
  id: uid(),
  name: 'Upload PDF to Sanity',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [1200, 300],
  parameters: {
    method: 'POST',
    url: 'https://titlisnw.api.sanity.io/v2024-06-22/assets/files/production',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpHeaderAuth',
    sendBody: true,
    contentType: 'binaryData',
    inputDataFieldName: 'biodata',
    options: {
      response: {
        response: {
          responseFormat: 'json',
        },
      },
    },
  },
  credentials: {
    httpHeaderAuth: { id: 'Sanity API', name: 'Sanity API' },
  },
};

// ─── NODE 6: Create Helper Document in Sanity ─────────────────────────────────
// Stub document: name, age, nationality, category, biodataPDF reference.
// Mom fills photo, skills, salary, languages manually in Sanity Studio.
const createHelperMutationExpr =
  "={{ JSON.stringify({ mutations: [{ create: { _type: \"helper\", name: $('Parse Payload').first().json.FULL_NAME, age: $('Parse Payload').first().json.AGE, nationality: $('Parse Payload').first().json.NATIONALITY, category: $('Parse Payload').first().json.category, skills: $('Parse Payload').first().json.summary_skills, salary: $('Parse Payload').first().json.summary_salary, offDays: $('Parse Payload').first().json.summary_off_days, biodataPDF: { _type: \"file\", asset: { _type: \"reference\", _ref: $('Upload PDF to Sanity').first().json.document._id } } } }] }) }}";

const createHelperNode = {
  id: uid(),
  name: 'Create Helper Document',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [1440, 300],
  parameters: {
    method: 'POST',
    url: 'https://titlisnw.api.sanity.io/v2024-06-22/data/mutate/production',
    authentication: 'genericCredentialType',
    genericAuthType: 'httpHeaderAuth',
    sendBody: true,
    contentType: 'raw',
    rawContentType: 'application/json',
    body: createHelperMutationExpr,
    options: {},
  },
  credentials: {
    httpHeaderAuth: { id: 'Sanity API', name: 'Sanity API' },
  },
};

// ─── NODE 7: Create Birthday Event (Google Calendar) ─────────────────────────
const birthdayEventBody =
  "={{ JSON.stringify({ summary: \"🎂 \" + $('Parse Payload').first().json.FULL_NAME + \" Birthday\", start: { date: $('Parse Payload').first().json.NEXT_BIRTHDAY }, end: { date: $('Parse Payload').first().json.NEXT_BIRTHDAY_PLUS_ONE }, recurrence: [\"RRULE:FREQ=YEARLY\"], reminders: { useDefault: false, overrides: [{ method: \"popup\", minutes: 1440 }] } }) }}";

const birthdayEventNode = {
  id: uid(),
  name: 'Create Birthday Event',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [1680, 300],
  parameters: {
    method: 'POST',
    url: 'https://www.googleapis.com/calendar/v3/calendars/YOUR_GMAIL_HERE/events',
    authentication: 'predefinedCredentialType',
    nodeCredentialType: 'googleApi',
    sendBody: true,
    contentType: 'raw',
    rawContentType: 'application/json',
    body: birthdayEventBody,
    options: {},
  },
  credentials: {
    googleApi: { id: 'Wilnor Google Calendar', name: 'Wilnor Google Calendar' },
  },
};

// ─── CONNECTIONS ──────────────────────────────────────────────────────────────
const connections = {
  'Tally Trigger':          { main: [[{ node: 'Parse Payload',          type: 'main', index: 0 }]] },
  'Parse Payload':          { main: [[{ node: 'Fill Template',          type: 'main', index: 0 }]] },
  'Fill Template':          { main: [[{ node: 'HTML to PDF',            type: 'main', index: 0 }]] },
  'HTML to PDF':            { main: [[{ node: 'Upload PDF to Sanity',   type: 'main', index: 0 }]] },
  'Upload PDF to Sanity':   { main: [[{ node: 'Create Helper Document', type: 'main', index: 0 }]] },
  'Create Helper Document': { main: [[{ node: 'Create Birthday Event',  type: 'main', index: 0 }]] },
};

// ─── ASSEMBLE & WRITE ─────────────────────────────────────────────────────────
const workflow = {
  name: 'Maid Biodata Automation',
  nodes: [
    tallyTriggerNode,
    parsePayloadNode,
    fillTemplateNode,
    htmlToPdfNode,
    uploadPdfNode,
    createHelperNode,
    birthdayEventNode,
  ],
  connections,
  active: false,
  settings: { executionOrder: 'v1' },
  versionId: uid(),
};

fs.writeFileSync('./n8n-biodata-workflow.json', JSON.stringify(workflow, null, 2));
console.log('Workflow JSON written to n8n-biodata-workflow.json');
