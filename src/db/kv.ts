export interface TodoItem {
  id: string;
  done: boolean;
  text: string;

  pending?: boolean;
}

import { createStorage } from "unstorage";
import fsLiteDriver from "unstorage/drivers/fs-lite";

// this uses file system driver for unstorage that works only on node.js
export const storage = createStorage({
  driver: fsLiteDriver({
    base: "./.data",
  }),
});
