import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions";
import { getActivity } from "@/lib/actions/user.actions";
import { formatDateString } from "@/lib/utils";


async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  // getActivity now expects the MongoDB _id of the user
  const activity = await getActivity(userInfo._id.toString());

  return (
    <>
      <h1 className='head-text'>Activity</h1>

      <section className='mt-10 flex flex-col gap-5'>
        {activity.length > 0 ? (
          <>
            {activity.map((activityItem) => (
              <Link href={`/thread/${activityItem.parentId}`} key={activityItem._id}>
                <article className='activity-card'>
                  <div className="flex items-start gap-3">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={activityItem.author.image}
                        alt={`${activityItem.author.name}'s profile picture`}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className="flex-1">
                      <p className='!text-small-regular text-text-secondary'>
                        <span className='mr-1 text-accent-primary font-semibold'>
                          {activityItem.author.name}
                        </span>{" "}
                        replied to your thread:
                      </p>
                      <p className="mt-1 text-small-regular text-text-primary truncate">
                        "{activityItem.text}"
                      </p>
                      <p className='!text-tiny-medium text-text-muted mt-2'>
                        {formatDateString(activityItem.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
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
