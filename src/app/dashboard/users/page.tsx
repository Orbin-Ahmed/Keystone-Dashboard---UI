import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import UserTable from "@/components/Tables/UserTable";

export const metadata: Metadata = {
  title: "Users || Keystone Engineering Consultant",
  description: "This is the user page.",
};

const UserPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Users" />

      <div className="flex flex-col gap-10">
        <UserTable />
      </div>
    </DefaultLayout>
  );
};

export default UserPage;
