"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative w-full sm:max-w-sm bg-base-800 border border-base-700 rounded-t-2xl sm:rounded-2xl p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          {description && <p className="text-base-500 text-sm mt-1">{description}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={danger ? "btn-secondary bg-danger text-white" : "btn-primary"}
          >
            {loading ? "Procesando…" : confirmLabel}
          </button>
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
