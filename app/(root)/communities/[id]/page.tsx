import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

import { communityTabs } from "@/constants";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreadsTab from "@/components/shared/ThreadsTab";
import UserCard from "@/components/cards/UserCard";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
    return null;
  }

  const communityDetails = await fetchCommunityDetails(params.id); // params.id is community's Clerk-like ID

  if (!communityDetails) {
    return <p className="no-result text-center mt-10">Community not found.</p>;
  }
  
  // Ensure communityDetails._id is converted to string for ThreadsTab
  const communityMongoId = communityDetails._id?.toString();
  if (!communityMongoId) {
     return <p className="no-result text-center mt-10">Community data is incomplete.</p>;
  }


  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.id} // Community's Clerk-like ID
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
                    {communityDetails.threads?.length || 0}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='threads' className='w-full text-text-primary'>
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityMongoId} // Pass the MongoDB ID string
              accountType='Community'
            />
          </TabsContent>

          <TabsContent value='members' className='mt-9 w-full text-text-primary'>
            <section className='mt-9 flex flex-col gap-6'> {/* Reduced gap from gap-10 */}
              {communityDetails.members && communityDetails.members.length > 0 ? (
                communityDetails.members.map((member: any) => (
                  <UserCard
                    key={member.id || member._id?.toString()} // Use Clerk ID if available, else MongoDB ID
                    id={member.id || member._id?.toString()}
                    name={member.name}
                    username={member.username}
                    imgUrl={member.image}
                    personType='User'
                  />
                ))
              ) : (
                <p className="no-result">No members found.</p>
              )}
            </section>
          </TabsContent>

          <TabsContent value='requests' className='w-full text-text-primary'>
            <p className="no-result text-center mt-10">Requests feature not yet implemented.</p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;
