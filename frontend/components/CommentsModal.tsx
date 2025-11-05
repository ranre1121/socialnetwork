import { useEffect, useState } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";
import type { Post as PostType } from "@/types/Types";
import profilePlaceholder from "@/public/images/profile-placeholder.png";
import { formatPostDate } from "@/utils/utils";
import type { Comment } from "@/types/Types";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CommentsModalProps = {
  post: PostType;
  onClose: () => void;
  onRefetch: () => void;
};

const CommentsModal = ({ post, onRefetch, onClose }: CommentsModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const router = useRouter();

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/posts/comment/${post.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setComments(data.updatedComments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/posts/comment/${post.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ commentContent: newComment }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setNewComment("");
        fetchComments();
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:8000/posts/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) console.log("smth wrong");
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={() => {
        onRefetch();
        onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-800 w-[600px] rounded-xl shadow-xl p-6 max-h-[80vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            onRefetch();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
        >
          <X className="size-5" />
        </button>
        <div className="flex gap-3">
          <Image
            alt="profile-picture"
            src={profilePlaceholder}
            className="size-8  rounded-full"
          />
          <div>
            <span className="flex gap-1 items-center">
              <p
                className="font-semibold cursor-pointer hover:underline dark:text-white"
                onClick={() => router.push(`/profile/${post.author.username}`)}
              >
                {post.author?.name}
              </p>
              <p className="text-gray-500">@{post.author?.username}</p>
              <p className="text-gray-500">
                · {formatPostDate(post.createdAt)}
              </p>
            </span>
            <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-all">
              {post?.content
                .split("\n")
                .map((line: string) => line.trimStart())
                .join("\n")}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-300 dark:border-gray-700 my-4" />

        {loading ? (
          <div className="flex justify-center w-full">
            <Loader2 className="w-6 h-6 text-gray-500 dark:text-gray-300 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          <div className="flex flex-col gap-3 ">
            <p className="text-lg font-bold">Comments</p>
            {comments.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 border-gray-200 dark:border-gray-700 pb-3"
              >
                <Image
                  src={profilePlaceholder}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex w-full items-center">
                  <div>
                    <p className="text-sm font-semibold dark:text-white">
                      {c.author.name}{" "}
                      <span className="text-gray-500">
                        @{c.author.username}
                      </span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">{c.text}</p>
                  </div>
                  {c.isOwner && (
                    <div className="ml-auto">
                      {confirmDelete !== c.id && (
                        <Trash2
                          className="size-5 hover:text-red-500 cursor-pointer"
                          onClick={() => {
                            setConfirmDelete(c.id);
                          }}
                        />
                      )}
                      {confirmDelete === c.id && (
                        <div className="flex gap-2">
                          <Check
                            className="hover:text-green-500 cursor-pointer"
                            onClick={() => handleDelete(c.id)}
                          />
                          <X
                            className="hover:text-red-500 cursor-pointer"
                            onClick={() => setConfirmDelete(null)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center mt-5 gap-2 border-t dark:border-gray-700 pt-3">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            onClick={handleAddComment}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
