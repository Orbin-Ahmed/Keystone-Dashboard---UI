import { VariantProps, cva } from "class-variance-authority";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const buttonStyles = cva(
  ["rounded px-6 py-2.5 font-medium leading-normal"],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary",
          "text-white",
          "shadow-[0_4px_9px_-4px_rgba(0,0,0,0.2)]",
          "transition duration-150",
          "ease-in-out",
          "hover:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]",
          "focus:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]",
          "focus:outline-none",
          "focus:ring-0",
          "active:shadow-[0_8px_9px_-4px_rgba(0,0,0,0.1),0_4px_18px_0_rgba(0,0,0,0.2)]",
        ],
        secondary: [
          "bg-white",
          "text-primary",
          "flex",
          "justify-center",
          "border",
          "border-primary",
          "hover:shadow-1",
        ],
        tertiary: [
          "flex",
          "justify-center",
          "border",
          "border-stroke",
          "text-black",
          "hover:shadow-1",
          "dark:border-strokedark",
          "dark:text-white",
        ],
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = VariantProps<typeof buttonStyles> & ComponentProps<"button">;

function CustomButton({ variant, className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(buttonStyles({ variant }), className)}
    />
  );
}

export default CustomButton;
