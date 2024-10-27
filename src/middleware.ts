import { createMiddleware } from "@solidjs/start/middleware";
import { env } from "./util/cf";

import { createStorage } from "unstorage";
import cloudflareKVBindingDriver from "unstorage/drivers/cloudflare-kv-binding";
import { storage } from "./db/kv";

export default createMiddleware({
  onRequest: async (event) => {
    if (import.meta.env.PROD) {
      event.locals.kv = createStorage({
        driver: cloudflareKVBindingDriver({
          binding: env(event).STORAGE,
        }),
      });
    } else {
      event.locals.kv = storage;
    }
  },
});

// Extend locals type
declare module "@solidjs/start/server" {
  interface RequestEventLocals {
    kv: ReturnType<typeof createStorage>;
  }
}
