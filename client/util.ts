export function getIsAdmin() {
  const adminCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("admin="));
  if (adminCookie) {
    return adminCookie.split("=")[1] === "true";
  }
  return false;
}

export function randomNoise(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha: number
) {
  x = x || 0;
  y = y || 0;
  width = width || canvas.width;
  height = height || canvas.height;
  alpha = alpha || 255;
  var g = canvas.getContext("2d")!,
    imageData = g.getImageData(x, y, width, height),
    random = Math.random,
    pixels = imageData.data,
    n = pixels.length,
    i = 0;
  while (i < n) {
    pixels[i++] = pixels[i++] = pixels[i++] = (random() * 256) | 0;
    pixels[i++] = alpha;
  }
  g.putImageData(imageData, x, y);
  return canvas;
}

export function perlin_noise(canvas: HTMLCanvasElement) {
  var canvas_ctx = canvas.getContext("2d")!,
    offscreen = document.createElement("canvas"),
    offscreen_ctx = offscreen.getContext("2d")!,
    saved_alpha = canvas_ctx.globalAlpha;

  /* Fill the offscreen buffer with random noise. */
  offscreen.width = canvas.width;
  offscreen.height = canvas.height;

  var offscreen_id = offscreen_ctx.getImageData(
      0,
      0,
      offscreen.width,
      offscreen.height
    ),
    offscreen_pixels = offscreen_id.data;

  for (var i = 0; i < offscreen_pixels.length; i += 4) {
    offscreen_pixels[i] =
      offscreen_pixels[i + 1] =
      offscreen_pixels[i + 2] =
        Math.floor(Math.random() * 256);
    offscreen_pixels[i + 3] = 255;
  }

  offscreen_ctx.putImageData(offscreen_id, 0, 0);

  /* Scale random iterations onto the canvas to generate Perlin noise. */
  for (var size = 4; size <= offscreen.width; size *= 2) {
    var x = Math.floor(Math.random() * (offscreen.width - size)),
      y = Math.floor(Math.random() * (offscreen.height - size));

    canvas_ctx.globalAlpha = 4 / size;
    canvas_ctx.drawImage(
      offscreen,
      x,
      y,
      size,
      size,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  canvas_ctx.globalAlpha = saved_alpha;
}
