# Maid Biodata Automation — n8n Workflow

Tally form submission → parsed PDF biodata → Sanity CMS helper document.

## Files

| File | Purpose |
|---|---|
| `build-workflow.js` | Node.js script that generates the n8n workflow JSON |
| `n8n-biodata-workflow.json` | Generated workflow — import this into n8n |
| `biodata-template.html` | HTML template with `{{PLACEHOLDER}}` tokens |
| `field-mapping.md` | Source of truth: Tally field IDs → template placeholders |
| `sample-payload.json` | Captured Tally webhook payload for reference |

## Setup

### 1. Rebuild the workflow JSON (if you change the template or field mapping)
```bash
node build-workflow.js
```

### 2. Import into n8n
Settings → Workflows → Import from File → select `n8n-biodata-workflow.json`.

### 3. Credentials required (create these in n8n before activating)

| Credential name (exact) | Type | Used by |
|---|---|---|
| `PDFShift API` | HTTP Basic Auth | HTML to PDF node |
| `Sanity API` | HTTP Header Auth — header: `Authorization`, value: `Bearer YOUR_TOKEN` | Upload PDF to Sanity, Create Helper Document |

### 4. Connect your Tally form
- In the Tally Trigger node, copy the webhook URL
- In Tally form settings → Integrations → Webhooks, paste it

## Workflow nodes

```
Tally Trigger
    ↓
Parse Payload          — maps all question_XXX fields, computes age, yes/no classes,
                         employer blocks HTML, SG record URL, Sanity category slug
    ↓
Fill Template          — replaces every {{PLACEHOLDER}} in biodata-template.html
    ↓
HTML to PDF            — PDFShift API, A4, 20mm margin → binary: biodata
    ↓
Upload PDF to Sanity   — POST binary to Sanity files asset endpoint
                         → response: { document: { _id: "file-..." } }
    ↓
Create Helper Document — POST stub mutation to Sanity:
                         name, age, nationality, category, biodataPDF reference
                         Mom fills photo / skills / salary / languages in Sanity Studio
```

## What Sanity gets (stub document)

```json
{
  "_type": "helper",
  "name": "MARIA SANTOS",
  "age": 26,
  "nationality": "Filipino",
  "category": "fresh-helpers",
  "biodataPDF": {
    "_type": "file",
    "asset": { "_type": "reference", "_ref": "file-abc123-pdf" }
  }
}
```

Mom completes the rest (photo, skills, salary, off days, languages) directly in Sanity Studio.

## Sanity category values

| Tally "Helper Status" | Sanity `category` |
|---|---|
| Fresh | `fresh-helpers` |
| Ex Singapore | `ex-singapore` |
| Ex Malaysia | `ex-abroad` |
| Ex Hong Kong | `ex-abroad` |
| Ex Taiwan | `ex-abroad` |
| Ex Middle East | `ex-abroad` |

`now-in-singapore` is set manually in Sanity Studio after the helper arrives — n8n never writes it.

## TODOs (v2)

- **Google Calendar**: add a Google Calendar node after Create Helper Document to create a yearly birthday reminder (RRULE `FREQ=YEARLY`, popup 1440 min before).
- **Photo upload**: add Download Helper Photo + Upload Photo to Sanity nodes once photo field IDs are confirmed, then include `photo` reference in the mutation.
