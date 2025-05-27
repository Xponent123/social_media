import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <section className="flex flex-col items-center">
      <h1 className="head-text mb-10">Create Thread</h1>

      <PostThread
        userId={userInfo._id.toString()}
        userImage={userInfo.image || user.imageUrl}
      />
    </section>
  );
}

export default Page;
