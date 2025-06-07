import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { profileTabs } from "@/constants";
import { fetchUser } from "@/lib/actions/user.actions";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in"); // Redirect if no logged-in user
    return null;
  }

  const userInfo = await fetchUser(params.id); // Fetch profile of the user whose ID (Clerk ID) is in params

  if (!userInfo) {
    // Handle user not found, e.g., show a "not found" message or redirect
    // For now, redirecting to home as a simple fallback.
    // Consider a dedicated 404 page or a message within the layout.
    redirect("/");
    return null;
  }

  // If viewing own profile and not onboarded, redirect to onboarding
  if (params.id === user.id && !userInfo.onboarded) {
    redirect("/onboarding");
    return null;
  }

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id} // Clerk ID of the profile being viewed
        authUserId={user.id} // Clerk ID of the logged-in user
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
        type="User"
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab-list'>
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-bg-tertiary px-2 py-1 !text-tiny-medium text-text-secondary'>
                    {userInfo.threads?.length || 0}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className='w-full text-text-primary'
            >
              <ThreadsTab
                currentUserId={user.id} // Clerk ID of logged-in user
                accountId={userInfo.id} // Clerk ID of the profile being viewed
                accountType='User'
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
export default Page;
