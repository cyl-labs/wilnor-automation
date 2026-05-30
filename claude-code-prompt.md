# Build an n8n Workflow Builder Script

## What you're building

A Node.js script (`build-workflow.js`) that, when I run `node build-workflow.js`, outputs a fully importable n8n workflow JSON file called `n8n-biodata-workflow.json`.

**You are writing a BUILDER, not a JSON file directly.**

This is intentional. JSON.stringify() handles all escaping automatically. You don't need to manually escape anything inside the script — Node's JSON serializer does it for you.

## ASK ME WHEN STUCK — DO NOT DELIBERATE

If you face ANY of the following, **stop and ask me a direct question**. Do not loop. Do not weigh options for paragraphs. Ask.

- You're unsure which of 2+ valid approaches I want
- A library, node type, or API behavior you're uncertain about
- A field in the payload you can't map cleanly
- A decision that has trade-offs and the prompt didn't pre-pick one
- ANYTHING that's caused you to reconsider the same problem more than twice

Format your question as: `QUESTION: [single specific question, no preamble]`

Then stop and wait. I'll answer. We move on. Iteration is faster than deliberation.

If you find yourself thinking "let me consider another approach…" for the third time on the same sub-problem — STOP and ask me instead. Always.

## Pre-decisions (final, do not re-evaluate)

