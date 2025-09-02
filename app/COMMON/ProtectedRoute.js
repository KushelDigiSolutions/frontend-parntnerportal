// ProtectedRoute.js
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) {
      router.replace("/login"); // agar login nahi hai to login pe bhej do
    }
  }, [router]);

  return <>{children}</>;
}
