import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [sortedQuestions, setSortedQuestions] = useState([]);
  const [sortByDate, setSortByDate] = useState(false);
  const [sortByAnswerCount, setSortByAnswerCount] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showAnsweredQuestions, setShowAnsweredQuestions] = useState(false);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/all/threads");
        const data = await response.json();
        console.log("Data received from the server:", data); // Check the data received
        setQuestions(data.threads);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let sortedQuestions = [...questions]; // Copy the original questions array

    if (showAnsweredQuestions) {
      sortedQuestions = sortedQuestions.filter(
        (question) => question.replies.length > 0
      );
    } else {
      sortedQuestions = sortedQuestions.filter(
        (question) => question.replies.length === 0
      );
    }

    if (sortByDate) {
      sortedQuestions.sort((a, b) => {
        // Sort by question date
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);

        if (sortOrder === "asc") {
          return dateA - dateB; // Ascending order
        } else {
          return dateB - dateA; // Descending order
        }
      });
    }

    if (sortByAnswerCount) {
      sortedQuestions.sort((a, b) => {
        // Sort by answer count
        if (sortOrder === "asc") {
          return a.replies.length - b.replies.length; // Ascending order
        } else {
          return b.replies.length - a.replies.length; // Descending order
        }
      });
    }

    // Set the updated sorted and filtered questions arrays
    setSortedQuestions(sortedQuestions);
    setFilteredQuestions(sortedQuestions);
  }, [
    questions,
    showAnsweredQuestions,
    sortByDate,
    sortByAnswerCount,
    sortOrder,
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

  return (
    <div>
      <h1>Klausimų sąrašas</h1>

      <div className="QuestionListButtonContainer">
        <button onClick={handleSortByDate} className="modalBtn">
          Rikiuoti pagal datą
        </button>
        <button onClick={handleSortByAnswerCount} className="modalBtn">
          Rikiuoti pagal atsakymų skaičių
        </button>
        <button onClick={() => handleSortOrder("asc")} className="modalBtn">
          Didėjimo tvarka
        </button>
        <button onClick={() => handleSortOrder("desc")} className="modalBtn">
          Mažėjimo tvarka
        </button>
        <button
          onClick={() => setShowAnsweredQuestions(!showAnsweredQuestions)}
          className="modalBtn"
        >
          {showAnsweredQuestions
            ? "Rodyti neatsakytus klausimus"
            : "Rodyti atsakytus klausimus"}
        </button>

        <Link to="/dashboard" className="modalBtn">
          Create a Thread
        </Link>
      </div>

      <div>
        {filteredQuestions.map((question) => (
          <div key={question.id}>
            {/* Display question information */}
            <h3>{question.title}</h3>
            <p>Atsakymų skaičius: {question.replies.length}</p>
            <p>Klausimo data: {question.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionsList;
