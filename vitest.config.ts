import { defineConfig } from 'vitest/config';
import { transform } from 'esbuild';

export default defineConfig({
  plugins: [
    {
      // note (srn271): added this plugin to make vite 8 working
      // -> can be removed as soon as oxc supports stage 3 decorators
      name: 'ts-with-esbuild',
      async transform(code, id) {
        if (!id.match(/\.[cm]?ts$/)) return;
        const result = await transform(code, { loader: 'ts', target: 'es2022', sourcefile: id, sourcemap: true });
        return { code: result.code, map: result.map };
      },
    },
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
