import { Tabs } from "@radix-ui/themes";
import React from "react";

type TabContentsProps = {
  value: string;
};

const TabContents = ({ value }: TabContentsProps) => {
  return (
    <>
      <Tabs.Content value={value}>
        <p>Make changes to your {value}.</p>
      </Tabs.Content>
    </>
  );
};

export default TabContents;
