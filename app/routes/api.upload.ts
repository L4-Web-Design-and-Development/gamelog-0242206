import { json, unstable_parseMultipartFormData, unstable_composeUploadHandlers, unstable_createMemoryUploadHandler } from "@remix-run/node";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createMemoryUploadHandler({
        maxPartSize: 10_000_000, // 10MB
      })
    );
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return json({ error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "gamelog" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return json({ imageUrl: uploadResult.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return json({ error: "Failed to upload image" }, { status: 500 });
  }
}