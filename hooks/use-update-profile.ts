import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProfile,
  UpdateProfileRequest,
} from "@/services/users";
import { useAuthStore } from "@/store/auth-store";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),

    onSuccess: (response) => {
      if (user) {
        setUser({
          ...user,
          name: response.updatedUser.name,
          email: response.updatedUser.email,
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
    },
  });
}