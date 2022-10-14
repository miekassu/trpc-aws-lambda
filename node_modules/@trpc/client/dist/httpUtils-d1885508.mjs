function getWindow() {
    if (typeof window !== 'undefined') {
        return window;
    }
    return globalThis;
}
function getAbortController(ac) {
    return ac ?? getWindow().AbortController ?? null;
}

function getFetch(f) {
    if (f) {
        return f;
    }
    const win = getWindow();
    const globalFetch = win.fetch;
    if (globalFetch) {
        return typeof globalFetch.bind === 'function' ? globalFetch.bind(win) : globalFetch;
    }
    throw new Error('No fetch implementation found');
}

function resolveHTTPLinkOptions(opts) {
    const headers = opts.headers || (()=>({}));
    return {
        url: opts.url,
        fetch: getFetch(opts.fetch),
        AbortController: getAbortController(opts.AbortController),
        headers: typeof headers === 'function' ? headers : ()=>headers
    };
}
// https://github.com/trpc/trpc/pull/669
function arrayToDict(array) {
    const dict = {};
    for(let index = 0; index < array.length; index++){
        const element = array[index];
        dict[index] = element;
    }
    return dict;
}
const METHOD = {
    query: 'GET',
    mutation: 'POST'
};
function getInput(opts) {
    return 'input' in opts ? opts.runtime.transformer.serialize(opts.input) : arrayToDict(opts.inputs.map((_input)=>opts.runtime.transformer.serialize(_input)));
}
function getUrl(opts) {
    let url = opts.url + '/' + opts.path;
    const queryParts = [];
    if ('inputs' in opts) {
        queryParts.push('batch=1');
    }
    if (opts.type === 'query') {
        const input = getInput(opts);
        if (input !== undefined) {
            queryParts.push(`input=${encodeURIComponent(JSON.stringify(input))}`);
        }
    }
    if (queryParts.length) {
        url += '?' + queryParts.join('&');
    }
    return url;
}
function getBody(opts) {
    if (opts.type === 'query') {
        return undefined;
    }
    const input = getInput(opts);
    return input !== undefined ? JSON.stringify(input) : undefined;
}
function httpRequest(opts) {
    const { type  } = opts;
    const ac = opts.AbortController ? new opts.AbortController() : null;
    const promise = new Promise((resolve, reject)=>{
        const url = getUrl(opts);
        const body = getBody(opts);
        const meta = {};
        Promise.resolve(opts.headers()).then((headers)=>{
            if (type === 'subscription') {
                throw new Error('Subscriptions should use wsLink');
            }
            return opts.fetch(url, {
                method: METHOD[type],
                signal: ac?.signal,
                body: body,
                headers: {
                    'content-type': 'application/json',
                    ...headers
                }
            });
        }).then((_res)=>{
            meta.response = _res;
            return _res.json();
        }).then((json)=>{
            resolve({
                json,
                meta
            });
        }).catch(reject);
    });
    const cancel = ()=>{
        ac?.abort();
    };
    return {
        promise,
        cancel
    };
}

export { getUrl as a, getFetch as g, httpRequest as h, resolveHTTPLinkOptions as r };
