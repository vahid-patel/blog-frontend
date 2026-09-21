import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  getAllUsers,
  deleteMyAccount,
  deleteUserById,
  type UserProfile,
} from "@/services/users";
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

export function useAllUsers() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  return useQuery({
    queryKey: ["users", "all"],
    queryFn: getAllUsers,
    enabled: isAuthenticated && isAdmin,
  });
}

export function useDeleteMyAccount() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => {
      logout();
      queryClient.clear();
      window.location.href = "/";
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}