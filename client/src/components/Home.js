import React, { useState, useEffect } from "react";
import Likes from "../utils/Likes";
import Comments from "../utils/Comments";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const Home = () => {
  const [thread, setThread] = useState({ text: "" });
  const [threadList, setThreadList] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = () => {
      if (!localStorage.getItem("_id")) {
        navigate("/");
      } else {
        fetch("http://localhost:4000/api/all/threads")
          .then((res) => res.json())
          .then((data) => setThreadList(data.threads))
          .catch((err) => console.error(err));
      }
    };
    checkUser();
  }, [navigate, refresh]);

  const createThread = () => {
    fetch("http://localhost:4000/api/create/thread", {
      method: "POST",
      body: JSON.stringify({
        thread: thread.text,
        userId: localStorage.getItem("_id"),
        replies: [],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRefresh((prevRefresh) => !prevRefresh);
        setThread({ text: "" });
        alert(data.message);
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createThread();
  };

  const deleteThread = (threadId) => {
    fetch(`http://localhost:4000/api/delete/thread/${threadId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        setThreadList((prevThreadList) =>
          prevThreadList.filter((thread) => thread.id !== threadId)
        );
        alert(data.message);
      })
      .catch((error) => {
        console.error("Error deleting thread:", error);
      });
  };

  const handleEdit = (threadId) => {
    const newText = prompt("Enter the new text:");
    if (newText) {
      editThread(threadId, newText);
    }
  };

  const editThread = (threadId, newText) => {
    fetch(`http://localhost:4000/api/edit/thread/${threadId}`, {
      method: "PUT",
      body: JSON.stringify({
        newText,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.thread) {
          const updatedThreadList = threadList.map((thread) =>
            thread.id === threadId ? data.thread : thread
          );
          setThreadList(updatedThreadList);
          setRefresh((prevRefresh) => !prevRefresh);
          alert("Thread edited successfully!");
        } else {
          throw new Error(data.error_message);
        }
      })
      .catch((error) => {
        console.error("Error editing thread:", error);
      });
  };

  return (
    <>
      <Nav />
      <main className="home">
        <h2 className="homeTitle">Create a Thread</h2>
        <form className="homeForm" onSubmit={handleSubmit}>
          <div className="home__container">
            <label htmlFor="thread">Title / Description</label>
            <input
              type="text"
              name="thread"
              required
              value={thread.text}
              onChange={(e) => setThread({ ...thread, text: e.target.value })}
            />
          </div>
          <button className="homeBtn">CREATE THREAD</button>
        </form>
        <Link to="/question-list" className="modalBtn">
          Go to Question List
        </Link>
        <div className="thread__container">
          {threadList.length > 0 &&
            threadList.map((thread) => (
              <div className="thread__item" key={thread.id}>
                <p>{thread.title}</p>
                <div className="react__container">
                  <Likes
                    numberOfLikes={thread.likes.length}
                    threadId={thread.id}
                  />
                  <Comments
                    numberOfComments={thread.replies.length}
                    threadId={thread.id}
                    title={thread.title}
                  />
                  {localStorage.getItem("_id") && (
                    <>
                      <button
                        className="modalBtn"
                        onClick={() => deleteThread(thread.id)}
                      >
                        Delete Thread
                      </button>
                      <button
                        className="modalBtn"
                        onClick={() => handleEdit(thread.id)}
                      >
                        Edit Thread
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
      </main>
    </>
  );
};

export default Home;
