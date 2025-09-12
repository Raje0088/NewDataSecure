import React, { useState, useEffect } from "react";
import axios from 'axios';
const userId = "abc123";

const OfflineData = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(userId)) || [];
    setTasks(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(userId, JSON.stringify(tasks));
  }, [tasks]);

  const AddTask = () => {
    console.log("AddTask clicked");

    const newTask = {
      id: Date.now().toString(),
      userId,
      title,
    };
    setTasks([...tasks, newTask]);
    setTitle("");
  };

  const sync = async() =>{
    if(!navigator.onLine) return;

    const savedTasks = JSON.parse(localStorage.getItem(userId)) || [];
    await axios.post('http://localhost:3000/sync', {
        userId,
        tasks: savedTasks
      });
      alert('Synced to backend!');
  }

  useEffect(()=>{
    window.addEventListener('online',sync);
    return () => window.removeEventListener('online',sync)
  },[])
  return (
    <div>
      <h2>Hello {userId}</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        placeholder="New Task"
      />
      <button type="submit" onClick={AddTask}>
        Add Task
      </button>

      <h3>Your Task List</h3>
      <ul>
        {tasks.map((todo, id) => (
          <li key={id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default OfflineData;
