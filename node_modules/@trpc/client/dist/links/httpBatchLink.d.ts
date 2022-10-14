import { AnyRouter } from '@trpc/server';
import { HTTPLinkOptions } from './internals/httpUtils';
import { TRPCLink } from './types';
export interface HttpBatchLinkOptions extends HTTPLinkOptions {
    maxURLLength?: number;
}
export declare function httpBatchLink<TRouter extends AnyRouter>(opts: HttpBatchLinkOptions): TRPCLink<TRouter>;
//# sourceMappingURL=httpBatchLink.d.ts.map