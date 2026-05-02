import preact from '@preact/preset-vite';
import { resolve } from 'path';
import { build, defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    preact(),
    {
      name: 'build-content-script-iife',
      closeBundle: async () => {
        await build({
          configFile: false,
          plugins: [preact()],
          define: { 'process.env.NODE_ENV': '"production"' },
          build: {
            outDir: 'dist',
            emptyOutDir: false,
            lib: {
              entry: resolve(__dirname, 'src/content/index.ts'),
              name: 'GithubGrouperContent',
              formats: ['iife'],
              fileName: () => 'content.js'
            },
            rollupOptions: {
              output: {
                inlineDynamicImports: true
              }
            }
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'index.html')
        // content entry removed — handled by the IIFE build above
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  optimizeDeps: {
    include: ['preact', 'preact/hooks']
  }
});
