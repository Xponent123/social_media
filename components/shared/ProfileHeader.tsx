import Link from "next/link";
import Image from "next/image";

interface Props {
  accountId: string;
  authUserId: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  type?: string;
}

function ProfileHeader({
  accountId,
  authUserId,
  name,
  username,
  imgUrl,
  bio,
  type,
}: Props) {
  return (
    <div className='profile-header'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='relative h-20 w-20 overflow-hidden rounded-full'>
            <Image
              src={imgUrl}
              alt={`${name}'s profile picture`}
              fill
              className='object-cover'
            />
          </div>

          <div className='flex-1'>
            <h2 className='text-heading3-bold text-text-primary'>{name}</h2>
            <p className='text-base-medium text-text-secondary'>@{username}</p>
          </div>
        </div>

        {accountId === authUserId && type !== "Community" && (
          <Link href='/profile/edit'>
            <div className='btn-secondary flex items-center gap-2'>
              <Image
                src='/assets/edit.svg'
                alt='Edit profile'
                width={16}
                height={16}
              />
              <span className='max-sm:hidden'>Edit</span>
            </div>
          </Link>
        )}
      </div>

      <p className='mt-6 max-w-lg text-base-regular text-text-secondary'>{bio}</p>

      <div className='mt-12 h-0.5 w-full bg-border' />
    </div>
  );
}

export default ProfileHeader;
