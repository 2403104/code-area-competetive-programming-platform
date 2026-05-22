import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <div className="content-area fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
