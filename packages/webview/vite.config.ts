import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        outDir: '../../out/extension/webview',
        emptyOutDir: true,
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                entryFileNames: `index.js`,
                chunkFileNames: `index.js`,
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'index.css';
                    }
                    return '[name].[ext]';
                }
            }
        }
    }
});