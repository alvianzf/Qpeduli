const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Identify an image by its first bytes instead of trusting the client's mimetype.
function sniffImage(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "webp";
  return null;
}

const memoryUpload = (maxBytes, files = 1) => multer({ storage: multer.memoryStorage(), limits: { fileSize: maxBytes, files } });

// Validates and stores an uploaded image buffer in `dir`, returning the stored file name.
async function saveImage(dir, prefix, buffer) {
  const ext = sniffImage(buffer);
  if (!ext) {
    const err = new Error("Format foto harus JPG, PNG, atau WEBP.");
    err.status = 400;
    throw err;
  }
  await fs.promises.mkdir(dir, { recursive: true });
  const name = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await fs.promises.writeFile(path.join(dir, name), buffer);
  return name;
}

module.exports = { sniffImage, memoryUpload, saveImage };
