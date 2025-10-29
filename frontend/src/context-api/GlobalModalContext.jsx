import React, { useContext, useState } from "react";
import { createContext } from "react";

export const RequestModalContext = createContext();

const GlobalModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);

  const handleOpenModal = (content,onResponse) => {
        console.log('GlobalModalProvider: openModal called with ->', content,onResponse);
    setModalContent({...content,onResponse}); //passing data in 1st argument and in 2nd -> getting response from receiver side accept/reject
  };

  const handleCloseModal = () => {
    console.log('GlobalModalProvider: closeModal called');
    setModalContent(null);
  };

  return (
    <RequestModalContext.Provider
      value={{ modalContent, handleOpenModal, handleCloseModal }}
    >
      {children}
    </RequestModalContext.Provider>
  );
};

export default GlobalModalProvider;
