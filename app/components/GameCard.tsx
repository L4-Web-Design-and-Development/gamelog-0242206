import gameLogLogo from "~/assets/svg/gamelog-logo.svg";

interface GameCardProps {
  image: string;
  title: string;
  genre: string;
  date: string;
  onView: () => void;
  onDelete: () => void;
}

export default function GameCard({
  image,
  title,
  genre,
  date,
  onView,
  onDelete,
}: GameCardProps) {
  return (
    <div className="relative w-full max-w-xl h-64 rounded-2xl shadow-lg overflow-hidden group bg-gray-900">
      {/* Image */}
      <img
        src={image || gameLogLogo}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-40 transition duration-300"></div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col justify-end h-full text-white">
        <div className="mb-auto">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-teal-400 text-xs">{genre}</p>
          <p className="text-gray-300 text-xs">{date}</p>
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={onView}
            className="border border-teal-400 text-teal-400 rounded px-3 py-1 text-xs hover:bg-teal-700/40 transition"
          >
            View
          </button>
          <button
            onClick={onDelete}
            className="border border-red-400 text-red-400 rounded px-3 py-1 text-xs hover:bg-red-700/40 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
