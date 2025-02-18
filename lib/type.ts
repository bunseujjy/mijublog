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
    publish_date: string;
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
    pin: boolean;
    allow_comments: boolean;
    seo_title: string;
    seo_description: string;
    settings_updated_at: string;
}

export type BlogPostUpdate = Partial<Pick<BlogData,
  | 'title'
  | 'subtitle'
  | 'content'
  | 'visibility'
  | 'allow_comments'
  | 'tags'
  | 'seo_title'
  | 'seo_description'
>>;
export interface BaseComment {
  id: string;
  content: string;
  likes_count: number;
}

export interface Comment extends BaseComment {
  post_id: string | null;
  list_id: string | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  status: string | null;
  type: string | null;
}

export type CommentResponse = Comment[];

export interface Replies {
  id: string;
  comment_id: string;
  post_id: string;
  list_id: string;
  user_id: string;
  parent_reply_id: string;
  content: string;
  likes_count: number;
  created_at: Date;
  updated_at: Date;
  status: string;
  type: string;
}

export interface PublicUser {
  id: string;
  user_id: string;
  username: string;
  email: string;
  profile_url: string;
  description: string;
  follower_length: number;
  following_length: number;
}

export interface PublicUser {
  id: string;
  profile_url: string;
  username: string;
  email: string;
  description: string;
  follower_length: number;
  following_length: number;
}

export type Lists = {
  id: string;
  user_id: string;
  name: string;
  slug: string | null; // Allow null
  description: string | null;
  status: string | null;
  created_at: string | null; // Ensure consistency
};


export interface SavedPosts {
  user_id: string;
  post_id: string;
  id: string;
  saved_at: Date;
  list_id: string
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  post_length: number;
  followers: number;
}

export interface FollowInfo {
  id: string;
  follower_id: string;
  author_id: string;
  created_at: Date;
}

export type Notifications = {
  id: number; // Matches the database type
  user_id: string | null; // Allow null values
  sender_id: string | null; // Allow null values
  message: string;
  status: "read" | "unread" | null; // Allow null values
  type: string | null; // Allow null values
  created_at: string | null; // Allow null values for timestamps
  updated_at: string | null; // Allow null values for timestamps
};


export interface Notification {
  id: string
  user_id: string
  type: 'email' | 'push'
  title: string
  message: string
  read: boolean
  created_at: string
}

export interface NotificationPreferences {
  email_enabled: boolean
  push_enabled: boolean
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}