import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";

type RevampProps = {};

const Variant = ({}: RevampProps) => {
  return (
    <>
      <DefaultLayout>
        <div className="mx-auto">
          <Breadcrumb pageName="Variant" />
        </div>
      </DefaultLayout>
    </>
  );
};

export default Variant;
