import type { User } from "@supabase/supabase-js";

export const findPostAuthor = (users: User[],author_id: string) => {
    return users.find((u) => u.id === author_id);
};