export interface Drama {
    rank: number;
    author: string;
    title: string;
    genre: string[];
    release_date: string;
    description: string;
    cast: string[];
    poster_url: string;
  }
  
export  interface BlogData {
    id: string;
    title: string;
    slug: string | null;
    subtitle: string;
    content: string | null;
    featured_image_url: string | undefined;
    author_id: string
    publish_date: Date;
    updated_at: Date;
    status: string;
    meta_title: string | null;
    meta_description: string | null;
    keywords: string | null;
    views_count: number;
    likes_count: number;
    comments_count: number;
    share_count: number;
    category_id: string | null;
    category_ids: string[] | null;
    tags: string[];
    is_featured: Boolean;
    estimated_reading_time: number | null;
    visibility: string;
    attachment_urls: JSON | null;
    poster: string;
    date: string;
    dramas: Drama[];
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
  status: string
}

export interface Replies {
  id: string;
  comment_id: string;
  post_id: string;
  user_id: string;
  parent_reply_id: string;
  content: string;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
  status: string
}

export interface User {
  id: string;
  username: string;
  email: string;
  // Add other fields that the user object contains
}