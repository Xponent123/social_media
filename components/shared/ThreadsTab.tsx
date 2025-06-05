import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";

import ThreadCard from "../cards/ThreadCard";

interface Result {
  name: string;
  image: string;
  id: string;
  threads: {
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
    createdAt: string;
    children: {
      author: {
        image: string;
      };
      // Ensure child comments also can have childCount if needed for deeper nesting display
      children?: { author: { image: string }}[] 
    }[];
    image?: string; // Add image property if not already present from backend
    isLiked?: boolean; // Add isLiked property
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  // Function to safely convert MongoDB ObjectIDs to strings
  const serialize = (data: any) => {
    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.error("Serialization error:", error);
      return String(data);
    }
  };

  return (
    <section className='mt-9 flex flex-col gap-10'>
      {result.threads.map((thread) => {
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
          createdAt: new Date(thread.createdAt).toISOString(),
          comments: thread.children.map((child: any) => ({
            author: {
              image: child.author.image,
            },
            // Include the count of child replies to this comment
            childCount: child.children?.length || 0
          })),
          image: thread.image, // Pass image if available
          isLiked: thread.isLiked, // Pass isLiked status
        };

        return (
          <ThreadCard
            key={serializedThread.id}
            {...serializedThread}
            currentUserId={currentUserId}
            isComment={accountType === "Community" ? false : undefined}
          />
        );
      })}
    </section>
  );
}

export default ThreadsTab;
