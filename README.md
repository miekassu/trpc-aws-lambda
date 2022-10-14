# serverless-offline + AWS Api Gateway Lambda

This example is a service oriented example how to combine many tRPC- servers with one client.

Project uses `serverless` to run a API Gateway V1 (ServerA) and V2 (ServerB).
Servers are combined and requests can be made using single tRPC-client.

## Run locally with serverless & serverless-offline

`$ npm install`
`$ npm run build`
`$ npm run start-server`
`$ npm run start-client`

## REST API & HTTP API

Run the client with `npm run start-client`
