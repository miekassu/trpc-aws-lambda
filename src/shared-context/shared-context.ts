import { CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { inferAsyncReturnType } from '@trpc/server'

export function sharedCreateContext({
                         event,
                         context,
                       }: CreateAWSLambdaContextOptions<APIGatewayProxyEvent>) {
  return {
    event: event,
    apiVersion: (event as {version?: string}).version || '1.0',
    user: event.headers['x-user'],
  }
}

export type SharedContext = inferAsyncReturnType<typeof sharedCreateContext>;
