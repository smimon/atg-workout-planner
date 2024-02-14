import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [vue()],
    build: {
      outDir: 'docs',
    },
    define: {
      // enable hydration mismatch details in production build
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true',
      // expose process to bundles expecting it
      'process': {
        version: '"v14.17.0"',
        env
      }
    },
    base: process.env.NODE_ENV === 'production'
      ? '/atg-workout-planner/'
      : '/'
  });
}
