import type { User } from "@supabase/supabase-js"

// interface User {
//     user_id: string;
//     description: string;
//     email: string;
//     follower_length: number;
//     folling_length: number;
//     profile_url: string;
//     username: string
// }
export const getAuthorDetails = (users: User[],author_id: string) => {
    return users.find((u) => u.id === author_id)
}