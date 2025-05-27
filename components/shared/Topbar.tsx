"use client";

import { OrganizationSwitcher, SignedIn, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

function Topbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className='topbar'
    >
      <div className='flex items-center gap-4'>
        <Link href='/' className='flex items-center gap-3 group'>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className='relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-[rgba(var(--gradient-1-start),1)] to-[rgba(var(--gradient-1-end),1)]'
          >
            <Image
              src='/logo.png'
              alt='ConnectX logo'
              fill
              sizes='32px'
              className='object-cover group-hover:scale-110 transition-transform'
              priority
            />
          </motion.div>
          <motion.p
            className='font-bold text-xl text-text-primary max-sm:hidden'
            whileHover={{ scale: 1.05 }}
          >
            <span className='bg-gradient-to-r from-[rgba(var(--gradient-1-start),1)] to-[rgba(var(--gradient-1-end),1)] text-transparent bg-clip-text'>
              Connect
            </span>
            <span>X</span>
          </motion.p>
        </Link>
      </div>

      <div className='flex items-center gap-4'>
        <ThemeToggle />

        <div className='block md:hidden'>
          <SignedIn>
            <SignOutButton>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className='btn-icon text-text-secondary'
              >
                <Image
                  src='/assets/logout.svg'
                  alt='logout'
                  width={20}
                  height={20}
                />
              </motion.button>
            </SignOutButton>
          </SignedIn>
        </div>

        <OrganizationSwitcher
          appearance={{
            elements: {
              organizationSwitcherTrigger:
                "py-2 px-4 rounded-lg border border-border text-text-primary bg-bg-primary hover:bg-bg-tertiary transition-all",
              userPreviewTextContainer: "max-sm:hidden",
              organizationPreviewTextContainer: "max-sm:hidden",
            },
          }}
        />
      </div>
    </motion.nav>
  );
}

export default Topbar;
