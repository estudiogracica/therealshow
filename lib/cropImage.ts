export interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Recorta la imagen al área elegida por el usuario y la devuelve como un
 * archivo JPEG cuadrado de 500x500, listo para subir a Supabase Storage.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  cropPixels: CroppedAreaPixels,
  fileName: string
): Promise<File> {
  const image = await loadImage(imageSrc);
  const outputSize = 500;

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputSize,
    outputSize
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen."))),
      "image/jpeg",
      0.9
    );
  });

  return new File([blob], fileName, { type: "image/jpeg" });
}
