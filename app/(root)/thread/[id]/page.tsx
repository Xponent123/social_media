import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";
import CommentThread from "@/components/cards/CommentThread";
import { serializeCommentTree } from "@/components/cards/serializeCommentTree";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";

export const revalidate = 0;

// Improve the typing of the serialized data
interface SerializedAuthor {
  id: string;
  name: string;
  image: string;
}

interface SerializedCommunity {
  id: string;
  name: string;
  image: string;
}

interface SerializedComment {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: SerializedAuthor;
  community: SerializedCommunity | null;
  comments: SerializedComment[];
  image?: string;
  isLiked?: boolean;
}

interface SerializedThread {
  id: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author: SerializedAuthor;
  community: SerializedCommunity | null;
  comments: SerializedComment[]; 
  image?: string;
  isLiked?: boolean;
}

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);


  // Recursively serialize the thread and all nested children
  const serializedMainThread = serializeCommentTree(thread);

  if (!serializedMainThread) return null;

  return (
    <section className='relative'>
      <div>
        <ThreadCard
          id={serializedMainThread.id}
          currentUserId={user.id}
          parentId={serializedMainThread.parentId}
          content={serializedMainThread.content}
          author={serializedMainThread.author}
          community={serializedMainThread.community}
          createdAt={serializedMainThread.createdAt}
          comments={serializedMainThread.comments?.map((c: any) => ({
            author: { image: c.author?.image },
            childCount: c.comments?.length || 0
          })) || []}
          image={serializedMainThread.image}
          isLiked={serializedMainThread.isLiked} // Corrected: was serializedMainThread.liked
        />
      </div>

      <div className='mt-7'>
        <Comment
          threadId={params.id}
          currentUserImg={user.imageUrl}
          currentUserId={userInfo._id.toString()}
        />
      </div>

      <div className='mt-10'>
        {serializedMainThread.comments?.map((reply: any) => ( // reply is a SerializedThread object
          <CommentThread
            key={reply.id}
            comment={reply} // reply object from serializeCommentTree now contains 'isLiked'
            currentUserId={user.id}
          />
        ))}
      </div>
    </section>
  );
}

export default page;
