import React from "react";
import { twMerge } from "tailwind-merge";

type InputFieldProps = {
  className?: string;
  type: "text" | "email" | "password" | "file" | "number";
  name: string;
  id: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  accept?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const InputField = ({ onChange, className, ...props }: InputFieldProps) => {
  return (
    <input
      {...props}
      onChange={onChange}
      className={twMerge(
        "w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary",
        className,
      )}
    />
  );
};

export default InputField;
