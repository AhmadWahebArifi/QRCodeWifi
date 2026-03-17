import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

function App() {
  const [imageUrl, setImageUrl] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadImage = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const processFile = async (file) => {
    if (file && file.type.startsWith("image/")) {
      setFileName(file.name);

      const uploadedUrl = await uploadImage(file);

      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        setQrValue(uploadedUrl);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const downloadQR = () => {
    const svg = document.querySelector("#qr-code svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qrcode-${fileName || "image"}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          QR Code Image Generator
        </h1>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-4 border-dashed border-blue-300 rounded-xl p-12 text-center transition-all mb-8 ${
              isUploading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <div className="text-6xl mb-4 animate-pulse">⏳</div>
            ) : (
              <div className="text-6xl mb-4">📁</div>
            )}
            <p className="text-xl text-gray-700 font-medium mb-2">
              {isUploading
                ? "Uploading to cloud..."
                : "Drop an image here or click to browse"}
            </p>
            <p className="text-gray-500">Supports JPG, PNG, GIF, WebP</p>
          </div>

          {fileName && (
            <p className="text-center text-gray-600 mb-6">
              Selected:{" "}
              <span className="font-medium text-blue-600">{fileName}</span>
            </p>
          )}

          {qrValue && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Your QR Code
                </h2>
                <div
                  id="qr-code"
                  className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-lg"
                >
                  <QRCodeSVG
                    value={qrValue}
                    size={256}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <button
                  onClick={downloadQR}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Download QR Code
                </button>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Image Preview
                </h2>
                <div className="p-4 bg-gray-100 border-2 border-gray-200 rounded-xl shadow-lg">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-w-[256px] max-h-[256px] object-contain rounded-lg"
                  />
                </div>
                <p className="mt-4 text-sm text-gray-500 text-center">
                  Scan to view online on Vercel
                </p>
              </div>
            </div>
          )}

          {!qrValue && (
            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                How it works:
              </h3>
              <ul className="text-blue-700 space-y-1 list-disc list-inside">
                <li>Upload or drag & drop an image</li>
                <li>Image is stored online on Vercel Blob</li>
                <li>QR code contains the image URL</li>
                <li>Anyone can scan to view the image online!</li>
                <li>Download and share the QR code anywhere!</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
