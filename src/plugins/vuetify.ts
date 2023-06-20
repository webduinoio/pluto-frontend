/**
 * Vuetify3 Plugin
 * 參考 https://github.com/dean9703111/vuetify-vite-ts-test/blob/master/src/plugins/vuetify.ts
 */
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

// Translations provided by Vuetify
//  import { en } from 'vuetify/locale';

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

export default createVuetify({
  // Global configuration
  // https://next.vuetifyjs.com/en/features/global-configuration/
  /*
   defaults: {
     global: {
       ripple: false,
     },
     VSheet: {
       elevation: 4,
     },
   },
   */
  // Icon Fonts
  // https://vuetifyjs.com/en/features/icon-fonts/
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  // Internationalization (i18n)
  // https://vuetifyjs.com/en/features/internationalization/#internationalization-i18n
  //  locale: {
  //    locale: 'en',
  //    fallback: 'en',
  //    messages: { en },
  //  },
  // Theme
  // https://vuetifyjs.com/en/features/theme/
  theme: {
    defaultTheme: 'light',
  },
});
