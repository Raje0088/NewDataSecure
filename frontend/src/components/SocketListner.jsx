import React, { useContext, useEffect } from "react";
import { RequestModalContext } from "../context-api/GlobalModalContext";
import socket from "../socketio/socket";
import { AuthContext } from "../context-api/AuthContext";
import { base_url } from "../config/config";
import axios from "axios";

const SocketListner = () => {
  const { handleOpenModal } = useContext(RequestModalContext);
  const { userLoginId } = useContext(AuthContext);
  console.log("socket", userLoginId);

  useEffect(() => {
    if (!userLoginId) return;
    const handleConnect = () => {
      console.log("✅ SocketListner connected:", socket.id);
      socket.emit("joinRoom", userLoginId);
      console.log("✅ joinRoom emitted with:", userLoginId);
    };
    if(socket.connected){
      // If the socket is already connected, call handleConnect immediately
      handleConnect()
    }else{
       // Otherwise, wait for the "connect" event and then call handleConnect
      socket.on("connect", handleConnect);
    }

    socket.on("assignTask", (data) => {
      console.log("Received AssignTask from socketListerner.jsx", data);
      //NOTE: IN HANDLEOPENMODAL I AM PASSING TWO PARAMETER, 1ST -> TEXT TO DISPLAY 2ND -> RESPONSE FROM CLIENT SIDE/RECEIVER SIDE LIKE ACCEPT/REJECT REQUEST AND SAVE TO DB
      handleOpenModal(
        {
          msg1: data.message,
          msg2: data.text,
          taskId: data.taskId,
        },
        async (status, taskId) => {
          const result = await axios.get(`${base_url}/task/task-request`, {
            params: { status: status, taskId: taskId },
          });
        }
      );
    });
    socket.on("userReminder", (data) => {
      console.log("data", data);
      handleOpenModal(
        {
          msg1: data.message,
          msg2: data.text,
          taskId: data.taskId,
        },
        async (status, taskId) => {
          const result = await axios.get(`${base_url}/task/task-request`, {
            params: { status: status, taskId: taskId },
          });
        }
      );
    });

    return () => {
      socket.off("assignTask");
      socket.off("connect", handleConnect);
    };
  }, [handleOpenModal, userLoginId]);
  return null;
};

export default SocketListner;
