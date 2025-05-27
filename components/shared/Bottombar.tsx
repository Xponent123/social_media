"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { sidebarLinks } from "@/constants";

function Bottombar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userId } = useAuth();

  return (
    <section className='bottombar'>
      <div className='flex justify-between w-full max-w-md mx-auto'>
        {sidebarLinks.map((link) => {
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          // Handle profile link special case
          const linkRoute =
            link.route === "/profile" ? `${link.route}/${userId}` : link.route;

          return (
            <Link
              href={linkRoute}
              key={link.label}
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive ? "text-accent-primary" : "text-text-secondary"
              }`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
                className='object-contain'
              />

              <p className='text-xs mt-1 max-sm:hidden'>
                {link.label.split(/\s+/)[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;
