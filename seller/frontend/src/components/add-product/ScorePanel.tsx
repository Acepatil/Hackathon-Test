import { Sparkles } from "lucide-react";
import type { Uploads } from "./ImagePanel";

export function ScorePanel({
  name, price, unit, description, uploads, configSpecs = {}, otherSpecs = {},
}: {
  name: string; price: string; unit: string; description: string; uploads: Uploads;
  configSpecs?: Record<string, string>;
  otherSpecs?: Record<string, string>;
}) {
  const items = computeScore({ name, price, unit, description, uploads, configSpecs, otherSpecs });
  const total = items.reduce((s, i) => s + i.got, 0);
  const max = items.reduce((s, i) => s + i.max, 0);
  const pct = Math.round((total / max) * 100);
  const level = pct >= 80 ? "High" : pct >= 50 ? "Medium" : "Low";
  const levelColor = pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600";

  const basics = items.filter((i) => i.section === "basic");
  const specs = items.filter((i) => i.section === "spec");

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-l border-gray-200 p-4 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-700">Product Score:</div>
        <div className={`font-bold ${levelColor}`}>{level}</div>
      </div>
      <div className="relative h-2 bg-gray-200 rounded mb-1">
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-green-500 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mb-3">
        <span>0</span><span className="font-bold text-gray-700">{pct}</span><span>100</span>
      </div>
      <button className="w-full border border-[#0d9e8e] text-[#0d9e8e] rounded py-1.5 text-xs flex items-center justify-center gap-1 mb-4 hover:bg-[#0d9e8e]/5">
        <Sparkles className="w-3 h-3" /> Use AI to Audit
      </button>

      <Section title="Basic details" items={basics} />
      <Section title="Specifications" items={specs} />
    </aside>
  );
}

function Section({ title, items }: { title: string; items: ScoreItem[] }) {
  return (
    <div className="mb-4">
      <div className="font-semibold text-gray-700 mb-2 pb-1 border-b">{title}</div>
      <ul className="space-y-1.5 text-xs">
        {items.map((it) => (
          <li key={it.label} className="flex justify-between items-center">
            <span className={it.parent ? "ml-3 text-gray-500" : "text-gray-700"}>{it.label}</span>
            <span className={`font-semibold ${
              it.got === 0 && !it.neutral ? "text-red-500" :
              it.neutral ? "text-gray-400" : "text-green-600"
            }`}>
              {it.neutral ? "" : `${it.got}/${it.max}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ScoreItem = {
  label: string; got: number; max: number; section: "basic" | "spec";
  parent?: boolean; neutral?: boolean;
};

export function computeScore({ name, price, unit, description, uploads, configSpecs = {}, otherSpecs = {} }: {
  name: string; price: string; unit: string; description: string; uploads: Uploads;
  configSpecs?: Record<string, string>;
  otherSpecs?: Record<string, string>;
}): ScoreItem[] {
  const nameWords = name.trim().split(/\s+/).filter(Boolean).length;
  const secCount = uploads.secondary.filter(Boolean).length + uploads.extras.filter(Boolean).length;
  const configCount = Object.values(configSpecs).filter(val => val.trim().length > 0).length;
  const otherCount = Object.values(otherSpecs).filter(val => val.trim().length > 0).length;
  return [
    { label: "Name (>=3 Words)", got: nameWords >= 3 ? 10 : 0, max: 10, section: "basic" },
    { label: "Photo Dimension (Width or Height >=1000 px)", got: 0, max: 0, section: "basic", neutral: true },
    { label: "Primary Photo", got: uploads.primary || uploads.secondary[0] ? 10 : 0, max: 10, section: "basic" },
    { label: "Secondary Photos", got: 0, max: 0, section: "basic", neutral: true },
    { label: "1 Photo", got: secCount >= 1 ? 10 : 0, max: 10, section: "basic", parent: true },
    { label: "2 or More Photos", got: secCount >= 2 ? 10 : 0, max: 10, section: "basic", parent: true },
    { label: "Price (with unit)", got: price && unit ? 20 : 0, max: 20, section: "basic" },
    { label: "Description (>100 chars)", got: description.length > 100 ? 5 : 0, max: 5, section: "basic" },
    { label: "Video", got: uploads.video ? 10 : 0, max: 10, section: "basic" },
    { label: "Product Brochure (PDF)", got: uploads.pdf ? 5 : 0, max: 5, section: "basic" },
    { label: "Config Specs.", got: configCount >= 1 ? 10 : 0, max: 10, section: "spec" },
    { label: "Other Specs.", got: otherCount >= 1 ? 10 : 0, max: 10, section: "spec" },
  ];
}
