import Dashboard from "@/components/Dashboard";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Dashboard || Keystone Engineering Consultant",
  description: "This is the admin dashbooard.",
};

export default function AdminDashboard() {
  return (
    <>
      <DefaultLayout>
        <Dashboard />
      </DefaultLayout>
    </>
  );
}
