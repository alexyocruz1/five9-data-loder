import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Contacts from './components/Contacts';
import Home from './components/Home';
import NavbarComponent from './components/Navbar';
import { AppProvider } from './context/AppContext';
import GeneralInfo from './components/Users/GeneralInfo';
import UsersBySkill from './components/Users/UsersBySkill';
import AddSkillUser from './components/Skills/AddSkillUser';

const App = () => {
  return (
    <AppProvider>
      <Router>
        <NavbarComponent />
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/users-general-info" element={<GeneralInfo />} />
            <Route path="/add-skills-to-user" element={<AddSkillUser />} />
            <Route path="/users-by-skill" element={<UsersBySkill />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;