import { Link } from "@remix-run/react";

interface GameCardProps {
  imageUrl: string;
  title: string;
  genre: string;
  date: string;
  id?: string;
  onDelete?: () => void;
}

export default function GameCard({
  imageUrl,
  title,
  genre,
  date,
  id,
  onDelete,
}: GameCardProps) {
  return (
    <div className="bg-gray-950 rounded-2xl w-72 overflow-hidden shadow-md flex flex-col">
      <img
        src={imageUrl}
        alt={`${title} cover`}
        className="w-full h-40 object-cover"
      />
      <div className="p-4 text-white">
        <h3 className="text-lg font-semibold leading-tight">{title}</h3>
        <p className="text-teal-400 text-sm mt-1">{genre}</p>
        <p className="text-gray-400 text-sm mb-3">{date}</p>
        <div className="flex flex-col gap-2 items-end">
          {id && (
            <Link
              to={`/edit-game/${id}`}
              className="w-24 border border-teal-400 text-teal-400 rounded px-4 py-1 text-xs hover:bg-teal-900 transition text-center"
            >
              Edit
            </Link>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-24 border border-red-400 text-red-400 rounded px-4 py-1 text-xs hover:bg-red-900 transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}