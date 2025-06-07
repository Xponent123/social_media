"use server";

import { FilterQuery, SortOrder } from "mongoose";
import mongoose from "mongoose"; // <-- ADDED: Import mongoose for Types.ObjectId
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

// ---- Add missing interface ----
interface UserDocument {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  image: string;
  // ...other fields if needed...
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  console.log(`[fetchUserPosts] Called. User ID: ${userId}`);
  try {
    connectToDB();

    const loggedInUser = await currentUser();
    const loggedInUserDbId = loggedInUser
      ? (await User.findOne({ id: loggedInUser.id }).select("_id").lean() as UserDocument | null)?._id
      : null;

    // Explicitly assert that the returned user document has a 'threads' property.
    const userWithThreads = await User.findOne({ id: userId })
      .populate({
        path: "threads",
        model: Thread,
        options: { sort: { createdAt: -1 } },
        populate: [
          {
            path: "community",
            model: Community,
            select: "name id image _id",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "name image id",
            },
          },
          {
            path: "likes",
            model: User,
            select: "_id",
          },
        ],
      })
      .lean() as { threads?: any[] } | null;

    if (!userWithThreads) return null;

    // Add isLiked property to each thread
    if (userWithThreads.threads && Array.isArray(userWithThreads.threads)) {
      userWithThreads.threads = userWithThreads.threads.map((thread: any) => ({
        ...thread,
        isLiked: loggedInUserDbId && Array.isArray(thread.likes)
          ? thread.likes.some((like: any) => {
              if (!like._id || !loggedInUserDbId) return false;
              return like._id.equals(loggedInUserDbId);
            })
          : false,
      }));
    }

    return userWithThreads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // Find the user's MongoDB _id based on the Clerk userId
    const userDoc = await User.findOne({ _id: userId }).select("_id").lean();
    if (!userDoc) {
      console.warn(`[getActivity] User with DB ID ${userId} not found.`);
      return [];
    }
    const userMongoId = userDoc._id;

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userMongoId }).select("_id children").lean();

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThreadItem) => {
      if (Array.isArray(userThreadItem.children)) {
        // Ensure children IDs are strings
        return acc.concat(userThreadItem.children.map(id => id.toString()));
      }
      return acc;
    }, [] as string[]);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const repliesFromDb = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userMongoId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id id", // id is Clerk ID
    }).lean(); // Use .lean() for plain objects

    // Serialize the replies
    const serializedReplies = repliesFromDb.map(reply => {
      if (!reply.author) {
        // Handle cases where author might not be populated (shouldn't happen with populate)
        console.warn(`[getActivity] Reply ${reply._id} missing author.`);
        return null; 
      }
      return {
        _id: reply._id.toString(),
        text: reply.text,
        // parentId here refers to the ID of the thread/comment this reply is directly under.
        // For an activity "X replied to your thread", this parentId is the ID of one of the user's threads.
        parentId: reply.parentId ? reply.parentId.toString() : null,
        createdAt: reply.createdAt.toISOString(),
        author: {
          _id: reply.author._id.toString(),
          id: reply.author.id, // Clerk ID
          name: reply.author.name,
          image: reply.author.image,
        },
        image: reply.image || null,
        // Add any other fields needed by ActivityCard
      };
    }).filter(item => item !== null); // Filter out any null items from bad data

    return serializedReplies as NonNullable<typeof serializedReplies[0]>[]; // Assert non-null items
  } catch (error) {
    console.error("Error fetching replies: ", error);
    // throw error; // Re-throwing might hide specific client-side issues, consider returning []
    return []; // Return empty array on error to prevent page crash
  }
}
