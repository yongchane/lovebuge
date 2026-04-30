import { createReadStream, createWriteStream } from "node:fs";
import { PNG } from "pngjs";

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  throw new Error("Usage: node scripts/remove-chroma.mjs <input> <output>");
}

createReadStream(input)
  .pipe(new PNG())
  .on("parsed", function parsed() {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];
        const greenDominance = g - Math.max(r, b);
        if (g > 150 && greenDominance > 45) {
          const edge = Math.min(1, Math.max(0, (greenDominance - 45) / 120));
          this.data[idx + 3] = Math.round(255 * (1 - edge));
          this.data[idx] = Math.round(r * (1 - edge));
          this.data[idx + 1] = Math.round(g * (1 - edge));
          this.data[idx + 2] = Math.round(b * (1 - edge));
        }
      }
    }
    this.pack().pipe(createWriteStream(output));
  });
