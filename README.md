# tRPC SOA: multiple servers and one client

This example is a service oriented example how to combine many tRPC- servers with one client.

Project uses `serverless` to run a HTTP API (ServerA) and Rest API (ServerB).
Servers are combined and requests can be made using single tRPC-client.

## Run locally with serverless & serverless-offline

1. `npm install`
2. `npm run build`
3. `npm run start-server`
4. `npm run start-client`
