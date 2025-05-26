import {
    json,
    redirect,
    unstable_parseMultipartFormData,
    unstable_composeUploadHandlers,
    unstable_createMemoryUploadHandler,
  } from "@remix-run/node";
  import { Form, useActionData, useNavigation } from "@remix-run/react";
  import { v2 as cloudinary } from "cloudinary";
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
  
  export const action = async ({ request }: { request: Request }) => {
    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createMemoryUploadHandler()
    );
  
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const file = formData.get("image");
  
    if (!(file instanceof File)) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }
  
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
  
    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "gamelog" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        }
      );
      stream.end(buffer);
    });
  
    // Redirect or return the uploaded URL for use in your form
    return redirect(`/cloudinary-upload?uploadedUrl=${encodeURIComponent(uploadResult.secure_url)}`);
  };
  
  export default function CloudinaryUpload() {
    const actionData = useActionData<{ error?: string }>();
    const navigation = useNavigation();
    const urlParams = new URLSearchParams(window.location.search);
    const uploadedUrl = urlParams.get("uploadedUrl");
  
    return (
      <div className="max-w-md mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Game Image</h2>
        <Form method="post" encType="multipart/form-data">
          <input type="file" name="image" accept="image/*" required />
          <button
            type="submit"
            disabled={navigation.state === "submitting"}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded"
          >
            {navigation.state === "submitting" ? "Uploading..." : "Upload"}
          </button>
        </Form>
  
        {actionData?.error && (
          <p className="text-red-500 mt-2">{actionData.error}</p>
        )}
  
        {uploadedUrl && (
          <div className="mt-4">
            <p>Uploaded Image Preview:</p>
            <img src={uploadedUrl} alt="Uploaded" className="mt-2 rounded max-w-full" />
            <p className="mt-2 break-all">{uploadedUrl}</p>
          </div>
        )}
      </div>
    );
  }
  