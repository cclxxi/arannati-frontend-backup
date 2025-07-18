import { Modal as AntModal, type ModalProps as AntModalProps } from "antd";
import { cn } from "@/utils/common";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import Image from "next/image";

export interface ModalProps extends AntModalProps {
  variant?: "default" | "fullscreen" | "drawer";
}

export function Modal({
  variant = "default",
  className,
  ...props
}: ModalProps) {
  const variantClasses = {
    default: "",
    fullscreen:
      "[&_.ant-modal]:!w-screen [&_.ant-modal]:!max-w-none [&_.ant-modal]:!top-0 [&_.ant-modal]:!p-0 [&_.ant-modal-content]:!h-screen [&_.ant-modal-content]:!rounded-none",
    drawer:
      "[&_.ant-modal]:!w-[480px] [&_.ant-modal]:!max-w-[90vw] [&_.ant-modal]:!right-0 [&_.ant-modal]:!left-auto [&_.ant-modal]:!top-0 [&_.ant-modal]:!transform-none [&_.ant-modal-content]:!h-screen [&_.ant-modal-content]:!rounded-l-lg [&_.ant-modal-content]:!rounded-r-none",
  };

  return (
    <AntModal className={cn(variantClasses[variant], className)} {...props} />
  );
}

// Confirmation Modal
interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>,
        <Button
          key="confirm"
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>,
      ]}
      width={400}
    >
      {description && <p className="text-text-secondary">{description}</p>}
    </Modal>
  );
}

// Image Preview Modal
interface ImagePreviewModalProps {
  open: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImagePreviewModal({
  open,
  images,
  initialIndex = 0,
  onClose,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Ensure we have valid images and currentIndex
  const currentImage = images[currentIndex];
  if (!currentImage || images.length === 0) {
    return null;
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ maxWidth: "1200px" }}
      centered
    >
      <div className="relative">
        <Image
          src={currentImage}
          alt={`Preview ${currentIndex + 1}`}
          width={1200}
          height={800}
          className="w-full h-auto max-h-[70vh] object-contain"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex ? "bg-white" : "bg-white/50",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
