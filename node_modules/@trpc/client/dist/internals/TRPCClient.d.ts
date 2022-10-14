import { AnyRouter, ClientDataTransformerOptions, inferProcedureInput, inferProcedureOutput, inferSubscriptionOutput } from '@trpc/server';
import { Unsubscribable } from '@trpc/server/observable';
import { TRPCClientError } from '../TRPCClientError';
import { OperationContext, TRPCClientRuntime, TRPCLink } from '../links/types';
interface CreateTRPCClientBaseOptions {
    /**
     * Data transformer
     * @link https://trpc.io/docs/data-transformers
     **/
    transformer?: ClientDataTransformerOptions;
}
export interface TRPCRequestOptions {
    /**
     * Pass additional context to links
     */
    context?: OperationContext;
    signal?: AbortSignal;
}
export interface TRPCSubscriptionObserver<TValue, TError> {
    onStarted: () => void;
    onData: (value: TValue) => void;
    onError: (err: TError) => void;
    onStopped: () => void;
    onComplete: () => void;
}
/** @internal */
export declare type CreateTRPCClientOptions<TRouter extends AnyRouter> = CreateTRPCClientBaseOptions & {
    links: TRPCLink<TRouter>[];
};
export declare class TRPCClient<TRouter extends AnyRouter> {
    private readonly links;
    readonly runtime: TRPCClientRuntime;
    private requestId;
    constructor(opts: CreateTRPCClientOptions<TRouter>);
    private $request;
    private requestAsPromise;
    query<TQueries extends TRouter['_def']['queries'], TPath extends string & keyof TQueries, TInput extends inferProcedureInput<TQueries[TPath]>>(path: TPath, input?: TInput, opts?: TRPCRequestOptions): Promise<inferProcedureOutput<TQueries[TPath]>>;
    mutation<TMutations extends TRouter['_def']['mutations'], TPath extends string & keyof TMutations, TInput extends inferProcedureInput<TMutations[TPath]>>(path: TPath, input?: TInput, opts?: TRPCRequestOptions): Promise<inferProcedureOutput<TMutations[TPath]>>;
    subscription<TSubscriptions extends TRouter['_def']['subscriptions'], TPath extends string & keyof TSubscriptions, TOutput extends inferSubscriptionOutput<TRouter, TPath>, TInput extends inferProcedureInput<TSubscriptions[TPath]>>(path: TPath, input: TInput, opts: TRPCRequestOptions & Partial<TRPCSubscriptionObserver<TOutput, TRPCClientError<TRouter>>>): Unsubscribable;
}
export {};
//# sourceMappingURL=TRPCClient.d.ts.map