import { useToast } from "~/components/ui/toast";

export default defineNuxtPlugin((nuxtApp) => {
    // Global error handler for Vue
    nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
      console.error('Vue Error:', error, info);
  
      if (error) {
        navigateTo('/error')
      }
      // Optional: Show an error notification or redirect
      useToast().toast({
        title: 'An error occurred',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive'
      });
    };
  
    // Nuxt-specific error hook
    nuxtApp.hook('vue:error', (error, instance, info) => {
      console.error('Nuxt Error:', error, info);
  
      // Example: Report to a logging service
      // reportErrorToService({ error, info });
      if (error) {
        navigateTo('/error')
      }
    });
  });
  