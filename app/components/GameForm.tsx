import { Form } from "@remix-run/react";
import { useState } from "react";

export default function GameForm() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Form method="post" encType="multipart/form-data" className="space-y-4">
      <div>
        <label htmlFor="title" className="block mb-1">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
          placeholder="Enter Game Title"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block mb-1">Price</label>
          <input
            id="price"
            type="number"
            name="price"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            placeholder="e.g. $59.95"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="rating" className="block mb-1">Rating</label>
          <input
            id="rating"
            type="number"
            name="rating"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            placeholder="1-5"
            min="1"
            max="5"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="releaseDate" className="block mb-1">Release Date</label>
        <input
          id="releaseDate"
          type="date"
          name="releaseDate"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
        />
      </div>

      <div>
        <label htmlFor="category" className="block mb-1">Category</label>
        <select
          id="category"
          name="category"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
          required
        >
          <option value="">Please Select</option>
          <option value="Action">Action</option>
          <option value="RPG">RPG</option>
          <option value="Strategy">Strategy</option>
          <option value="Indie">Indie</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block mb-1">Description</label>
        <textarea
          id="description"
          name="description"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
          rows={4}
          placeholder="How was your experience?"
        />
      </div>

      <div>
        <label htmlFor="image" className="block mb-1">Upload Game Image</label>
        <input
          id="image"
          type="file"
          name="image"
          accept="image/*"
          className="w-full text-sm text-gray-400 file:bg-gray-700 file:text-white file:px-4 file:py-2 file:rounded file:border-none file:cursor-pointer"
          onChange={handleImageChange}
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-4 max-h-48 w-auto rounded object-contain"
          />
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="reset"
          className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
          onClick={() => setPreview(null)} // reset preview on form reset
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
        >
          Submit
        </button>
      </div>
    </Form>
  );
}
