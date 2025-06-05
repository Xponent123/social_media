"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";

import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import { toggleLikeThread } from "@/lib/actions/thread.actions";
import { usePathname } from "next/navigation";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
    childCount?: number;
  }[];
  isComment?: boolean;
  image?: string;
  isLiked?: boolean;
  onReplyAction?: () => void;
}

function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
  image,
  isLiked: initialIsLiked, // Use the new prop
  onReplyAction, // Add this to the function parameter destructuring
}: Props) {
  const [liked, setLiked] = useState(initialIsLiked || false);
  // const [currentLikesCount, setCurrentLikesCount] = useState(initialLikesCount || 0);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleLikeClick = async () => {
    // Optimistic update
    setLiked(!liked);
    // setCurrentLikesCount(liked ? currentLikesCount - 1 : currentLikesCount + 1);

    startTransition(async () => {
      try {
        await toggleLikeThread(id, currentUserId, pathname);
        // Optionally re-fetch or rely on revalidatePath for count updates
      } catch (error) {
        console.error("Failed to toggle like:", error);
        // Revert optimistic update on error
        setLiked(liked); 
        // setCurrentLikesCount(liked ? currentLikesCount + 1 : currentLikesCount - 1);
      }
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`thread-card ${
        isComment ? "border-0 shadow-none pl-0" : ""
      } mb-5 w-full max-w-full`}
    >
      <div className='flex gap-3 md:gap-4 w-full'>
        {/* Author Avatar with animated hover effect */}
        <div className='flex-shrink-0'>
          <Link href={`/profile/${author.id}`} className='block'>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='relative h-8 w-8 md:h-10 md:w-10 overflow-hidden rounded-full bg-bg-tertiary'
            >
              <Image
                src={author.image}
                alt={author.name}
                fill
                sizes="(max-width: 768px) 32px, 40px"
                className='object-cover'
                priority
              />
            </motion.div>
          </Link>
        </div>

        {/* Thread Content */}
        <div className='flex-grow min-w-0 overflow-hidden'>
          <div className='flex items-center justify-between mb-1'>
            <Link href={`/profile/${author.id}`} className='hover:underline'>
              <h4 className='font-semibold text-text-primary text-sm md:text-base truncate max-w-[120px] md:max-w-none'>
                {author.name}
              </h4>
            </Link>

            {currentUserId === author.id && (
              <DeleteThread
                threadId={JSON.stringify(id)}
                currentUserId={currentUserId}
                authorId={author.id}
                parentId={parentId}
                isComment={isComment}
              />
            )}
          </div>

          <p className='text-text-secondary text-sm md:text-base mb-2 md:mb-3'>
            {content}
          </p>

          {/* Media rendering: show image or video */}
          {image && (
            <div className="mb-3 rounded-lg overflow-hidden">
              {image.match(/\.(mp4|webm|ogg)$/i) ? (
                <video src={image} controls className="object-cover w-full max-h-[350px] bg-black" />
              ) : (
                <Image
                  src={image}
                  alt="Thread media"
                  width={500}
                  height={300}
                  className="object-cover w-full max-h-[350px]"
                />
              )}
            </div>
          )}

          {/* Action Buttons with animations */}
          <div className='flex gap-3 md:gap-4 mb-2'>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLikeClick}
              aria-label='like thread'
              className='btn-icon text-text-secondary p-1 md:p-2 group'
            >
              <AnimatePresence mode="wait">
                {liked ? (
                  <motion.div
                    key="filled"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    id={`heart-${id}`}
                    className="text-red-500"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="outline"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    id={`heart-${id}`}
                    className="group-hover:text-red-400 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {onReplyAction ? (
                // If onReplyAction is provided, use it instead of navigating
                <button
                  onClick={onReplyAction}
                  className='btn-icon text-text-secondary p-1 md:p-2 hover:text-accent-primary transition-colors'
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
              ) : (
                // Otherwise, use the Link for navigation
                <Link
                  href={`/thread/${id}`}
                  className='btn-icon text-text-secondary p-1 md:p-2 hover:text-accent-primary transition-colors'
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>
              )}
            </motion.div>
          </div>
          
          {/* Comment Preview with enhanced styling */}
          {(!isComment && comments.length > 0) || 
           (isComment && comments.some(c => c.childCount && c.childCount > 0)) ? (
            <div className='flex items-center gap-2 mt-2 md:mt-3'>
              {!isComment ? (
                // Original comment preview for threads
                <div className='flex'>
                  {comments.slice(0, 2).map((comment, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={index}
                      className={`relative w-5 h-5 md:w-6 md:h-6 rounded-full overflow-hidden border-2 border-bg-primary ${
                        index !== 0 ? "-ml-2 md:-ml-3" : ""
                      }`}
                    >
                      <Image
                        src={comment.author.image}
                        alt={`commenter_${index}`}
                        fill
                        className='object-cover'
                      />
                    </motion.div>
                  ))}
                </div>
              ) : null}

              <Link
                href={`/thread/${id}`}
                className='text-xs md:text-sm text-text-muted hover:underline hover:text-accent-primary transition-colors'
              >
                {!isComment ? (
                  // Original reply count for threads
                  <>
                    {comments.length}{" "}
                    {comments.length === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  // Show replies to this comment
                  <>
                    {comments.reduce((sum, c) => sum + (c.childCount || 0), 0)}{" "}
                    {comments.reduce((sum, c) => sum + (c.childCount || 0), 0) === 1 ? "reply" : "replies"}
                  </>
                )}
              </Link>
            </div>
          ) : null}

          {/* Community Tag with enhanced styling */}
          {!isComment && community && (
            <div className='mt-2 md:mt-3 flex items-center gap-1 md:gap-2 text-xs md:text-sm text-text-muted'>
              <span>{formatDateString(createdAt)}</span>
              <span>•</span>
              <Link
                href={`/communities/${community.id}`}
                className='flex items-center gap-1 hover:underline group transition-all'
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className='relative w-3 h-3 md:w-4 md:h-4 rounded-full overflow-hidden'
                >
                  <Image
                    src={community.image}
                    alt={community.name}
                    fill
                    className='object-cover group-hover:scale-110 transition-transform'
                  />
                </motion.div>
                <span className="truncate max-w-[80px] md:max-w-none group-hover:text-accent-primary transition-colors">
                  {community.name}
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default ThreadCard;
