"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import Community from "../models/community.model";
import { connectToDB } from "../mongoose";
import { currentUser } from "@clerk/nextjs";


// Define interfaces for MongoDB documents
interface UserDocument {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  image: string;
  // Add other relevant fields
}

// Helper function to add isLiked to a thread and its children recursively
function addIsLikedRecursively(node: any, dbCurrentUserId: mongoose.Types.ObjectId | null) {
  if (!node) return;

  // Add isLiked to the current node
  node.isLiked = dbCurrentUserId && Array.isArray(node.likes)
    ? node.likes.some((like: any) => {
        // Handle both populated likes (object with _id) and non-populated likes (ObjectId directly)
        const likeId = like._id ? like._id : like;
        // Add null check before calling equals
        return dbCurrentUserId && dbCurrentUserId.equals(likeId);
      })
    : false;

  // Recursively call for children
  if (Array.isArray(node.children) && node.children.length > 0) {
    for (const child of node.children) {
      addIsLikedRecursively(child, dbCurrentUserId); // Pass dbCurrentUserId here
    }
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  console.log(`[fetchPosts] Called. Page: ${pageNumber}, Size: ${pageSize}`);
  connectToDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image",
      },
    })
    .populate({ // Populate likes for top-level posts
        path: "likes",
        model: User,
        select: "_id"
    })
    .lean(); // Use .lean() for plain JS objects

  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const postsData = await postsQuery;

  // Make currentUser check more robust with try/catch
  let dbCurrentUserId: mongoose.Types.ObjectId | null = null;
  try {
    const user = await currentUser();
    
    if (user && user.id) {
      try {
        // Explicitly type the result as UserDocument or null
        const dbUser = await User.findOne({ id: user.id }).select("_id").lean() as UserDocument | null;
        if (dbUser) {
          dbCurrentUserId = dbUser._id;
        } else {
          console.warn(`[fetchPosts] User with Clerk ID ${user.id} not found in the database.`);
        }
      } catch (dbError) {
        console.error(`[fetchPosts] Database error fetching user by Clerk ID ${user.id}:`, dbError);
      }
    }
  } catch (clerkError) {
    // Handle Clerk errors gracefully - don't let it crash the page
    console.error("[fetchPosts] Error with Clerk currentUser():", clerkError);
    // Continue with dbCurrentUserId as null - posts will show as not liked by the user
  }

  // Process posts even if there was an authentication error
  const postsWithLikeStatus = postsData.map(post => {
    // Safely check if post.likes exists and is an array before using .some()
    const isLiked = dbCurrentUserId && post.likes && Array.isArray(post.likes) 
      ? post.likes.some((like: any) => {
          // Handle both populated likes (object with _id) and non-populated likes (ObjectId directly)
          if (!like) return false;
          const likeId = like._id ? like._id : like;
          // Add null check before calling equals
          return dbCurrentUserId && dbCurrentUserId.equals(likeId);
        })
      : false;
      
    return {
      ...post,
      isLiked
    };
  });

  const isNext = totalPostsCount > skipAmount + postsData.length;

  return { posts: postsWithLikeStatus, isNext };
}

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

interface CreateThreadParams {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
  imageUrl?: string | null; // Add image URL parameter
}

