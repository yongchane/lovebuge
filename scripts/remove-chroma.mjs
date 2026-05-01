import { createReadStream, createWriteStream } from "node:fs";
import { PNG } from "pngjs";

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  throw new Error("Usage: node scripts/remove-chroma.mjs <input> <output>");
}

createReadStream(input)
  .pipe(new PNG())
  .on("parsed", function parsed() {
    const border = [
      [0, 0],
      [this.width - 1, 0],
      [0, this.height - 1],
      [this.width - 1, this.height - 1],
    ];
    const key = border.reduce(
      (acc, [x, y]) => {
        const idx = (this.width * y + x) << 2;
        acc.r += this.data[idx];
        acc.g += this.data[idx + 1];
        acc.b += this.data[idx + 2];
        return acc;
      },
      { r: 0, g: 0, b: 0 }
    );
    key.r /= border.length;
    key.g /= border.length;
    key.b /= border.length;

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const distance = Math.hypot(r - key.r, g - key.g, b - key.b);
        if (distance < 150) {
          const edge = Math.min(1, Math.max(0, (150 - distance) / 110));
          this.data[idx + 3] = Math.round(255 * (1 - edge));
          this.data[idx] = Math.round(r * (1 - edge));
          this.data[idx + 1] = Math.round(g * (1 - edge));
          this.data[idx + 2] = Math.round(b * (1 - edge));
        }
      }
    }
    this.pack().pipe(createWriteStream(output));
  });
