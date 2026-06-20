import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookAppointment.css";

const API_BASE_URL = "http://localhost:5001";

const TIME_SLOTS = [
  "08:00 - 08:50 AM",
  "09:00 - 09:50 AM",
  "10:00 - 10:50 AM",
  "11:00 - 11:50 AM",
  "12:00 - 12:50 PM",
  "14:00 - 14:50 PM"
];

function getAuthConfig() {
  const token = localStorage.getItem("authToken");
  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    : {};
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "null");
  } catch {
    return null;
  }
}

function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = getStoredUser();
  const bookingState = location.state || {};
  const [counselors, setCounselors] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [formData, setFormData] = useState({
    studentName: authUser?.name || "",
    email: authUser?.email || "",
    phone: "",
    counselorId: bookingState.counselorId || "",
    date: "",
    slot: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getTimeSlotForSession = () => {
    if (selectedSession === "morning" && preferredTime) {
      const [hour] = preferredTime.split(":").map(Number);
      return TIME_SLOTS.find(slot => slot.includes(`${String(hour).padStart(2, "0")}:00`)) || "";
    } else if (selectedSession === "afternoon" && preferredTime) {
      const [hour] = preferredTime.split(":").map(Number);
      return TIME_SLOTS.find(slot => slot.includes(`${String(hour).padStart(2, "0")}:00`)) || "";
    }
    return "";
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/counselors`, getAuthConfig())
      .then((res) => {
        setCounselors(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching counselors:", err);
        setCounselors([]);
      });
  }, []);

  useEffect(() => {
    if (!formData.counselorId || !formData.date) {
      setBookedSlots([]);
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/appointments/booked-slots`, {
        ...getAuthConfig(),
        params: {
          counselorId: formData.counselorId,
          date: formData.date
        }
      })
      .then((res) => {
        setBookedSlots(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching booked slots:", err);
        setBookedSlots([]);
      });
  }, [formData.counselorId, formData.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSession || !preferredTime) {
      alert("Please select session and preferred time");
      return;
    }

    const slot = getTimeSlotForSession();
    if (!slot) {
      alert("Invalid time selection");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/appointments`,
        {
          ...formData,
          slot: slot,
          studentId: bookingState.studentId || authUser?.studentId || authUser?.username || authUser?.id || null,
          source: bookingState.fromAssessment ? "assessment2" : "manual"
        },
        getAuthConfig()
      );

      alert("Appointment booked successfully");
      navigate(`/status/${res.data._id}`);
    } catch (error) {
      console.error(error);
      alert("Booking failed");
    }
  };

  return (
    <div className="booking-form">
      <h2>{bookingState.fromAssessment ? "Book a Counselor After Assessment" : "Book a Counselor"}</h2>

      {bookingState.fromAssessment && (
        <p style={{ marginBottom: "16px", color: "#ff4f87", fontWeight: "600" }}>
          Continue with the counselor booking below.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Student Name</label>
        <input
          type="text"
          name="studentName"
          value={formData.studentName}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Phone</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <label>Select Counselor</label>
        <select
          name="counselorId"
          value={formData.counselorId}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Counselor --</option>

          {counselors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label>Select Session</label>
        <select
          value={selectedSession}
          onChange={(e) => {
            setSelectedSession(e.target.value);
            setPreferredTime("");
          }}
          required
        >
          <option value="">-- Select Session --</option>
          <option value="morning">Morning Session (8 AM – 12 PM)</option>
          <option value="afternoon">Afternoon Session (12 PM – 3 PM)</option>
        </select>

        <label>Preferred Time</label>
        <input
          type="time"
          value={preferredTime}
          onChange={(e) => setPreferredTime(e.target.value)}
          min={selectedSession === "morning" ? "08:00" : selectedSession === "afternoon" ? "12:00" : undefined}
          max={selectedSession === "morning" ? "11:59" : selectedSession === "afternoon" ? "14:59" : undefined}
          required
        />

        <button type="submit">Book Appointment</button>
      </form>
    </div>
  );
}

export default BookAppointment;
