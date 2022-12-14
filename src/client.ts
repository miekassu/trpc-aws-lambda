import { createTRPCProxyClient, httpLink } from '@trpc/client';
import fetch from 'node-fetch';
import { AppRouter } from './server-gateway'

if (!global.fetch) {
  (global as any).fetch = fetch;
}

const client = createTRPCProxyClient<AppRouter>({
  links: [
    // create a custom ending link
    (runtime) => {
      // initialize the different links for different targets
      const servers = {
        serverA: httpLink({ url: 'http://127.0.0.1:4050' })(runtime),
        serverB: httpLink({ url: 'http://127.0.0.1:4050/dev' })(runtime),
      };
      return (ctx) => {
        const { op } = ctx;
        // split the path by `.` as the first part will signify the server target name
        const pathParts = op.path.split('.');

        // first part of the query should be `server1` or `server2`
        const serverName = pathParts.shift() as string as keyof typeof servers;

        // combine the rest of the parts of the paths
        // -- this is what we're actually calling the target server with
        const path = pathParts.join('.');
        console.log(`calling ${serverName} on path ${path}`, {
          input: op.input,
        });

        const link = servers[serverName];

        return link({
          ...ctx,
          op: {
            ...op,
            // override the target path with the prefix removed
            path,
          },
        });
      };
    },
  ],
});

async function main() {
  try {
    const result = await client.serverA.greet.query({ name: 'Kasper' });
    console.log(result);
  } catch (error) {
    console.log(error);
  }

  try {
    const result = await client.serverB.greet.query({ name: 'Kasper' });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

main();
