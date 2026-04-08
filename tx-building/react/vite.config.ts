import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// libsodium-wrappers-sumo imports "./libsodium-sumo.mjs" as a relative path,
// but the file lives in the separate "libsodium-sumo" package.
// This plugin resolves that cross-package reference.
function resolveSodium(): Plugin {
  const target = path.resolve(
    __dirname,
    'node_modules/libsodium-sumo/dist/modules-sumo-esm/libsodium-sumo.mjs',
  );
  return {
    name: 'resolve-libsodium',
    resolveId(source, importer) {
      if (
        source === './libsodium-sumo.mjs' &&
        importer?.includes('libsodium-wrappers-sumo')
      ) {
        return target;
      }
    },
  };
}

export default defineConfig({
  plugins: [
    resolveSodium(),
    react(),
    wasm(),
    topLevelAwait(),
    nodePolyfills(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Exclude libsodium from esbuild pre-bundling (broken cross-package import);
    // the resolveSodium plugin handles it at serve time instead.
    exclude: ['libsodium-wrappers-sumo'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      plugins: [
        // Rollup also needs the same resolution for production builds
        {
          name: 'resolve-libsodium-rollup',
          resolveId(source: string, importer: string | undefined) {
            if (
              source === './libsodium-sumo.mjs' &&
              importer?.includes('libsodium-wrappers-sumo')
            ) {
              return path.resolve(
                __dirname,
                'node_modules/libsodium-sumo/dist/modules-sumo-esm/libsodium-sumo.mjs',
              );
            }
          },
        },
      ],
    },
  },
  css: { devSourcemap: false },
  server: {
    sourcemapIgnoreList: (sourcePath) => sourcePath.includes('node_modules'),
  },
});
