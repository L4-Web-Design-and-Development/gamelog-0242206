// components/ImageUploader.tsx
import { useState } from "react";

export default function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/your-cloudinary-upload-route", {
      method: "POST",
      body: formData,
    });

    if (response.redirected) {
      const url = new URL(response.url);
      const uploadedUrl = url.searchParams.get("uploadedUrl");
      if (uploadedUrl) {
        setPreview(uploadedUrl);
        onUpload(uploadedUrl);
      }
    } else {
      alert("Upload failed");
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-4 max-w-full rounded border border-gray-700"
        />
      )}
    </div>
  );
}
