"use server";

import { FilterQuery, SortOrder } from "mongoose";
import mongoose from "mongoose"; // Add this import for mongoose.Types.ObjectId
import { currentUser } from "@clerk/nextjs";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function createCommunity(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string // Change the parameter name to reflect it's an id
) {
  try {
    await connectToDB();

    // Find the user with the provided unique id
    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error("User not found"); // Handle the case if the user with the id is not found
    }

    const newCommunity = new Community({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id, // Use the mongoose ID of the user
    });

    const createdCommunity = await newCommunity.save();

    // Update User model
    user.communities.push(createdCommunity._id);
    await user.save();

    return createdCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error creating community:", error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    connectToDB(); // Removed await

    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
    ]);

    return communityDetails;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error);
    throw error;
  }
}

// Define interfaces to help TypeScript understand the shape of community data
interface ThreadAuthor {
  _id: string;
  id: string;
  name: string;
  image: string;
}

interface ThreadChild {
  _id: string;
  author: {
    _id: string;
    image: string;
  };
  children?: any[];
}

interface ThreadLike {
  _id: mongoose.Types.ObjectId;
}

interface Thread {
  _id: mongoose.Types.ObjectId;
  text: string;
  author: ThreadAuthor;
  community: mongoose.Types.ObjectId | null;
  createdAt: Date;
  parentId: string | null;
  children: ThreadChild[];
  likes: ThreadLike[];
  image?: string;
}

interface PopulatedCommunity {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  username: string;
  image: string;
  bio: string;
  createdBy: mongoose.Types.ObjectId | null;
  threads: Thread[];
  members: mongoose.Types.ObjectId[];
}

export async function fetchCommunityPosts(id: string) {
  console.log(`[fetchCommunityPosts] Called. Community MongoDB ID: ${id}`);
  try {
    connectToDB();

    const loggedInUser = await currentUser();
    const loggedInUserDbId = loggedInUser ? (await User.findOne({ id: loggedInUser.id }).select("_id"))?._id : null;

    // Use type assertion to tell TypeScript about the expected shape
    const communityDetails = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      options: { sort: { createdAt: -1 } },
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", 
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", 
          },
        },
        {
          path: "likes",
          model: User,
          select: "_id"
        }
      ],
    }).lean() as PopulatedCommunity | null;

    if (!communityDetails) {
      console.warn(`[fetchCommunityPosts] Community with ID ${id} not found`);
      // Return an empty result with the expected structure
      return {
        _id: id,
        id: "",
        name: "Unknown Community",
        username: "",
        image: "/assets/community.svg",
        bio: "",
        createdBy: null,
        threads: [],
        members: []
      };
    }

    // Now TypeScript knows communityDetails has a threads property
    if (communityDetails.threads && Array.isArray(communityDetails.threads)) {
      communityDetails.threads = communityDetails.threads.map((thread: Thread) => ({
        ...thread,
        isLiked: loggedInUserDbId && Array.isArray(thread.likes) 
          ? thread.likes.some((like) => {
              if (!like._id || !loggedInUserDbId) return false;
              return like._id.equals(loggedInUserDbId);
            }) 
          : false,
      }));
    }

    return {
      _id: communityDetails._id,
      id: communityDetails.id || id,
      name: communityDetails.name || "Community",
      username: communityDetails.username || "",
      image: communityDetails.image || "/assets/community.svg",
      bio: communityDetails.bio || "",
      createdBy: communityDetails.createdBy || null,
      threads: communityDetails.threads || [],
      members: communityDetails.members || []
    };

  } catch (error) {
    console.error("Error fetching community posts:", error);
    // Return a default structure in case of error
    return {
      _id: id,
      id: "",
      name: "Error Loading Community",
      username: "",
      image: "/assets/community.svg",
      bio: "",
      createdBy: null,
      threads: [],
      members: []
    };
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB(); // Removed await

    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Community> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the communities based on the search and sort criteria.
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    connectToDB(); // Removed await

    // Find the community by its unique id
    const community = await Community.findOne({ id: communityId });

    if (!community) {
      throw new Error("Community not found");
    }

    // Find the user by their unique id
    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the community
    if (community.members.includes(user._id)) {
      throw new Error("User is already a member of the community");
    }

    // Add the user's _id to the members array in the community
    community.members.push(user._id);
    await community.save();

    // Add the community's _id to the communities array in the user
    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    connectToDB(); // Removed await

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!communityIdObject) {
      throw new Error("Community not found");
    }

    // Remove the user's _id from the members array in the community
    await Community.updateOne(
      { _id: communityIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    // Remove the community's _id from the communities array in the user
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );

    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from community:", error);
    throw error;
  }
}

export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    connectToDB(); // Removed await

    // Find the community by its _id and update the information
    const updatedCommunity = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image }
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }

    return updatedCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error updating community information:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    connectToDB(); // Removed await

    // Find the community by its ID and delete it
    const deletedCommunity = await Community.findOneAndDelete({
      id: communityId,
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // Delete all threads associated with the community
    await Thread.deleteMany({ community: communityId });

    // Find all users who are part of the community
    const communityUsers = await User.find({ communities: communityId });

    // Remove the community from the 'communities' array for each user
    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}
