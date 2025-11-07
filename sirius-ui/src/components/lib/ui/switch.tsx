import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "~/components/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed",
      "data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600",
      "data-[state=unchecked]:border-gray-600 data-[state=unchecked]:bg-gray-700",
      "disabled:data-[state=unchecked]:border-gray-700 disabled:data-[state=unchecked]:bg-gray-800",
      "disabled:data-[state=checked]:border-violet-700 disabled:data-[state=checked]:bg-violet-800",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform",
        "bg-white data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        "disabled:bg-gray-400"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
