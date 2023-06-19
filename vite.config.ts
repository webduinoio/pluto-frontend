import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      imports: [
        'vue',
        'vue-router',
        'vue-i18n',
        {
          axios: [['default', 'axios']],
        },
      ],
      dts: 'src/types/auto-imports.d.ts', // typescript 宣告檔案位置
      vueTemplate: false,
    }),
  ],
});
