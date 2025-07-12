"use client"
import React from 'react'
import { motion } from 'framer-motion'
import UserProfile from './user-profile';
import { authClient } from '@/lib/auth-client';

export default function SidebarProfile() {
  const {data} = authClient.useSession();
  return (
    <motion.div
    >
      <UserProfile name={data?.user.name || ""} email={data?.user.email || ""} avatarUrl={data?.user.image || ""} />
    </motion.div>
  );
}
