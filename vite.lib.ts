import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        outDir: "./lib",
        lib: {
            entry: "src/index.ts",
            name: "StarMax"
        },
        rollupOptions: {
            output: {
                exports: "named"
            }
        }
    }
})