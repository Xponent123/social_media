// ...existing imports...
import { useState } from "react";

function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  image,
  initialLikes,       // new prop: array of user IDs who liked the thread
  initialLikeCount,   // new prop: total like count
  ...rest
}: {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: { id: string; name: string; image: string };
  community: { id: string; name: string; image: string } | null;
  createdAt: string;
  comments: any[];
  image?: string;
  initialLikes: string[];
  initialLikeCount: number;
  [key: string]: any;
}) {
  const [likes, setLikes] = useState(initialLikes || []);
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
  const liked = likes.includes(currentUserId);

  const toggleLike = async () => {
    try {
      const res = await fetch("/api/thread/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.thread.likes);
        setLikeCount(data.thread.likeCount);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div {...rest}>
      {/* ...existing thread card content... */}
      <div className="flex items-center gap-2">
        <button onClick={toggleLike} className="btn-icon">
          {liked ? "💙" : "🤍"}
        </button>
        <span className="text-sm text-text-secondary">{likeCount}</span>
      </div>
    </div>
  );
}

export default ThreadCard;
