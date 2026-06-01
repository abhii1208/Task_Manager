import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

import { cn } from "../../utils/cn";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: ReactNode;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  disableClose?: boolean;
};

export const Modal = ({ open, title, description, onClose, children, footer, className, contentClassName, disableClose = false }: ModalProps) => {
  useEffect(() => {
    if (!open || disableClose) {
      return;
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [disableClose, onClose, open]);

  const handleRequestClose = (): void => {
    if (disableClose) {
      return;
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-700/30 p-4 backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleRequestClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "w-full max-h-[92vh] overflow-hidden rounded-2xl border border-violet-border bg-white shadow-[0_24px_52px_rgba(15,23,42,0.2)]",
              className
            )}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-violet-border px-5 py-4 sm:px-6">
              <div>
                <div className="text-xl font-bold text-text-main">{title}</div>
                {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
              </div>
              <Button variant="ghost" className="h-9 w-9 px-0 text-slate-600" onClick={handleRequestClose} disabled={disableClose} aria-label="Close modal">
                <X size={16} />
              </Button>
            </div>

            <div className={cn("max-h-[calc(92vh-132px)] overflow-y-auto px-5 py-5 sm:px-6", contentClassName)}>{children}</div>
            {footer ? <div className="border-t border-violet-border px-5 py-4 sm:px-6">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
