import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { namsorApiRequest } from './GenericFunctions';
import { countryOptions } from '../../options/countries';
import { indiaSubdivisionOptions } from '../../options/indiaSubdivisions';

export class Namsor implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Namsor',
    name: 'namsor',
    icon: 'file:namsor.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"]}}: {{$parameter["operation"]}}',
    description: 'Work with Namsor API',
    defaults: {
      name: 'Namsor',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'namsorApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        description: 'Select the feature category you want to use.',
        options: [
          { name: 'Gender', value: 'gender', description: 'Predict likely gender from a name' },
          { name: 'Origin', value: 'origin', description: 'Predict country of origin from a name' },
          { name: 'Ethnicity (Diaspora)', value: 'ethnicity', description: 'Predict ethnicity/diaspora from a name' },
          { name: 'US Race/Ethnicity', value: 'usRaceEthnicity', description: 'Predict US census race/ethnicity classes' },
          { name: 'Indian Caste', value: 'indianCaste', description: 'Predict Indian caste group from a name' },
          { name: 'Name Parsing', value: 'nameParsing', description: 'Split a full name into first and last name' },
          { name: 'Name Type Recognition', value: 'nameTypeRecognition', description: 'Identify the most likely name type (anthroponym, brand name, toponym)' }
        ],
        default: 'gender',
      },

      // Operation per resource
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['gender'] } },
        description: 'Choose how you provide the name(s) for gender prediction.',
        options: [
          { name: 'Name', value: 'name', action: 'Predict gender from name', description: 'Use first name (required) and optional last name' },
          { name: 'Full Name', value: 'fullName', action: 'Predict gender from full name', description: 'Use a single full name field' },
        ],
        default: 'name',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['origin'] } },
        description: 'Choose how you provide the name(s) for origin prediction.',
        options: [
          { name: 'Name', value: 'name', action: 'Predict origin from name', description: 'Use first and/or last name' },
          { name: 'Full Name', value: 'fullName', action: 'Predict origin from full name', description: 'Use a single full name field' },
        ],
        default: 'name',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['ethnicity'] } },
        description: 'Predict ethnicity/diaspora from first/last names.',
        options: [
          { name: 'Name', value: 'name', action: 'Predict ethnicity (diaspora) from name', description: 'Use last name (required) and optional first name' },
          { name: 'Full Name', value: 'fullName', action: 'Predict ethnicity (diaspora) from full name', description: 'Use a single full name field' },

        ],
        default: 'name',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['usRaceEthnicity'] } },
        description: 'Predict US race/ethnicity classes from names.',
        options: [
          { name: 'Name', value: 'name', action: 'Predict US race/ethnicity from name', description: 'Use first and/or last name' },
          { name: 'Full Name', value: 'fullName', action: 'Predict US race/ethnicity from full name', description: 'Use a single full name field' },
        ],
        default: 'name',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['indianCaste'] } },
        description: 'Predict Indian caste group from names.',
        options: [
          { name: 'Name', value: 'name', action: 'Predict Indian caste from name', description: 'Use first & last name plus Indian subdivision ISO code' },
          { name: 'Full Name', value: 'fullName', action: 'Predict Indian caste from full name', description: 'Use full name plus Indian subdivision ISO code' },
        ],
        default: 'name',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['nameParsing'] } },
        description: 'Split a full name into first and last name components.',
        options: [
          { name: 'Split Full Names', value: 'splitFullNames', action: 'Split full names', description: 'Provide a single full name to parse' },
        ],
        default: 'splitFullNames',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['nameTypeRecognition'] } },
        description: 'Identify the most likely name type (anthroponym, brand name, toponym).',
        options: [
          { name: 'Proper Noun Type', value: 'properNounType', action: 'Proper Noun Type', description: 'Predict name type from a proper noun' },
        ],
        default: 'properNounType',
      },

      // Ethnicity (Diaspora) by first/last name (batch)
      {
        displayName: 'Names to Analyze',
        name: 'personalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Name',
        default: {},
        displayOptions: { show: { resource: ['ethnicity'], operation: ['name'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '', description: 'Optional first name to increase accuracy' },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '', required: true, description: 'Last name or surname' },
              { displayName: 'Country (ISO 3166-1 alpha-2). U.S. by default', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional country code providing local context to improve accuracy.' },
            ],
          },
        ],
      },

      // Ethnicity (Diaspora) by full name (batch)
      {
        displayName: 'Names to Analyze',
        name: 'personalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Full Name',
        default: {},
        displayOptions: { show: { resource: ['ethnicity'], operation: ['fullName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2). U.S. by default', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional country code providing local context to improve accuracy.' },
            ],
          },
        ],
      },

      // Gender by name (classic/geo switch)
      {
        displayName: 'Names to Analyze',
        name: 'genderPersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Name',
        default: {},
        displayOptions: { show: { resource: ['gender'], operation: ['name'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '', required: true },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional. Enter a 2-letter country code (e.g. US, FR, IN) to focus predictions on that country and improve accuracy.' },
            ],
          },
        ],
      },

      // Gender by full name (classic/geo switch)
      {
        displayName: 'Full Names to Analyze',
        name: 'genderFullPersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Full Name',
        default: {},
        displayOptions: { show: { resource: ['gender'], operation: ['fullName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional. Enter a 2-letter country code (e.g. US, FR, IN) to focus predictions on that country and improve accuracy.' },
            ],
          },
        ],
      },

      // Split full names (classic/geo switch)
      {
        displayName: 'Full Names to Split',
        name: 'splitFullPersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Full Name',
        default: {},
        displayOptions: { show: { resource: ['nameParsing'], operation: ['splitFullNames'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional. Enter a 2-letter country code (e.g. US, FR, IN) to focus predictions on that country and improve accuracy.' },
            ],
          },
        ],
      },

      // Name type recognition (classic/geo switch)
      {
        displayName: 'Proper Nouns to Analyze',
        name: 'nameTypeRecognition',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Proper Noun',
        default: {},
        displayOptions: { show: { resource: ['nameTypeRecognition'], operation: ['properNounType'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Proper Noun', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional. Enter a 2-letter country code (e.g. US, FR, IN) to focus predictions on that country and improve accuracy.' },
            ],
          },
        ],
      },

      // Origin by name (batch)
      {
        displayName: 'Names to Analyze',
        name: 'originPersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Name',
        default: {},
        displayOptions: { show: { resource: ['origin'], operation: ['name'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
            ],
          },
        ],
      },

      // Origin by full name (batch)
      {
        displayName: 'Full Names to Analyze',
        name: 'originFullPersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Full Name',
        default: {},
        displayOptions: { show: { resource: ['origin'], operation: ['fullName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
            ],
          },
        ],
      },

      // US Race/Ethnicity by name (batch)
      {
        displayName: 'Names to Analyze',
        name: 'usrePersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Name',
        default: {},
        displayOptions: { show: { resource: ['usRaceEthnicity'], operation: ['name'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
              { displayName: 'Country (ISO 3166-1 alpha-2), U.S. by default', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional. Enter a 2-letter country code (e.g. US, FR, IN) to focus predictions on that country and improve accuracy.' },
            ],
          },
        ],
      },

      // US Race/Ethnicity by full name (batch)
      {
        displayName: 'Full Names to Analyze',
        name: 'usreFullPersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Full Name',
        default: {},
        displayOptions: { show: { resource: ['usRaceEthnicity'], operation: ['fullName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2),  U.S. by default', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: "Optional. Enter a 2-letter country code (e.g. US, FR, IN) to focus predictions on that country and improve accuracy." },
            ],
          },
        ],
      },

      // Indian Caste by name (batch)
      {
        displayName: 'Names to Analyze',
        name: 'indianCastePersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Name',
        default: {},
        displayOptions: { show: { resource: ['indianCaste'], operation: ['name'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '', required: true },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '', required: true },
              { displayName: 'Indian state or union territory (ISO 3166-2:IN)', name: 'subdivisionIso', type: 'options', options: indiaSubdivisionOptions, default: '', required: true },
            ],
          },
        ],
      },

      // Indian Caste by full name (batch)
      {
        displayName: 'Full Names to Analyze',
        name: 'indianCasteFullPersonalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Full Name',
        default: {},
        displayOptions: { show: { resource: ['indianCaste'], operation: ['fullName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Indian state or union territory (ISO 3166-2:IN)', name: 'subdivisionIso', type: 'options', options: indiaSubdivisionOptions, default: '', required: true },
            ],
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    const returnData: IDataObject[] = [];
    const toEntries = (paramName: string): IDataObject[] => {
      const raw = this.getNodeParameter(paramName, 0) as IDataObject | IDataObject[] | undefined;
      if (!raw) return [];
      if (Array.isArray(raw)) {
        // Array of collections with inner 'name' arrays
        return (raw as IDataObject[]).flatMap((e) => ((e as any)?.name as IDataObject[] | undefined) || []);
      }
      // Single collection object with 'name' array
      const inner = (raw as any)?.name as IDataObject[] | undefined;
      return inner || [];
    };

    // Ethnicity (diaspora) by name
    if (resource === 'ethnicity' && operation === 'name') {
      const entries = toEntries('personalNames');
      const names = entries
        .map((n) => ({
          firstName: ((n as any).firstName || '').toString(),
          lastName: ((n as any).lastName || '').toString(),
          countryIso2: ((n as any).countryIso2 || '').toString(),
        }))
        .filter((n) => n.lastName);

      if (names.length === 0) throw new Error('Please add at least one name with a Last Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/diasporaBatch', body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const ethnicitiesTop = ((r.ethnicitiesTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, firstName: r.firstName, lastName: r.lastName, countryIso2: r.countryIso2, ethnicity: ethnicitiesTop[0], ethnicity2: ethnicitiesTop[1], ethnicity3: ethnicitiesTop[2], ethnicity4: ethnicitiesTop[3], ethnicity5: ethnicitiesTop[4], probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Ethnicity (diaspora) by full name
    if (resource === 'ethnicity' && operation === 'fullName') {
      const entries = toEntries('personalNames');
      const names = entries
        .map((n) => ({
          name: ((n as any).name || '').toString(),
          countryIso2: ((n as any).countryIso2 || '').toString(),
        }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Full Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/diasporaFullBatch', body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const ethnicitiesTop = ((r.ethnicitiesTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, name: r.name, countryIso2: r.countryIso2, ethnicity: ethnicitiesTop[0], ethnicity2: ethnicitiesTop[1], ethnicity3: ethnicitiesTop[2], ethnicity4: ethnicitiesTop[3], ethnicity5: ethnicitiesTop[4], probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Gender by name (classic/geo)
    if (resource === 'gender' && operation === 'name') {
      const entries = toEntries('genderPersonalNames');
      const names = entries
        .map((n) => ({
          firstName: ((n as any).firstName || '').toString(),
          lastName: ((n as any).lastName || '').toString(),
          countryIso2: ((n as any).countryIso2 || '').toString(),
        }))
        .filter((n) => n.firstName);

      if (names.length === 0) throw new Error('Please add at least one entry with a First Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const useGeo = names.some((n) => n.countryIso2 && n.countryIso2.length > 0);
      const endpoint = useGeo ? '/api2/json/genderGeoBatch' : '/api2/json/genderBatch';
      const cleaned = names.map((n) => {
        const e: IDataObject = { firstName: n.firstName };
        if (n.lastName) e.lastName = n.lastName;
        if (useGeo && n.countryIso2) e.countryIso2 = n.countryIso2;
        return e;
      });
      const body = { personalNames: cleaned } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        returnData.push({ script: r.script, firstName: r.firstName, lastName: r.lastName, likelyGender: r.likelyGender, probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Gender by full name (classic/geo)
    if (resource === 'gender' && operation === 'fullName') {
      const entries = toEntries('genderFullPersonalNames');
      const names = entries
        .map((n) => ({ name: ((n as any).name || '').toString(), countryIso2: ((n as any).countryIso2 || '').toString() }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Full Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const useGeo = names.some((n) => n.countryIso2 && n.countryIso2.length > 0);
      const endpoint = useGeo ? '/api2/json/genderFullGeoBatch' : '/api2/json/genderFullBatch';
      const cleaned = names.map((n) => {
        const e: IDataObject = { name: n.name };
        if (useGeo && n.countryIso2) e.countryIso2 = n.countryIso2;
        return e;
      });
      const body = { personalNames: cleaned } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        returnData.push({ script: r.script, name: r.name, likelyGender: r.likelyGender, probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Split full names (classic/geo)
    if (resource === 'nameParsing' && operation === 'splitFullNames') {
      const entries = toEntries('splitFullPersonalNames');
      const names = entries
        .map((n) => ({ name: ((n as any).name || '').toString(), countryIso2: ((n as any).countryIso2 || '').toString() }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Full Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const useGeo = names.some((n) => n.countryIso2 && n.countryIso2.length > 0);
      const endpoint = useGeo ? '/api2/json/parseNameGeoBatch' : '/api2/json/parseNameBatch';
      const cleaned = names.map((n) => {
        const e: IDataObject = { name: n.name };
        if (useGeo && n.countryIso2) e.countryIso2 = n.countryIso2;
        return e;
      });
      const body = { personalNames: cleaned } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const firstLast = (r.firstLastName as IDataObject) || ({} as IDataObject);
        returnData.push({ script: r.script, name: r.name, countryIso2: r.countryIso2, firstName: firstLast.firstName, lastName: firstLast.lastName } as IDataObject);
      }
    }

    // Get proper noun type
    if (resource === 'nameTypeRecognition' && operation === 'properNounType') {
      const entries = toEntries('nameTypeRecognition');
      const names = entries
        .map((n) => ({ name: ((n as any).name || '').toString(), countryIso2: ((n as any).countryIso2 || '').toString() }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Proper Noun.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const useGeo = names.some((n) => n.countryIso2 && n.countryIso2.length > 0);
      const endpoint = useGeo ? '/api2/json/nameTypeGeoBatch' : '/api2/json/nameTypeBatch';
      const cleaned = names.map((n) => {
        const e: IDataObject = { name: n.name };
        if (useGeo && n.countryIso2) e.countryIso2 = n.countryIso2;
        return e;
      });
      const body = { properNouns: cleaned } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;
      const results = (response.properNouns as IDataObject[]) || [];
      for (const r of results) {
        returnData.push({ script: r.script, name: r.name, countryIso2: r.countryIso2, commonType: r.commonType, commonTypeAlt: r.commonTypeAlt } as IDataObject);
      }
    }

    // Origin by name
    if (resource === 'origin' && operation === 'name') {
      const entries = toEntries('originPersonalNames');
      const names = entries
        .map((n) => ({ firstName: ((n as any).firstName || '').toString(), lastName: ((n as any).lastName || '').toString() }))
        .filter((n) => n.firstName || n.lastName);

      if (names.length === 0) throw new Error('Please add at least one entry with a First or Last Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/originBatch', body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const countriesOriginTop = ((r.countriesOriginTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, firstName: r.firstName, lastName: r.lastName, countryOrigin: countriesOriginTop[0], countryOrigin2: countriesOriginTop[1], countryOrigin3: countriesOriginTop[2], countryOrigin4: countriesOriginTop[3], countryOrigin5: countriesOriginTop[4], regionOrigin: r.regionOrigin, subRegionOrigin: r.subRegionOrigin, probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Origin by full name
    if (resource === 'origin' && operation === 'fullName') {
      const entries = toEntries('originFullPersonalNames');
      const names = entries
        .map((n) => ({ name: ((n as any).name || '').toString() }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Full Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/originFullBatch', body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const countriesOriginTop = ((r.countriesOriginTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, name: r.name, countryOrigin: countriesOriginTop[0], countryOrigin2: countriesOriginTop[1], countryOrigin3: countriesOriginTop[2], countryOrigin4: countriesOriginTop[3], countryOrigin5: countriesOriginTop[4], regionOrigin: r.regionOrigin, subRegionOrigin: r.subRegionOrigin, probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // US Race/Ethnicity by name
    if (resource === 'usRaceEthnicity' && operation === 'name') {
      const entries = toEntries('usrePersonalNames');
      const names = entries
        .map((n) => ({
          firstName: ((n as any).firstName || '').toString(),
          lastName: ((n as any).lastName || '').toString(),
          countryIso2: ((n as any).countryIso2 || '').toString(),
        }))
        .filter((n) => n.firstName || n.lastName);

      if (names.length === 0) throw new Error('Please add at least one entry with a First or Last Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const headers = { 'X-OPTION-USRACEETHNICITY-TAXONOMY': 'USRACEETHNICITY-6CLASSES' } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/usRaceEthnicityBatch', body, {}, headers)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const raceTop = ((r.raceEthnicitiesTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, firstName: r.firstName, lastName: r.lastName, countryIso2: r.countryIso2, ethnicity: r.raceEthnicity, ethnicity2: raceTop[1], ethnicity3: raceTop[2], ethnicity4: raceTop[3], ethnicity5: raceTop[4], ethnicity6: raceTop[5], probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // US Race/Ethnicity by full name
    if (resource === 'usRaceEthnicity' && operation === 'fullName') {
      const entries = toEntries('usreFullPersonalNames');
      const names = entries
        .map((n) => ({ name: ((n as any).name || '').toString(), countryIso2: ((n as any).countryIso2 || '').toString() }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Full Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const headers = { 'X-OPTION-USRACEETHNICITY-TAXONOMY': 'USRACEETHNICITY-6CLASSES' } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/usRaceEthnicityFullBatch', body, {}, headers)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const raceTop = ((r.raceEthnicitiesTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, name: r.name, countryIso2: r.countryIso2, ethnicity: r.raceEthnicity, ethnicity2: raceTop[1], ethnicity3: raceTop[2], ethnicity4: raceTop[3], ethnicity5: raceTop[4], ethnicity6: raceTop[5], probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Indian caste by name
    if (resource === 'indianCaste' && operation === 'name') {
      const entries = toEntries('indianCastePersonalNames');
      const names = entries
        .map((n) => ({
          firstName: ((n as any).firstName || '').toString(),
          lastName: ((n as any).lastName || '').toString(),
          subdivisionIso: ((n as any).subdivisionIso || '').toString(),
        }))
        .filter((n) => n.firstName && n.lastName && n.subdivisionIso);

      if (names.length === 0) throw new Error('Please add at least one entry with First Name, Last Name, and subdivisionIso.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/castegroupIndianBatch', body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const top = ((r.castegroupTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, firstName: r.firstName, lastName: r.lastName, subdivisionIso: r.subdivisionIso, castegroup: r.castegroup, castegroup2: top[1], castegroup3: top[2], castegroup4: top[3], castegroup5: top[4], probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Indian caste by full name
    if (resource === 'indianCaste' && operation === 'fullName') {
      const entries = toEntries('indianCasteFullPersonalNames');
      const names = entries
        .map((n) => ({ name: ((n as any).name || '').toString(), subdivisionIso: ((n as any).subdivisionIso || '').toString() }))
        .filter((n) => n.name && n.subdivisionIso);

      if (names.length === 0) throw new Error('Please add at least one Full Name with subdivisionIso.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', '/api2/json/castegroupIndianFullBatch', body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const top = ((r.castegroupTop as unknown) as string[]) || [];
        returnData.push({ script: r.script, name: r.name, subdivisionIso: r.subdivisionIso, castegroup: r.castegroup, castegroup2: top[1], castegroup3: top[2], castegroup4: top[3], castegroup5: top[4], probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    return [this.helpers.returnJsonArray(returnData)];
  }
}
