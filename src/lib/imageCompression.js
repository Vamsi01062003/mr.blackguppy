/** Browser-side WebP optimization; never enlarges a file, gracefully retains originals. */
export async function compressImage(file, options = {}) {
  const { maxDimension = 800, targetKB = 25, minDimension = 480, minQuality = 0.65, maxQuality = 0.88 } = options;
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size <= targetKB * 1024) return file;
  if (typeof document === "undefined" || typeof URL === "undefined") return file;
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const longest = Math.max(image.naturalWidth, image.naturalHeight);
    if (!longest) return file;
    let dimension = Math.min(maxDimension, longest);
    let best = null;
    while (dimension >= Math.min(minDimension, longest)) {
      const scale = dimension / longest;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) break;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (let quality = maxQuality; quality >= minQuality - 0.001; quality -= 0.05) {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/webp", Math.max(minQuality, quality)));
        if (!blob || blob.type !== "image/webp") continue;
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= targetKB * 1024) break;
      }
      if (best && best.size <= targetKB * 1024) break;
      const next = Math.round(dimension * 0.85);
      if (next < minDimension || next === dimension) break;
      dimension = next;
    }
    if (!best || best.size >= file.size) return file;
    const result = new File([best], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp", lastModified: Date.now() });
    console.info(`Optimized ${file.name}: ${Math.round(file.size / 1024)} KB → ${Math.round(result.size / 1024)} KB`);
    return result;
  } catch (error) {
    console.warn("Image optimization skipped:", error);
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
