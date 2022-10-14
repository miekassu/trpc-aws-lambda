import type { AnyRouter } from '@trpc/server';
import { TRPCClient as Client, CreateTRPCClientOptions } from './internals/TRPCClient';
/**
 * @deprecated use `createTRPCProxyClient` instead
 */
export declare function createTRPCClient<TRouter extends AnyRouter>(opts: CreateTRPCClientOptions<TRouter>): Client<TRouter>;
export type { CreateTRPCClientOptions, TRPCClient, TRPCRequestOptions, } from './internals/TRPCClient';
//# sourceMappingURL=createTRPCClient.d.ts.map