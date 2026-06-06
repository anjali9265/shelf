"use client";
// src/app/_components/Navbar.tsx
import Image from "next/image";
import { signOut } from "next-auth/react";
import styles from "./Navbar.module.css";

type Props = {
  user: { name?: string | null; image?: string | null; email?: string | null };
};

export function Navbar({ user }: Props) {
  return (
    <nav className={styles.nav}>
      <span className={styles.logo}>Shelf</span>
      <div className={styles.right}>
        {user.image && (
          <Image
            src={user.image}
            alt={user.name ?? "You"}
            width={28}
            height={28}
            className={styles.avatar}
          />
        )}
        <span className={styles.name}>{user.name}</span>
        <button className={styles.signOut} onClick={() => signOut({ callbackUrl: "/sign-in" })}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
