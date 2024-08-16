import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Contacts from './components/Contacts';
import Home from './components/Home';
import NavbarComponent from './components/Navbar';
import { AppProvider } from './context/AppContext';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <NavbarComponent />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;