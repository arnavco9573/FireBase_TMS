import React, { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getDB } from "../utils/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import "./container.css";

const Home = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filterByCompleted, setFilterByCompleted] = useState(false);
  const [filterByDueDate, setFilterByDueDate] = useState("");
  

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, []);

  const logout = () => {
    signOut(auth).then(() => {
      localStorage.removeItem("token");
      navigate("/");
    });
  };

  const deleteTask = async (id) => {
    const db = getDB();
    try {
      await deleteDoc(doc(db, "tasks", id));
      setTasks((prevTasks) => prevTasks.filter((task) => task.uid !== id));
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const startEditingTask = (task) => {
    setEditingTask(task);
  };

  const cancelEditingTask = () => {
    setEditingTask(null);
  };

  const updateTask = async (updatedTask) => {
    const db = getDB();
    try {
      await updateDoc(doc(db, "tasks", updatedTask.uid), updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.uid === updatedTask.uid ? updatedTask : task
        )
      );
      setEditingTask(null); // Clear the editing state
    } catch (error) {
      console.error("Error updating task: ", error);
    }
  };

  const addTask = async () => {
    const db = getDB();
    const taskCollectionRef = collection(db, "tasks");
    const newTask = {
      title: title,
      description: description,
      dueDate: dueDate,
      user: user.uid,
      completed: false, // Initial completion status
    };

    try {
      const docRef = await addDoc(taskCollectionRef, newTask);
      const addedTask = {
        ...newTask,
        uid: docRef.id,
      };

      setTasks((prevTasks) => [...prevTasks, addedTask]);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  };

  const fetchTasks = async () => {
    const db = getDB();
    if (user && user.uid) {
      const q = query(collection(db, "tasks"), where("user", "==", user.uid));
      try {
        const querySnapshot = await getDocs(q);
        const fetchedTasks = [];
        querySnapshot.forEach((doc) => {
          const taskData = doc.data();
          fetchedTasks.push({
            ...taskData,
            uid: doc.id,
          });
        });
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      }
    }
  };

  const filterTasksByCompleted = () => {
    const filteredTasks = tasks.filter((task) => task.completed);
    setTasks(filteredTasks);
  };

  const filterTasksByDueDate = (date) => {
    const filteredTasks = tasks.filter((task) => task.dueDate === date);
    setTasks(filteredTasks);
  };

  const resetFilters = () => {
    fetchTasks(); // Reset to fetch all tasks
  };

  useEffect(() => {
    fetchTasks();
  }, [filterByCompleted, filterByDueDate]);

  const renderTaskItem = (task) => {
    if (editingTask && editingTask.uid === task.uid) {
      // Render the edit form for the currently editing task
      return (
        <div key={task.uid} className="bg-white rounded-lg p-4 shadow-md mt-4">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:border-blue-500"
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({ ...editingTask, title: e.target.value })
            }
          />
          <textarea
            className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:border-blue-500"
            value={editingTask.description}
            onChange={(e) =>
              setEditingTask({ ...editingTask, description: e.target.value })
            }
          ></textarea>
          <input
            type="date"
            className="w-full px-3 py-2 border rounded-lg mb-2 focus:outline-none focus:border-blue-500"
            value={editingTask.dueDate}
            onChange={(e) =>
              setEditingTask({ ...editingTask, dueDate: e.target.value })
            }
          />
          <div className="mt-4">
            <button
              onClick={() => updateTask(editingTask)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Save
            </button>
            <button
              onClick={cancelEditingTask}
              className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    } else {
      // Render the task item
      return (
        <div
          key={task.uid}
          className="bg-white rounded-lg p-4 shadow-md mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-600 mb-2"
        >
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className=" mt-2">{task.description}</p>
          <p className=" mt-2">Due Date: {task.dueDate}</p>
          <div className="mt-4">
            <button
              onClick={() => deleteTask(task.uid)}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
            >
              Delete
            </button>
            <button
              onClick={() => startEditingTask(task)}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Edit
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="dashboard-container w-full md:w-[55rem] h-screen p-6 bg-white rounded-lg shadow-xl">
        <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-600 text-4xl font-bold mb-2">
          Hii, There Welcome to your Dashboard
        </h4>
        <h2 className="mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-blue-600 text-3xl font-bold mb-2">
          {user && user.displayName}
        </h2>
        <div className="mb-4 mt-4">
          <label htmlFor="title" className="block text-gray-700">
            Add a task
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter the task"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="3"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter your description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="dueDate" className="block text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Enter due date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="w-full mt-5 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-2 rounded-lg"
          onClick={addTask}
        >
          ADD A TASK
        </button>

        <div>
          <div className="mt-4">
            <label className="text-gray-700 font-semibold">Filter by:</label>
            <div className="mt-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
                onClick={filterTasksByCompleted}
              >
                Completed
              </button>
              <button
                className="ml-2 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 ease-in-out"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
            <div className="mt-2">
              <label className="block text-gray-700">Due Date:</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                value={filterByDueDate}
                onChange={(e) => setFilterByDueDate(e.target.value)}
              />
              <button
                className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
                onClick={() => filterTasksByDueDate(filterByDueDate)}
              >
                Apply
              </button>
            </div>
          </div>

          {tasks.map((task) => (
            <div className="mt-2" key={task.uid}>
              {renderTaskItem(task)}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="ml-auto mt-3 md:ml-[22rem] w-32 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg"
          onClick={logout}
        >
          LogOut
        </button>
      </div>
    </div>
  );
};

export default Home;
