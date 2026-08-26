import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/services/users";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
}