const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Proof attached to a campaign request: photos plus documents. Stored privately, readable only by the requester and reviewers.
const EVIDENCE_DIR = path.join(__dirname, "..", "private", "evidence");
const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024;

function sniffKind(buf) {
  if (buf.length > 12 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", mime: "image/jpeg" };
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: "png", mime: "image/png" };
  if (buf.length > 12 && buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return { ext: "webp", mime: "image/webp" };
  if (buf.length > 5 && buf.slice(0, 5).toString() === "%PDF-") return { ext: "pdf", mime: "application/pdf" };
  if (buf.length > 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return { ext: "zip", mime: "application/zip" }; // docx / xlsx
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))) return { ext: "doc", mime: "application/msword" };
  return null;
}

const uploader = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES, files: MAX_FILES } }).array("evidence", MAX_FILES);

// Validates every uploaded file, writes it to the private directory and returns the metadata to store on the request.
async function storeEvidence(files, prefix) {
  await fs.promises.mkdir(EVIDENCE_DIR, { recursive: true });
  const out = [];
  for (const f of files) {
    const kind = sniffKind(f.buffer);
    if (!kind) {
      const err = new Error(`Berkas "${f.originalname}" tidak didukung. Gunakan JPG, PNG, WEBP, PDF, DOC atau DOCX.`);
      err.status = 400;
      throw err;
    }
    const file = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${kind.ext}`;
    await fs.promises.writeFile(path.join(EVIDENCE_DIR, file), f.buffer);
    out.push({ file, name: path.basename(f.originalname).slice(0, 120), mime: kind.mime, size: f.size });
  }
  return out;
}

module.exports = { EVIDENCE_DIR, MAX_FILES, MAX_BYTES, uploader, storeEvidence };
