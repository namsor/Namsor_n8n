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
    subtitle: '={{$parameter["operation"]}}',
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
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Ethnicity (Diaspora) by Name', value: 'ethnicityName', description: 'Predict ethnicity from first and/or last names', action: 'Get ethnicity from names' },
          { name: 'Gender by Name', value: 'genderName', description: 'Predict gender from first name and optional last name', action: 'Get gender from names' },
          { name: 'Gender by Full Name', value: 'genderFullName', description: 'Predict gender from full name', action: 'Get gender from full name' },
          { name: 'Split Full Names', value: 'splitFullNames', description: 'Split a full name into first and last name', action: 'Split full names' },
          { name: 'Origin by Name', value: 'originName', description: 'Predict country of origin from names', action: 'Get origin from names' },
          { name: 'Origin by Full Name', value: 'originFullName', description: 'Predict country of origin from full name', action: 'Get origin from full name' },
          { name: 'US Race/Ethnicity by Name', value: 'usRaceEthnicityName', description: 'Predict US race/ethnicity (Census taxonomy) from names', action: 'Get US race/ethnicity from names' },
          { name: 'US Race/Ethnicity by Full Name', value: 'usRaceEthnicityFullName', description: 'Predict US race/ethnicity (Census taxonomy) from full name', action: 'Get US race/ethnicity from full name' },
          { name: 'Indian Caste by Name', value: 'indianCasteName', description: 'Predict Indian caste group from names', action: 'Get Indian caste from names' },
          { name: 'Indian Caste by Full Name', value: 'indianCasteFullName', description: 'Predict Indian caste group from full name', action: 'Get Indian caste from full name' },
        ],
        default: 'ethnicityName',
      },

      // Ethnicity (Diaspora) by first/last name (batch)
      {
        displayName: 'Names to Analyze',
        name: 'personalNames',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Name',
        default: {},
        displayOptions: { show: { operation: ['ethnicityName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '', description: 'Optional first name to increase accuracy' },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '', required: true, description: 'Last name or surname' },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional country code for local context' },
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
        displayOptions: { show: { operation: ['genderName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '', required: true },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional; when provided, uses geo endpoint' },
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
        displayOptions: { show: { operation: ['genderFullName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional; when provided, uses geo endpoint' },
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
        displayOptions: { show: { operation: ['splitFullNames'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional; when provided, uses geo endpoint' },
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
        displayOptions: { show: { operation: ['originName'] } },
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
        displayOptions: { show: { operation: ['originFullName'] } },
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
        displayOptions: { show: { operation: ['usRaceEthnicityName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Name',
            values: [
              { displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
              { displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '', description: 'Optional country for local context' },
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
        displayOptions: { show: { operation: ['usRaceEthnicityFullName'] } },
        options: [
          {
            name: 'name',
            displayName: 'Entry',
            values: [
              { displayName: 'Full Name', name: 'name', type: 'string', default: '', required: true },
              { displayName: 'Country (ISO 3166-1 alpha-2)', name: 'countryIso2', type: 'options', options: countryOptions, default: '' },
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
        displayOptions: { show: { operation: ['indianCasteName'] } },
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
        displayOptions: { show: { operation: ['indianCasteFullName'] } },
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
    const operation = this.getNodeParameter('operation', 0) as string;
    const returnData: IDataObject[] = [];

    // Ethnicity (diaspora) by name
    if (operation === 'ethnicityName') {
      const personalNamesCollection = this.getNodeParameter('personalNames', 0, []) as Array<{ name: Array<{ firstName?: string; lastName: string; countryIso2?: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ firstName: (n.firstName || '').toString(), lastName: (n.lastName || '').toString(), countryIso2: (n.countryIso2 || '').toString() }))
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

    // Gender by name (classic/geo)
    if (operation === 'genderName') {
      const personalNamesCollection = this.getNodeParameter('genderPersonalNames', 0, []) as Array<{ name: Array<{ firstName: string; lastName?: string; countryIso2?: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ firstName: (n.firstName || '').toString(), lastName: (n.lastName || '').toString(), countryIso2: (n.countryIso2 || '').toString() }))
        .filter((n) => n.firstName);

      if (names.length === 0) throw new Error('Please add at least one entry with a First Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const useGeo = names.some((n) => n.countryIso2 && n.countryIso2.length > 0);
      const endpoint = useGeo ? '/api2/json/genderGeoBatch' : '/api2/json/genderBatch';
      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        returnData.push({ script: r.script, firstName: r.firstName, lastName: r.lastName, likelyGender: r.likelyGender, probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Gender by full name (classic/geo)
    if (operation === 'genderFullName') {
      const personalNamesCollection = this.getNodeParameter('genderFullPersonalNames', 0, []) as Array<{ name: Array<{ name: string; countryIso2?: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ name: (n.name || '').toString(), countryIso2: (n.countryIso2 || '').toString() }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Full Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const useGeo = names.some((n) => n.countryIso2 && n.countryIso2.length > 0);
      const endpoint = useGeo ? '/api2/json/genderFullGeoBatch' : '/api2/json/genderFullBatch';
      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        returnData.push({ script: r.script, name: r.name, likelyGender: r.likelyGender, probabilityCalibrated: r.probabilityCalibrated } as IDataObject);
      }
    }

    // Split full names (classic/geo)
    if (operation === 'splitFullNames') {
      const personalNamesCollection = this.getNodeParameter('splitFullPersonalNames', 0, []) as Array<{ name: Array<{ name: string; countryIso2?: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ name: (n.name || '').toString(), countryIso2: (n.countryIso2 || '').toString() }))
        .filter((n) => n.name);

      if (names.length === 0) throw new Error('Please add at least one Full Name.');
      if (names.length > 200) throw new Error('A maximum of 200 names is allowed per request.');

      const useGeo = names.some((n) => n.countryIso2 && n.countryIso2.length > 0);
      const endpoint = useGeo ? '/api2/json/parseNameGeoBatch' : '/api2/json/parseNameBatch';
      const body = { personalNames: names } as IDataObject;
      const response = (await namsorApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;
      const results = (response.personalNames as IDataObject[]) || [];
      for (const r of results) {
        const firstLast = (r.firstLastName as IDataObject) || ({} as IDataObject);
        returnData.push({ script: r.script, name: r.name, countryIso2: r.countryIso2, firstName: firstLast.firstName, lastName: firstLast.lastName } as IDataObject);
      }
    }

    // Origin by name
    if (operation === 'originName') {
      const personalNamesCollection = this.getNodeParameter('originPersonalNames', 0, []) as Array<{ name: Array<{ firstName?: string; lastName?: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ firstName: (n.firstName || '').toString(), lastName: (n.lastName || '').toString() }))
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
    if (operation === 'originFullName') {
      const personalNamesCollection = this.getNodeParameter('originFullPersonalNames', 0, []) as Array<{ name: Array<{ name: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ name: (n.name || '').toString() }))
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
    if (operation === 'usRaceEthnicityName') {
      const personalNamesCollection = this.getNodeParameter('usrePersonalNames', 0, []) as Array<{ name: Array<{ firstName?: string; lastName?: string; countryIso2?: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ firstName: (n.firstName || '').toString(), lastName: (n.lastName || '').toString(), countryIso2: (n.countryIso2 || '').toString() }))
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
    if (operation === 'usRaceEthnicityFullName') {
      const personalNamesCollection = this.getNodeParameter('usreFullPersonalNames', 0, []) as Array<{ name: Array<{ name: string; countryIso2?: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ name: (n.name || '').toString(), countryIso2: (n.countryIso2 || '').toString() }))
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
    if (operation === 'indianCasteName') {
      const personalNamesCollection = this.getNodeParameter('indianCastePersonalNames', 0, []) as Array<{ name: Array<{ firstName: string; lastName: string; subdivisionIso: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ firstName: (n.firstName || '').toString(), lastName: (n.lastName || '').toString(), subdivisionIso: (n.subdivisionIso || '').toString() }))
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
    if (operation === 'indianCasteFullName') {
      const personalNamesCollection = this.getNodeParameter('indianCasteFullPersonalNames', 0, []) as Array<{ name: Array<{ name: string; subdivisionIso: string }> }>;

      const names = (personalNamesCollection || [])
        .flatMap((entry) => entry.name || [])
        .map((n) => ({ name: (n.name || '').toString(), subdivisionIso: (n.subdivisionIso || '').toString() }))
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
