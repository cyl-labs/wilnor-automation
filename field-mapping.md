# Tally → HTML Template Field Mapping

This is the source of truth for mapping Tally webhook fields to template placeholders. Every entry maps one Tally `question_XXX` ID to one placeholder in `biodata-template.html`.

## Section 1: Profile

| Tally Field ID | Label | Placeholder | Notes |
|---|---|---|---|
| `question_rEdQ0L` | Helper Status | `{{HELPER_STATUS}}` | Convert to uppercase. Options: Fresh, Ex Singapore, Ex Malaysia, Ex Hong Kong, Ex Taiwan, Ex Middle East |
| `question_4joY1o` | Full name | `{{FULL_NAME}}` | Convert to uppercase |
| `question_jx7r09` | FIN Number | `{{FIN_NUMBER}}` | |
| `question_2rJYbb` | Nationality | `{{NATIONALITY}}` | |
| `question_xZP709` | Birthday | `{{BIRTHDAY}}` | Format YYYY-MM-DD → "09 Dec 1980" |
| (computed) | Age | `{{AGE}}` | Calculate from birthday. `floor((today - birthday) / 365.25)` |
| `question_ZJzAGv` | Height in CM | `{{HEIGHT_CM}}` | |
| `question_N0Jx4b` | Weight in KG | `{{WEIGHT_KG}}` | |
| `question_qPKqYk` | Origin/City | `{{ORIGIN_CITY}}` | |
| `question_Q0Jqxk` | Home Address | `{{HOME_ADDRESS}}` | |
| `question_9lEY64` | Nearest Airport | `{{NEAREST_AIRPORT}}` | |
| `question_eE7GNo` | Religion | `{{RELIGION}}` | |
| `question_W0M6eQ` | Education | `{{EDUCATION}}` | |
| `question_aGD1jy` | Marital Status | `{{MARITAL_STATUS}}` | |
| `question_6xOY15` | Number of Kids | `{{NUM_KIDS}}` | |
| `question_7ZVYJz` | Kids Ages | `{{KIDS_AGES}}` | |
| `question_bO8M2E` | Who Takes Care of Kids | `{{KIDS_CARETAKER}}` | |
| `question_A8qY6N` | Photo | `{{PHOTO_URL}}` | Tally signed URL — fetch and re-host OR use directly |

## Section 2: Health Declaration

| Tally Field ID | Label | Placeholder Pair | Logic |
|---|---|---|---|
| `question_BBQYLY` | Allergies | `{{ALLERGIES}}` | Free text |
| `question_2rJdYe` | Mental Illness | `{{MENTAL_YES_CLASS}}` / `{{MENTAL_NO_CLASS}}` | If value="Yes" → first = "yes-marked", second = "". If value="No" → first = "", second = "no-marked" |
| `question_xZPb7d` | Epilepsey | `{{EPILEPSY_YES_CLASS}}` / `{{EPILEPSY_NO_CLASS}}` | Same logic |
| `question_8ePDbz` | Asthma | `{{ASTHMA_YES_CLASS}}` / `{{ASTHMA_NO_CLASS}}` | Same logic |
| `question_0PJ0qB` | Diabetes | `{{DIABETES_YES_CLASS}}` / `{{DIABETES_NO_CLASS}}` | Same logic |
| `question_zerB8M` | Hypertension | `{{HYPERTENSION_YES_CLASS}}` / `{{HYPERTENSION_NO_CLASS}}` | Same logic |
| `question_52G0aZ` | TBC | `{{TBC_YES_CLASS}}` / `{{TBC_NO_CLASS}}` | Same logic |
| `question_dPDGJd` | Heart | `{{HEART_YES_CLASS}}` / `{{HEART_NO_CLASS}}` | Same logic |
| `question_YdMB7W` | Malaria | `{{MALARIA_YES_CLASS}}` / `{{MALARIA_NO_CLASS}}` | Same logic |
| `question_DeJORN` | Operasi | `{{OPERASI_YES_CLASS}}` / `{{OPERASI_NO_CLASS}}` | Same logic |
| `question_yDEb0W` | Other sickness | `{{OTHER_CONDITIONS}}` | Free text. If empty, show "NIL" |

## Section 3: Expectations

| Tally Field ID | Label | Placeholder |
|---|---|---|
| `question_XqM7RV` | Preferred Salary in SGD | `{{PREFERRED_SALARY}}` |
| `question_8ePYjo` | Off Days Per Month | `{{OFF_DAYS}}` |
| `question_lR728N` | OK with Animals | `{{OK_ANIMALS}}` |
| `question_RLJeq4` | OK with Big House | `{{OK_BIG_HOUSE}}` |
| `question_oO7N8O` | OK with Cooking Pork | `{{OK_COOK_PORK}}` |
| `question_G0JEOL` | Can Eat Pork | `{{CAN_EAT_PORK}}` |
| `question_O0JqxY` | Sholat Preference | `{{SHOLAT_PREFERENCE}}` |

## Section 4: Skills

