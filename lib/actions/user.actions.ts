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

// Define an interface for the structure of a lean, populated reply
interface LeanPopulatedReply {
  _id: mongoose.Types.ObjectId; // Mongoose _id is an ObjectId
  text: string;
  parentId?: string; // Based on Thread schema, parentId is a String
  createdAt: Date;   // Mongoose Date
  author: {          // Populated author
    _id: mongoose.Types.ObjectId;
    id: string;      // Clerk ID from User schema
    name: string;
    image: string;
  };
  image?: string;      // Optional image from Thread schema
  // Include any other fields from the Thread schema that are selected or present
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

export async function getActivity(userId: string) { // userId here is the string representation of MongoDB _id
  try {
    connectToDB();

    // Validate if userId is a valid ObjectId string before querying
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.warn(`[getActivity] Invalid MongoDB ObjectId string provided: ${userId}`);
      return [];
    }

    const userMongoIdAsObject = new mongoose.Types.ObjectId(userId);

    // Find the user document using the MongoDB _id (converted from string)
    const userDoc = await User.findOne({ _id: userMongoIdAsObject })
      .select("_id")
      .lean() as { _id: mongoose.Types.ObjectId } | null;

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
        return acc.concat(userThreadItem.children.map(id => {
            // Ensure id is not null and is an ObjectId before calling toString()
            if (id && typeof id.toString === 'function') {
                return id.toString();
            }
            return null; // Or handle as an error/skip
        }).filter(id => id !== null) as string[]); // Filter out nulls and assert as string[]
      }
      return acc;
    }, [] as string[]);

    if (childThreadIds.length === 0) {
        return []; // No replies to fetch
    }

    // Find and return the child threads (replies) excluding the ones created by the same user
    const repliesFromDb = await Thread.find({
      _id: { $in: childThreadIds.map(id => new mongoose.Types.ObjectId(id)) }, 
      author: { $ne: userMongoId }, 
    }).populate({
      path: "author",
      model: User,
      select: "name image _id id", 
    }).lean() as LeanPopulatedReply[]; // Explicitly cast to our defined interface array

    // Serialize the replies
    const serializedReplies = repliesFromDb.map((reply: LeanPopulatedReply) => { // Type the reply parameter
      if (!reply.author || !reply.author._id) { // Check author and author._id
        // It's possible _id is null if author population failed or author was deleted
        console.warn(`[getActivity] Reply ${reply._id ? reply._id.toString() : 'ID_UNKNOWN'} missing author or author._id.`);
        return null; 
      }
      return {
        _id: reply._id.toString(),
        text: reply.text,
        parentId: reply.parentId ? reply.parentId.toString() : null, // parentId is already a string from schema, but ensure it's handled if optional
        createdAt: reply.createdAt.toISOString(), // Convert Date to ISO string
        author: {
          _id: reply.author._id.toString(),
          id: reply.author.id, 
          name: reply.author.name,
          image: reply.author.image,
        },
        image: reply.image || null,
      };
    }).filter(item => item !== null); 

    return serializedReplies as NonNullable<typeof serializedReplies[0]>[];
  } catch (error) {
    console.error("Error fetching replies: ", error);
    return []; 
  }
}
