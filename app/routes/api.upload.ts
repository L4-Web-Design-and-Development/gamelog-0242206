// app/routes/api.upload.ts
import type { ActionFunction } from "@remix-run/node";
import { writeFile } from "fs/promises";
import path from "path";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file || typeof file === "string") {
    return new Response("Invalid file", { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  const filePath = path.join(uploadsDir, file.name);
  await writeFile(filePath, buffer);

  const imageUrl = `/uploads/${file.name}`;
  return new Response(JSON.stringify({ imageUrl }), {
    headers: { "Content-Type": "application/json" },
  });
};
