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
  type SortByOption,
} from '@/services/posts';

export function usePosts(page = 1, limit = 10, sortBy: SortByOption = 'newest', author?: string) {
  return useQuery({
    queryKey: ['posts', page, limit, sortBy, author],
    queryFn: () => getPosts(page, limit, sortBy, author),
  });
}

export function useUserPosts(
  authorId?: string,
  page = 1,
  limit = 10,
  sortBy: SortByOption = 'newest'
) {
  return useQuery({
    queryKey: ['posts', 'user', authorId, page, limit, sortBy],
    queryFn: () => getPosts(page, limit, sortBy, authorId),
    enabled: Boolean(authorId),
  });
}

export function useInfinitePosts(limit = 6, sortBy: SortByOption = 'newest') {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', limit, sortBy],
    queryFn: ({ pageParam = 1 }) => getPosts(pageParam, limit, sortBy),
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