1. **PDF rendering**: PDFShift via HTTP Request node. Credential name: `PDFShift API`.
2. **PDF merging**: `pdf-lib` via `require('pdf-lib')` in a Code node. It IS available in n8n. Do not check.
3. **Binary property names**: HTML→PDF output = `biodata`. SG Record download = `mom_record`. Merged final = `merged_pdf`.
4. **Timezone for age calc**: Asia/Singapore.
5. **Birthday in past this year**: schedule next year's date as first event. RRULE: `FREQ=YEARLY`. Reminder: popup, 1440 minutes before.
6. **Unresolved placeholders**: replace with empty string.
7. **Drive folder**: assume "Helper Biodatas" exists. Use Google Drive Search node to find by name. If not found in execution, default to root (handle at runtime, not build time).
8. **Branching for optional Singapore Record**: ALWAYS go through Merge node. FALSE branch has a Code node that emits `{ binary: {}, json: { skip_sg_record: true } }` so Merge always has two inputs.
9. **Merge node mode**: Append (so it doesn't wait for both inputs).

If you face any decision NOT covered above and you're unsure: **ASK ME**.

## Ship-or-skip rule

**v1 ships incomplete, not perfect.** v2 ships polished.

v1 success criteria (ship these first):
- Workflow imports into n8n without errors
- Parse Payload node correctly maps Tally fields
- HTML template gets filled with values
- PDFShift generates a PDF
- Final PDF lands in Google Drive

v1 nice-to-haves (skip if hard, mark `// TODO: v2`):
- Singapore Record merging (stub: just upload biodata.pdf)
- Calendar birthday event (stub: log "TODO" to console)
- Drive folder lookup (stub: upload to root)

If something blocks v1 for more than ~3 minutes of thinking: **ASK ME** how to handle it. Don't spend tokens looking for the "right" solution.

## Token discipline

If you've reasoned about a single sub-problem for what feels like a long time:
1. Stop
2. Pick the option that's least likely to need debugging
3. Add `// TODO: revisit if this breaks` as a comment
4. Move on

You have a finite token budget. JSON file first, refinements after.

## Inputs (in this folder)

- `biodata-template.html` — HTML template with `{{PLACEHOLDER}}` tokens. The base64 logo is already embedded.
- `field-mapping.md` — Tally `question_XXX` → placeholder mapping. **Source of truth for field mapping.**
- `sample-payload.json` — captured Tally webhook payload.

## Required output files

1. **`build-workflow.js`** — the Node script that builds the workflow JSON
2. **`n8n-biodata-workflow.json`** — the actual workflow JSON (created by running the script)
3. **`README.md`** — short, only after the above two work

Run the script. Verify the JSON file exists. Then write the README.

## How to structure the builder script

```javascript
// build-workflow.js
const fs = require('fs');

// 1. Load the HTML template from disk
const htmlTemplate = fs.readFileSync('./biodata-template.html', 'utf8');

// 2. Define each n8n node as a JS object
const tallyTriggerNode = { /* ... */ };

const parsePayloadNode = {
  parameters: {
    jsCode: `
      // The parse payload code as a regular JS string (no escaping needed)
      // Use template literals freely
      const item = $input.first().json;
      // ... mapping logic ...
      return [{ json: parsed }];
    `,
    mode: 'runOnceForAllItems'
  },
  // ...
};

const fillTemplateNode = {
  parameters: {
    jsCode: `
      // Template is loaded as a constant at the top of this jsCode block
      const TEMPLATE = ${JSON.stringify(htmlTemplate)};
      // Then replace placeholders
      // ...
    `,
    mode: 'runOnceForAllItems'
  },
  // ...
};

// 3. Define connections object
const connections = { /* ... */ };

// 4. Assemble workflow object
const workflow = {
  name: 'Maid Biodata Automation',
  nodes: [tallyTriggerNode, parsePayloadNode, fillTemplateNode, /* etc */],
  connections,
  active: false,
  settings: {},
  versionId: '1'
};

// 5. Write to file — JSON.stringify handles ALL escaping for you
fs.writeFileSync('./n8n-biodata-workflow.json', JSON.stringify(workflow, null, 2));
console.log('Workflow JSON written.');
```

The critical line: `${JSON.stringify(htmlTemplate)}` — this is where escaping happens automatically. You write the HTML normally inside `biodata-template.html`, the builder script reads it as a normal string, and JSON.stringify embeds it correctly in the workflow JSON. No manual escaping anywhere.

## Workflow node sequence

```
Tally Trigger
    ↓
Parse Payload (Code)
    ↓
Fill Template (Code)
    ↓
HTML to PDF (HTTP Request → PDFShift)
    ↓
IF: Has Singapore Record?
   TRUE ↓                       ↓ FALSE
Download SG Record       Set Empty mom_record (Code)
   (HTTP Request)               ↓
       ↓                        ↓
        └─→ Merge (Append) ←───┘
                  ↓
          Merge PDFs (Code, pdf-lib)
                  ↓
          Upload to Drive (Google Drive)
                  ↓
          Create Birthday Event (Google Calendar)
```

## Code node specs (compact)

**Parse Payload** — see `field-mapping.md` for all field IDs. Output a flat object with:
- All Tally fields mapped to readable names
- `age` (SG timezone, accounts for whether birthday already passed)
- `birthday_formatted` (DD MMM YYYY)
- `helper_status` and `full_name` uppercased
- For each sickness: `{name}_yes_class` and `{name}_no_class` (rule in field-mapping.md)
- `work_experience_blocks`: HTML string built by looping employer 1-10, skipping if `country` is null
- Empty text fields default to `"NIL"`
- `singapore_record_url` (from `question_V8MO5E`, may be null)
- `photo_url` (from `question_A8qY6N`)

**Fill Template** — see the builder script structure above. Loads template via `${JSON.stringify(htmlTemplate)}`, runs `.replaceAll('{{KEY}}', value)` for every key from Parse Payload, replaces remaining `{{...}}` with empty string.

**Set Empty mom_record** (FALSE branch) — emits `[{ json: { skip_sg_record: true }, binary: {} }]`.

**Merge PDFs** — uses pdf-lib. Logic:
```javascript
const { PDFDocument } = require('pdf-lib');
const item = $input.first();

const biodataBytes = Buffer.from(item.binary.biodata.data, 'base64');
const merged = await PDFDocument.create();
const bioDoc = await PDFDocument.load(biodataBytes);
(await merged.copyPages(bioDoc, bioDoc.getPageIndices())).forEach(p => merged.addPage(p));

if (item.binary?.mom_record?.data) {
  const momBytes = Buffer.from(item.binary.mom_record.data, 'base64');
  const momDoc = await PDFDocument.load(momBytes);
  (await merged.copyPages(momDoc, momDoc.getPageIndices())).forEach(p => merged.addPage(p));
}

const out = await merged.save();
return [{
  json: { name: $('Parse Payload').first().json.full_name },
  binary: {
    merged_pdf: {
      data: Buffer.from(out).toString('base64'),
      fileName: `${$('Parse Payload').first().json.full_name}_Biodata.pdf`,
      mimeType: 'application/pdf'
    }
  }
}];
```

## HTTP Request specs

**HTML to PDF (PDFShift)**:
- POST `https://api.pdfshift.io/v3/convert/pdf`
- Auth: HTTP Basic Auth, credential `PDFShift API`
- Body (JSON): `{ "source": "={{ $json.html_content }}", "format": "A4", "margin": "20mm" }`
- Response Format: File
- Put Output in Field: `biodata`

**Download Singapore Record**:
- GET `={{ $('Parse Payload').first().json.singapore_record_url }}`
- Response Format: File
- Put Output in Field: `mom_record`

## Final notes

- All Code nodes: `mode: 'runOnceForAllItems'`
- Comments at top of every Code node explaining what it does
- IF node condition: `singapore_record_url` is not empty AND not null
- Calendar event: stub it as a Code node that logs "TODO" if the Google Calendar node config is unclear — ASK ME

## Execute now

1. Write `build-workflow.js`
2. Run it: `node build-workflow.js`
3. Verify `n8n-biodata-workflow.json` exists and is valid JSON (`node -e "JSON.parse(require('fs').readFileSync('./n8n-biodata-workflow.json'))"`)
4. Write `README.md` only after the JSON is verified

If anything is unclear: **STOP. ASK ME. DON'T DELIBERATE.**
