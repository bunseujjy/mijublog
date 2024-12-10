import { vOnClickOutside } from '@vueuse/components';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('clickOutside', vOnClickOutside);
});
