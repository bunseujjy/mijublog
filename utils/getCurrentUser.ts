// Get Current User
export default async function (currentUser: any) {
    const client = useSupabaseClient();
    const { data, error } = await client.auth.getSession();
  
    if (error) {
      throw new Error("Error getting session:", error);
    } else {
      currentUser.value = data.session?.user;
    }
}
