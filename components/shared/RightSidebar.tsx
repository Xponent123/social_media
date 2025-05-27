import { currentUser } from "@clerk/nextjs";

import UserCard from "../cards/UserCard";

import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUsers } from "@/lib/actions/user.actions";

async function RightSidebar() {
  const user = await currentUser();
  if (!user) return null;

  const similarMinds = await fetchUsers({
    userId: user.id,
    pageSize: 4,
  });

  const suggestedCommunities = await fetchCommunities({ pageSize: 4 });

  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-col gap-6'>
        <h3 className='text-heading4-bold text-text-primary'>
          Suggested Communities
        </h3>
        <div className='flex flex-col gap-4'>
          {suggestedCommunities.communities.length > 0 ? (
            suggestedCommunities.communities.map((community) => (
              <UserCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                personType='Community'
              />
            ))
          ) : (
            <p className='text-text-secondary text-base-medium'>
              No communities yet
            </p>
          )}
        </div>
      </div>

      <div className='mt-8 flex flex-col gap-6'>
        <h3 className='text-heading4-bold text-text-primary'>Similar Minds</h3>
        <div className='flex flex-col gap-4'>
          {similarMinds.users.length > 0 ? (
            similarMinds.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType='User'
              />
            ))
          ) : (
            <p className='text-text-secondary text-base-medium'>No users yet</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default RightSidebar;
