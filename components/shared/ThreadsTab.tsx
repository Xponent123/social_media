import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";

import ThreadCard from "../cards/ThreadCard";

// Define more specific interfaces to match the actual data structure
interface Thread {
  _id: string;
  text: string;
  parentId: string | null;
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
  createdAt: string | Date; // Accept both string and Date
  children: {
    author: {
      image: string;
    };
    children?: { author: { image: string } }[];
  }[];
  image?: string;
  isLiked?: boolean;
}

interface UserResult {
  _id: string;
  id: string;
  name: string;
  image: string;
  threads: Thread[];
}

interface CommunityResult {
  _id: any; // Accept any type for MongoDB IDs
  id: string;
  name: string;
  username: string;
  image: string;
  bio: string;
  createdBy: any;
  threads: Thread[];
  members: any[];
}

interface Result {
  name: string;
  image: string;
  id: string;
  threads: Thread[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  try {
    if (accountType === "Community") {
      // Use type casting with unknown as intermediate step to avoid TypeScript errors
      const communityResult = await fetchCommunityPosts(accountId) as unknown as CommunityResult;
      
      if (!communityResult) {
        result = {
          name: "Unknown Community",
          image: "/assets/community.svg",
          id: accountId,
          threads: []
        };
      } else {
        result = {
          name: communityResult.name,
          image: communityResult.image,
          id: communityResult.id,
          threads: communityResult.threads || []
        };
      }
    } else {
      // Use type casting with unknown as intermediate step to avoid TypeScript errors
      const userResult = await fetchUserPosts(accountId) as unknown as UserResult;
      
      if (!userResult) {
        result = {
          name: "Unknown User",
          image: "/assets/profile.svg",
          id: accountId,
          threads: []
        };
      } else {
        result = {
          name: userResult.name,
          image: userResult.image,
          id: userResult.id,
          threads: userResult.threads || []
        };
      }
    }
  } catch (error) {
    console.error(`Error fetching ${accountType} posts:`, error);
    // Return a default structure on error
    result = {
      name: accountType === "Community" ? "Community" : "User",
      image: accountType === "Community" ? "/assets/community.svg" : "/assets/profile.svg",
      id: accountId,
      threads: []
    };
  }

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.threads.length === 0 ? (
        <p className='text-center text-text-secondary py-6'>No threads found</p>
      ) : (
        result.threads.map((thread) => {
          // Convert Date objects to ISO strings for consistent handling
          const createdAtString = typeof thread.createdAt === 'string' 
            ? thread.createdAt 
            : thread.createdAt instanceof Date 
              ? thread.createdAt.toISOString() 
              : new Date().toISOString();
              
          // Serialize all IDs and dates to ensure they're properly stringified
          const serializedThread = {
            id: thread._id.toString(),
            parentId: thread.parentId ? thread.parentId.toString() : null,
            content: thread.text,
            author:
              accountType === "User"
                ? { name: result.name, image: result.image, id: result.id.toString() }
                : {
                    name: thread.author.name,
                    image: thread.author.image,
                    id: thread.author.id.toString(),
                  },
            community:
              accountType === "Community"
                ? { name: result.name, id: result.id.toString(), image: result.image }
                : thread.community
                ? {
                    name: thread.community.name,
                    id: thread.community.id.toString(),
                    image: thread.community.image,
                  }
                : null,
            createdAt: createdAtString,
            comments: thread.children.map((child: any) => ({
              author: {
                image: child.author.image,
              },
              childCount: child.children?.length || 0
            })),
            image: thread.image,
            isLiked: thread.isLiked,
          };

          return (
            <ThreadCard
              key={serializedThread.id}
              {...serializedThread}
              currentUserId={currentUserId}
              isComment={accountType === "Community" ? false : undefined}
            />
          );
        })
      )}
    </section>
  );
}

export default ThreadsTab;
