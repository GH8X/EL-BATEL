import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      offset={24}
      toastOptions={{
        style: {
          background: "#000",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: "0px",
          color: "#fff",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          padding: "14px 16px",
        },
        className: "elb-toast",
      }}
    />
  );
}
