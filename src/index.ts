import { initializeTelemetry } from "./initializeTelemetry";
import { mastra } from "./mastra";
import { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';

type Event = APIGatewayProxyEvent | APIGatewayProxyEventV2;

initializeTelemetry();

function handle() {
  return async (event: Event) => {
    try {
      if (!event.body) {
        return {
          statusCode: 404,
        };
      }
      const response = await mastra.getAgents().weatherAgent.generate([
        {
          role: 'user',
          content: event.body,
        },
      ],
      );

      return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
    } catch (error) {
      console.error('Error:', error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }
  };
}

export const handler = handle();
