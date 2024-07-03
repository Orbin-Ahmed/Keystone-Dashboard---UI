"use client";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
      <>
        {loading ? <Loader /> : children}
      </>
  );
}
