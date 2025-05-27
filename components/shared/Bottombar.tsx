"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { sidebarLinks } from "@/constants";

function Bottombar() {
  const pathname = usePathname();
  const { userId } = useAuth();

  return (
    <section className='bottombar md:hidden'>
      <div className='bottombar-container'>
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
              className={`bottombar-link ${
                isActive ? "text-accent-primary" : "text-text-secondary"
              }`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
                className='bottombar-icon object-contain'
              />
              {/* Hide text labels on smallest screens */}
              <span className='bottombar-text sm:inline hidden'>
                {link.label.split(/\s+/)[0]}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;
