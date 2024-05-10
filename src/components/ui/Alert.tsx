import { AlertDialog, Flex } from "@radix-ui/themes";
import React from "react";
import CustomButton from "../CustomButton";

type AlertProps = {
  title: string;
  description?: string;
};

function Alert({ title, description }: AlertProps) {
  return (
    <>
      <AlertDialog.Content maxWidth="450px">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size="2">
          {description}
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <CustomButton variant="tertiary">Cancel</CustomButton>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <CustomButton className="bg-danger">Revoke</CustomButton>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </>
  );
}

export default Alert;
