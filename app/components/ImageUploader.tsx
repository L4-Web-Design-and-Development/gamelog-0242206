import { useState, useRef, useEffect } from "react";
import { useFetcher } from "@remix-run/react";

interface UploadResponse {
  imageUrl?: string;
  error?: string;
}

interface ImageUploaderProps {
  onUpload: (url: string) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fetcher = useFetcher<UploadResponse>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    fetcher.submit(formData, {
      method: "post",
      action: "/api/upload",
      encType: "multipart/form-data",
    });
  };

  useEffect(() => {
    if (fetcher.data?.imageUrl) {
      setIsUploading(false);
      onUpload(fetcher.data.imageUrl);
    }
    if (fetcher.data?.error) {
      setIsUploading(false);
      alert(fetcher.data.error);
    }
  }, [fetcher.data, onUpload]);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
          }
        }}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-gray-700 text-white px-4 py-2 rounded-md mr-2"
      >
        Select Image
      </button>
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`px-4 py-2 rounded-md ${
          !file || isUploading
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-cyan-600 text-white"
        }`}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {preview && (
        <img
          key="image-preview"
          src={preview}
          alt="Preview"
          className="mt-4 max-w-full rounded border border-gray-700"
        />
      )}
    </div>
  );
}
