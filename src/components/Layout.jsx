import React from 'react';
import NavbarComponent from '../components/Navbar';

const Layout = ({ children }) => {
  const contentStyle = {
    padding: '5.5rem 1rem 0rem',
  };

  return (
    <div>
      <NavbarComponent />
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
};

export default Layout;