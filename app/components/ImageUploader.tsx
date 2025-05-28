import { useFetcher } from "@remix-run/react";
import { useRef, useEffect } from "react";

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
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.data?.imageUrl) {
      onUpload(fetcher.data.imageUrl);
    }
  }, [fetcher.data?.imageUrl, onUpload]);

  return (
    <div className="bg-gray-950 text-white p-2 rounded">
      <fetcher.Form
        ref={formRef}
        method="post"
        action="/api/upload"
        encType="multipart/form-data"
        onSubmit={e => e.preventDefault()} // Prevent default form submit
        style={{ display: "inline" }}
      >
        <input
          ref={inputRef}
          type="file"
          name="image"
          accept="image/*"
          onChange={() => {
            if (inputRef.current?.files?.length && formRef.current) {
              fetcher.submit(formRef.current, {
                method: "post",
                encType: "multipart/form-data",
              });
            }
          }}
        />
        {fetcher.state === "submitting" && <p>Uploading...</p>}
        {fetcher.data?.error && <p className="text-red-400">{fetcher.data.error}</p>}
      </fetcher.Form>
    </div>
  );
}