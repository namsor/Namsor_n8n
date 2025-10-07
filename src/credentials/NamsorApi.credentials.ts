import type { ICredentialType, INodeProperties, IHttpRequestMethods } from 'n8n-workflow';

export class NamsorApi implements ICredentialType {
  name = 'namsorApi';
  displayName = 'Namsor API';
  documentationUrl = 'https://namsor.app/api-documentation/introduction/';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      description: 'Your Namsor API key (sent as X-API-KEY header).',
    },
  ];

  authenticate = {
    type: 'generic' as const,
    properties: {
      headers: {
        'X-API-KEY': '={{$credentials.apiKey}}',
      },
    },
  };

  test = {
    request: {
      baseURL: 'https://v2.namsor.com/NamsorAPIv2',
      url: '/api2/json/gender/Joe/Smith',
      method: 'GET' as IHttpRequestMethods,
    },
  };
}
