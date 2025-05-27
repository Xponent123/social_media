"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
}

function UserCard({ id, name, username, imgUrl, personType }: Props) {
  const router = useRouter();

  const isCommunity = personType === "Community";

  return (
    <article className="card flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 rounded-full overflow-hidden">
          <Image
            src={imgUrl}
            alt="user_logo"
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h3 className="text-base-semibold text-text-primary">{name}</h3>
          <p className="text-small-medium text-text-secondary">@{username}</p>
        </div>
      </div>

      <Button
        className="btn-primary"
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`);
          } else {
            router.push(`/profile/${id}`);
          }
        }}
      >
        {isCommunity ? "View" : "Follow"}
      </Button>
    </article>
  );
}

export default UserCard;
