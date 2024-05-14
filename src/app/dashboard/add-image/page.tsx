import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Tab from "@/components/Tab";
import SearchBar from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "Dream Space || Keystone Engineering Consultant",
  description: "This is the edit image page",
};

type Props = {};

const AddImage = (props: Props) => {
  return (
    <DefaultLayout>
      <div className="mx-auto">
        <Breadcrumb pageName="Dream Space" />
        <SearchBar />
        <div>
          <Tab />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddImage;
