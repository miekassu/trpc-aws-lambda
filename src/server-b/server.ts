import { publicProcedure, router } from '../server-lib'
import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda'
import { sharedCreateContext } from '../shared-context/shared-context'
import { z } from 'zod'

export const routerB = router({
  greet: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input, ctx }) => {
      return `Greetings ${input.name} from serverB.`
    }),
})

export const handler = awsLambdaRequestHandler({
  router: routerB,
  createContext: sharedCreateContext,
})
