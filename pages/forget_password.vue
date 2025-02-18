  <script setup lang="ts">
  import { LockIcon, LoaderIcon } from 'lucide-vue-next';
  import { useToast } from '~/components/ui/toast';
  
  const router = useRouter();
  const { toast } = useToast();
  const supabase = useSupabaseClient()
  const email = ref('');
  const emailError = ref('');
  const isLoading = ref(false);
  const isDarkTheme = ref(false);
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleSubmit = async () => {
    emailError.value = '';
    if (!validateEmail(email.value)) {
      emailError.value = 'Please enter a valid email address';
      return;
    }
  
    isLoading.value = true;
    try {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      let { data, error } = await supabase.auth.resetPasswordForEmail(email.value)
      if (error) {
        throw new Error(error.message)
      }
      if (data) {
        console.log(data)
        toast({description: 'Check your email to reset the password.'})
      }
      email.value = '';
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    } finally {
      isLoading.value = false;
    }
  };
  
  const goToLogin = () => {
    router.push('/login');
  };
  
  </script>

<template>
    <div class="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div class="max-w-md w-full">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
          <div class="p-8">
            <div class="flex justify-center mb-8">
              <div class="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                <LockIcon class="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <h2 class="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">Forgot Password</h2>
            <p class="text-center text-gray-600 dark:text-gray-300 mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-150 ease-in-out"
                  :class="{ 'border-red-500 dark:border-red-400': emailError }"
                  placeholder="you@example.com"
                />
                <p v-if="emailError" class="mt-1 text-sm text-red-500 dark:text-red-400">{{ emailError }}</p>
              </div>
              <button
                type="submit"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="flex items-center justify-center">
                  <LoaderIcon class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Sending...
                </span>
                <span v-else>Reset Password</span>
              </button>
            </form>
            <div class="mt-6 text-center">
              <a href="#" @click.prevent="goToLogin" class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                Remember your password? Log in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>