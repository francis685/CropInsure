import React, { createContext, useState } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [langIndex, setLangIndex] = useState(0); 

  return (
    <LanguageContext.Provider value={{ langIndex, setLangIndex }}>
      {children}
    </LanguageContext.Provider>
  );
};