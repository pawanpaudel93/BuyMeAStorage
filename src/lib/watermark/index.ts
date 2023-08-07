// Function to calculate the average color of the image
function calculateAverageColor(image: HTMLImageElement) {
  const blockSize = 3; // Adjust the size of the blocks for color sampling
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  context!.drawImage(image, 0, 0, image.width, image.height);

  let r = 0,
    g = 0,
    b = 0;
  let count = 0;

  for (let y = 0; y < canvas.height; y += blockSize) {
    for (let x = 0; x < canvas.width; x += blockSize) {
      const pixel = context!.getImageData(x, y, 1, 1).data;
      r += pixel[0];
      g += pixel[1];
      b += pixel[2];
      count++;
    }
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return { r, g, b };
}

// Function to get the complementary color of an RGB color
function getComplementaryColor(rgb: { r: number; g: number; b: number }) {
  return {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b,
  };
}

export async function addWaterMark(
  file: File,
  watermarkText = "BuyMeaStorage"
): Promise<ArrayBufferLike> {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const watermarkFontSize = 20;
  const watermarkOpacity = 0.6;
  const watermarkInterval = 100; // Adjust the interval between watermarks as needed

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        const scale = 0.5;
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Calculate the average color of the image
        const averageColor = calculateAverageColor(img);
        const watermarkColor = getComplementaryColor(averageColor);

        // Add the watermark with the adjusted color and fixed font size
        ctx.fillStyle = `rgba(${watermarkColor.r}, ${watermarkColor.g}, ${watermarkColor.b}, ${watermarkOpacity})`;
        ctx.font = `${watermarkFontSize}px Arial`;

        // Calculate the angle of the rotated watermark (45 degrees)
        const angle = -45;
        const radians = (angle * Math.PI) / 180;

        // Loop through the entire canvas and draw the rotated watermark at each position
        for (let y = 0; y < canvas.height; y += watermarkInterval) {
          for (let x = 0; x < canvas.width; x += watermarkInterval) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(radians);
            ctx.fillText(watermarkText, 0, 0);
            ctx.restore();
          }
        }

        // // Get the canvas content as an array buffer
        // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // const buffer = imageData.data.buffer;

        // resolve(buffer);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                resolve(reader.result as ArrayBufferLike);
              };
              reader.readAsArrayBuffer(blob);
            } else {
              reject(new Error("Failed to create blob."));
            }
          },
          "image/jpeg", // You can specify the desired image format here (e.g., "image/jpeg")
          0.1 // Image quality (0 to 1, where 1 is highest quality)
        );
      };

      img.src = event?.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
