import React from "react";
import { Checkbox, Dialog, Flex, Inset, Select, Table } from "@radix-ui/themes";
import CustomButton from "../CustomButton";

type CustomDialogProps = {
  title: string;
  description: string;
};

const AddImageDialogue = ({ title, description }: CustomDialogProps) => {
  return (
    <Dialog.Content>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>

      <Flex gap="3" justify="end">
        <Dialog.Close>
          <CustomButton variant="tertiary">Close</CustomButton>
        </Dialog.Close>
        <Dialog.Close>
          <CustomButton>Save</CustomButton>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  );
};

export default AddImageDialogue;
