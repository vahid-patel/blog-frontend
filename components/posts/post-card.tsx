import { Post } from "@/services/posts";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Author */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900">
          {post.author.name}
        </p>

        <p className="text-xs text-gray-500">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {post.title}
        </h2>

        {post.summary && (
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {post.summary}
          </p>
        )}
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center gap-4 border-t pt-4 text-sm text-gray-500">
        <span>▲ {post.upvotesCount}</span>

        <span>▼ {post.downvotesCount}</span>

        <span>Score: {post.score}</span>
      </div>
    </article>
  );
}