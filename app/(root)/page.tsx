import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";

import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";

// Add interface for post object structure
interface Post {
  _id: string;
  text: string;
  parentId: string | null;
  author: {
    _id: string;
    name: string;
    image: string;
  };
  community: {
    _id: string;
    name: string;
    image: string;
  } | null;
  createdAt: Date;
  children: {
    author: {
      image: string;
    };
  }[];
  isLiked: boolean;
  image?: string; // Added image property
}

// Add interface for the result from fetchPosts
interface PostResult {
  posts: Post[];
  isNext: boolean;
}

async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Check if user has been onboarded
    let userInfo;
    try {
      userInfo = await fetchUser(user.id);
      if (!userInfo?.onboarded) redirect("/onboarding");
    } catch (error) {
      console.error("[Home] Error fetching user info:", error);
      // If we can't fetch user info, we'll still show posts without redirecting
      // This prevents the page from crashing
    }

    // Fetch posts with error handling
    let result;
    try {
      result = await fetchPosts(
        searchParams.page ? +searchParams.page : 1,
        30
      ) as PostResult;
    } catch (error) {
      console.error("[Home] Error fetching posts:", error);
      // Return empty posts array if fetch fails
      result = { posts: [], isNext: false };
    }

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
                  isLiked={post.isLiked} 
                  image={post.image}
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
  } catch (error) {
    console.error("[Home] Unhandled error:", error);
    // Return a simple error UI
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-heading3-bold text-text-primary mb-4">Something went wrong</h1>
        <p className="text-text-secondary">We're having trouble loading your feed.</p>
      </div>
    );
  }
}

export default Home;
