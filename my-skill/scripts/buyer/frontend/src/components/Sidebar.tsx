import React from 'react';
import { MapPin, ShieldCheck, LayoutDashboard, UserCircle, MessageSquare, Shield, CreditCard, Banknote, Truck, Activity, HeadphonesIcon } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="user-profile">
        <div className="avatar">
          <span>S</span>
        </div>
        <div className="user-info">
          <h3>Sourabh Patil</h3>
          <div className="user-location">
            <MapPin size={12} />
            <span>Panvel</span>
          </div>
          <div className="trustseal-badge">
            <ShieldCheck size={14} className="star-icon" />
            <span>Become TrustSEAL Buyer</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li className="active">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </li>
          <li>
            <UserCircle size={18} />
            <span>My Profile</span>
          </li>
          <li>
            <MessageSquare size={18} />
            <span>Messages</span>
          </li>
          <li>
            <ShieldCheck size={18} />
            <span>TrustSEAL Buyer</span>
          </li>
          <li>
            <Shield size={18} />
            <span>Know Your Seller</span>
          </li>
          <li>
            <CreditCard size={18} />
            <span>Payment Protection</span>
          </li>
          <li>
            <Banknote size={18} />
            <span>Loans</span>
          </li>
          <li>
            <Truck size={18} />
            <span>Ship With IM</span>
          </li>
          <li>
            <Activity size={18} />
            <span>Credit Score</span>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <HeadphonesIcon size={18} />
        <span>Help and support</span>
      </div>
    </aside>
  );
};

export default Sidebar;
