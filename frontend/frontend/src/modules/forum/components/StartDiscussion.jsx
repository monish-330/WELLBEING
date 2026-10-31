import { useState } from "react";
import axios from "axios";

function StartDiscussion({ refresh }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submitPost = async () => {
    if (!title || !description) return;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
    await axios.post(`${API_BASE_URL}/api/posts`, {
      title,
      description,
      tag: "General"
    });

    setTitle("");
    setDescription("");
    refresh();
  };

  return (
    <div className="start-box">
      <input
        placeholder="Start a discussion"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={submitPost}>Post</button>
    </div>
  );
}

export default StartDiscussion;