export async function createThread({
  text,
  author,
  communityId,
  path,
  imageUrl,
}: CreateThreadParams) {
  try {
    connectToDB();

    const communityIdObject = communityId
      ? new mongoose.Types.ObjectId(communityId)
      : null;

    // Create thread with image URL if provided
    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject,
      image: imageUrl, // Save the image URL to the thread document
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

// Recursively populate all children for unlimited nesting
async function populateThreadDeep(thread: any) {
  if (!thread) return null;
  // Populate author and community if not populated
  if (thread.populate) {
    await thread.populate([
      { path: "author", model: User, select: "_id id name image" },
      { path: "community", model: Community, select: "_id id name image" },
      { path: "children", model: Thread },
    ]);
  }
  // Recursively populate children
  if (Array.isArray(thread.children) && thread.children.length > 0) {
    for (let i = 0; i < thread.children.length; i++) {
      thread.children[i] = await populateThreadDeep(await Thread.findById(thread.children[i]._id || thread.children[i]));
    }
  }
  return thread;
}

export async function fetchThreadById(threadId: string) {
  console.log(`[fetchThreadById] Called. Thread ID: ${threadId}`);
  connectToDB();

  try {
    const user = await currentUser();
    let currentClerkUserId = null;
    if (user && user.id) {
        currentClerkUserId = user.id;
    }

    let dbCurrentUserId: mongoose.Types.ObjectId | null = null;
    if (currentClerkUserId) {
        // Explicitly type the result as UserDocument or null
        const dbUser = await User.findOne({ id: currentClerkUserId }).select("_id").lean() as UserDocument | null;
        if (dbUser) {
            dbCurrentUserId = dbUser._id;
        } else {
            console.warn(`[fetchThreadById] User with Clerk ID ${currentClerkUserId} not found in the database.`);
        }
    }

    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate({ // Populate likes for the main thread
        path: "likes", 
        model: User, 
        select: "_id" 
      })
      .populate({
        path: "children", // Comments
        model: Thread, 
        populate: [
          { path: "author", model: User, select: "_id id name image" },
          { path: "likes", model: User, select: "_id" }, 
          {
            path: "children", // Replies to comments
            model: Thread, 
            populate: [
              { path: "author", model: User, select: "_id id name image" },
              { path: "likes", model: User, select: "_id" }, 
                 {
                    path: "children", // great-grandchildren
                    model: Thread,
                    populate: [
                        { path: "author", model: User, select: "_id id name image" },
                        { path: "likes", model: User, select: "_id" },
                        // Add more levels if needed, or consider a more dynamic deep population strategy
                    ]
                 }
            ],
          },
        ],
      })
      .lean(); 

    if (!thread) return null;

    // Add isLiked to the main thread and all its children/descendants
    addIsLikedRecursively(thread, dbCurrentUserId);
    
    return thread; // The thread object now contains isLiked for itself and descendants

  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function toggleLikeThread(threadId: string, userId: string, path: string): Promise<void> {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }

    // Explicitly type the result as UserDocument or null
    const userObject = await User.findOne({ id: userId }).select("_id").lean() as UserDocument | null;
    if (!userObject) {
      console.error(`[toggleLikeThread] User with Clerk ID ${userId} not found in DB. Cannot toggle like.`);
      throw new Error(`User with ID ${userId} not found in database.`);
    }
    const userObjectId = userObject._id;

    const userLikeIndex = thread.likes.findIndex((like: any) => like.equals(userObjectId));

    if (userLikeIndex > -1) {
      // User has already liked, so unlike
      thread.likes.splice(userLikeIndex, 1);
    } else {
      // User has not liked, so like
      thread.likes.push(userObjectId);
    }

    await thread.save();
    revalidatePath(path);
  } catch (error: any) {
    console.error("Error toggling like on thread: ", error);
    throw new Error(`Failed to toggle like on thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string,
  parentCommentId?: string 
): Promise<void> {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: parentCommentId || threadId, // Use parentCommentId if provided, otherwise use threadId
      likes: [] // Initialize empty likes array to avoid TypeScript errors
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // If this is a reply to a comment (not directly to the main thread)
    if (parentCommentId && parentCommentId !== threadId) {
      // Find the parent comment and add this reply to its children
      const parentComment = await Thread.findById(parentCommentId);
      if (parentComment) {
        parentComment.children.push(savedCommentThread._id);
        await parentComment.save();
      }
    } else {
      // Add the comment thread's ID to the original thread's children array
      originalThread.children.push(savedCommentThread._id);
      await originalThread.save();
    }

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
