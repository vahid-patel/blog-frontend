import { useQuery } from "@tanstack/react-query";
import { getProfile, type UserProfile } from "@/services/users";
import { useAuthStore } from "@/store/auth-store";

export type { UserProfile };

export function useProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isAuthenticated,
  });
}