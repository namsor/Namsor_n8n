# Namsor for n8n

AI‑powered name analysis in your n8n workflows: predict gender, origin, ethnicity/diaspora, US race/ethnicity, split full names, and Indian caste groups.

## Authentication

- Add credentials “Namsor API” and paste your API key from https://namsor.app/my-account/
- The integration sends `X-API-KEY` on every request.

## Classic vs Geo Endpoints

- For Gender (Name, Full Name) and Split Full Names, the node switches automatically:
  - Without `countryIso2` → classic endpoints
  - With `countryIso2` set on any entry → geo endpoints

## Operations

- Ethnicity (Diaspora) by Name
  - Endpoint: `POST /api2/json/diasporaBatch`
  - Input: collection of entries with `lastName` (required), `firstName` (optional), `countryIso2` (optional)
  - Output: `script`, `firstName`, `lastName`, `countryIso2`, `ethnicity`..`ethnicity5`, `probabilityCalibrated`

- Gender by Name
  - Endpoint: classic `genderBatch` or geo `genderGeoBatch`
  - Input: entries with `firstName` (required), `lastName` (optional), `countryIso2` (optional)
  - Output: `script`, `firstName`, `lastName`, `likelyGender`, `probabilityCalibrated`

- Gender by Full Name
  - Endpoint: classic `genderFullBatch` or geo `genderFullGeoBatch`
  - Input: entries with `name` (required), `countryIso2` (optional)
  - Output: `script`, `name`, `likelyGender`, `probabilityCalibrated`

- Split Full Names
  - Endpoint: classic `parseNameBatch` or geo `parseNameGeoBatch`
  - Input: entries with `name` (required), `countryIso2` (optional)
  - Output: `script`, `name`, `countryIso2`, `firstName`, `lastName`

- Origin by Name
  - Endpoint: `originBatch`
  - Input: entries with `firstName` (optional), `lastName` (optional) — at least one required
  - Output: `script`, `firstName`, `lastName`, `countryOrigin`..`countryOrigin5`, `regionOrigin`, `subRegionOrigin`, `probabilityCalibrated`

- Origin by Full Name
  - Endpoint: `originFullBatch`
  - Input: entries with `name` (required)
  - Output: `script`, `name`, `countryOrigin`..`countryOrigin5`, `regionOrigin`, `subRegionOrigin`, `probabilityCalibrated`

- US Race/Ethnicity by Name
  - Endpoint: `usRaceEthnicityBatch` with header `X-OPTION-USRACEETHNICITY-TAXONOMY: USRACEETHNICITY-6CLASSES`
  - Input: entries with `firstName` (optional), `lastName` (optional), `countryIso2` (optional) — at least one of first/last required
  - Output: `script`, `firstName`, `lastName`, `countryIso2`, `ethnicity`..`ethnicity6`, `probabilityCalibrated`

- US Race/Ethnicity by Full Name
  - Endpoint: `usRaceEthnicityFullBatch` with taxonomy header
  - Input: entries with `name` (required), `countryIso2` (optional)
  - Output: `script`, `name`, `countryIso2`, `ethnicity`..`ethnicity6`, `probabilityCalibrated`

- Indian Caste by Name
  - Endpoint: `castegroupIndianBatch`
  - Input: entries with `firstName` (required), `lastName` (required), `subdivisionIso` (required)
  - Output: `script`, `firstName`, `lastName`, `subdivisionIso`, `castegroup`..`castegroup5`, `probabilityCalibrated`

- Indian Caste by Full Name
  - Endpoint: `castegroupIndianFullBatch`
  - Input: entries with `name` (required), `subdivisionIso` (required)
  - Output: `script`, `name`, `subdivisionIso`, `castegroup`..`castegroup5`, `probabilityCalibrated`

## Country and Subdivision Dropdowns

- `countryIso2` uses a full ISO 3166‑1 list (value = code)
- `subdivisionIso` uses ISO 3166‑2:IN list (value = code)

## Install for Development

- Install dependencies: `npm install`
- Build: `npm run build`
- Install into n8n runtime: `npm install /path/to/this/folder`
- Restart n8n and add the “Namsor” node

## Project Structure

- `src/credentials/NamsorApi.credentials.ts` — API Key auth (`X-API-KEY`)
- `src/nodes/Namsor/Namsor.node.ts` — All operations and mappings
- `src/nodes/Namsor/GenericFunctions.ts` — Request helper (+ optional headers)
- `src/options/countries.ts` — Country dropdown options
- `src/options/indiaSubdivisions.ts` — India subdivision dropdown options

## Notes

- Batch size up to 200 entries per request (per API limits)
- Confidence fields are in range 0–1; lower scores indicate ambiguous names
