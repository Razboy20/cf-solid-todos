import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";

import type { RouteSectionProps } from "@solidjs/router";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { ThemeControllerButton, ThemeProvider } from "./components/ThemeController";

const Root = (prop: RouteSectionProps) => {
  return (
    <Suspense>
      <ThemeProvider>
        <div class="absolute right-0 top-0 flex items-center gap-2 p-4">
          <ThemeControllerButton />
        </div>
        <Suspense>{prop.children}</Suspense>
      </ThemeProvider>
    </Suspense>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <Router root={Root}>
        <FileRoutes />
      </Router>
    </ThemeProvider>
  );
}

// min-h-full w-full flex flex-col bg-neutral-50 transition-colors duration-100 dark:bg-neutral-900
