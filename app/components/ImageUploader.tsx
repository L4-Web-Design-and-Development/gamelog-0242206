import { useFetcher } from "@remix-run/react";
import { useRef } from "react";

interface UploadResponse {
  imageUrl?: string;
  error?: string;
}

interface ImageUploaderProps {
  onUpload: (url: string) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const fetcher = useFetcher<UploadResponse>();
  const inputRef = useRef<HTMLInputElement>(null);

  // When upload is done, call onUpload with the image URL
  if (fetcher.data?.imageUrl) {
    onUpload(fetcher.data.imageUrl);
    fetcher.data.imageUrl = undefined; // Prevent repeated calls
  }

  return (
    <div>
      <fetcher.Form
        method="post"
        action="/api/upload"
        encType="multipart/form-data"
        onChange={(e) => {
          const fileInput = inputRef.current;
          if (fileInput && fileInput.files && fileInput.files.length > 0) {
            fetcher.submit(e.currentTarget, { method: "post", encType: "multipart/form-data" });
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/*"
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
        />
      </fetcher.Form>
      {fetcher.state === "submitting" && <p className="text-gray-400 text-sm mt-2">Uploading...</p>}
      {fetcher.data?.error && <p className="text-red-400 text-sm mt-2">{fetcher.data.error}</p>}
    </div>
  );
}