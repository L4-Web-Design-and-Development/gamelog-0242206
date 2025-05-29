import { Link } from "@remix-run/react";
import GameLogButton from "./GameLogButton";

interface GameCardProps {
  imageUrl: string;
  title: string;
  genre: string;
  date: string;
  id?: string;
  onDelete?: () => void;
  hoursPlayed?: number;
  showDelete?: boolean;
  showEdit?: boolean; // new prop
}

export default function GameCard({
  imageUrl,
  title,
  genre,
  date,
  id,
  onDelete,
  hoursPlayed,
  showDelete,
  showEdit = true, // default true
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
        <p className="text-gray-400 text-sm mb-1">{date}</p>
        {typeof hoursPlayed === 'number' && (
          <p className="text-cyan-300 text-xs mb-3">Total Hours Played: <span className="font-semibold">{hoursPlayed}</span></p>
        )}
        <div className="flex flex-col gap-2 items-end justify-end mt-2">
          {id && (
            <>
              {showEdit && (
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
              {showDelete && (
                <GameLogButton
                  type="button"
                  variant="danger"
                  size="sm"
                  className="w-24 text-center"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete && onDelete();
                  }}
                >
                  Delete
                </GameLogButton>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}