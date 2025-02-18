import { useState } from '#app'

export interface NotificationState {
  email: boolean
  push: boolean
  isLoading: boolean
}

export function useNotificationState() {
  const state = useState<NotificationState>('notificationSettings', () => ({
    email: false,
    push: false,
    isLoading: false
  }))

  const setLoading = (loading: boolean) => {
    state.value.isLoading = loading
  }

  const updateEmailState = (enabled: boolean) => {
    state.value.email = enabled
  }

  const updatePushState = (enabled: boolean) => {
    state.value.push = enabled
  }

  return {
    state: readonly(state),
    setLoading,
    updateEmailState,
    updatePushState
  }
}