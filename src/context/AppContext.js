import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [usersGeneralInfo, setUsersGeneralInfo] = useState([]);
  const [username, setUsername] = useState([]);
  const [apiRoute] = useState(process.env.REACT_APP_API_URL);

  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn, contacts, setContacts, usersGeneralInfo, setUsersGeneralInfo, username, setUsername, apiRoute }}>
      {children}
    </AppContext.Provider>
  );
};