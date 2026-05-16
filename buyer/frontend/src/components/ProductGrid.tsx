import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from './ProductCard';
import { ChevronRight } from 'lucide-react';
import './ProductGrid.css';

const LANGUAGES = [
  { code: 'en-IN', name: 'English' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'ta-IN', name: 'Tamil' },
  { code: 'te-IN', name: 'Telugu' },
  { code: 'gu-IN', name: 'Gujarati' },
  { code: 'bn-IN', name: 'Bengali' },
  { code: 'mr-IN', name: 'Marathi' }
];

const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('en-IN');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isFirstLoad = true;

    const fetchProducts = () => {
      if (isFirstLoad) {
        setIsLoading(true);
      }
      
      fetch(`/api/buyer/products?lang=${selectedLang}`)
        .then(res => res.json())
        .then(data => {
          if (data.products && Array.isArray(data.products)) {
            const validProducts = data.products.filter((p: any) => p.name && p.name.trim() !== '' && p.name !== 'Unknown Product');
            const backendProducts: Product[] = validProducts.map((p: any) => ({
              id: p.id || Math.random().toString(),
              name: p.name,
              price: p.price ? p.price : 'Ask Price',
              image: p.primaryPhoto || `https://via.placeholder.com/200x200.png?text=${encodeURIComponent(p.name || 'Product')}`,
              supplier: 'Lovable Seller',
              location: 'Mumbai, Maharashtra',
              rating: 0,
              reviewsCount: 0,
              isTrustSeal: true,
              hasGst: true,
              tag: p.category || undefined
            }));
            
            setProducts(backendProducts);
          } else {
            setProducts([]);
          }
        })
        .catch(err => {
          console.error('Error fetching products:', err);
          if (isFirstLoad) setProducts([]);
        })
        .finally(() => {
          if (isFirstLoad) {
            setIsLoading(false);
            isFirstLoad = false;
          }
        });
    };

    fetchProducts();
    const interval = setInterval(fetchProducts, 3000);

    return () => clearInterval(interval);
  }, [selectedLang]);

  return (
    <div className="product-section">
      <div className="product-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Products You May Like</h2>
        <select 
          value={selectedLang} 
          onChange={(e) => setSelectedLang(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
      <div className="product-carousel-wrapper">
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>Translating products... Please wait.</div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard key={`${product.id}-${index}`} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>No products found.</div>
        )}
        <button className="carousel-next-btn">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;
