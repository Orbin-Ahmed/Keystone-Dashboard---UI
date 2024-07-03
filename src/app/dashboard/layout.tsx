"use client";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
