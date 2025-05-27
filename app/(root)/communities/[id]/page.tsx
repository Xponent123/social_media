import Image from "next/image";
import { currentUser } from "@clerk/nextjs";

import { communityTabs } from "@/constants";

import UserCard from "@/components/cards/UserCard";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchCommunityDetails } from "@/lib/actions/community.actions";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const communityDetails = await fetchCommunityDetails(params.id);

  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.createdBy.id}
        authUserId={user.id}
        name={communityDetails.name}
        username={communityDetails.username}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        type='Community'
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab-list'>
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <div className="relative w-6 h-6">
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    fill
                    className='object-contain'
                  />
                </div>
                <p className='max-sm:hidden text-text-secondary'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <div className='ml-1 rounded-sm bg-accent-primary/10 px-2 py-1 text-tiny-medium text-accent-primary'>
                    {communityDetails.threads.length}
                  </div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='threads' className='w-full text-text-primary'>
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>

          <TabsContent value='members' className='mt-9 w-full text-text-primary'>
            <section className='mt-9 flex flex-col gap-10'>
              {communityDetails.members.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                />
              ))}
            </section>
          </TabsContent>

          <TabsContent value='requests' className='w-full text-text-primary'>
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;
