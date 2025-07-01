import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, showSidebar = true }) => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && <Sidebar />}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;