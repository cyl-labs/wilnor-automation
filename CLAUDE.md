# Wilnor — n8n Automation Project

This repo contains n8n workflow JSON files and supporting scripts for a maid agency (Wilnor) in Singapore.

## Project overview

Two main workflows:

### 1. Contract Generator (`n8n-contract-workflow.json`)
Triggered by a webhook POST `{ "row": N }`. Reads row N from a Google Sheet, copies 3 Google Doc templates, fills them with data via Docs API batchUpdate, exports each as PDF, and sends to DocuSeal for e-signing.

**Flow:**
```
Webhook → Read Sheet → Pick Row → Build Replacements
  → Copy SA → Fill SA
  → Copy Safety → Fill Safety
  → Copy EC → Fill EC
  → Export SA PDF → Sign SA (DocuSeal POST /submissions/pdf)
  → Export Safety PDF → Sign Safety (DocuSeal POST /submissions/pdf)  ← Safety/EC still use old 2-step (upload template, then submit)
  → Export EC PDF → Sign EC
  → Write Back (mark "Contract Created" = yes in sheet)
  → Send Notification (Gmail)
```

**Current state (as of 2026-06-01):**
- SA already uses `POST /submissions/pdf` (inline PDF, single step)
- Safety and EC still use the old 2-step: `POST /api/templates` then `POST /api/submissions`
- **Next step:** Update Safety and EC to use `POST /submissions/pdf` like SA
- **Pre-req:** Add `{{Signature;role=Employer;type=signature}}` DocuSeal text tag to each of the 3 Google Doc templates at the employer signature line — this lets DocuSeal auto-place the signature field from the tag without needing coordinate mapping

**Google Doc Template IDs:**
- Service Agreement (SA): `1XKvdaUJIjAVKr_ZlAqVokLNJLZzZ23w2w4dBc5cZjvM`
- Safety Agreement: `1fBnLlN3r2oWUZk4FHeQHWEHKhzm2w8wSpx8foA5aZ2M`
- Employment Contract (EC): `19RNlwnaPo3IGMh2mXNk5K97o1MCJ-lG8cCXLrRODMn4`

**Google Sheets ID:** `150FbUAyIg_Lid4WiBn-Fk8jZk55oc0b5cyfIbpogxfw` (sheet: "Form Responses 1")

**Drive output folder:** `1exoPi9K0SInFjzf7U16w_cbsttY3zJpw`

**Credentials in n8n:**
- `Google Drive OAuth2 API` (id: `416DOTjrBY8KBw3p`) — Drive copy/export and Docs batchUpdate
- `Wilnor Sheets API` (id: `hJIK4knNVdFbbeYJ`) — Google Sheets service account
- `Gmail Account` (id: `GMAIL_CREDENTIAL_ID`) — notification email (placeholder, needs real id)
- DocuSeal: `https://sign.cyllabs.com`, token `u76oZg21N8tvAJYJCpVFu9yYMvS57fsbZajFkktp8Ls`

**Template placeholders** (filled via Docs batchUpdate):
`{{DATE}}`, `{{EMPLOYERNAME}}`, `{{NRIC}}`, `{{ADDRESS}}`, `{{AGENCYFEE}}`, `{{LOAN}}`, `{{SERVICE}}`, `{{MAIDNAME}}`, `{{BASIC}}`, `{{OFF}}`, `{{SALARY}}`, `{{PASSPORT}}`, `{{PHONE}}`, `{{WP}}`, `{{SALARYDATE}}`, `{{COMPENSATION}}`, `{{REPATRIATION}}`, `{{COUNTRY}}`

DocuSeal text tags (e.g. `{{Signature;role=Employer;type=signature}}`) are intentionally NOT in the replacements list — they must pass through untouched to the PDF so DocuSeal can render them as signature fields.

### 2. Biodata Generator (`n8n-biodata-workflow.json`)
Triggered by Tally form webhook. Parses payload, fills an HTML template, converts to PDF via PDFShift, uploads to Google Drive and Sanity CMS.

**Flow:** Tally Trigger → Parse Payload → Fill Template → HTML to PDF (PDFShift) → Upload to Drive → Create Sanity helper document stub

**Key files:**
- `build-workflow.js` — Node.js script that generates `n8n-biodata-workflow.json`; run with `node build-workflow.js`
- `biodata-template.html` — HTML template with `{{PLACEHOLDER}}` tokens
- `field-mapping.md` — Tally question IDs → placeholder mapping (source of truth)
- `sample-payload.json` — captured Tally webhook payload for reference

**Credentials:**
- `PDFShift API` — HTTP Basic Auth
- `Sanity API` — HTTP Header Auth (`Authorization: Bearer ...`)

## Other files
- `generate-contracts.html` — HTML form that POSTs to the contract webhook (triggers a row)
- `delete-calendar-events.js` — one-off script for cleaning up calendar events
- `n8n-birthday-reminder-workflow.json`, `n8n-birthday-sheet-workflow.json` — separate birthday automation workflows
