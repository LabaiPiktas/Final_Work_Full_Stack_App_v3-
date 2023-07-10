import React, { useState } from "react";

const EditReply = ({ replyId, initialText, onEdit }) => {
  const [newText, setNewText] = useState(initialText);

  const handleEdit = () => {
    // Siunčiame pakeistą tekstą į serverį ir vykdome onEdit funkciją
    onEdit(replyId, newText);
  };

  return (
    <div>
      <textarea
        rows={5}
        value={newText}
        onChange={(e) => setNewText(e.target.value)}
      />
      <button className="modalBtn" onClick={handleEdit}>Save</button>
    </div>
  );
};

export default EditReply;
