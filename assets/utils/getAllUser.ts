import supabase from "~/utils/supabase";

export default async function () {
  const { data: { users: userList }, error } = await supabase().auth.admin.listUsers();

  if (error) {
    console.error("Error getting session:", error);
  } else {
    return userList;
  }
}
