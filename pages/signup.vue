<script setup>
  import { useToast } from '~/components/ui/toast';
  const router = useRouter()
  const client = useSupabaseClient();
  const { toast } = useToast()
  const email = ref('')
  const username = ref('')
  const password = ref('')
  const desc = ref('')
  const showPassword = ref(false)

  const handleSubmit = async () => {
  const { data, error } = await client.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        username: username.value,
        profile_url: "/default-pf.jpg",
        description: desc.value,
      }
    }
  });

  // Check if user was created successfully
  if (error) {
    console.error('Error signing up:', error);
    toast({ description: 'Failed to sign up', variant: 'destructive' });
    return; // Exit the function if there was an error
  }

  // Proceed to create the profile only if data is valid
  if (data && data.user) {
    const { error: profileError } = await client
      .from('profiles')
      .insert({
        username: username.value,
        email: email.value, // Ensure this is valid and not null
        profile_url: "/default-pf.jpg",
        description: desc.value,
        user_id: data.user.id // Use the newly created user's ID
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      toast({ description: 'Failed to create profile', variant: 'destructive' });
    } else {
      router.push('/');
      toast({ description: 'Sign up successfully' });
      return data;
    }
  } else {
    console.error('Unexpected response structure:', data);
    toast({ description: 'Unexpected response from signup', variant: 'destructive' });
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">

    <Head>
      <Title>Sign-up</Title>
      <Meta name="description"
        content="Sign-up to explore our blog and you can like, comment, share, posting blog that you want to share here." />
    </Head>
    <div class="w-full max-w-md">
      <!-- Card Container -->
      <div class="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
        <!-- Logo/Brand -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p class="text-gray-400 mt-2">Join us on this amazing journey</p>
        </div>

        <!-- Social Login Buttons -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <button
            class="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-gray-700 transition-all duration-300">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4" />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853" />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05" />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335" />
            </svg>
            <span class="text-sm text-gray-300">Google</span>
          </button>
          <button
            class="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-gray-700 transition-all duration-300">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            <span class="text-sm text-gray-300">Facebook</span>
          </button>
        </div>

        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-800/40 text-gray-400">Or sign up with email</span>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input type="email" v-model="email"
              class="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter your email">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input type="username" v-model="username"
              class="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter your username">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input :type="showPassword ? 'text' : 'password'" v-model="password"
              class="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter your password">
          </div>

          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input type="checkbox"
                class="w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500">
              <span class="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <a href="#" class="text-sm text-purple-400 hover:text-purple-300">Forgot password?</a>
          </div>

          <button type="submit"
            class="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transform hover:scale-[1.02] transition-all duration-300">
            Sign up
          </button>
        </form>

        <!-- Sign up Link -->
        <p class="mt-6 text-center text-sm text-gray-400">
          Already have an account?
          <a href="/signin" class="text-purple-400 hover:text-purple-300 font-medium">Sign in</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  body {
    font-family: 'Inter', sans-serif;
  }
</style>