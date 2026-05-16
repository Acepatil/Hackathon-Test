import { useRef, useState } from "react";
import { Camera, Video, FileText, Plus } from "lucide-react";

export type Uploads = {
  primary: string | null;
  secondary: (string | null)[];
  extras: (string | null)[];
  video: string | null;
  pdf: string | null;
};

export function ImagePanel({
  uploads, setUploads,
}: { uploads: Uploads; setUploads: (u: Uploads) => void }) {
  return (
    <div className="w-[240px] flex-shrink-0 space-y-3">
      <ImageSlot
        value={uploads.primary}
        onChange={(v) => setUploads({ ...uploads, primary: v })}
        big
        label="Primary Photo"
      />
      <div className="grid grid-cols-2 gap-2">
        {uploads.secondary.map((v, i) => (
          <ImageSlot
            key={i}
            value={v}
            onChange={(nv) => {
              const next = [...uploads.secondary];
              next[i] = nv;
              setUploads({ ...uploads, secondary: next });
            }}
            label={i === 0 ? "Primary Photo" : "Secondary Photo"}
            small
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {uploads.extras.map((v, i) => (
          <ImageSlot
            key={i}
            value={v}
            onChange={(nv) => {
              const next = [...uploads.extras];
              next[i] = nv;
              setUploads({ ...uploads, extras: next });
            }}
            label="Add Image"
            tiny
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <FileSlot
          value={uploads.video}
          onChange={(v) => setUploads({ ...uploads, video: v })}
          accept="video/*"
          label="Add Video"
          icon={<Video className="w-6 h-6 text-gray-500" />}
        />
        <FileSlot
          value={uploads.pdf}
          onChange={(v) => setUploads({ ...uploads, pdf: v })}
          accept=".pdf"
          label="Product Brochure"
          icon={<FileText className="w-6 h-6 text-red-500" />}
          isPdf
        />
      </div>
    </div>
  );
}

function ImageSlot({
  value, onChange, label, big, small, tiny,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  label: string;
  big?: boolean; small?: boolean; tiny?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const h = big ? "h-48" : small ? "h-20" : "h-16";
  return (
    <div
      onClick={() => ref.current?.click()}
      className={`${h} border-2 border-dashed border-gray-300 rounded bg-gray-50 hover:border-[#0d9e8e] cursor-pointer flex flex-col items-center justify-center text-gray-400 overflow-hidden relative`}
    >
      {value ? (
        <img src={value} alt="" className="w-full h-full object-cover" />
      ) : (
        <>
          {tiny ? <Plus className="w-4 h-4" /> : <Camera className="w-6 h-6" />}
          <span className="text-[10px] mt-1">{label}</span>
        </>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              onChange(ev.target.result as string);
            }
          };
          reader.readAsDataURL(f);
        }}
      />
    </div>
  );
}

function FileSlot({
  value, onChange, accept, label, icon, isPdf,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  accept: string;
  label: string;
  icon: React.ReactNode;
  isPdf?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>("");
  return (
    <div
      onClick={() => ref.current?.click()}
      className="h-20 border-2 border-dashed border-gray-300 rounded bg-gray-50 hover:border-[#0d9e8e] cursor-pointer flex flex-col items-center justify-center text-gray-500 px-1"
    >
      {icon}
      <span className="text-[10px] mt-1 truncate max-w-full">
        {value ? (isPdf ? "View PDF" : "Video added") : label}
      </span>
      {name && <span className="text-[9px] text-gray-400 truncate max-w-full">{name}</span>}
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setName(f.name);
          onChange(URL.createObjectURL(f));
        }}
      />
    </div>
  );
}
