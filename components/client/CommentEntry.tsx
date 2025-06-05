"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import CommentForm from "@/components/forms/Comment"; // Ensure this is your correct comment form component

// Define types locally to match SerializedComment and SerializedAuthor from page.tsx
interface LocalSerializedAuthor {
  id: string;
  name: string;
  image: string;
}

interface LocalSerializedComment {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: LocalSerializedAuthor;
  comments?: LocalSerializedComment[];
}

interface CommentEntryProps {
  comment: LocalSerializedComment;
  currentUserId: string; // This should be the Database User ID for posting comments
  clerkUserId: string; // This is the Clerk User ID, often used by ThreadCard for its internal logic
  currentUserImg: string;
  originalThreadId: string;
  level: number;
}

export default function CommentEntry({
  comment,
  currentUserId,
  clerkUserId,
  currentUserImg,
  originalThreadId,
  level,
}: CommentEntryProps) {
  const [isReplyFormOpen, setIsReplyFormOpen] = useState(false);
  const router = useRouter();

  const toggleReplyForm = () => {
    setIsReplyFormOpen(!isReplyFormOpen);
  };

  const handleCommentSubmitted = () => {
    setIsReplyFormOpen(false); // Close the form
    router.refresh(); // Re-fetch data for the current route to show the new comment
  };

  const displayLevel = Math.min(level, 5); // Cap visual nesting depth
  
  // replyFormMarginLeft determines the left margin to align with the start of the next comment level item
  let replyFormMarginLeft = "ml-8"; // Default: for a level 0 comment, reply form starts where a level 1 comment (pl-8) would.
  if (displayLevel === 1) { // Parent comment is level 1 (pl-8)
    replyFormMarginLeft = "ml-12"; // Reply form starts where a level 2 comment (pl-12) would.
  } else if (displayLevel === 2) { // Parent comment is level 2 (pl-12)
    replyFormMarginLeft = "ml-16"; // Reply form starts where a level 3 comment (pl-16) would.
  } else if (displayLevel >= 3) { // Parent comment is level 3+ (pl-16)
    replyFormMarginLeft = "ml-16"; // Cap indentation for reply form margin as well.
  }


  return (
    <div className={`comment-thread w-full`}>
      <div className={`comment-item comment-level-${displayLevel}`}>
        {displayLevel > 0 && <div className="comment-connector" />}
        <ThreadCard
          id={comment.id}
          parentId={comment.parentId}
          content={comment.content}
          author={comment.author}
          community={null} 
          createdAt={comment.createdAt}
          comments={[]} 
          currentUserId={clerkUserId} 
          isComment={true}
          onReplyAction={toggleReplyForm}
        />
      </div>

      {isReplyFormOpen && (
        // Apply the calculated margin and the same conditional horizontal padding as ThreadCard (for comments)
        <div className={`${replyFormMarginLeft} mt-2 px-0 xs:px-7`}>
          <CommentForm
            threadId={originalThreadId} 
            currentUserImg={currentUserImg}
            currentUserId={currentUserId} 
            parentId={comment.id} 
            onCommentSubmitted={handleCommentSubmitted}
          />
        </div>
      )}

      {/* Recursively render nested comments */}
      {comment.comments &&
        comment.comments.length > 0 &&
        comment.comments.map((subComment) => (
          <CommentEntry
            key={subComment.id}
            comment={subComment}
            currentUserId={currentUserId}
            clerkUserId={clerkUserId}
            currentUserImg={currentUserImg}
            originalThreadId={originalThreadId}
            level={level + 1} 
          />
        ))}
    </div>
  );
}
