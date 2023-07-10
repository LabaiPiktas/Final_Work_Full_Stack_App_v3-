import React, { useEffect, useState } from "react";

const ReplyLikes = ({ numberOfLikes, replyId }) => {
  const [likesCount, setLikesCount] = useState(numberOfLikes);
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const fetchReplyLikesData = () => {
      setLikes((likesState) =>
        likesState.includes(localStorage.getItem("_id"))
          ? likesState
          : [...likesState, localStorage.getItem("_id")]
      );
    };

    fetchReplyLikesData();
  }, [replyId]); // Include the missing dependency 'replyId'

  const handleLikeFunction = () => {
    fetch("http://localhost:4000/api/like/reply", {
      method: "POST",
      body: JSON.stringify({
        replyId,
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
          throw new Error("Failed to add like");
        }
      })
      .then((data) => {
        if (data.message === "Like added successfully!") {
          setLikesCount(data.likesCount);
          setLikes(data.updatedReply.replyLikes || []);
        } else {
          alert(data.message);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="likes__container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 likesBtn"
        onClick={handleLikeFunction}
        style={{
          color: likes.includes(localStorage.getItem("_id"))
            ? "#f99417"
            : "#000",
        }}
      >
        {/* SVG path */}
      </svg>
      <p style={{ color: "#434242" }}>{likesCount === 0 ? "" : likesCount}</p>
    </div>
  );
};

export default ReplyLikes;
