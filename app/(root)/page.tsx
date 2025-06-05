import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";

import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";

async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchPosts(
    searchParams.page ? +searchParams.page : 1,
    30
  );

  return (
    <>
      <h1 className='head-text text-left'>Home</h1>

      <section className='mt-9 flex flex-col gap-10'>
        {result.posts.length === 0 ? (
          <p className='no-result'>No threads found</p>
        ) : (
          <>
            {result.posts.map((post) => (
              <ThreadCard
                key={post._id.toString()}
                id={post._id.toString()}
                currentUserId={user.id}
                parentId={post.parentId ? post.parentId.toString() : null}
                content={post.text}
                author={{
                  name: post.author.name,
                  image: post.author.image,
                  id: post.author._id.toString(),
                }}
                community={
                  post.community
                    ? {
                        id: post.community._id.toString(),
                        name: post.community.name,
                        image: post.community.image,
                      }
                    : null
                }
                createdAt={post.createdAt.toString()}
                comments={post.children.map((child: any) => ({
                  author: {
                    image: child.author.image,
                  },
                }))}
                isLiked={post.isLiked} // Added isLiked prop
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path='/'
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={result.isNext}
      />
    </>
  );
}

export default Home;
