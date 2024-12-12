export const PUBLIC_ROUTES = ['/', '/signin', '/signup'] as const

export const isPublicRoute = (path: string) => {
  return PUBLIC_ROUTES.includes(path as typeof PUBLIC_ROUTES[number])
}

export const isAuthRoute = (path: string) => {
  return ['/signin', '/signup'].includes(path)
}