import { getAuthorDetails } from "~/lib/getAuthorDetails";
import type { NotificationPreferences, Notifications } from "~/lib/type";
import type { Database } from "~/supabase";

export const useNotifications = () => {
  const supabase = useSupabaseClient<Database>();
  const { user: currentUser, users } = useAuth();
  // Make notifications state reactive
  const channel = ref();
  const notifications = useState<Notifications[]>("notifications", () => []);
  const preferences = useState<NotificationPreferences>(
    "notificationPreferences",
    () => ({
      email_enabled: false,
      push_enabled: false,
    })
  );
  const isLoading = ref(false);

  const updateEmailPreference = async (enabled: boolean) => {
    isLoading.value = true;
    try {
      const { data } = await useFetch("/api/notifications/email", {
        method: "POST",
        body: { enabled },
      });
      if (data.value) {
        preferences.value.email_enabled = enabled;
      }
      return { success: true };
    } catch (error) {
      console.error("Email preference update failed:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  };

  const subscribePushNotification = async (subscription: PushSubscription) => {
    isLoading.value = true;
    try {
      const { data } = await useFetch("/api/notifications/push/subscribe", {
        method: "POST",
        body: subscription,
      });
      if (data.value) {
        preferences.value.push_enabled = true;
      }
      return { success: true };
    } catch (error) {
      console.error("Push subscription failed:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  };

  const unsubscribePushNotification = async (endpoint: string) => {
    isLoading.value = true;
    try {
      const { data } = await useFetch("/api/notifications/push/unsubscribe", {
        method: "POST",
        body: { endpoint },
      });
      if (data.value) {
        preferences.value.push_enabled = false;
      }
      return { success: true };
    } catch (error) {
      console.error("Push unsubscribe failed:", error);
      return { success: false, error };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single()
      
      if (error) throw error
      if (data) {
        preferences.value = data as any
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const fetchNotification = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", currentUser.value?.id ?? "");

    if (error) {
      console.error("Error fetching notifications:", error.message);
      return;
    }

    // Update global state
    notifications.value = data || [];
  };

  const followNotification = async (author_id: string) => {
    const newNotification = {
      user_id: author_id,
      sender_id: currentUser.value?.id,
      message: `${currentUser?.value?.user_metadata?.username} started following you`,
      type: "follow",
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(newNotification)
      .select()
      .single();

    if (error) {
      console.error("Error creating follow notification:", error.message);
      return null;
    }

    // Update local state
    notifications.value = [data, ...notifications.value];
    return data;
  };

  const unfollowNotification = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .delete()
      .eq("sender_id", currentUser?.value?.id ?? "");
    if (error) {
      console.error(error.message);
    }
    return data;
  };

  const clearNotification = async (id: number) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error clearing notification:", error.message);
      return null;
    }

    // Update local state immediately after successful deletion
    notifications.value = notifications.value.filter(
      (notification) => notification.id !== id
    );
    return true;
  };

  const clearAllNotifications = async () => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .or(
        `sender_id.eq.${currentUser?.value?.id ?? ""},user_id.eq.${currentUser?.value?.id ?? ""}`
      );

    if (error) {
      console.error("Error clearing all notifications:", error.message);
      return null;
    }

    // Clear local state
    notifications.value = [];
    return true;
  };

  const markAllNotificationAsRead = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .or(
        `sender_id.eq.${currentUser?.value?.id ?? ""},user_id.eq.${currentUser?.value?.id ?? ""}`
      )
      .select("*");

    if (error) {
      console.error("Error marking notifications as read:", error.message);
      return null;
    }

    // Update local state with read status
    notifications.value = notifications.value.map((notification) => ({
      ...notification,
      status: "read",
    }));

    return data;
  };

  const setupRealtimeNotifications = () => {
    if (channel.value) {
      channel.value.unsubscribe();
    }

    channel.value = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Only add if it's relevant to current user
            if (payload.new.user_id === currentUser.value?.id) {
              notifications.value = [
                payload.new as Notifications,
                ...notifications.value,
              ];
            }
          } else if (payload.eventType === "UPDATE") {
            notifications.value = notifications.value.map((n) =>
              n.id === payload.new?.id ? (payload.new as Notifications) : n
            );
          } else if (payload.eventType === "DELETE") {
            notifications.value = notifications.value.filter(
              (n) => n.id !== payload.old?.id
            );
          }
        }
      )
      .subscribe();

    return channel.value;
  };

  // Cleanup on component unmount
  onUnmounted(() => {
    if (channel.value) {
      channel.value.unsubscribe();
    }
  });

  // Watch for user changes and update notifications
  watch(currentUser, () => {
    if (currentUser.value) {
      fetchNotification();
      setupRealtimeNotifications();
    } else {
      notifications.value = []; // Clear notifications when user logs out
    }
  });

  return {
    preferences,
    isLoading,
    subscribePushNotification,
    updateEmailPreference,
    unsubscribePushNotification,
    fetchNotificationPreferences,
    notifications,
    followNotification,
    clearNotification,
    fetchNotification,
    markAllNotificationAsRead,
    clearAllNotifications,
    setupRealtimeNotifications,
    unfollowNotification,
  };
};
