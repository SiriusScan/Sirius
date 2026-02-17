import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "src/components/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-violet-500/20 bg-violet-500/10 text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/20",
        destructive:
          "border border-red-500/20 bg-red-500/10 text-red-400 hover:border-red-500/30 hover:bg-red-500/20",
        outline:
          "border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white",
        secondary:
          "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white",
        ghost:
          "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200",
        link: "text-violet-400 underline-offset-4 hover:text-violet-300 hover:underline",
        primary:
          "border border-violet-500/30 bg-violet-500/20 text-violet-200 hover:border-violet-500/40 hover:bg-violet-500/30",
      },
      size: {
        none: "",
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // className goes FIRST so variant styles win in tailwind-merge.
    // This means className can add layout utilities (mt-4, w-full, flex-1)
    // but cannot override the variant's color/border/bg treatment.
    return (
      <Comp
        className={cn(className, buttonVariants({ variant, size }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
