import React, { useState, useEffect } from "react";
import Likes from "../utils/Likes";
import Comments from "../utils/Comments";
import { useNavigate } from "react-router-dom";
import Nav from "./Nav";

const Home = () => {
  const deleteThread = (threadId) => {
    fetch(`http://localhost:4000/api/delete/thread/${threadId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setThreadList((prevThreadList) =>
          prevThreadList.filter((thread) => thread.id !== threadId)
        );
      })
      .catch((error) => {
        console.error("Error deleting thread:", error);
      });
  };

  const [thread, setThread] = useState({ text: "" });
  const [threadList, setThreadList] = useState([]);
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
  }, [navigate]);

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
        alert(data.message);
        fetch("http://localhost:4000/api/all/threads")
          .then((res) => res.json())
          .then((data) => setThreadList(data.threads))
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createThread();
    setThread({ text: "" });
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

        <div className="thread__container">
          {threadList.map((thread) => (
            <div
              className={`thread__item ${thread.edited ? "edited" : ""}`}
              key={thread.id}
            >
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
                  <button
                    className="modalBtn"
                    onClick={() => deleteThread(thread.id)}
                  >
                    Delete Thread
                  </button>
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
