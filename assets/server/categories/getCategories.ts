export const getCategories = async () => {
    const client = useSupabaseClient();
    const { data, error } = await client.from("categories").select("*");
  
    if (error) {
      console.error("Error fetching categories:", error.message);
      return null;
    }
  
    return data; // Return data to the caller
  };
  