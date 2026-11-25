import { Toaster as Sonner } from "sonner";
import { Z_INDEX } from "~/components/shared/layers";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ style, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group z-toast"
      // Sonner's injected stylesheet sets its own z-index after Tailwind's,
      // so the layer is applied inline: toasts sit above dialogs (z-toast).
      style={{ zIndex: Z_INDEX.toast, ...style }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-800 group-[.toaster]:text-white group-[.toaster]:border-gray-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-violet-600 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-700 group-[.toast]:text-gray-200",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
