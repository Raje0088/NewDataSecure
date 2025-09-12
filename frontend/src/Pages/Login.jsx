import React, { useState } from "react";
import styles from "./Login.module.css";
import axios from "axios";
import MessagePortal from "../UI/MessagePortal";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context-api/AuthContext";
import { base_url } from "../config/config";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

const Login = () => {
  const { setUserLoginId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [close, setCloses] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("yo");
    setIsLoading(true);
    try {
      if (!userId) {
        setIsLoading(false);
        return setMessage("UserId required");
      }
      if (!password) {
        setIsLoading(false);
        return setMessage("Password required");
      }
      const result = await axios.post(
        // "http://localhost:3000/auth/login",
        `${base_url}/auth/login`,
        {
          userId: userId,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("result", result.data);
      if (result.data.message === "Password Match") {
        setUserLoginId(result.data.userLoginId);
        navigate("/");
      }
    } catch (err) {
      console.log("internal error", err);
      if (
        err &&
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setMessage(err.response.data.message);
      }
    }
    setIsLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <span className={styles.formcontent}>
          <label htmlFor="userid">UserId</label>
          <input
            type="text"
            className={styles.input}
            id="userid"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value.trim().toUpperCase());
            }}
          />
        </span>
        <span className={styles.formcontent}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className={styles.input}
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </span>
        <span className={styles.btn}>
          {isLoading ? (
            <strong className={styles.spinner} ></strong>
          ) : (
            <button type="submit">Login</button>
          )}
        </span>
        {message && (
          <MessagePortal
            message1={message}
            onClose={() => {
              setMessage("");
              setCloses(false);
            }}
          />
        )}
      </div>
    </form>
  );
};

export default Login;
