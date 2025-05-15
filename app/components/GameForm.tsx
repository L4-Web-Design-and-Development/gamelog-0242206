import { Form } from "@remix-run/react";
import { useState } from "react";

export default function GameForm({ categories }: { categories: { id: string; title: string }[] }) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <Form method="post" encType="multipart/form-data" className="flex flex-col gap-6">
      {/* Your form fields here, including category select */}
      <div>
        <label htmlFor="categoryId" className="block mb-1 text-gray-300 font-medium">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          className="w-full rounded bg-black border border-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Please Select</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>
      {/* Rest of your form fields */}
      {/* Image preview and upload */}
      <div>
        <label htmlFor="image" className="block mb-1 text-gray-300 font-medium">
          Upload Game Image
        </label>
        <div className="w-full h-48 bg-black border border-gray-700 rounded flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Preview" className="object-contain max-h-full max-w-full" />
          ) : (
            <span className="text-gray-500">No image selected</span>
          )}
        </div>
        <label className="inline-block mt-2 px-4 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600">
          Select Image
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      </div>
      {/* Submit buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="reset"
          className="px-5 py-2 bg-gray-700 rounded hover:bg-gray-600 text-white"
          onClick={() => setPreview(null)}
        >
          Cancel
        </button>
        <button type="submit" className="px-5 py-2 bg-teal-600 rounded hover:bg-teal-500 text-white">
          Submit
        </button>
      </div>
    </Form>
  );
}
