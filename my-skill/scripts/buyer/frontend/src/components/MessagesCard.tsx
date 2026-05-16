import React from 'react';
import { Phone, MapPin } from 'lucide-react';
import './MessagesCard.css';

interface Message {
  id: string;
  companyName: string;
  location: string;
  date: string;
  inquiryText: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    companyName: 'DR Kleenz Laboratories Private Limited',
    location: 'New Delhi, Delhi',
    date: '29 Apr',
    inquiryText: 'I am interested in Colgate Toothpaste for NGOs'
  },
  {
    id: '2',
    companyName: 'Rop Enterprises',
    location: 'Navi Mumbai, Maharashtra',
    date: '15 Feb',
    inquiryText: 'I am interested in Colgate Max Fresh Toothpaste (50g, 100g)'
  },
  {
    id: '3',
    companyName: 'National Chikki',
    location: '',
    date: '02 Feb',
    inquiryText: ''
  }
];

const MessagesCard: React.FC = () => {
  return (
    <div className="card messages-card">
      <div className="messages-header">
        <h2>Messages</h2>
        <button className="call-logs-btn">
          <Phone size={14} />
          <span>Call Logs</span>
        </button>
      </div>

      <div className="messages-list">
        {mockMessages.map(msg => (
          <div key={msg.id} className="message-item">
            <div className="message-top">
              <h4 className="company-name">{msg.companyName}</h4>
              <span className="message-date">{msg.date}</span>
            </div>
            {msg.location && (
              <div className="message-location">
                <MapPin size={12} />
                <span>{msg.location}</span>
              </div>
            )}
            {msg.inquiryText && (
              <p className="message-inquiry">{msg.inquiryText}</p>
            )}
          </div>
        ))}
      </div>

      <div className="view-more-container">
        <button className="view-more-btn">View More</button>
      </div>
    </div>
  );
};

export default MessagesCard;
