import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { TopNav } from "../add-product/TopNav";
import { Sidebar } from "../add-product/Sidebar";
import { Plus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  description: string;
  primaryPhoto?: string;
  score?: number;
  configSpecs?: Record<string, string>;
  otherSpecs?: Record<string, string>;
};

export function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/seller/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Failed to load products", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-medium text-gray-800 flex items-center gap-2">
              <span className="text-[#0d9e8e] border-b-2 border-[#0d9e8e] pb-1">Active ({products.length})</span>
              <span className="text-gray-500 pb-1 ml-4 cursor-pointer">Inactive (0)</span>
            </h1>
            <div className="flex gap-3">
              <Link
                to="/"
                className="bg-[#0d9e8e] hover:bg-[#0b8a7c] text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Product
              </Link>
              <button className="border border-[#0d9e8e] text-[#0d9e8e] hover:bg-teal-50 px-4 py-2 rounded font-medium text-sm flex items-center gap-2">
                Quick Add
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="bg-white p-8 rounded border shadow-sm text-center text-gray-500">
                No products found. Add a product to get started.
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded border shadow-sm flex gap-4">
                  <div className="w-40 h-40 bg-gray-100 rounded border flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {product.primaryPhoto ? (
                      <img src={product.primaryPhoto} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs text-center px-4">[Product Image Placeholder]</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <h2 className="text-lg font-medium text-blue-600 hover:underline cursor-pointer">
                        {product.name}
                      </h2>
                      <a
                        href={`/?id=${product.id}`}
                        className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200"
                      >
                        Edit Product
                      </a>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      ₹ {product.price} / {product.unit}
                    </div>
                    
                    {product.category && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Category</span>
                        <span className="text-xs border rounded-full px-3 py-1 bg-gray-50">{product.category}</span>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium text-gray-700">Description</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="w-64 flex flex-col items-end gap-2 text-sm text-gray-500">
                    <div className="flex gap-4 mb-4">
                      <button className="flex flex-col items-center hover:text-gray-800">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold mb-1 text-xs ${
                          (product.score || 0) >= 80 ? "border-green-500 text-green-600" :
                          (product.score || 0) >= 50 ? "border-yellow-500 text-yellow-600" :
                          "border-red-500 text-red-600"
                        }`}>
                          {product.score || 0}
                        </div>
                        <span className="text-[10px]">Score</span>
                      </button>
                    </div>
                    
                    <div className="w-full">
                      {product.configSpecs && Object.keys(product.configSpecs).length > 0 && (
                        <div className="mb-2">
                          <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Config Specs</span>
                          {Object.entries(product.configSpecs).slice(0, 2).map(([key, val]) => (
                            <div key={key} className="flex justify-between mt-1 text-xs">
                              <span className="truncate max-w-[50%]">{key}</span>
                              <span className="text-gray-800 truncate max-w-[50%]">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {product.otherSpecs && Object.keys(product.otherSpecs).length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">Other Specs</span>
                          {Object.entries(product.otherSpecs).slice(0, 2).map(([key, val]) => (
                            <div key={key} className="flex justify-between mt-1 text-xs">
                              <span className="truncate max-w-[50%]">{key}</span>
                              <span className="text-gray-800 truncate max-w-[50%]">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {(!product.configSpecs || Object.keys(product.configSpecs).length === 0) &&
                       (!product.otherSpecs || Object.keys(product.otherSpecs).length === 0) && (
                        <div className="text-xs text-gray-400 italic">No specifications added.</div>
                      )}
                      <div className="flex justify-between text-xs text-blue-600 cursor-pointer hover:underline mt-2">
                        View All
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
