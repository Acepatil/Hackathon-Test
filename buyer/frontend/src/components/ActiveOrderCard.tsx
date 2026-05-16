import React from 'react';
import { PackageOpen, PlusCircle } from 'lucide-react';
import './ActiveOrderCard.css';

const ActiveOrderCard: React.FC = () => {
  return (
    <div className="card active-order-card">
      <div className="card-header">
        <h2>Active Order</h2>
      </div>
      <div className="active-order-content">
        <div className="empty-state-icon">
          <PackageOpen size={32} />
        </div>
        <p className="empty-state-text">No requirements posted yet. Post one to receive quotations</p>
        <button className="post-req-btn">
          <PlusCircle size={18} />
          <span>Post a Requirement</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveOrderCard;
