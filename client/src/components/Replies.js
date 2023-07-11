import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReplyLikes from "../utils/ReplyLikes";
import EditReply from "./EditReply";

const Replies = () => {
  const [thread, setThread] = useState(null);
  const [replyList, setReplyList] = useState([]);
  const [reply, setReply] = useState("");
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const [setReplyLikes] = useState([]);
  const [editReplyId, setEditReplyId] = useState(null); // State variable to store the ID of the reply being edited

  const handleEditReply = (replyId, newText) => {
    fetch(`http://localhost:4000/api/edit/reply/${id}/${replyId}`, {
      method: "PUT",
      body: JSON.stringify({ newText }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error("Failed to edit reply");
        }
      })
      .then((data) => {
        // Update the replyList with the edited reply
        setReplyList((prevReplyList) =>
          prevReplyList.map((reply) => {
            if (reply._id === replyId) {
              return {
                ...reply,
                text: newText,
                edited: true,
              };
            }
            return reply;
          })
        );
        alert(data.message);
        setEditReplyId(null); // Turn off the editing mode
      })
      .catch((err) => console.error(err));
  };

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
        window.location.reload(); // Refresh the page
        if (data.message === "Reply added successfully!") {
          const newReply = {
            _id: data.reply._id,
            text: reply,
            name: "User",
          };
          setReplyList((prevReplyList) => [...prevReplyList, newReply]);
          setReplyLikes((prevLikes) => [...prevLikes, newReply._id]); // Add the new reply's _id to replyLikes state
          alert(data.message);
          navigate(`/${id}/replies`); // Navigate to the main page after successful reply submission
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
                name:
                  reply.userId === localStorage.getItem("_id") ? "You" : "User", // Set the name based on the userId
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
            {editReplyId === reply._id ? (
              // If editing this reply, display the EditReply component
              <EditReply
                replyId={reply._id}
                initialText={reply.text}
                onEdit={handleEditReply}
              />
            ) : (
              // Otherwise, display the reply information
              <div>
                <p>{reply.text}</p>
                <div className="react__container">
                  <p style={{ opacity: "0.5" }}>by {reply.name}</p>
                  <p style={{ opacity: "0.5" }}>{reply.timestamp}</p>
                  {localStorage.getItem("_id") === reply.userId && (
                    <div>
                      <button
                        className="modalBtn"
                        onClick={() => setEditReplyId(reply._id)} // Turn on editing mode
                      >
                        Edit
                      </button>
                      <button
                        className="modalBtn"
                        onClick={() => deleteReply(reply._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  <ReplyLikes
                    numberOfLikes={reply.likes.length}
                    replyId={reply._id}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default Replies;
