import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/dbConnect";
import Thread from "@/lib/models/thread.model";
import { currentUser } from "@clerk/nextjs";

export async function POST(request: Request) {
  await dbConnect();
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  
  const { threadId } = await request.json();
  if (!threadId)
    return NextResponse.json({ message: "Thread id missing" }, { status: 400 });
  
  const thread = await Thread.findById(threadId);
  if (!thread)
    return NextResponse.json({ message: "Thread not found" }, { status: 404 });
  
  const userId = user.id;
  let updatedThread;
  if (thread.likes.includes(userId)) {
    // User already liked, so remove and decrement likeCount
    updatedThread = await Thread.findByIdAndUpdate(
      threadId,
      { 
        $pull: { likes: userId },
        $inc: { likeCount: -1 }
      },
      { new: true }
    );
  } else {
    updatedThread = await Thread.findByIdAndUpdate(
      threadId,
      { 
        $push: { likes: userId },
        $inc: { likeCount: 1 }
      },
      { new: true }
    );
  }
  
  // Revalidate home page so client fetches fresh data.
  revalidatePath("/");
  
  return NextResponse.json({ thread: updatedThread }, { status: 200 });
}
