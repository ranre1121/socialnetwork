import profilePlaceholder from "@/public/images/profile-placeholder.png";
import { Trash2Icon, Check, X } from "lucide-react";
import { useUser } from "../context/UserContext";

import type { Post as PostType } from "../types/Types";
import { useState } from "react";
import { Heart } from "lucide-react";
import { MessageCircleMore } from "lucide-react";
import Image from "next/image";
import heart from "@/public/images/heart.svg";
import CommentsModal from "./CommentsModal";
import { formatPostDate } from "@/utils/utils";
import { useRouter } from "next/navigation";

type PostTypes = {
  post: PostType;
  onFetch: () => void;
};

const Post = ({ post, onFetch }: PostTypes) => {
  const { user } = useUser();
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [liked, setLiked] = useState(post.liked);
  const [confirmationActive, setConfirmationActive] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleDelete = async (postId: number) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/posts/${postId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) onFetch();
      else console.error(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: number) => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/posts/like/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) console.error(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-start gap-3">
      <Image
        alt="profile-picture"
        src={profilePlaceholder}
        className="rounded-full size-7"
      />
      <div className="w-full">
        <span className="flex gap-1 items-center">
          <p
            className="font-semibold cursor-pointer hover:underline dark:text-white"
            onClick={() => router.push(`/profile/${post.author.username}`)}
          >
            {post.author?.name}
          </p>
          <p className="text-gray-500">@{post.author?.username}</p>
          <p className="text-gray-500">· {formatPostDate(post.createdAt)}</p>

          {user?.username === post.author?.username &&
            (!confirmationActive ? (
              <Trash2Icon
                className="ml-auto size-5 hover:text-red-500 cursor-pointer"
                onClick={() => setConfirmationActive(true)}
              />
            ) : (
              <div className="ml-auto flex gap-3 items-center">
                <p className="text-md">Delete post?</p>
                <div className="flex gap-2">
                  <Check
                    className="hover:text-green-500 cursor-pointer"
                    onClick={() => handleDelete(post.id)}
                  />
                  <X
                    className="hover:text-red-500 cursor-pointer"
                    onClick={() => setConfirmationActive(false)}
                  />
                </div>
              </div>
            ))}
        </span>

        <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap break-all">
          {post?.content
            .split("\n")
            .map((line: string) => line.trimStart())
            .join("\n")}
        </p>
        <div className="flex mt-3 gap-5 items-center">
          <span
            className="flex items-center cursor-pointer group"
            onClick={() => {
              handleLike(post.id);
              setLiked(liked ? false : true);
              setLikesCount(liked ? likesCount - 1 : likesCount + 1);
            }}
          >
            {liked ? (
              <Image alt="like" className="size-4.5" src={heart} />
            ) : (
              <Heart className={`size-4.5 `} />
            )}
            &nbsp;
            <p>{likesCount}</p>
          </span>

          <span
            className="flex items-center group cursor-pointer"
            onClick={() => setShowComments(true)}
          >
            <MessageCircleMore className="size-4.5 group-hover:text-sky-500" />
            &nbsp;
            <p>{post.commentsCount}</p>
          </span>
        </div>
      </div>
      {showComments && (
        <CommentsModal
          post={post}
          onRefetch={onFetch}
          onClose={() => {
            setShowComments(false);
          }}
        />
      )}
    </div>
  );
};

export default Post;
