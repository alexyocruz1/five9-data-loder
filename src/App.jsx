import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

// Contacts
import Contacts from './components/Contacts';

// Users
import UsersBySkill from './components/Users/UsersBySkill';
import GeneralInfo from './components/Users/GeneralInfo';
import UpdateUser from './components/Users/UpdateUser';
import CreateUser from './components/Users/CreateUser';

// Skills
import AddSkillUser from './components/Skills/AddSkillUser';

// Other
import Home from './components/Home';
import NavbarComponent from './components/Navbar';

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
            <Route path="/users-by-skill" element={<UsersBySkill />} />
            <Route path="/update-user-info" element={<UpdateUser />} />
            <Route path="/create-user-info" element={<CreateUser />} />

            <Route path="/add-skills-to-user" element={<AddSkillUser />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
};

export default App;