// This file provides types for the Deno global and imports in the IDE
// when the Deno extension is not fully configured or available.

declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}

declare module "std/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "supabase" {
  export function createClient(url: string, key: string): any;
}
