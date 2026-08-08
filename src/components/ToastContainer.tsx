import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4500;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-white border-teal-500/80 shadow-teal-900/10",
          iconBg: "bg-teal-100 text-teal-700",
          titleColor: "text-slate-900",
          icon: <CheckCircle2 className="h-5 w-5 text-teal-600" />,
          progress: "bg-teal-500",
        };
      case "error":
        return {
          bg: "bg-white border-rose-500/80 shadow-rose-900/10",
          iconBg: "bg-rose-100 text-rose-700",
          titleColor: "text-slate-900",
          icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
          progress: "bg-rose-500",
        };
      case "warning":
        return {
          bg: "bg-white border-amber-500/80 shadow-amber-900/10",
          iconBg: "bg-amber-100 text-amber-800",
          titleColor: "text-slate-900",
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          progress: "bg-amber-500",
        };
      case "info":
      default:
        return {
          bg: "bg-white border-sky-500/80 shadow-sky-900/10",
          iconBg: "bg-sky-100 text-sky-700",
          titleColor: "text-slate-900",
          icon: <Info className="h-5 w-5 text-sky-600" />,
          progress: "bg-sky-500",
        };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md ${style.bg} flex items-start space-x-3`}
    >
      <div className={`p-2 rounded-xl shrink-0 ${style.iconBg}`}>{style.icon}</div>

      <div className="flex-1 pr-4 min-w-0">
        <h4 className={`text-xs font-extrabold ${style.titleColor} truncate`}>{toast.title}</h4>
        {toast.description && (
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-0.5 line-clamp-2">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
        title="Dismiss Notification"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Animated Countdown Progress Bar */}
      {duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`absolute bottom-0 left-0 right-0 h-1 ${style.progress} opacity-70`}
        />
      )}
    </motion.div>
  );
};
