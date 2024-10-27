// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";

if (import.meta.env.DEV) {
  await import("solid-devtools");
}

mount(() => <StartClient />, document.getElementById("app")!);
