import { put } from "@vercel/blob";
import Busboy from "busboy";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: req.headers });

    let fileBuffer = null;
    let fileName = null;
    let mimeType = null;

    bb.on("file", (_fieldname, file, info) => {
      const { filename, mimeType: mt } = info;
      fileName = filename;
      mimeType = mt;

      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("limit", () => reject(new Error("File too large")));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on("error", reject);
    bb.on("finish", () => {
      resolve({ fileBuffer, fileName, mimeType });
    });

    req.pipe(bb);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileBuffer, fileName, mimeType } = await parseMultipart(req);

    if (!fileBuffer || !fileName) {
      return res.status(400).json({ error: "No file provided" });
    }

    const safeName = `${Date.now()}-${fileName}`;
    const blob = await put(safeName, fileBuffer, {
      access: "public",
      contentType: mimeType || undefined,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Upload failed", details: error?.message });
  }
}
