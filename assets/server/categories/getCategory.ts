export const getCategory = async (slug: ComputedRef<string | string[]>) => {
  const client = useSupabaseClient();
  const { data, error } = await client.from("categories").select("*").eq("slug", slug).single();
  if (error || !data) {
    console.error("Error fetching category:", error ? error.message : "No data found");
    return null;
  }
  return data;
};
