import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ReplyPage = () => {
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);

  useEffect(() => {
    const fetchThread = () => {
      fetch(`http://localhost:4000/api/thread/${threadId}`)
        .then((res) => res.json())
        .then((data) => {
          const threadData = data.thread;
          setThread(threadData);
        })
        .catch((error) => {
          console.error("Error fetching thread:", error);
        });
    };

    fetchThread();
  }, [threadId]);

  return (
    <div>
      {thread && (
        <div>
          <h1>{thread.title}</h1>
          <p>{thread.content}</p>

          <h2>Replies</h2>
          {thread.replies.map((reply) => (
            <div key={reply._id}>
              <p>{reply.text}</p>
              <p>Posted by: {reply.username}</p>
              <p>Timestamp: {reply.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyPage;
