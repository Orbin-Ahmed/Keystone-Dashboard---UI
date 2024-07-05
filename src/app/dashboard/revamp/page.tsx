import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React from "react";

type RevampProps = {};

const Revamp = ({}: RevampProps) => {
  return (
    <>
      <DefaultLayout>
        <div className="mx-auto">
          <Breadcrumb pageName="Design Studio / Revamp" />
        </div>
      </DefaultLayout>
    </>
  );
};

export default Revamp;
