import profilePlaceholder from "../../public/images/profile-placeholder.png";
import { Trash2Icon } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import type { Post as PostType } from "../types/Types";

type PostProps = {
  post: PostType;
  onFetch: () => void;
};

// Format like Twitter
const formatPostDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffHours < 24) {
    if (diffHours === 0) {
      if (diffMinutes === 0) {
        return "Just now";
      }
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  } else {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
};

const Post = ({ post, onFetch }: PostProps) => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleDelete = async (postId: number) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/posts/delete/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.error);
      } else {
        onFetch();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-start gap-3">
      <img src={profilePlaceholder} className="rounded-full size-7" />
      <div className="w-full">
        <span className="flex gap-1 items-center">
          <p
            className="font-semibold cursor-pointer hover:underline dark:text-white"
            onClick={() => navigate(`/profile/${post.author}`)}
          >
            {post.name}
          </p>
          <p className="text-gray-500">@{post.author}</p>
          <p className="text-gray-500">· {formatPostDate(post.createdAt)}</p>
          {user?.username === post.author && (
            <Trash2Icon
              className="ml-auto size-5 hover:text-red-500 cursor-pointer"
              onClick={() => handleDelete(post.id)}
            />
          )}
        </span>

        <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">
          {post.content
            .split("\n")
            .map((line) => line.trimStart())
            .join("\n")}
        </p>
      </div>
    </div>
  );
};

export default Post;
