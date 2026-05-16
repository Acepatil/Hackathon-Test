import React from 'react';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import './ProductCard.css';

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  supplier: string;
  location: string;
  rating: number;
  reviewsCount: number;
  isTrustSeal: boolean;
  hasGst: boolean;
  tag?: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          className={i <= Math.floor(product.rating) ? 'star-filled' : 'star-empty'} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {product.tag && <span className="product-tag">{product.tag}</span>}
        <div className="price-badge">₹{product.price}</div>
        <img src={product.image} alt={product.name} className="product-image" />
      </div>
      
      <div className="product-info">
        <h3 className="product-name" title={product.name}>{product.name}</h3>
        
        <div className="supplier-info">
          <p className="supplier-name">{product.supplier}</p>
          <div className="supplier-location">
            <MapPin size={12} />
            <span>{product.location}</span>
          </div>
        </div>

        <div className="badges-row">
          {product.hasGst && (
            <div className="badge gst-badge">
              <CheckCircle size={12} />
              <span>GST</span>
            </div>
          )}
          {product.isTrustSeal && (
            <div className="badge trustseal-badge-sm">
              <Star size={12} className="star-icon" />
              <span>TrustSEAL</span>
            </div>
          )}
        </div>

        <div className="rating-row">
          <div className="stars">{renderStars()}</div>
          <span className="rating-score">{product.rating.toFixed(1)}</span>
          <span className="reviews-count">({product.reviewsCount})</span>
        </div>

        <button className="get-price-btn">Get Best Price</button>
      </div>
    </div>
  );
};

export default ProductCard;
