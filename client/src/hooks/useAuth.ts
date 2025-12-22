import { trpc } from "@/lib/trpc";

/**
 * Hook to access current user authentication state
 * 
 * Returns:
 * - user: Current user object or null if not authenticated
 * - isLoading: True while checking authentication status
 * - isAuthenticated: True if user is logged in
 */
export function useAuth() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
  };
}

/**
 * Get the login URL for OAuth flow
 */
export function getLoginUrl() {
  return "/api/oauth/login";
}
