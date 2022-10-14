import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda'
import { publicProcedure, router } from '../server-lib'
import { z } from 'zod'
import { sharedCreateContext } from '../shared-context/shared-context'

export const routerA = router({
  greet: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input, ctx }) => {
      return `Greetings ${input.name} from serverA.`
    }),
})

export const handler = awsLambdaRequestHandler({
  router: routerA,
  createContext: sharedCreateContext,
})
