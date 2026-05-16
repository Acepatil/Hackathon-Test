import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lightbulb, Check, ChevronDown } from "lucide-react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { ImagePanel, type Uploads } from "./ImagePanel";
import { ScorePanel, computeScore } from "./ScorePanel";
import { MicButton } from "./MicButton";
import { SuggestionDropdown } from "./SuggestionDropdown";
import { RichTextToolbar } from "./RichTextToolbar";
import { useDebounce } from "@/hooks/use-debounce";
import { useSpeech } from "@/hooks/use-speech";
import { callClaude, parseJsonLoose } from "@/lib/claude";

const LANGS = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ta-IN", label: "Tamil" },
  { code: "te-IN", label: "Telugu" },
  { code: "gu-IN", label: "Gujarati" },
  { code: "bn-IN", label: "Bengali" },
  { code: "mr-IN", label: "Marathi" },
];

type FieldKey = string;

export function AddProductPage() {
  const [name, setName] = useState("Calamine Clay Powder");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("380");
  const [unit, setUnit] = useState("Kg");
  const [description, setDescription] = useState(
    "ASTRRA Chemicals LLP\n\nCALAMINE CLAY POWDER\n\nSoothing • Cooling • Skin Protective\n\nPremium mineral-rich ingredient widely used in skincare, cosmetic, pharmaceutical, and wellness formulations."
  );

  const [uploads, setUploads] = useState<Uploads>({
    primary: null,
    secondary: [null, null],
    extras: [null, null, null, null, null, null],
    video: null,
    pdf: null,
  });

  const [lang, setLang] = useState("en-IN");
  const [highlight, setHighlight] = useState<FieldKey | null>(null);

  const [activeTab, setActiveTab] = useState<"basic" | "specs">("basic");
  const [configSpecs, setConfigSpecs] = useState<Record<string, string>>({});
  const [otherSpecs, setOtherSpecs] = useState<Record<string, string>>({});
  const [suggestedConfigKeys, setSuggestedConfigKeys] = useState<string[]>([]);
  const [suggestedOtherKeys, setSuggestedOtherKeys] = useState<string[]>([]);
  const [isGeneratingSpecs, setIsGeneratingSpecs] = useState(false);
  const navigate = useNavigate();
  const [success, setSuccess] = useState<FieldKey | null>(null);
  const [error, setError] = useState<FieldKey | null>(null);
  const [activeMic, setActiveMic] = useState<FieldKey | null>(null);
  const [pendingSpeech, setPendingSpeech] = useState<{ field: FieldKey; text: string } | null>(null);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);

  // Suggestions
  const debouncedName = useDebounce(name, 400);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const lastQueriedRef = useRef<string>(name);

  useEffect(() => {
    if (debouncedName.trim().length < 3) {
      setSuggestions([]); setCategories([]);
      return;
    }
    if (debouncedName === lastQueriedRef.current && suggestions.length) return;
    lastQueriedRef.current = debouncedName;
    let cancelled = false;
    (async () => {
      try {
        const text = await callClaude(
          `You are an IndiaMART product catalog assistant. Given partial product name, suggest 5 similar complete product names and 2-3 categories it belongs to. Return ONLY JSON: {"suggestions": ["name1",...], "categories": ["cat1",...]}`,
          `Product name typed: "${debouncedName}"`
        );
        const parsed = parseJsonLoose<{ suggestions: string[]; categories: string[] }>(text);
        if (!cancelled && parsed) {
          setSuggestions(parsed.suggestions || []);
          setCategories(parsed.categories || []);
          setShowDropdown(true);
        }
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  // Click outside dropdown
  const nameWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!nameWrapRef.current?.contains(e.target as Node)) setShowDropdown(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowDropdown(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  // Speech
  const speech = useSpeech(lang);

  const handleMic = (field: FieldKey) => {
    if (activeMic === field) {
      speech.stop?.();
      return;
    }
    setActiveMic(field);
    setError(null);
    speech.start(
      (transcript) => {
        setPendingSpeech({ field, text: transcript });
        setActiveMic(null);
      },
      () => { setActiveMic(null); setError(field); }
    );
  };

  const handleProcessSpeech = async () => {
    if (!pendingSpeech) return;
    const { field, text } = pendingSpeech;
    setIsProcessingSpeech(true);
    try {
      const res = await fetch("/api/seller/process-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, field, language: lang }),
      });

      if (!res.ok) {
        setError(field);
        return;
      }

      const data = await res.json();
      if (!data?.value || !data.value.trim()) {
        setError(field);
        return;
      }
      
      if (field === "name") setName(data.value);
      else if (field === "price") setPrice(data.value.replace(/[^\d.]/g, ""));
      else if (field === "unit") setUnit(data.value);
      else if (field === "description") setDescription(data.value);
      else if (field.startsWith("config-spec-")) {
        const key = field.replace("config-spec-", "");
        setConfigSpecs(prev => ({ ...prev, [key]: data.value }));
      }
      else if (field.startsWith("other-spec-")) {
        const key = field.replace("other-spec-", "");
        setOtherSpecs(prev => ({ ...prev, [key]: data.value }));
      }
      
      setHighlight(field);
      setSuccess(field);
      setTimeout(() => setHighlight(null), 2000);
      setTimeout(() => setSuccess(null), 2500);
    } catch {
      setError(field);
    } finally {
      setIsProcessingSpeech(false);
      setPendingSpeech(null);
    }
  };

  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setEditId(id);
      fetch(`/api/seller/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.product) {
            setName(data.product.name || "");
            setCategory(data.product.category || "");
            setPrice(data.product.price || "");
            setUnit(data.product.unit || "");
            setDescription(data.product.description || "");
            if (data.product.primaryPhoto) {
              setUploads((prev) => ({ ...prev, primary: data.product.primaryPhoto }));
            }
          }
        })
        .catch((err) => console.error("Error fetching product", err));
    }
  }, []);

  const handleSave = async () => {
    try {
      const items = computeScore({ name, price, unit, description, uploads, configSpecs, otherSpecs });
      const total = items.reduce((s, i) => s + i.got, 0);
      const max = items.reduce((s, i) => s + i.max, 0);
      const score = Math.round((total / max) * 100);

      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/seller/products/${editId}` : "/api/seller/products";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, category, price, unit, description,
          primaryPhoto: uploads.primary,
          score,
          configSpecs,
          otherSpecs,
        }),
      });
      if (res.ok) {
        navigate({ to: "/manage" });
      } else {
        console.error("Failed to save product");
      }
    } catch (err) {
      console.error("Error saving product", err);
    }
  };

  const fieldClasses = (f: FieldKey, base: string) => {
    const isActive = activeMic === f && speech.listening;
    const isHi = highlight === f;
    const isErr = error === f;
    return `${base} ${isActive ? "border-red-500 ring-2 ring-red-300 animate-pulse" : ""} ${
      isHi ? "bg-yellow-100" : ""
    } ${isErr ? "border-orange-500" : ""}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-white min-h-[calc(100vh-56px)]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 px-6 py-3 border-b text-sm">
            <button onClick={() => navigate({ to: "/manage" })} className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-gray-300">|</span>
            <span className="font-medium">{name || "Product"}</span>
            <div className="ml-auto">
              <label className="text-xs text-gray-500 mr-2">Speech language:</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              >
                {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex">
            <div className="flex-1 px-6 py-4">
              {/* Tabs */}
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab("basic")}
                  className={`flex-1 py-3 rounded-l text-sm font-semibold ${activeTab === "basic" ? "bg-[#1a2b4a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  Basic Details
                </button>
                <button
                  onClick={() => {
                    setActiveTab("specs");
                    if (suggestedConfigKeys.length === 0 && suggestedOtherKeys.length === 0 && description.length > 10 && !isGeneratingSpecs) {
                      setIsGeneratingSpecs(true);
                      fetch("/api/seller/suggest-specs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, description }),
                      })
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.configSpecs) setSuggestedConfigKeys(data.configSpecs);
                          if (data.otherSpecs) setSuggestedOtherKeys(data.otherSpecs);
                          setIsGeneratingSpecs(false);
                        })
                        .catch((err) => {
                          console.error(err);
                          setIsGeneratingSpecs(false);
                        });
                    }
                  }}
                  className={`flex-1 py-3 rounded-r text-sm font-semibold ${activeTab === "specs" ? "bg-[#1a2b4a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  Specification/Additional Details
                </button>
              </div>

              <div className="flex gap-6">
                <ImagePanel uploads={uploads} setUploads={setUploads} />

                <div className="flex-1 space-y-5">
                  {activeTab === "basic" ? (
                    <>
                      {/* Name */}
                      <div ref={nameWrapRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product/Service Name
                        </label>
                        <div className={fieldClasses("name", "flex items-center border rounded bg-white")}>
                          <input
                            value={name}
                            onChange={(e) => { setName(e.target.value); setShowDropdown(true); }}
                            onFocus={() => setShowDropdown(true)}
                            className="flex-1 px-3 py-2.5 outline-none text-sm bg-transparent rounded"
                          />
                          {success === "name" && <Check className="w-4 h-4 text-green-600 mr-1" />}
                          <MicButton active={activeMic === "name" && speech.listening} onClick={() => handleMic("name")} className="mr-1" />
                        </div>
                        {error === "name" && <p className="text-xs text-orange-600 mt-1">Content filtered, try again</p>}
                        {showDropdown && (
                          <SuggestionDropdown
                            suggestions={suggestions}
                            categories={categories}
                            onPick={(s) => { setName(s); setShowDropdown(false); }}
                            onPickCategory={(c) => { setCategory(c); }}
                          />
                        )}
                        {category && (
                          <div className="mt-2 text-xs text-gray-600">
                            Category: <span className="font-medium text-gray-800">{category}</span>
                          </div>
                        )}
                      </div>

                      {/* Price + Unit */}
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <div className={fieldClasses("price", "flex items-center border rounded bg-white")}>
                            <span className="px-3 text-gray-500">₹</span>
                            <input
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              inputMode="decimal"
                              className="flex-1 py-2.5 outline-none text-sm bg-transparent"
                            />
                            {success === "price" && <Check className="w-4 h-4 text-green-600 mr-1" />}
                            <MicButton active={activeMic === "price" && speech.listening} onClick={() => handleMic("price")} className="mr-1" />
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 pb-3">- per -</div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                          <div className={fieldClasses("unit", "flex items-center border rounded bg-white")}>
                            <input
                              value={unit}
                              onChange={(e) => setUnit(e.target.value)}
                              className="flex-1 px-3 py-2.5 outline-none text-sm bg-transparent"
                            />
                            {success === "unit" && <Check className="w-4 h-4 text-green-600 mr-1" />}
                            <MicButton active={activeMic === "unit" && speech.listening} onClick={() => handleMic("unit")} className="mr-1" />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium text-gray-700">Product/Service Description</label>
                          <span className="text-xs text-gray-500">Uses, Details, Benefits, etc.</span>
                        </div>
                        <RichTextToolbar />
                        <div className={fieldClasses("description", "relative border border-t-0 rounded-b bg-white")}>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full min-h-[200px] p-3 text-sm outline-none resize-y bg-transparent rounded-b"
                          />
                          <div className="absolute top-1 right-1 flex items-center gap-1">
                            {success === "description" && <Check className="w-4 h-4 text-green-600" />}
                            <MicButton active={activeMic === "description" && speech.listening} onClick={() => handleMic("description")} />
                          </div>
                        </div>
                        <div className="text-right text-xs text-gray-500 mt-1">
                          {description.length} character (maximum of 4000) including formatting.
                        </div>
                        {error === "description" && <p className="text-xs text-orange-600 mt-1">Content filtered, try again</p>}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Specifications */}
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Product Specifications</h3>
                        {isGeneratingSpecs ? (
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#0d9e8e] border-t-transparent rounded-full animate-spin"></div>
                            Suggesting specifications based on description...
                          </div>
                        ) : suggestedConfigKeys.length === 0 && suggestedOtherKeys.length === 0 ? (
                          <div className="text-sm text-gray-500">No specifications suggested. Type more in the description or add them manually below.</div>
                        ) : (
                          <div className="space-y-6">
                            {suggestedConfigKeys.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700 border-b pb-1">Config Specs.</h4>
                                {suggestedConfigKeys.map((key, idx) => {
                                  const fKey = `config-spec-${key}` as FieldKey;
                                  return (
                                    <div key={key}>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                                      <div className={fieldClasses(fKey, "flex items-center border rounded bg-white")}>
                                        <input
                                          value={configSpecs[key] || ""}
                                          onChange={(e) => setConfigSpecs(prev => ({ ...prev, [key]: e.target.value }))}
                                          className="flex-1 px-3 py-2.5 outline-none text-sm bg-transparent rounded"
                                          placeholder={`Enter ${key}`}
                                        />
                                        {success === fKey && <Check className="w-4 h-4 text-green-600 mr-1" />}
                                        <MicButton active={activeMic === fKey && speech.listening} onClick={() => handleMic(fKey)} className="mr-1" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {suggestedOtherKeys.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700 border-b pb-1">Other Specs.</h4>
                                {suggestedOtherKeys.map((key, idx) => {
                                  const fKey = `other-spec-${key}` as FieldKey;
                                  return (
                                    <div key={key}>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                                      <div className={fieldClasses(fKey, "flex items-center border rounded bg-white")}>
                                        <input
                                          value={otherSpecs[key] || ""}
                                          onChange={(e) => setOtherSpecs(prev => ({ ...prev, [key]: e.target.value }))}
                                          className="flex-1 px-3 py-2.5 outline-none text-sm bg-transparent rounded"
                                          placeholder={`Enter ${key}`}
                                        />
                                        {success === fKey && <Check className="w-4 h-4 text-green-600 mr-1" />}
                                        <MicButton active={activeMic === fKey && speech.listening} onClick={() => handleMic(fKey)} className="mr-1" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Save */}
                  <div className="flex items-center justify-between pt-4">
                    <button className="flex items-center gap-1 text-[#0d9e8e] text-sm hover:underline">
                      <Lightbulb className="w-4 h-4" /> Tips
                    </button>
                    <button onClick={handleSave} className="bg-[#0d9e8e] hover:bg-[#0b8a7c] text-white px-6 py-2.5 rounded font-medium text-sm flex items-center gap-2">
                      Save and Continue <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <ScorePanel
              name={name} price={price} unit={unit} description={description} uploads={uploads} configSpecs={configSpecs} otherSpecs={otherSpecs}
            />
          </div>
        </main>
      </div>

      {/* Speech Verification Modal */}
      {pendingSpeech && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">Verify Captured Speech</h2>
              <p className="text-sm text-gray-500">Please verify what you said before we process it.</p>
            </div>
            
            <div className="p-6 flex-1">
              <textarea
                value={pendingSpeech.text}
                onChange={(e) => setPendingSpeech({ ...pendingSpeech, text: e.target.value })}
                className="w-full h-32 p-3 border rounded focus:ring-2 focus:ring-[#0d9e8e] focus:border-transparent outline-none resize-none"
                placeholder="Captured text will appear here..."
              />
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setPendingSpeech(null)}
                disabled={isProcessingSpeech}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessSpeech}
                disabled={isProcessingSpeech || !pendingSpeech.text.trim()}
                className="px-4 py-2 bg-[#0d9e8e] hover:bg-[#0b8a7c] text-white rounded font-medium flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessingSpeech ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  "Translate & Apply"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
