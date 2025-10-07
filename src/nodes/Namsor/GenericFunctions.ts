import type { IDataObject, IExecuteFunctions, ILoadOptionsFunctions, IHttpRequestMethods, IRequestOptions } from 'n8n-workflow';

export async function namsorApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body: IDataObject = {},
  qs: IDataObject = {},
  extraHeaders: IDataObject = {},
) {
  const options: IRequestOptions = {
    method,
    qs,
    body,
    url: `https://v2.namsor.com/NamsorAPIv2${endpoint}`,
    json: true,
    headers: {
      ...extraHeaders,
    } as IDataObject,
  };

  return this.helpers.requestWithAuthentication.call(this, 'namsorApi', options);
}
