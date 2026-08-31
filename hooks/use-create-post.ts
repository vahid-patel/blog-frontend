import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  CreatePostRequest,
} from "@/services/posts";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) =>
      createPost(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });
}