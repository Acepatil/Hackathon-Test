import { Bold, Italic, List, ListOrdered, Sigma, Superscript, Strikethrough, Undo, Redo, Sparkles } from "lucide-react";

export function RichTextToolbar() {
  const btn = "p-1.5 hover:bg-gray-200 rounded text-gray-600";
  return (
    <div className="flex items-center gap-0.5 border border-gray-200 border-b-0 bg-gray-50 px-2 py-1 rounded-t">
      <button className={btn}><Bold className="w-3.5 h-3.5" /></button>
      <button className={btn}><Italic className="w-3.5 h-3.5" /></button>
      <span className="w-px h-4 bg-gray-300 mx-1" />
      <button className={btn}><List className="w-3.5 h-3.5" /></button>
      <button className={btn}><ListOrdered className="w-3.5 h-3.5" /></button>
      <span className="w-px h-4 bg-gray-300 mx-1" />
      <button className={btn}><Sigma className="w-3.5 h-3.5" /></button>
      <button className={btn}><Superscript className="w-3.5 h-3.5" /></button>
      <button className={btn}><Strikethrough className="w-3.5 h-3.5" /></button>
      <span className="w-px h-4 bg-gray-300 mx-1" />
      <button className={btn}><Undo className="w-3.5 h-3.5" /></button>
      <button className={btn}><Redo className="w-3.5 h-3.5" /></button>
      <span className="w-px h-4 bg-gray-300 mx-1" />
      <button className={`${btn} text-[#0d9e8e]`}><Sparkles className="w-3.5 h-3.5" /></button>
    </div>
  );
}
