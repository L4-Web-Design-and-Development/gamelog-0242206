import { Form } from "@remix-run/react";

export default function AddGame() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Track a New Game</h2>

      <Form method="post" encType="multipart/form-data" className="space-y-4">
        <div>
          <label htmlFor="title" className="block mb-1">Title</label>
          <input
            id="title"
            type="text"
            name="title"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="1-5"
              min="1"
              max="5"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateStarted" className="block mb-1">Date Started</label>
            <input
              id="dateStarted"
              type="date"
              name="dateStarted"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>

          <div>
            <label htmlFor="dateFinished" className="block mb-1">Date Finished</label>
            <input
              id="dateFinished"
              type="date"
              name="dateFinished"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block mb-1">Category</label>
          <select
            id="category"
            name="category"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
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
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            rows={4}
            placeholder="In a few words, how was your experience playing the game?"
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
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="reset"
            className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
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
    </div>
  );
}
