// Utility to recursively serialize a thread and its children for nested rendering
export function serializeCommentTree(thread: any) {
  if (!thread) return null;
  return {
    id: thread._id?.toString?.() || thread.id?.toString?.() || "", // fallback for missing _id
    parentId: thread.parentId?.toString?.() || thread.parentId || null,
    content: thread.text || thread.content || "",
    createdAt: thread.createdAt ? (typeof thread.createdAt === "string" ? thread.createdAt : thread.createdAt.toString()) : "",
    author: thread.author
      ? {
          id: thread.author._id?.toString?.() || thread.author.id?.toString?.() || "",
          name: thread.author.name || "",
          image: thread.author.image || "",
        }
      : { id: "", name: "", image: "" },
    community: thread.community && thread.community._id
      ? {
          id: thread.community._id?.toString?.() || thread.community.id?.toString?.() || "",
          name: thread.community.name || "",
          image: thread.community.image || "",
        }
      : null,
    image: thread.image,
    isLiked: thread.isLiked, // Add this line to pass through the isLiked status
    comments: Array.isArray(thread.children)
      ? thread.children.map(serializeCommentTree).filter(Boolean)
      : [],
  };
}
