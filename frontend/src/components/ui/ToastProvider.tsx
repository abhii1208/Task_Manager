import { Toaster } from "react-hot-toast";

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3200,
        style: {
          borderRadius: "12px",
          border: "1px solid #d8d2eb",
          background: "#ffffff",
          color: "#111827",
          padding: "12px 14px",
          fontSize: "14px"
        }
      }}
    />
  );
};
