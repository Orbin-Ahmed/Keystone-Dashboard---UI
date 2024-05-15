import React from "react";
import { Checkbox, Dialog, Flex, Inset, Select, Table } from "@radix-ui/themes";
import CustomButton from "../CustomButton";

type CustomDialogProps = {
  title: string;
  description?: string;
  name: string;
  email: string;
  role: string;
  isDisabled: boolean;
};

const CustomDialog = ({
  title,
  description,
  name,
  email,
  role,
  isDisabled = false,
}: CustomDialogProps) => {
  const roles: { [key: string]: string[] } = {
    Admin: ["Moderator", "Designer"],
    Moderator: ["Server Admin", "Designer"],
    Designer: ["Moderator", "Server Admin"],
  };
  const availableRoles = roles[role] || [];

  return (
    <Dialog.Content>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Description>{description}</Dialog.Description>

      <Inset side="x" my="5">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Full name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="center">
                Disable
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row align="center">
              <Table.RowHeaderCell>{name}</Table.RowHeaderCell>
              <Table.Cell>{email}</Table.Cell>
              <Table.Cell>
                <Select.Root size="1" defaultValue={role}>
                  <Select.Trigger />
                  <Select.Content>
                    <Select.Item value={role}>{role}</Select.Item>
                    {availableRoles.map((role) => (
                      <Select.Item key={role} value={role}>
                        {role}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Table.Cell>
              <Table.Cell justify="center">
                <Checkbox
                  size="2"
                  color="indigo"
                  defaultChecked={isDisabled}
                  highContrast
                />
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Inset>

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

export default CustomDialog;
