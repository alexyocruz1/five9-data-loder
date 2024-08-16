// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Contacts from './components/Contacts';
import Home from './components/Home';

const App = () => {
  const isTestEnv = process.env.REACT_APP_NODE_ENV === 'test';

  const appContent = (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contacts" element={<Contacts />} />
      </Routes>
    </Layout>
  );

  return isTestEnv ? appContent : <Router>{appContent}</Router>;
};

export default App;