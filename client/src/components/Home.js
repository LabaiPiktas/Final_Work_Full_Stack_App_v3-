import React, { useState, useEffect } from "react";
import Likes from "../utils/Likes";
import Comments from "../utils/Comments";
import { useNavigate, Link } from "react-router-dom";
import Nav from "./Nav";

const Home = () => {
  const [sortByDate, setSortByDate] = useState(false);
  const [sortByAnswerCount, setSortByAnswerCount] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAnsweredQuestions, setShowAnsweredQuestions] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [sortedThreads, setSortedThreads] = useState([]);
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
          .then((data) => {
            setThreadList(data.threads);
            filterThreads(data.threads);
          })
          .catch((err) => console.error(err));
      }
    };
    checkUser();
  }, [navigate, refresh]);

  useEffect(() => {
    // Sort threads based on the selected options
    let sortedThreads = [...threadList];

    if (showAnsweredQuestions && !showAllQuestions) {
      sortedThreads = sortedThreads.filter(
        (thread) => thread.replies.length > 0
      );
    } else if (!showAnsweredQuestions && !showAllQuestions) {
      sortedThreads = sortedThreads.filter(
        (thread) => thread.replies.length === 0
      );
    }

    if (sortByDate) {
      sortedThreads.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);

        if (sortOrder === "asc") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }

    if (sortByAnswerCount) {
      sortedThreads.sort((a, b) => {
        if (sortOrder === "asc") {
          return a.replies.length - b.replies.length;
        } else {
          return b.replies.length - a.replies.length;
        }
      });
    }

    setSortedThreads(sortedThreads);
  }, [
    threadList,
    sortByDate,
    sortByAnswerCount,
    sortOrder,
    showAnsweredQuestions,
    showAllQuestions,
  ]);

  const handleSortByDate = () => {
    setSortByDate(true);
    setSortByAnswerCount(false);
  };

  const handleSortByAnswerCount = () => {
    setSortByDate(false);
    setSortByAnswerCount(true);
  };

  const handleSortOrder = (order) => {
    setSortOrder(order);
  };

  const filterThreads = (threads) => {
    const answeredThreads = threads.filter((thread) => thread.replies.length > 0);
    const unansweredThreads = threads.filter(
      (thread) => thread.replies.length === 0
    );
    let filteredThreads = [];
    if (showAnsweredQuestions && !showAllQuestions) {
      filteredThreads = answeredThreads;
    } else if (!showAnsweredQuestions && !showAllQuestions) {
      filteredThreads = unansweredThreads;
    } else {
      filteredThreads = threads;
    }
    setSortedThreads(filteredThreads);
  };

  const handleToggleQuestions = () => {
    if (showAllQuestions) {
      setShowAnsweredQuestions(false);
      setShowAllQuestions(false);
    } else if (showAnsweredQuestions) {
      setShowAnsweredQuestions(false);
      setShowAllQuestions(true);
    } else {
      setShowAnsweredQuestions(true);
      setShowAllQuestions(false);
    }
  };

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

  const handleButtonClick = () => {
    // Functionality to be executed when the button is clicked
    console.log("Button Clicked!");
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
          <div className="sort__buttons">
            <button
              onClick={handleSortByDate}
              className={sortByDate ? "modalBtn active" : "modalBtn"}
            >
              Sort by Date
            </button>
            <button
              onClick={handleSortByAnswerCount}
              className={sortByAnswerCount ? "modalBtn active" : "modalBtn"}
            >
              Sort by Answer Count
            </button>
            <button
              onClick={() => handleSortOrder("asc")}
              className={sortOrder === "asc" ? "modalBtn active" : "modalBtn"}
            >
              Ascending Order
            </button>
            <button
              onClick={() => handleSortOrder("desc")}
              className={sortOrder === "desc" ? "modalBtn active" : "modalBtn"}
            >
              Descending Order
            </button>
            <button
              onClick={handleToggleQuestions}
              className="modalBtn"
            >
              {showAllQuestions
                ? "Show Answered and Unanswered Questions"
                : showAnsweredQuestions
                ? "Show Unanswered Questions"
                : "Show Answered Questions"}
            </button>
          </div>
          {sortedThreads.length > 0 &&
            sortedThreads.map((thread) => (
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
