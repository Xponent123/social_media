// Recursive comment thread component for Reddit-style nested replies
"use client";
import ThreadCard from "./ThreadCard";

interface Author {
  id: string;
  name: string;
  image: string;
}

interface Community {
  id: string;
  name: string;
  image: string;
}

interface CommentData {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: Author;
  community: Community | null;
  comments: CommentData[];
  image?: string;
}

interface CommentThreadProps {
  comment: CommentData;
  currentUserId: string;
  level?: number;
}

const INDENT_SIZE = 20;

export default function CommentThread({ comment, currentUserId, level = 0 }: CommentThreadProps) {
  return (
    <div style={{ marginLeft: level * INDENT_SIZE, borderLeft: level > 0 ? '2px solid #e5e7eb' : undefined, paddingLeft: level > 0 ? 12 : 0 }}>
      <ThreadCard
        id={comment.id}
        currentUserId={currentUserId}
        parentId={comment.parentId}
        content={comment.content}
        author={comment.author}
        community={comment.community}
        createdAt={comment.createdAt}
        comments={comment.comments.map(child => ({ author: { image: child.author.image }, childCount: child.comments?.length || 0 }))}
        isComment={true}
        image={comment.image}
      />
      {comment.comments && comment.comments.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {comment.comments.map((child) => (
            <CommentThread key={child.id} comment={child} currentUserId={currentUserId} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