| Tally Field ID | Label | Placeholder |
|---|---|---|
| `question_V8M7WM` | Baby Care — Willing? | `{{BABY_CARE_WILLING}}` |
| `question_lR7jV6` | Baby Care — Experience? | `{{BABY_CARE_EXPERIENCE}}` |
| `question_RLJQ8P` | Baby Care — Remarks | `{{BABY_CARE_REMARKS}}` |
| `question_P0XQZB` | Kids Care — Willing? | `{{KIDS_CARE_WILLING}}` |
| `question_G0JVYz` | Kids Care — Experience? | `{{KIDS_CARE_EXPERIENCE}}` |
| `question_O0JZ8A` | Kids Care — Remarks | `{{KIDS_CARE_REMARKS}}` |
| `question_P0XQJe` | Elderly Care — Willing? | `{{ELDERLY_CARE_WILLING}}` |
| `question_P0XN80` | Elderly Care — Experience? | `{{ELDERLY_CARE_EXPERIENCE}}` |
| `question_E0JG8L` | Elderly Care — Remarks | `{{ELDERLY_CARE_REMARKS}}` |
| `question_E0JVoB` | Disabled Care — Willing? | `{{DISABLED_CARE_WILLING}}` |
| `question_4joYPo` | Disabled Care — Experience? | `{{DISABLED_CARE_EXPERIENCE}}` |
| `question_jx7rG9` | Disabled Care — Remarks | `{{DISABLED_CARE_REMARKS}}` |
| `question_rEd982` | Housework — Willing? | `{{HOUSEWORK_WILLING}}` |
| `question_xZP799` | Housework — Experience? | `{{HOUSEWORK_EXPERIENCE}}` |
| `question_RLJQ8v` | Housework — Remarks | `{{HOUSEWORK_REMARKS}}` |
| `question_4jo0lA` | Cooking — Willing? | `{{COOKING_WILLING}}` |
| `question_G0JVYQ` | Cooking — Experience? | `{{COOKING_EXPERIENCE}}` |
| `question_O0JZ8k` | Cooking — Remarks | `{{COOKING_REMARKS}}` |
| `question_jx748J` | Cook Pork — Willing? | `{{COOK_PORK_WILLING}}` |
| `question_P0XN8P` | Cook Pork — Experience? | `{{COOK_PORK_EXPERIENCE}}` |
| `question_E0JG8A` | Cook Pork — Remarks | `{{COOK_PORK_REMARKS}}` |
| `question_2rJd9D` | Pets — Willing? | `{{PETS_WILLING}}` |
| `question_4joYPd` | Pets — Experience? | `{{PETS_EXPERIENCE}}` |
| `question_jx7rGY` | Pets — Remarks | `{{PETS_REMARKS}}` |
| `question_2rJYOg` | Other Skills | `{{OTHER_SKILLS}}` |

## Section 5: Work Experience (DYNAMIC — replaces `{{WORK_EXPERIENCE_BLOCKS}}`)

Employer blocks are grouped by the "Reason for Not Continuing - Employer N" anchor. Each employer has 10 fields:

**Employer 1:**
- Country: `question_xZP79E`
- Race: `question_ZJzAPA`
- House Type: `question_N0Jx8N`
- Number of Maids: `question_qPKqj8`
- Number of Adults: `question_Q0Jq8l`
- Number of Kids and Ages: `question_9lEY2K`
- Daily Language: `question_eE7G9J`
- Job Scope: `question_W0M6lL`
- Work Length: `question_aGD1ZW`
- Reason for Not Continuing: `question_6xOYro`

**Employer 2:**
- Country: `question_7ZVY46`
- Race: `question_bO8MN0`
- House Type: `question_A8qYWo`
- Number of Maids: `question_BBQYA4`
- Number of Adults: `question_kZ74Kd`
- Number of Kids and Ages: `question_v2OaEX`
- Daily Language: `question_K0J4vz`
- Job Scope: `question_L0Jjvz`
- Work Length: `question_pV7NRy`
- Reason for Not Continuing: `question_1EJYD4`

**Employer 3:**
- Country: `question_M5J2vE`
- Race: `question_J0JrXz`
- House Type: `question_g47VYM`
- Number of Maids: `question_yDEbj6`
- Number of Adults: `question_XqM71e`
- Number of Kids and Ages: `question_8ePYAk`
- Daily Language: `question_0PJY1P`
- Job Scope: `question_zerA2Z`
- Work Length: `question_52GY8v`
- Reason for Not Continuing: `question_dPDoKD`

**Employer 4:**
- Country: `question_YdMbpz`
- Race: `question_DeJoAX`
- House Type: `question_lR7jKV`
- Number of Maids: `question_RLJQvv`
- Number of Adults: `question_oO7ZK5`
- Number of Kids and Ages: `question_G0JVXQ`
- Daily Language: `question_O0JZdk`
- Job Scope: `question_V8MavN`
- Work Length: `question_P0XNvP`
- Reason for Not Continuing: `question_E0JGvA`

