import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://philipreese.github.io',
  base: '/so-what-do-you-actually-do',
  integrations: [
    react(),
    {
      // Chrome DevTools always probes this path at the domain root, ignoring
      // our `base` — serve it directly in dev instead of letting Astro's
      // base-prefix check log a router warning for every page load.
      name: 'chrome-devtools-json',
      hooks: {
        'astro:server:setup': ({ server }) => {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/.well-known/appspecific/com.chrome.devtools.json') {
              res.setHeader('Content-Type', 'application/json');
              res.end('{}');
              return;
            }
            next();
          });
        },
      },
    },
  ],
});
