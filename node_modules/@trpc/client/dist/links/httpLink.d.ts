import { AnyRouter } from '@trpc/server';
import { HTTPLinkOptions } from './internals/httpUtils';
import { TRPCLink } from './types';
export declare function httpLink<TRouter extends AnyRouter>(opts: HTTPLinkOptions): TRPCLink<TRouter>;
//# sourceMappingURL=httpLink.d.ts.map