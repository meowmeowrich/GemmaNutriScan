/**
 * Resizes an image file to a target square resolution (e.g., 896x896).
 * It maintains aspect ratio and adds letterboxing/padding if necessary
 * to ensure the model gets the ideal resolution.
 */
export const resizeImageForAi = (file: File, targetSize: number = 896): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Fill background with black (padding)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Calculate scaling to fit within targetSize
        const scale = Math.min(targetSize / img.width, targetSize / img.height);
        const x = (targetSize / 2) - (img.width / 2) * scale;
        const y = (targetSize / 2) - (img.height / 2) * scale;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        // Return base64
        resolve(canvas.toDataURL('image/jpeg', 0.85)); // 0.85 quality is sufficient
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};