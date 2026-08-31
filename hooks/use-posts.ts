import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/services/posts";

export function usePosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ["posts", page, limit],
    queryFn: () => getPosts(page, limit),
  });
}