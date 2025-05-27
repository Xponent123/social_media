import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.actions";

export const revalidate = 0;

async function page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);

  const serializeThread = (t: any) => ({
    id: t._id.toString(),
    parentId: t.parentId?.toString() || null,
    content: t.text,
    createdAt: t.createdAt.toString(),
    author: {
      id: t.author._id.toString(),
      name: t.author.name,
      image: t.author.image,
    },
    community: t.community
      ? {
          id: t.community._id.toString(),
          name: t.community.name,
          image: t.community.image,
        }
      : null,
    comments: (t.children || []).map((child: any) => ({
      author: {
        image: child.author.image,
      },
    })),
  });

  const serializedMainThread = serializeThread(thread);
  const serializedReplies = (thread.children || []).map(serializeThread);

  return (
    <section className='relative'>
      <div>
        <ThreadCard
          {...serializedMainThread}
          currentUserId={user.id}
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
        {serializedReplies.map((reply) => (
          <ThreadCard
            key={reply.id}
            {...reply}
            currentUserId={user.id}
            isComment
          />
        ))}
      </div>
    </section>
  );
}

export default page;
