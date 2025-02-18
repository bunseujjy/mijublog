<script setup lang="ts">
    import { KeyIcon, LoaderIcon } from 'lucide-vue-next';
    import { useToast } from '~/components/ui/toast';

    const router = useRouter();
    const supabase = useSupabaseClient();
    const { toast } = useToast();

    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const emailError = ref('');
    const passwordError = ref('');
    const confirmPasswordError = ref('');
    const isLoading = ref(false);

    const passwordStrength = computed(() => {
        const strength = calculatePasswordStrength(password.value);
        return Math.min(strength * 25, 100);
    });

    const passwordStrengthClass = computed(() => {
        if (passwordStrength.value < 25) return 'bg-red-500';
        if (passwordStrength.value < 50) return 'bg-orange-500';
        if (passwordStrength.value < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    });

    const isFormValid = computed(() => {
        return email.value && password.value.length >= 6 && password.value === confirmPassword.value;
    });

    const calculatePasswordStrength = (pwd: string) => {
        let strength = 0;
        if (pwd.length >= 6) strength++;
        if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
        if (pwd.match(/\d/)) strength++;
        if (pwd.match(/[^a-zA-Z\d]/)) strength++;
        return strength;
    };

    const validateEmail = () => {
        emailError.value = '';
        if (!email.value) {
            emailError.value = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email.value)) {
            emailError.value = 'Please enter a valid email address';
        }
    };

    const validatePassword = () => {
        passwordError.value = '';
        if (password.value.length < 6) {
            passwordError.value = 'Password must be at least 6 characters long';
        }
    };

    const validateConfirmPassword = () => {
        confirmPasswordError.value = '';
        if (password.value !== confirmPassword.value) {
            confirmPasswordError.value = 'Passwords do not match';
        }
    };

    const handleSubmit = async () => {
        validateEmail();
        validatePassword();
        validateConfirmPassword();

        if (emailError.value || passwordError.value || confirmPasswordError.value) {
            toast({
                description: 'Please correct the errors in the form',
                variant: 'destructive'
            });
            return;
        }

        isLoading.value = true;
        try {
            const { data, error } = await supabase.auth.updateUser({
                email: email.value,
                password: confirmPassword.value
            });

            if (error) throw error;

            if (data) {
                toast({
                    description: 'Password reset successful',
                });
                router.push('/signin');
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                description: 'An error occurred while resetting your password. Please try again later.',
                variant: 'destructive'
            });
        } finally {
            isLoading.value = false;
        }
    };
</script>

<template>
    <div
        class="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <div class="max-w-md w-full">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
                <div class="p-8">
                    <div class="flex justify-center mb-8">
                        <div class="bg-green-100 dark:bg-green-900 rounded-full p-3">
                            <KeyIcon class="w-8 h-8 text-green-500 dark:text-green-400" />
                        </div>
                    </div>
                    <h2 class="text-3xl font-bold text-center text-gray-800 dark:text-white mb-4">Reset Password</h2>
                    <p class="text-center text-gray-600 dark:text-gray-300 mb-8">
                        Enter your email and new password below to reset your account.
                    </p>
                    <form @submit.prevent="handleSubmit" class="space-y-6">
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input id="email" v-model="email" type="email" required
                                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-150 ease-in-out"
                                :class="{ 'border-red-500 dark:border-red-400': emailError }" />
                            <p v-if="emailError" class="mt-1 text-sm text-red-500 dark:text-red-400">{{ emailError }}
                            </p>
                        </div>
                        <div>
                            <label for="password"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <input id="password" v-model="password" type="password" required
                                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-150 ease-in-out"
                                :class="{ 'border-red-500 dark:border-red-400': passwordError }" />
                            <p v-if="passwordError" class="mt-1 text-sm text-red-500 dark:text-red-400">{{ passwordError
                                }}</p>
                            <div class="mt-2">
                                <div class="text-sm text-gray-600 dark:text-gray-400">Password strength:</div>
                                <div class="h-2 w-full bg-gray-200 rounded-full mt-1">
                                    <div class="h-full rounded-full transition-all duration-300 ease-in-out"
                                        :class="passwordStrengthClass" :style="{ width: `${passwordStrength}%` }"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label for="confirmPassword"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm Password
                            </label>
                            <input id="confirmPassword" v-model="confirmPassword" type="password" required
                                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-150 ease-in-out"
                                :class="{ 'border-red-500 dark:border-red-400': confirmPasswordError }" />
                            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-500 dark:text-red-400">{{
                                confirmPasswordError }}</p>
                        </div>
                        <button type="submit"
                            class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                            :disabled="isLoading || !isFormValid">
                            <span v-if="isLoading" class="flex items-center justify-center">
                                <LoaderIcon class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                Resetting...
                            </span>
                            <span v-else>Reset Password</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>