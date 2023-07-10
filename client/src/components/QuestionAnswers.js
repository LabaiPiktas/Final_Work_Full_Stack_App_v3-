import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const QuestionAnswers = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    console.log("Question ID:", id); // Patikrinkite, ar gaunate teisingą ID
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/thread/${id}`);
        const data = await response.json();
        console.log("Question data received from the server:", data); // Check the data received
        setQuestion(data);
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };

    fetchQuestion();
  }, [id]);

  return (
    <div>
      <h2>Question & Answers</h2>
      <Link to="/question-list" className="homeBtn">
        Go Back
      </Link>{" "}
      {/* Nuoroda į "Question List" puslapį */}
      {question ? (
        <div className="question-answers-container">
          <h3>{question.title}</h3>
          <p>Question Content: {question.content}</p>
          <p>Number of Replies: {question.replies?.length || 0}</p>
          <h4>Replies:</h4>
          {question.replies.map((reply) => (
            <div key={reply.id} className="question-answers-container">
              <p>Reply Text: {reply.text}</p>
              <p>User ID: {reply.userId}</p>
              <p>Timestamp: {reply.timestamp}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading question answers...</p>
      )}
    </div>
  );
};

export default QuestionAnswers;
