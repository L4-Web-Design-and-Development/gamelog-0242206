interface GameCardProps {
    image: string;
    title: string;
    genre: string;
    date: string;
    onEdit: () => void;
    onDelete: () => void;
  }
  
  export default function GameCard({
    image,
    title,
    genre,
    date,
    onEdit,
    onDelete,
  }: GameCardProps) {
    return (
      <div className="bg-[#071212] rounded-2xl p-4 w-80 shadow-md flex flex-col gap-3">
        <img
          src={image}
          alt={title}
          className="rounded-lg w-full h-40 object-cover mb-2"
        />
        <div className="flex flex-col gap-1 flex-grow">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <p className="text-teal-400 text-xs">{genre}</p>
          <p className="text-gray-500 text-xs">{date}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onEdit}
            className="border border-teal-400 text-teal-400 rounded-lg px-4 py-1 text-xs hover:bg-teal-900 transition"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="border border-red-400 text-red-400 rounded-lg px-4 py-1 text-xs hover:bg-red-900 transition"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
  