import { ref, computed } from "vue";
import { useToast } from "~/components/ui/toast";

export const useAuth = () => {
  const user = useSupabaseUser();
  const loading = ref(false);
  const error = ref(null);
  const {toast} = useToast();
  const currentUser = computed(() => user.value);

  const signOut = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { error: signOutError } = await useSupabaseClient().auth.signOut();
      if (signOutError) throw signOutError;

      toast({description: "Signed out successfully"});
      navigateTo("/signin");
    } catch (e: any) {
      error.value = e.message;
      toast({description: "Error signing out", variant: 'destructive'});
    } finally {
      loading.value = false;
    }
  };

  return {
    user: currentUser,
    loading,
    error,
    signOut,
  };
};
