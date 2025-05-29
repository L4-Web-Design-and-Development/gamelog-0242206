import { Link } from "@remix-run/react";
import GameLogButton from "./GameLogButton";

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
    <div className="bg-gray-950 rounded-2xl w-80 overflow-hidden shadow-md flex flex-col">
      <Link to={id ? `/games/${id}` : "#"}>
        <img
          src={imageUrl}
          alt={`${title} cover`}
          className="w-full h-52 object-cover cursor-pointer"
        />
      </Link>
      <div className="p-6 text-white">
        <Link to={id ? `/games/${id}` : "#"}>
          <h3 className="text-lg font-semibold leading-tight hover:underline cursor-pointer">{title}</h3>
        </Link>
        <p className="text-teal-400 text-sm mt-1">{genre}</p>
        <p className="text-gray-400 text-sm mb-3">{date}</p>
        <div className="flex flex-col gap-2 items-end">
          {id && (
            <Link to={`/edit-game/${id}`} className="w-24">
              <GameLogButton
                as="button"
                variant="outline"
                size="sm"
                className="w-full text-center"
              >
                Edit
              </GameLogButton>
            </Link>
          )}
          {onDelete && (
            <GameLogButton
              type="button"
              variant="danger"
              size="sm"
              className="w-24 text-center"
              style={{ marginTop: '0.5rem' }}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </GameLogButton>
          )}
        </div>
      </div>
    </div>
  );
}