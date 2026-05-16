import { useEffect, useState } from "react";
import { TopNav } from "../add-product/TopNav";
import { ArrowLeft } from "lucide-react";

const REGIONS = [
  { code: "en", label: "Global (English)", lang: "English" },
  { code: "mh", label: "Maharashtra", lang: "Marathi" },
  { code: "tn", label: "Tamil Nadu", lang: "Tamil" },
  { code: "gj", label: "Gujarat", lang: "Gujarati" },
  { code: "up", label: "Uttar Pradesh", lang: "Hindi" },
];

export function ProductPage() {
  const [region, setRegion] = useState("en");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "Calamine Clay Powder",
    price: "380",
    unit: "Kg",
    description: "ASTRRA Chemicals LLP\n\nCALAMINE CLAY POWDER\n\nSoothing • Cooling • Skin Protective\n\nPremium mineral-rich ingredient widely used in skincare, cosmetic, pharmaceutical, and wellness formulations.",
  });

  useEffect(() => {
    if (region === "en") {
      setProduct({
        name: "Calamine Clay Powder",
        price: "380",
        unit: "Kg",
        description: "ASTRRA Chemicals LLP\n\nCALAMINE CLAY POWDER\n\nSoothing • Cooling • Skin Protective\n\nPremium mineral-rich ingredient widely used in skincare, cosmetic, pharmaceutical, and wellness formulations.",
      });
      return;
    }

    const targetLanguage = REGIONS.find((r) => r.code === region)?.lang || "English";
    setLoading(true);

    fetch("/api/buyer/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetLanguage,
        productData: JSON.stringify({
          name: "Calamine Clay Powder",
          price: "380",
          unit: "Kg",
          description: "ASTRRA Chemicals LLP\n\nCALAMINE CLAY POWDER\n\nSoothing • Cooling • Skin Protective\n\nPremium mineral-rich ingredient widely used in skincare, cosmetic, pharmaceutical, and wellness formulations.",
        }),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProduct({
            name: data.name || product.name,
            price: data.price || product.price,
            unit: data.unit || product.unit,
            description: data.description || product.description,
          });
        }
      })
      .catch((err) => console.error("Translation error:", err))
      .finally(() => setLoading(false));
  }, [region]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <TopNav />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Simulate Buyer Location:</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-500 animate-pulse">
            Translating listing...
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-8 shadow-sm">
            <div className="flex gap-8">
              <div className="w-1/3">
                <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-400">
                  [Product Image]
                </div>
              </div>
              <div className="w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="text-2xl text-[#0d9e8e] font-semibold mb-6">
                  ₹{product.price} <span className="text-sm text-gray-500 font-normal">/ {product.unit}</span>
                </div>
                
                <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                <div className="whitespace-pre-wrap text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </div>
                
                <div className="mt-8 pt-6 border-t flex gap-4">
                  <button className="bg-[#0d9e8e] text-white px-8 py-3 rounded font-medium hover:bg-[#0b8a7c]">
                    Contact Seller
                  </button>
                  <button className="border border-[#0d9e8e] text-[#0d9e8e] px-8 py-3 rounded font-medium hover:bg-teal-50">
                    Get Best Price
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
