"use client";


import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, usePathname } from "next/navigation";
import * as z from "zod";
import { useState, useRef, useEffect } from "react"; // Import useEffect
import Image from "next/image";
import { motion } from "framer-motion";
import { Send, Image as ImageIcon, Video as VideoIcon, X as XIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  userId: string;
  userImage: string;
}


function PostThread({ userId, userImage }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { organization } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to revoke object URL when component unmounts or mediaPreview changes
  useEffect(() => {
    let currentPreview = mediaPreview;
    return () => {
      if (currentPreview && currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [mediaPreview]);

  const form = useForm({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
    },
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharacterCount(e.target.value.length);
    form.setValue("thread", e.target.value);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous object URL if it exists
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }

    setMediaFile(file);
    const newPreviewUrl = URL.createObjectURL(file);
    setMediaPreview(newPreviewUrl);

    if (file.type.startsWith("image/")) {
      setMediaType("image");
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
    } else {
      setMediaType(null);
      setMediaPreview(null); // Reset if not image/video
      URL.revokeObjectURL(newPreviewUrl); // Revoke if not used
    }
  };

  const handleRemoveMedia = () => {
    if (mediaPreview && mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    try {
      setIsSubmitting(true);
      let uploadedUrl = null;
      if (mediaFile) {
        // Use a simple upload endpoint or 3rd party service here
        // For demonstration, we'll use a placeholder and skip actual upload
        // Replace this with your actual upload logic
        uploadedUrl = mediaPreview; // In a real app, this would be the URL from your upload service
      }
      await createThread({
        text: values.thread,
        author: userId,
        communityId: organization ? organization.id : null,
        path: pathname,
        imageUrl: uploadedUrl,
      });
      form.reset();
      setCharacterCount(0);
      // No need to revoke mediaPreview here as it's handled by useEffect or handleRemoveMedia
      // if it was set by createObjectURL. If uploadedUrl is a blob URL and needs revoking,
      // it should be handled after it's no longer needed post-submission.
      // However, typically uploadedUrl will be a permanent URL from a storage service.
      setMediaFile(null);
      setMediaPreview(null); 
      setMediaType(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear file input
      router.push("/");
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="flex flex-col gap-8 mt-8 w-full max-w-xl"
      >
        <div className="bg-bg-primary rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent-primary/20 bg-bg-tertiary">
                {userImage && (
                  <Image
                    src={userImage}
                    alt="Profile image"
                    fill
                    sizes="40px"
                    priority
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="thread"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel className="text-base-semibold text-text-primary">
                    <span className="bg-gradient-to-r from-[rgba(var(--gradient-1-start),1)] to-[rgba(var(--gradient-1-end),1)] text-transparent bg-clip-text">
                      Share your thoughts
                    </span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      rows={4}
                      placeholder="What's happening?"
                      className="resize-none bg-bg-tertiary/30 border-none rounded-lg p-4 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent-primary/30 transition-all duration-200 text-base-regular w-full"
                      {...field}
                      onChange={handleTextChange}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-text-secondary mt-1">
                    <FormMessage />
                    <span className={characterCount > 280 ? "text-red-500" : ""}>
                      {characterCount}/280
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Media Preview */}
          {mediaPreview && (
            <div className="mb-2 relative w-full flex flex-col items-start">
              <button type="button" onClick={handleRemoveMedia} className="absolute top-2 right-2 bg-white/80 rounded-full p-1 z-10 border border-gray-200 hover:bg-red-100">
                <XIcon className="w-4 h-4 text-gray-500" />
              </button>
              {mediaType === "image" && (
                <img src={mediaPreview} alt="preview" className="rounded-lg max-h-64 object-contain border border-gray-200" />
              )}
              {mediaType === "video" && (
                <video src={mediaPreview} controls className="rounded-lg max-h-64 object-contain border border-gray-200" />
              )}
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex items-center mt-4 gap-2 border-t border-border pt-4">
            {/* Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleMediaChange}
            />
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
              onClick={() => fileInputRef.current?.click()}
              tabIndex={0}
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs">Image</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition"
              onClick={() => fileInputRef.current?.click()}
              tabIndex={0}
            >
              <VideoIcon className="w-4 h-4" />
              <span className="text-xs">Video</span>
            </button>
            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary ml-auto flex items-center gap-2 px-5 py-2"
              disabled={isSubmitting || characterCount === 0 || characterCount > 280}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <span>Post</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Community Information */}
        {organization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 rounded-lg bg-bg-tertiary/30 p-3"
          >
            <Image
              src={organization.imageUrl}
              alt={organization.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <p className="text-text-secondary text-small-medium">
              Posting in{" "}
              <span className="text-accent-primary">{organization.name}</span>
            </p>
          </motion.div>
        )}
      </form>
    </Form>
  );
}

export default PostThread;
