"use client";

import {
  Alert as AntAlert,
  notification,
  type AlertProps as AntAlertProps,
} from "antd";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/utils/common";
import React from "react";

export interface AlertProps extends AntAlertProps {
  variant?: "success" | "info" | "warning" | "error";
}

const iconMap = {
  success: <CheckCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
};

export function Alert({
  variant = "info",
  type,
  icon,
  className,
  ...props
}: AlertProps) {
  return (
    <AntAlert
      type={type || variant}
      icon={icon !== undefined ? icon : iconMap[variant]}
      className={cn("rounded-lg", className)}
      {...props}
    />
  );
}

// Notification API wrapper
export const notify = {
  success: (message: string, description?: string) => {
    notification.success({
      message,
      description,
      placement: "topRight",
      icon: <CheckCircle className="text-success" />,
    });
  },

  error: (message: string, description?: string) => {
    notification.error({
      message,
      description,
      placement: "topRight",
      icon: <XCircle className="text-error" />,
    });
  },

  info: (message: string, description?: string) => {
    notification.info({
      message,
      description,
      placement: "topRight",
      icon: <Info className="text-info" />,
    });
  },

  warning: (message: string, description?: string) => {
    notification.warning({
      message,
      description,
      placement: "topRight",
      icon: <AlertCircle className="text-warning" />,
    });
  },
};

// Inline Alert компонент
interface InlineAlertProps {
  variant?: "success" | "info" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  success: "bg-success/10 border-success/20 text-success",
  info: "bg-info/10 border-info/20 text-info",
  warning: "bg-warning/10 border-warning/20 text-warning",
  error: "bg-error/10 border-error/20 text-error",
};

export function InlineAlert({
  variant = "info",
  title,
  children,
  className,
}: InlineAlertProps) {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg border",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{iconMap[variant]}</div>
      <div className="flex-1">
        {title && <h4 className="font-medium mb-1">{title}</h4>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
    </div>
  );
}
