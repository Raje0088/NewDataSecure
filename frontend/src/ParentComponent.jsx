// ParentComponent.jsx
import React, { useState } from 'react';
import Register from './components/Register';
import UserAssignTask from './components/UserAssignTask';

function ParentComponent() {
  const [selectedAssignProduct, setSelectedAssignProduct] = useState([]);
  console.log("Parent holds:", selectedAssignProduct);

  return (
    <>
      <Register 
        selectedAssignProduct={selectedAssignProduct} 
        setSelectedAssignProduct={setSelectedAssignProduct} 
      />
      <UserAssignTask selectedAssignProduct={selectedAssignProduct} />
    </>
  );
}

export default ParentComponent;
