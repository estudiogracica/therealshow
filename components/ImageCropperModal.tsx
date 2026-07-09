"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, ZoomIn } from "lucide-react";
import { getCroppedImageFile } from "@/lib/cropImage";

export function ImageCropperModal({
  imageSrc,
  fileName,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  fileName: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName);
      onConfirm(file);
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-base-950">
      <div className="px-4 pt-4 pb-2 text-center">
        <h2 className="text-lg font-bold">Ajusta tu foto</h2>
        <p className="text-xs text-base-500 mt-1">Arrastra para mover, pellizca o usa la barra para hacer zoom</p>
      </div>

      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>

      <div className="px-4 py-4 flex flex-col gap-4 bg-base-900 border-t border-base-700">
        <div className="flex items-center gap-3">
          <ZoomIn className="w-5 h-5 text-base-500 shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-pitch-500"
          />
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="button" onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            Usar esta foto
          </button>
        </div>
      </div>
    </div>
  );
}
