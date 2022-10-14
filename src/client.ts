import { createTRPCProxyClient, httpLink } from '@trpc/client'
import fetch from 'node-fetch'
import type { AppRouter } from './server'

global.fetch = fetch as any

const proxy = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({ url: 'http://127.0.0.1:4050' }),
  ],
});

(async () => {
  try {
    const q = await proxy.greet.query({ name: 'Kasper' })
    console.log(q)
  } catch (error) {
    console.log('error', error)
  }
})()
