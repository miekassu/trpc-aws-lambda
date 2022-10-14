
import { router } from '../server-lib';
import { server as serverA } from '../server-a/server'
import { server as serverB } from '../server-b/server'

const appRouter = router({
  serverA,
  serverB,
});

export type AppRouter = typeof appRouter;
