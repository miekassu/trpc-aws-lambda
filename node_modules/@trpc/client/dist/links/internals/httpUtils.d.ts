import { ProcedureType } from '@trpc/server';
import { TRPCResponse } from '@trpc/server/rpc';
import { HTTPHeaders, PromiseAndCancel, TRPCClientRuntime } from '../types';
export interface HTTPLinkOptions {
    url: string;
    /**
     * Add ponyfill for fetch
     */
    fetch?: typeof fetch;
    /**
     * Add ponyfill for AbortController
     */
    AbortController?: typeof AbortController | null;
    /**
     * Headers to be set on outgoing requests or a callback that of said headers
     * @link http://trpc.io/docs/v10/header
     */
    headers?: HTTPHeaders | (() => HTTPHeaders | Promise<HTTPHeaders>);
}
export interface ResolvedHTTPLinkOptions {
    url: string;
    fetch: typeof fetch;
    AbortController: typeof AbortController | null;
    /**
     * Headers to be set on outgoing request
     * @link http://trpc.io/docs/v10/header
     */
    headers: () => HTTPHeaders | Promise<HTTPHeaders>;
}
export declare function resolveHTTPLinkOptions(opts: HTTPLinkOptions): ResolvedHTTPLinkOptions;
export interface HTTPResult {
    json: TRPCResponse;
    meta: {
        response: Response;
    };
}
declare type GetInputOptions = {
    runtime: TRPCClientRuntime;
} & ({
    inputs: unknown[];
} | {
    input: unknown;
});
export declare type HTTPRequestOptions = ResolvedHTTPLinkOptions & GetInputOptions & {
    type: ProcedureType;
    path: string;
};
export declare function getUrl(opts: HTTPRequestOptions): string;
declare type GetBodyOptions = {
    type: ProcedureType;
} & GetInputOptions;
export declare function getBody(opts: GetBodyOptions): string | undefined;
export declare function httpRequest(opts: HTTPRequestOptions): PromiseAndCancel<HTTPResult>;
export {};
//# sourceMappingURL=httpUtils.d.ts.map