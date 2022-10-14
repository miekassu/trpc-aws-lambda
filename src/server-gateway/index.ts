
import { router } from '../server-lib';
import { routerA} from '../server-a/server'
import { routerB } from '../server-b/server'

const appRouter = router({
  serverA: routerA,
  serverB: routerB,
});

export type AppRouter = typeof appRouter;
