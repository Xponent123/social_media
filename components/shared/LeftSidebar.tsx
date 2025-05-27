"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";

import { sidebarLinks } from "@/constants";

const LeftSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();

  return (
    <section className='sidebar'>
      <div className='flex flex-col gap-2'>
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          const linkRoute =
            link.route === "/profile" ? `${link.route}/${userId}` : link.route;

          return (
            <Link
              href={linkRoute}
              key={link.label}
              className={`sidebar_link ${isActive ? "active" : ""}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={20}
                height={20}
                className={
                  isActive
                    ? "text-accent-primary"
                    : "text-text-secondary"
                }
              />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className='mt-auto border-t border-border pt-6'>
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push("/sign-in")}>
            <button className='sidebar_link flex w-full justify-start text-text-secondary'>
              <Image
                src='/assets/logout.svg'
                alt='logout'
                width={20}
                height={20}
              />
              <span>Logout</span>
            </button>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
};

export default LeftSidebar;
