export const isNonProd = (env: any) => !env?.PROD;
export const isBypassRequested = (env: any) => env?.VITE_AUTH_BYPASS === 'true';
export const shouldBypassAuth = (env: any) => isNonProd(env) && isBypassRequested(env);
