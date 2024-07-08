"use client";
import Footer from "@/components/Client/Footer";
import Header from "@/components/Client/Header";
import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
