export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      blog_post_reports: {
        Row: {
          id: string
          post_id: string
          report_details: string
          report_reason: string
          report_timestamp: string | null
          reporter_id: string
          status: string | null
        }
        Insert: {
          id?: string
          post_id: string
          report_details: string
          report_reason: string
          report_timestamp?: string | null
          reporter_id: string
          status?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          report_details?: string
          report_reason?: string
          report_timestamp?: string | null
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          allow_comments: boolean | null
          attachment_urls: Json | null
          author_id: string | null
          category_id: string | null
          comments_count: number | null
          content: string | null
          estimated_reading_time: number | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          keywords: string | null
          likes_count: number | null
          meta_description: string | null
          meta_title: string | null
          pin: boolean | null
          publish_date: string | null
          seo_description: string | null
          seo_title: string | null
          settings_updated_at: string | null
          share_count: number | null
          slug: string
          status: string | null
          subtitle: string
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          allow_comments?: boolean | null
          attachment_urls?: Json | null
          author_id?: string | null
          category_id?: string | null
          comments_count?: number | null
          content?: string | null
          estimated_reading_time?: number | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          keywords?: string | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          pin?: boolean | null
          publish_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          settings_updated_at?: string | null
          share_count?: number | null
          slug: string
          status?: string | null
          subtitle: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          allow_comments?: boolean | null
          attachment_urls?: Json | null
          author_id?: string | null
          category_id?: string | null
          comments_count?: number | null
          content?: string | null
          estimated_reading_time?: number | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          keywords?: string | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          pin?: boolean | null
          publish_date?: string | null
          seo_description?: string | null
          seo_title?: string | null
          settings_updated_at?: string | null
          share_count?: number | null
          slug?: string
          status?: string | null
          subtitle?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          followers: number | null
          id: string
          name: string
          post_length: number | null
          slug: string
        }
        Insert: {
          followers?: number | null
          id?: string
          name: string
          post_length?: number | null
          slug: string
        }
        Update: {
          followers?: number | null
          id?: string
          name?: string
          post_length?: number | null
          slug?: string
        }
        Relationships: []
      }
      category_followed_by: {
        Row: {
          category_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_followed_by_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          id: string
          report_details: string
          report_reason: string
          report_timestamp: string | null
          reporter_id: string
          status: string | null
        }
        Insert: {
          comment_id: string
          id?: string
          report_details: string
          report_reason: string
          report_timestamp?: string | null
          reporter_id: string
          status?: string | null
        }
        Update: {
          comment_id?: string
          id?: string
          report_details?: string
          report_reason?: string
          report_timestamp?: string | null
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number
          list_id: string | null
          post_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          list_id?: string | null
          post_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          list_id?: string | null
          post_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      like_by: {
        Row: {
          post_id: string
          user_id: string
        }
        Insert: {
          post_id: string
          user_id: string
        }
        Update: {
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "like_by_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      like_by_comments: {
        Row: {
          comment_id: string
          liked_at: string | null
          user_id: string
        }
        Insert: {
          comment_id: string
          liked_at?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string
          liked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "like_by_comments_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      like_by_replies: {
        Row: {
          replies_id: string
          user_id: string
        }
        Insert: {
          replies_id: string
          user_id: string
        }
        Update: {
          replies_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "like_by_replies_replies_id_fkey"
            columns: ["replies_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
        ]
      }
      muted_authors: {
        Row: {
          created_at: string | null
          id: string
          muted_author_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          muted_author_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          muted_author_id?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          message: string
          sender_id: string | null
          status: Database["public"]["Enums"]["notification_status"] | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
          sender_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
          sender_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          description: string | null
          email: string
          follower_length: number | null
          following_length: number | null
          id: number
          profile_url: string | null
          user_id: string
          username: string
        }
        Insert: {
          description?: string | null
          email: string
          follower_length?: number | null
          following_length?: number | null
          id?: never
          profile_url?: string | null
          user_id: string
          username: string
        }
        Update: {
          description?: string | null
          email?: string
          follower_length?: number | null
          following_length?: number | null
          id?: never
          profile_url?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      replies: {
        Row: {
          comment_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number
          list_id: string | null
          parent_reply_id: string | null
          post_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number
          list_id?: string | null
          parent_reply_id?: string | null
          post_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number
          list_id?: string | null
          parent_reply_id?: string | null
          post_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replies_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_posts: {
        Row: {
          id: string
          isChecked: boolean | null
          list_id: string | null
          post_id: string
          saved_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          isChecked?: boolean | null
          list_id?: string | null
          post_id: string
          saved_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          isChecked?: boolean | null
          list_id?: string | null
          post_id?: string
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_category_preferences: {
        Row: {
          category_id: string
          interaction_type: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          interaction_type?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          interaction_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_category_preferences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_info: {
        Row: {
          author_id: string
          created_at: string | null
          follower_id: string
          id: string
        }
        Insert: {
          author_id: string
          created_at?: string | null
          follower_id: string
          id?: string
        }
        Update: {
          author_id?: string
          created_at?: string | null
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      user_lists: {
        Row: {
          created_at: string | null
          description: string
          id: string
          name: string
          slug: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          name: string
          slug?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          slug?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      decrement_category_follower: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      decrement_comment_like: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      decrement_follower: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      decrement_replies_like: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      increment: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      increment_category_follower:
        | {
            Args: {
              x: number
              row_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              x: number
              row_id: string
              user_id: string
            }
            Returns: Json
          }
      increment_comment_like: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      increment_follower: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
      increment_replies_like: {
        Args: {
          x: number
          row_id: string
          user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      notification_status: "read" | "unread"
      post_visibility: "public" | "private" | "draft"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
