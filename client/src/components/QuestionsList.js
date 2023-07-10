import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const QuestionsList = () => {
  const [questions, setQuestions] = useState([]);
  const [sortedQuestions, setSortedQuestions] = useState([]);
  const [sortByDate, setSortByDate] = useState(false);
  const [sortByAnswerCount, setSortByAnswerCount] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Įkelkite klausimų sąrašą iš serverio (ar kitos duomenų šaltinio)
    const fetchQuestions = () => {
      // Įkelimo logika...
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let sortedQuestions = [...questions]; // Kopijuojame pradinį klausimų sąrašą

    if (sortByDate) {
      sortedQuestions.sort((a, b) => {
        // Rikiuojame pagal klausimo datą
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (sortOrder === "asc") {
          return dateA - dateB; // Didėjimo tvarka
        } else {
          return dateB - dateA; // Mažėjimo tvarka
        }
      });
    }

    if (sortByAnswerCount) {
      sortedQuestions.sort((a, b) => {
        // Rikiuojame pagal atsakymų skaičių
        if (sortOrder === "asc") {
          return a.answers.length - b.answers.length; // Didėjimo tvarka
        } else {
          return b.answers.length - a.answers.length; // Mažėjimo tvarka
        }
      });
    }

    // Nustatome atnaujintą rikiuotą klausimų sąrašą
    setSortedQuestions(sortedQuestions);
  }, [questions, sortByDate, sortByAnswerCount, sortOrder]);

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

      <div>
        <button onClick={handleSortByDate}>Rikiuoti pagal datą</button>
        <button onClick={handleSortByAnswerCount}>
          Rikiuoti pagal atsakymų skaičių
        </button>
        <button onClick={() => handleSortOrder("asc")}>Didėjimo tvarka</button>
        <button onClick={() => handleSortOrder("desc")}>Mažėjimo tvarka</button>
      </div>

      <div>
        {sortedQuestions.map((question) => (
          <div key={question.id}>
            {/* Rodyti klausimo informaciją */}
            <h3>{question.title}</h3>
            <p>{question.content}</p>
            <p>Atsakymų skaičius: {question.answers.length}</p>
            <p>Klausimo data: {question.date}</p>
          </div>
        ))}
      </div>

      <Link to="/create-question">Sukurti klausimą</Link>
    </div>
  );
};

export default QuestionsList;
