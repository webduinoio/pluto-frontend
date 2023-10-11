/**
 * 包裝 sweetalert2 的 hook
 * i18n https://sweetalert2.github.io/recipe-gallery/i18n-l10n.html
 * 樣式的處理，請使用 src/assets/styles/sweetalert2.scss，使用官方預設的 api，可能不會生效！
 */

import { LOCALE } from '@/enums';
import enUS from '@/i18n/locales/en-US-SweetAlert2.json';
import zhHant from '@/i18n/locales/zh-Hant-SweetAlert2.json';
import frenchkiss from 'frenchkiss';
import type { SweetAlertOptions } from 'sweetalert2';
import Swal from 'sweetalert2';

frenchkiss.locale(LOCALE.ZH_HANT);
frenchkiss.set(LOCALE.ZH_HANT, zhHant);
frenchkiss.set(LOCALE.EN, enUS);

export function setLocale(lang: LOCALE) {
  frenchkiss.locale(lang);
}

export function useSweetAlert() {
  const fire = (options: SweetAlertOptions) => {
    const defaultOptions = {
      confirmButtonText: frenchkiss.t('confirmButtonText'),
    };
    return Swal.fire(Object.assign(defaultOptions, options));
  };

  const confirm = async (options: SweetAlertOptions) => {
    const defaultOptions = {
      title: frenchkiss.t('confirm.title'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: frenchkiss.t('confirmButtonText'),
      cancelButtonText: frenchkiss.t('cancelButtonText'),
      reverseButtons: true,
    };
    const result = await Swal.fire(Object.assign(defaultOptions, options));
    return result.isConfirmed;
  };

  const showLoading = (options?: SweetAlertOptions) => {
    const defaultOptions = {
      title: frenchkiss.t('loading.title'),
      allowOutsideClick: false,
      backdrop: true,
      didOpen() {
        Swal.showLoading();
      },
    };
    Swal.fire(Object.assign(defaultOptions, options));
  };

  const hideLoading = () => {
    Swal.close();
  };

  return {
    fire,
    confirm,
    showLoading,
    hideLoading,
    Swal,
  };
}
