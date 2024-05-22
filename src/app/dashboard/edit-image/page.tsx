import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

type Props = {};

const EditImage = (props: Props) => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-242.5">
        <Breadcrumb pageName="Design Studio" />
      </div>
    </DefaultLayout>
  );
};

export default EditImage;
