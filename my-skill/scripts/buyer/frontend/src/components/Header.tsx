import React from 'react';
import { Search, MapPin, MessageSquare, HelpCircle, User, Briefcase } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="logo-icon">M</div>
        <span className="logo-text">indiamart</span>
      </div>
      
      <div className="header-search-container">
        <div className="location-select">
          <MapPin size={16} />
          <span>Panvel</span>
          <span className="dropdown-arrow">▼</span>
        </div>
        <div className="search-input-wrapper">
          <input type="text" placeholder="Enter product / service to search" />
        </div>
        <button className="search-btn">
          <Search size={18} />
          <span>Search</span>
        </button>
      </div>

      <button className="post-rfq-btn">Post RFQ</button>

      <nav className="header-nav">
        <div className="nav-item">
          <Briefcase size={20} />
          <span>Seller Tools</span>
        </div>
        <div className="nav-item">
          <MessageSquare size={20} />
          <span>Messages</span>
        </div>
        <div className="nav-item">
          <HelpCircle size={20} />
          <span>Help</span>
        </div>
        <div className="nav-item">
          <User size={20} />
          <span>Hi Sourabh ▼</span>
        </div>
      </nav>
    </header>
  );
};

export default Header;
