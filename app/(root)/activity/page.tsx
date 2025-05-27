import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { AnimatedCard } from "@/components/shared/AnimatedWrapper";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);

  return (
    <>
      <h1 className='head-text'>Activity</h1>

      <section className='mt-10 flex flex-col gap-5'>
        {activity.length > 0 ? (
          <>
            {activity.map((activity, index) => (
              <AnimatedCard key={activity._id} delay={index * 0.05}>
                <Link href={`/thread/${activity.parentId}`}>
                  <article className='activity-card flex items-center gap-2 rounded-md border border-border bg-bg-primary p-4 shadow-sm transition-all duration-200 hover:shadow-md'>
                    <Image
                      src={activity.author.image}
                      alt={`${activity.author.name}'s profile picture`}
                      width={20}
                      height={20}
                      className='rounded-full object-cover'
                    />
                    <p className='text-small-regular text-text-secondary'>
                      <span className='mr-1 font-medium text-accent-primary'>
                        {activity.author.name}
                      </span>{" "}
                      replied to your thread
                    </p>
                  </article>
                </Link>
              </AnimatedCard>
            ))}
          </>
        ) : (
          <p className='text-base-regular text-text-secondary text-center py-6 bg-bg-tertiary/50 rounded-lg'>
            No activity yet
          </p>
        )}
      </section>
    </>
  );
}

export default Page;
