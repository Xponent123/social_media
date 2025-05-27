"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignOutButton, SignedIn, useAuth } from "@clerk/nextjs";
import { useTheme } from "@/context/ThemeProvider";

import { sidebarLinks } from "@/constants";

const LeftSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();
  const { theme } = useTheme();

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
              <div
                className={`relative w-5 h-5 ${
                  isActive ? "text-accent-primary" : "text-text-secondary"
                }`}
              >
                <Image
                  src={link.imgURL}
                  alt={link.label}
                  fill
                  className='object-contain'
                  style={{
                    filter:
                      theme === "light" && !isActive
                        ? "invert(0.6) sepia(0.1) saturate(1) hue-rotate(190deg)"
                        : "none",
                  }}
                />
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className='mt-auto border-t border-border pt-6'>
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push("/sign-in")}>
            <button className='sidebar_link flex w-full justify-start text-text-secondary'>
              <div className='relative w-5 h-5'>
                <Image
                  src='/assets/logout.svg'
                  alt='logout'
                  fill
                  className='object-contain'
                  style={{
                    filter:
                      theme === "light"
                        ? "invert(0.6) sepia(0.1) saturate(1) hue-rotate(190deg)"
                        : "none",
                  }}
                />
              </div>
              <span>Logout</span>
            </button>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
};

export default LeftSidebar;
