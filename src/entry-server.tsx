// @refresh reload
import { StartServer, createHandler } from "@solidjs/start/server";
import { getCookie } from "vinxi/http";
import logo from "~/assets/img/logo.svg";

export default createHandler((ctx) => {
  const theme = getCookie(ctx.nativeEvent, "color-theme") ?? "dark";

  return (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en" class="h-full font-sans" classList={{ dark: theme === "dark" }}>
          <head>
            <title>Solid Todos</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#2463eb" />
            <meta name="description" content="CF Todos: Add and never forget!" />
            <link rel="icon" type="image/svg+xml" href={logo} />
            {assets}
          </head>
          <body class="min-h-full w-full flex flex-col bg-neutral-50 transition-colors duration-100 dark:bg-neutral-900">
            <div class="w-full flex flex-grow" id="app">
              {children}
            </div>
            {scripts}
          </body>
        </html>
      )}
    />
  );
});
