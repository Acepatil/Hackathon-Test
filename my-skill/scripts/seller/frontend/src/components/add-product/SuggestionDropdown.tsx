export function SuggestionDropdown({
  suggestions, categories, onPick, onPickCategory,
}: {
  suggestions: string[];
  categories: string[];
  onPick: (s: string) => void;
  onPickCategory: (c: string) => void;
}) {
  if (!suggestions.length && !categories.length) return null;
  return (
    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 p-2">
      {suggestions.length > 0 && (
        <ul className="mb-2">
          {suggestions.map((s) => (
            <li
              key={s}
              onClick={() => onPick(s)}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer rounded"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-2 pt-2 border-t">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onPickCategory(c)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
