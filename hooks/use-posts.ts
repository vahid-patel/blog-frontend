import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getPosts,
  getPostById,
  searchPosts,
  updatePost,
  deletePost,
  type UpdatePostRequest,
} from '@/services/posts';

export function usePosts(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['posts', page, limit],
    queryFn: () => getPosts(page, limit),
  });
}

export function useInfinitePosts(limit = 10) {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', limit],
    queryFn: ({ pageParam = 1 }) => getPosts(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}

export function useSearchPosts(keyword: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['posts', 'search', keyword, page, limit],
    queryFn: () => searchPosts(keyword, page, limit),
    enabled: !!keyword && keyword.trim().length > 0,
  });
}


export function usePost(id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    enabled: Boolean(id),
  });
}

export function useUpdatePost(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePostRequest) => updatePost(id, data),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(["post", id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}