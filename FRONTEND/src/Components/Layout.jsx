// Components/Layout.jsx
import React from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

function Layout({ children }) {
    
  return (
    <div>
        <Navbar />
      <main>
        {children} {/* Aquí se renderizará el contenido de las páginas */}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;