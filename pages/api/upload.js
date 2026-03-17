import { put } from "@vercel/blob";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Upload request received");

    // Use built-in body parsing for multipart data
    // Vercel automatically parses multipart form data
    const { file } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    console.log(
      "File received:",
      file.name || "unknown",
      "Size:",
      file.size || "unknown",
    );

    // Upload to Vercel Blob
    const blob = await put(file.name || "upload.jpg", file, {
      access: "public",
    });

    console.log("Upload successful:", blob.url);

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      error: "Upload failed",
      details: error.message,
    });
  }
}
