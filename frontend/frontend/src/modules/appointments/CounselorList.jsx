import axios from "axios";
import { useEffect, useState } from "react";

function CounselorList({ setSelectedCounselor }) {
  const [counselors, setCounselors] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/counselors`)
      .then(res => setCounselors(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Available Counselors</h2>

      {counselors.map(c => (
        <div key={c._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <p><strong>Name:</strong> {c.name}</p>
          <p><strong>Specialization:</strong> {c.specialization}</p>
          <button onClick={() => setSelectedCounselor(c)}>
            Book Appointment
          </button>
        </div>
      ))}
    </div>
  );
}

export default CounselorList;
