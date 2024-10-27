import { handler } from '../main';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import  dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const event = {} as APIGatewayProxyEvent;
const context = {} as Context;
const callback = function () {};

try {
    handler(event, context, callback);
} catch(e: unknown) {
    console.log('error');
    console.log(e);
}