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
      description: 'Your Namsor API key (sent as X-API-KEY header). Retrieve your Namsor API key at https://namsor.app/my-account/',
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
      baseURL: 'https://namsor.app',
      url: '/api/add-on/get-user-data-and-features',
      method: 'GET' as IHttpRequestMethods,
    },
  };
}
