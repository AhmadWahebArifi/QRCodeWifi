export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get Blob token from environment
    const token = process.env.BLOB_READ_WRITE_TOKEN;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "BLOB_READ_WRITE_TOKEN not set" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Upload to Vercel Blob using fetch API
    const uploadFormData = new FormData();
    uploadFormData.append("file", file, file.name);

    const response = await fetch("https://blob.vercel-storage.com/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ url: result.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Upload failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
