import { Handler, APIGatewayProxyEvent, ProxyResult } from 'aws-lambda';
import { buildHoyoLabCookie, axiosRequest, checkAndReport } from './service';
import { HoyoLabDailyApiResponse } from './types';

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<ProxyResult> => {
  const headers = buildHoyoLabCookie();
  const requestOptions = {
    url: 'https://bbs-api-os.hoyoverse.com/game_record/genshin/api/dailyNote',
    method: 'GET',
    params: {
        role_id: process.env['USER_ID'] ?? '',
        server: 'os_asia',
        schedule_type: 1,
    },
    headers: headers
  };

  const response = await axiosRequest<HoyoLabDailyApiResponse>(requestOptions);

  if(!response){
    throw new Error('Api response has been empty');
  }

  const res = await checkAndReport(response);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(res ?? ''),
  }
}