import { Mic } from "lucide-react";

export function MicButton({
  active, onClick, className = "",
}: { active: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-gray-100 ${active ? "text-red-500 animate-pulse" : "text-gray-500"} ${className}`}
      title="Speak"
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}
