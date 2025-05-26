import { Form } from "@remix-run/react";

export default function GameForm({
  categories,
  imageUrl,
}: {
  categories: { id: string; title: string }[];
  imageUrl: string;
}) {
  return (
    <Form method="post" encType="multipart/form-data" className="flex flex-col gap-6">
      <div>
        <label htmlFor="title" className="block mb-1 text-gray-300 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter Game Title"
        />
      </div>
      <div>
        <label htmlFor="description" className="block mb-1 text-gray-300 font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter Game Description"
        />
      </div>
      <div>
        <label htmlFor="price" className="block mb-1 text-gray-300 font-medium">
          Price
        </label>
        <input
          type="number"
          id="price"
          name="price"
          step="0.01"
          required
          className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter Price"
        />
      </div>
      <div>
        <label htmlFor="rating" className="block mb-1 text-gray-300 font-medium">
          Rating
        </label>
        <input
          type="number"
          id="rating"
          name="rating"
          step="0.1"
          min="0"
          max="10"
          required
          className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Enter Rating (0-10)"
        />
      </div>
      <div>
        <label htmlFor="releaseDate" className="block mb-1 text-gray-300 font-medium">
          Release Date
        </label>
        <input
          type="date"
          id="releaseDate"
          name="releaseDate"
          required
          className="w-full p-3 bg-black rounded-md border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
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
      {/* Show preview if imageUrl exists */}
      {imageUrl && (
        <div className="w-full h-48 bg-black border border-gray-700 rounded flex items-center justify-center overflow-hidden">
          <img src={imageUrl} alt="Preview" className="object-contain max-h-full max-w-full" />
        </div>
      )}
      {/* Hidden input to submit imageUrl */}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="reset"
          className="px-5 py-2 bg-gray-700 rounded hover:bg-gray-600 text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-teal-600 rounded hover:bg-teal-500 text-white"
        >
          Submit
        </button>
      </div>
    </Form>
  );
}