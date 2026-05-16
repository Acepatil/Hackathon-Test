import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ActiveOrderCard from './ActiveOrderCard';
import MessagesCard from './MessagesCard';
import ProductGrid from './ProductGrid';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main-content">
          <div className="dashboard-top-row">
            <div className="active-order-section">
              <ActiveOrderCard />
            </div>
            <div className="messages-section">
              <MessagesCard />
            </div>
          </div>
          <div className="dashboard-bottom-row">
            <ProductGrid />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
