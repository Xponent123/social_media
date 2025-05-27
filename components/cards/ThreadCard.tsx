"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";

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
  }[];
  isComment?: boolean;
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
}: Props) {
  const [liked, setLiked] = useState(false);
  const toggleLike = () => setLiked((prev) => !prev);

  return (
    <article
      className={`thread-card ${
        isComment ? "border-0 shadow-none pl-0" : ""
      } mb-5`}
    >
      <div className='flex gap-4'>
        {/* Author Avatar */}
        <div className='flex-shrink-0'>
          <Link href={`/profile/${author.id}`} className='block'>
            <div className='relative h-10 w-10 overflow-hidden rounded-full'>
              <Image
                src={author.image}
                alt={author.name}
                fill
                className='object-cover'
              />
            </div>
          </Link>
        </div>

        {/* Thread Content */}
        <div className='flex-grow'>
          <div className='flex items-center justify-between mb-1'>
            <Link href={`/profile/${author.id}`} className='hover:underline'>
              <h4 className='font-semibold text-text-primary'>{author.name}</h4>
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

          <p className='text-text-secondary mb-3'>{content}</p>

          {/* Action Buttons */}
          <div className='flex gap-4 mb-2'>
            <button
              onClick={toggleLike}
              aria-label='like thread'
              className='btn-icon text-text-secondary'
            >
              <Image
                src={
                  liked
                    ? "/assets/heart-filled.svg"
                    : "/assets/heart-gray.svg"
                }
                alt='heart'
                width={20}
                height={20}
                className='object-contain'
              />
            </button>

            <Link
              href={`/thread/${id}`}
              className='btn-icon text-text-secondary'
            >
              <Image
                src='/assets/reply.svg'
                alt='reply'
                width={20}
                height={20}
                className='object-contain'
              />
            </Link>

            <button className='btn-icon text-text-secondary'>
              <Image
                src='/assets/repost.svg'
                alt='repost'
                width={20}
                height={20}
                className='object-contain'
              />
            </button>

            <button className='btn-icon text-text-secondary'>
              <Image
                src='/assets/share.svg'
                alt='share'
                width={20}
                height={20}
                className='object-contain'
              />
            </button>
          </div>

          {/* Comment Preview */}
          {!isComment && comments.length > 0 && (
            <div className='flex items-center gap-2 mt-3'>
              <div className='flex'>
                {comments.slice(0, 2).map((comment, index) => (
                  <div
                    key={index}
                    className={`relative w-6 h-6 rounded-full overflow-hidden border-2 border-bg-primary ${
                      index !== 0 ? "-ml-3" : ""
                    }`}
                  >
                    <Image
                      src={comment.author.image}
                      alt={`commenter_${index}`}
                      fill
                      className='object-cover'
                    />
                  </div>
                ))}
              </div>

              <Link
                href={`/thread/${id}`}
                className='text-sm text-text-muted hover:underline'
              >
                {comments.length}{" "}
                {comments.length === 1 ? "reply" : "replies"}
              </Link>
            </div>
          )}

          {/* Community Tag */}
          {!isComment && community && (
            <div className='mt-3 flex items-center gap-2 text-sm text-text-muted'>
              <span>{formatDateString(createdAt)}</span>
              <span>•</span>
              <Link
                href={`/communities/${community.id}`}
                className='flex items-center gap-1 hover:underline'
              >
                <div className='relative w-4 h-4 rounded-full overflow-hidden'>
                  <Image
                    src={community.image}
                    alt={community.name}
                    fill
                    className='object-cover'
                  />
                </div>
                <span>{community.name}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ThreadCard;
