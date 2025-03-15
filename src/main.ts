import { Handler, ProxyResult } from 'aws-lambda';
import { requestHoyoLabApi, report } from './service';

export const handler: Handler = async (): Promise<ProxyResult> => {

  const response = await requestHoyoLabApi();

  if (!response) {
      throw new Error('Api response has been empty');
  }

  const res =  await report(response);

  return {
    statusCode: 200,
    headers   : {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(res ?? ''),
  };
};