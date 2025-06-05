"use client";
import { useState } from "react";
import ThreadCard from "@/components/cards/ThreadCard";
import CommentForm from "@/components/forms/Comment";
import { useRouter } from "next/navigation";

// Author interface
interface Author {
  id: string;
  name: string;
  image: string;
}

// Comment data interface with proper content and author fields
interface CommentData {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: Author;
  comments: CommentData[];
}

interface ExpandableCommentThreadProps {
  comment: CommentData;
  currentUserId: string;
  mongoUserId: string;
  currentUserImg: string;
  currentUserName: string;
  originalThreadId: string;
  level: number;
}

export default function ExpandableCommentThread({
  comment,
  currentUserId,
  mongoUserId,
  currentUserImg,
  currentUserName,
  originalThreadId,
  level = 0,
}: ExpandableCommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [areRepliesVisible, setAreRepliesVisible] = useState(false);
  const router = useRouter();
  
  // Only allow replies for levels 0 and 1 (2 levels of nesting)
  const canReply = level < 2;
  const hasReplies = comment.comments && comment.comments.length > 0;
  
  const toggleReplies = () => setAreRepliesVisible(prev => !prev);
  
  const toggleReplyForm = () => {
    if (!canReply) return; // Don't allow replying if at max depth
    setShowReplyForm(prev => !prev);
  };

  const handleCommentSubmitted = () => {
    setShowReplyForm(false);
    setAreRepliesVisible(true);
    router.refresh();
  };

  return (
    <div className={`comment-thread-container level-${level}`}>
      {/* Display the comment - only pass onReplyAction if level < 2 */}
      <div className="comment-card">
        <ThreadCard
          id={comment.id}
          currentUserId={currentUserId}
          parentId={comment.parentId}
          content={comment.content}
          author={comment.author}
          community={null}
          createdAt={comment.createdAt}
          comments={comment.comments}
          isComment={true}
          onReplyAction={canReply ? toggleReplyForm : undefined} // Only provide reply function for levels 0 and 1
        />
      </div>

      {/* Only show reply form for allowed levels */}
      {canReply && showReplyForm && (
        <div className="reply-form-wrapper ml-4 sm:ml-8 mt-2">
          <CommentForm
            threadId={originalThreadId}
            currentUserImg={currentUserImg}
            currentUserId={mongoUserId}
            parentId={comment.id}
            onCommentSubmitted={handleCommentSubmitted}
          />
        </div>
      )}

      {/* Show/hide replies button */}
      {hasReplies && (
        <button
          onClick={toggleReplies}
          className="expand-replies-button ml-4 sm:ml-8 mt-2"
        >
          {areRepliesVisible ? "Hide" : "Show"} {comment.comments.length}{" "}
          {comment.comments.length === 1 ? "reply" : "replies"}
        </button>
      )}

      {/* Show nested replies with limited depth */}
      {hasReplies && areRepliesVisible && (
        <div className="replies-container ml-4 sm:ml-8 mt-2 pl-2 border-l-2 border-border/40">
          {comment.comments.map((reply) => (
            <ExpandableCommentThread
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              mongoUserId={mongoUserId}
              currentUserImg={currentUserImg}
              currentUserName={currentUserName}
              originalThreadId={originalThreadId}
              level={level + 1} // Increment level for nested comments
            />
          ))}
        </div>
      )}
    </div>
  );
}
