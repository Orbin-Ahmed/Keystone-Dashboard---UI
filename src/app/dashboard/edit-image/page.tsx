import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
export const metadata: Metadata = {
  title: "Design Studio || Keystone Engineering Consultant",
  description: "This is the edit image page",
};

type Props = {};

const EditImage = (props: Props) => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Design Studio" />
        <div>Design Studio</div>
      </div>
    </DefaultLayout>
  );
};

export default EditImage;