**Employer 5:**
- Country: `question_rEdQGp`
- Race: `question_4joYAd`
- House Type: `question_jx7r5Y`
- Number of Maids: `question_2rJY1g`
- Number of Adults: `question_xZP74E`
- Number of Kids and Ages: `question_ZJzAvA`
- Daily Language: `question_N0JxMN`
- Job Scope: `question_qPKqo8`
- Work Length: `question_Q0Jqvl`
- Reason for Not Continuing: `question_9lEYpK`

**Employer 6:**
- Country: `question_eE7GKJ`
- Race: `question_W0M6DL`
- House Type: `question_aGD1KW`
- Number of Maids: `question_6xOYAo`
- Number of Adults: `question_7ZVY16`
- Number of Kids and Ages: `question_bO8MK0`
- Daily Language: `question_A8qYAo`
- Job Scope: `question_BBQYj4`
- Work Length: `question_kZ74Jd`
- Reason for Not Continuing: `question_v2OaJX`

**Employer 7:**
- Country: `question_K0J4Wz`
- Race: `question_L0Jjaz`
- House Type: `question_pV7NJy`
- Number of Maids: `question_1EJYN4`
- Number of Adults: `question_M5J26E`
- Number of Kids and Ages: `question_J0Jrez`
- Daily Language: `question_g47VJM`
- Job Scope: `question_yDEbo6`
- Work Length: `question_XqM78e`
- Reason for Not Continuing: `question_8ePY6k`

**Employer 8:**
- Country: `question_0PJYZP`
- Race: `question_zerAGZ`
- House Type: `question_52GYev`
- Number of Maids: `question_dPDo8D`
- Number of Adults: `question_YdMbJz`
- Number of Kids and Ages: `question_DeJoxX`
- Daily Language: `question_lR7jYV`
- Job Scope: `question_RLJQbv`
- Work Length: `question_oO7Z55`
- Reason for Not Continuing: `question_G0JVqQ`

**Employer 9:**
- Country: `question_O0JZbk`
- Race: `question_V8MabN`
- House Type: `question_P0XNbP`
- Number of Maids: `question_E0JGZA`
- Number of Adults: `question_rEdQJp`
- Number of Kids and Ages: `question_4joY9d`
- Daily Language: `question_jx7rJY`
- Job Scope: `question_2rJYlg`
- Work Length: `question_xZP7RE`
- Reason for Not Continuing: `question_RLJQbQ`

**Employer 10:**
- Country: `question_oO7Z5N`
- Race: `question_G0JVqO`
- House Type: `question_O0JZbM`
- Number of Maids: `question_V8Mab6`
- Number of Adults: `question_P0XNbx`
- Number of Kids and Ages: `question_E0JGZ2`
- Daily Language: `question_rEdQJX`
- Job Scope: `question_4joY95`
- Work Length: `question_jx7rJ1`
- Reason for Not Continuing: `question_2rJYlM`

### Logic for Work Experience Rendering

For each employer block (1-10), check if "Country" field has a value (i.e. not null/empty). If yes, render the block using this template:

```html
<div class="employer-block">
  <div class="employer-title">Employer {N}</div>
  <table class="employer-table">
    <tr><td class="label">Country</td><td>{country}</td></tr>
    <tr><td class="label">Race</td><td>{race}</td></tr>
    <tr><td class="label">House Type</td><td>{house_type}</td></tr>
    <tr><td class="label">Number of Maids</td><td>{num_maids}</td></tr>
    <tr><td class="label">Number of Adults</td><td>{num_adults}</td></tr>
    <tr><td class="label">Number of Kids and Ages</td><td>{num_kids_ages}</td></tr>
    <tr><td class="label">Daily Language</td><td>{daily_language}</td></tr>
    <tr><td class="label">Job Scope</td><td>{job_scope}</td></tr>
    <tr><td class="label">Work Length</td><td>{work_length}</td></tr>
    <tr><td class="label">Reason of Not Continuing</td><td>{reason}</td></tr>
  </table>
</div>
```

Skip employer blocks where Country is null. Concatenate all rendered blocks into `{{WORK_EXPERIENCE_BLOCKS}}`.

## Singapore Record

| Tally Field ID | Label | Placeholder |
|---|---|---|
| `question_V8MO5E` | (label is null in payload — this is the Singapore Record upload) | `{{SINGAPORE_RECORD_PAGE}}` |

If file is provided:
```html
<div class="singapore-record-page">
  <div class="singapore-record-title">Singapore Employment Record</div>
  <img src="{singapore_record_url}" alt="Singapore Record">
</div>
```

If null, leave `{{SINGAPORE_RECORD_PAGE}}` as empty string.

**Note:** If the uploaded file is a PDF (not image), it cannot be inline-rendered. n8n must either (a) convert PDF to image first, or (b) append the PDF as separate pages to the final output PDF. Recommend option (b) using a PDF merge step.

## Logo

`{{LOGO_URL}}` — replace with a public URL of the Wilnor & Lavett's logo. Options:
- Upload to a public CDN (Cloudinary, Imgur)
- Host on Google Drive as a public-shareable image link
- Base64-embed inline in the HTML (best for self-contained reliability)
