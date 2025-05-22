// app/routes/api/upload.ts
import type { ActionFunction } from "@remix-run/node";
import {
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const uploadHandler = unstable_composeUploadHandlers(
  async ({ name, data }) => {
    if (name !== "image") return undefined;

    const chunks: Uint8Array[] = [];
    for await (const chunk of data) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "gamelog" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
      stream.end(buffer);
    });
  },
  unstable_createMemoryUploadHandler()
);

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const imageUrl = formData.get("image");
    if (typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "Upload failed" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ imageUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
