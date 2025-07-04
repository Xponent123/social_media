import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },
  ],
  image: {
    type: String, // Assuming you store image URL
  },
  likes: {
    type: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    default: [], // Ensure likes is always initialized as an array
  },
});

const Thread = mongoose.models.Thread || mongoose.model("Thread", threadSchema);

export default Thread;
