import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-batel disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-red-batel hover:text-white border border-white hover:border-red-batel",
        outline:
          "border border-white/25 bg-transparent text-white hover:border-white hover:bg-white hover:text-black",
        ghost: "text-white/70 hover:text-white border border-transparent hover:border-white/20",
        accent:
          "bg-red-batel text-white border border-red-batel hover:bg-white hover:text-black hover:border-white",
        bone: "bg-bone text-black border border-bone hover:bg-red-batel hover:text-white hover:border-red-batel",
        destructive:
          "border border-red-batel/60 text-red-batel hover:bg-red-batel hover:text-white",
        link: "text-white underline-offset-4 hover:underline hover:text-red-batel p-0 h-auto",
      },
      size: {
        default: "h-12 px-7",
        sm: "h-9 px-4 text-[10px]",
        lg: "h-14 px-9 text-xs",
        icon: "h-10 w-10 px-0",
        block: "h-14 w-full px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
