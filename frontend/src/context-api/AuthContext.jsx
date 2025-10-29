import React, { useState, useEffect } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import { base_url } from "../config/config";
import axios from "axios";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userLoginId, setUserLoginId] = useState(() => {
    return localStorage.getItem("userLoginId") || null;
  });
  const [userPermissions, setUserPermission] = useState(()=>{
    return  JSON.parse(localStorage.getItem("userPermissions")) || null;
      
    
  })

  useEffect(() => {
    if (userLoginId) {
      localStorage.setItem("userLoginId", userLoginId);
    } else {
      localStorage.removeItem("userLoginId");
    }
    if (userPermissions) {
      localStorage.setItem("userPermissions", JSON.stringify(userPermissions));
    } else {
      localStorage.removeItem("userPermissions");
    }
  }, [userLoginId,userPermissions]);

  useEffect(() => {
    if (!userLoginId) return;
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        setUserLoginId(null);
        localStorage.removeItem("userLoginId");
        try {
          const result = await axios.post(
            `${base_url}/auth/logout`,
            {
              userId: userLoginId,
            },
            { 
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          console.log(`${userLoginId} logout successfully`, result);
        } catch (err) {
          console.log("internal error", err);
        }
        navigate("/login");
      }, 1000 * 60 * 15);
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [navigate, userLoginId]);




  return (
    <AuthContext.Provider value={{ userLoginId, setUserLoginId,userPermissions, setUserPermission}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
