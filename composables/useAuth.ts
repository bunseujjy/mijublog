import { useToast } from "~/components/ui/toast";
import { useRouter } from 'vue-router';
import type { User } from "@supabase/supabase-js";
import type { PublicUser } from "~/lib/type";

export const useAuth = () => {
  const user = useSupabaseUser();
  const client = useSupabaseClient()
  const loading = ref(false);
  const error = ref(null);
  const { toast } = useToast();
  const currentUser = computed(() => user.value);
  const users = useState<User[]>('user', () => []);
  const public_user = useState<PublicUser[]>('public_user', () => [])
  const router = useRouter();
  const isUploading = ref(false)
  const profile_url = ref('')
  const photoFile = ref<File | null>(null)
  const username = ref('')
  const email = ref('')
  const desc = ref('')

  // Sign-out function
  const signOut = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { error: signOutError } = await useSupabaseClient().auth.signOut();
      if (signOutError) throw signOutError;

      toast({ description: "Signed out successfully" });
      router.push("/signin");
    } catch (e: any) {
      error.value = e.message;
      toast({ description: "Error signing out", variant: 'destructive' });
      console.error(e.message);
    } finally {
      loading.value = false;
    }
  };

  const fetchPublicUser = async () => {
      try {
        const client = useSupabaseClient()
        const {data, error} = await client.from("profiles").select("*")
        if(error) {
            throw new Error(error.message)
        }
        public_user.value = data || []
    } catch (error: any) {
        console.error(error.message)
    }
  }

  const handleAvatarChange = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    photoFile.value = file

    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>) => {
      profile_url.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const uploadAvatar = async () => {
    if (!photoFile.value) return null

    const fileExt = photoFile.value.name.split('.').pop()
    const fileName = `avatar_${Date.now()}.${fileExt}`

    const { error: uploadError, data } = await client.storage
      .from('profile_avatar')
      .upload(fileName, photoFile.value)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = client.storage
      .from('profile_avatar')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const updateUserProfile = async (publicUrl?: string) => {
    const { data: userData, error: updateError } = await client.auth.updateUser({
      email: email.value,
      data: {
        username: username.value || currentUser.value?.user_metadata.username,
        description: desc.value || currentUser.value?.user_metadata.description,
        profile_url: publicUrl || currentUser.value?.user_metadata.profile_url,
      },
    })

    if (updateError) throw updateError
    return userData
  }

  const updateUserNotification = async () => {
    const { data , error } = await client.auth.updateUser({
      data: {
        emailNotifications: 'enabled'
      }
    })
    if (data) throw error
    return data
  }

  // Fetching users when the component is mounted
  onMounted(async () => {
    try {
      const data = await getAllUser();
      users.value = data || [];
    } catch (error: any) {
      console.error("Failed to fetch users:", error);
    }
    await fetchPublicUser()
  });

  return {
    user: currentUser,
    loading,
    error,
    signOut,
    users,
    isUploading,
    profile_url,
    photoFile,
    handleAvatarChange,
    uploadAvatar,
    username,
    email,
    desc,
    updateUserProfile,
    updateUserNotification,
    public_user
  };
};
