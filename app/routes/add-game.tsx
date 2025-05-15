import GameForm from "~/components/GameForm";

export default function AddGame() {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-900 text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Track a New Game</h2>
      <GameForm />
    </div>
  );
}
