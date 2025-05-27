"use client";

import { OrganizationSwitcher, SignedIn, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

function Topbar() {
  return (
    <nav className='topbar'>
      <div className='flex items-center gap-4'>
        <Link href='/' className='flex items-center gap-3'>
          <div className='relative h-8 w-8 overflow-hidden rounded-full'>
            <Image
              src='/logo.png'
              alt='ConnectX logo'
              fill
              className='object-cover'
            />
          </div>
          <p className='font-bold text-xl text-text-primary'>ConnectX</p>
        </Link>
      </div>

      <div className='flex items-center gap-4'>
        <ThemeToggle />

        <div className='block md:hidden'>
          <SignedIn>
            <SignOutButton>
              <button className='btn-icon text-text-secondary'>
                <Image
                  src='/assets/logout.svg'
                  alt='logout'
                  width={20}
                  height={20}
                />
              </button>
            </SignOutButton>
          </SignedIn>
        </div>

        <OrganizationSwitcher
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                "py-2 px-4 rounded-lg border border-border text-text-primary bg-bg-primary",
            },
          }}
        />
      </div>
    </nav>
  );
}

export default Topbar;
