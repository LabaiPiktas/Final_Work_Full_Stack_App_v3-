import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReplyLikes from "../utils/ReplyLikes";

const Replies = () => {
  const [thread, setThread] = useState(null);
  const [replyList, setReplyList] = useState([]);
  const [reply, setReply] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [replyLikes, setReplyLikes] = useState([]);

  const addReply = () => {
    fetch(`http://localhost:4000/api/add/reply/${id}`, {
      method: "POST",
      body: JSON.stringify({
        replyText: reply,
        userId: localStorage.getItem("_id"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to add reply");
        }
      })
      .then((data) => {
        alert(data.message);
        window.location.reload(); // Refresh the page
        if (data.message === "Reply added successfully!") {
          const newReply = {
            _id: data.reply._id,
            text: reply,
            name: "User",
          };
          setReplyList((prevReplyList) => [...prevReplyList, newReply]);
          alert(data.message);

          navigate("/:id/replies"); // Navigate to the main page after successful reply submission
        } else {
          alert(data.message); // Display the error message
        }
      })
      .catch((err) => console.error(err));
  };

  const handleSubmitReply = (e) => {
    e.preventDefault();
    addReply();
    setReply("");
  };

  useEffect(() => {
    const fetchThread = () => {
      setIsLoading(true);

      fetch("http://localhost:4000/api/all/threads")
        .then((res) => res.json())
        .then((data) => {
          const selectedThread = data.threads.find((t) => t.id === id);
          if (selectedThread) {
            setThread(selectedThread);
            setReplyList(selectedThread.replies || []); // Set replyList as an empty array if it's undefined
            setTitle(selectedThread.title);
            // Initialize the likes array for each reply
            const updatedReplies = selectedThread.replies.map((reply) => {
              return {
                ...reply,
                likes: reply.likes || [],
              };
            });
            setReplyList(updatedReplies);
          } else {
            setTitle("Thread not found");
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsLoading(false));
    };

    fetchThread();
  }, [id]);

  const deleteReply = (replyId) => {
    fetch(`http://localhost:4000/api/delete/reply/${id}/${replyId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to delete reply");
        }
      })
      .then((data) => {
        setReplyList((prevReplyList) =>
          prevReplyList.filter((reply) => reply._id !== replyId)
        );
        alert(data.message);
      })
      .catch((err) => console.error(err));
  };

  return (
    <main className="replies">
      <h1 className="repliesTitle">{title}</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        thread && (
          <form className="modal__content" onSubmit={handleSubmitReply}>
            <label htmlFor="reply">Reply to the thread</label>
            <textarea
              rows={5}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              type="text"
              name="reply"
              className="modalInput"
            />

            <button className="modalBtn">SEND</button>
          </form>
        )
      )}
      <Link to="/dashboard">
        <button className="modalBtn">Create a Thread</button>
      </Link>
      <div className="thread__container">
        {replyList.map((reply) => (
          <div className="thread__item" key={reply._id}>
            <p>{reply.text}</p>
            <div className="react__container">
              <p style={{ opacity: "0.5" }}>by {reply.name}</p>
              <p style={{ opacity: "0.5" }}>{reply.timestamp}</p>

              {localStorage.getItem("_id") === reply.userId && (
                <button
                  className="modalBtn"
                  onClick={() => deleteReply(reply._id)}
                >
                  Delete
                </button>
              )}
              <ReplyLikes
                numberOfLikes={reply.likes.length}
                replyId={reply._id}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Replies;
