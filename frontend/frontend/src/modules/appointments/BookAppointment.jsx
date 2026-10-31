import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookAppointment.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" ? "https://wellbeing-backend-764z.onrender.com" : "");

// Exact required time slots and sessions
const SESSIONS = {
  morning: {
    name: "Morning Session",
    label: "Morning Session (8:00 AM – 12:00 PM)",
    slots: [
      "08:00 AM – 08:50 AM",
      "09:00 AM – 09:50 AM",
      "10:00 AM – 10:50 AM",
      "11:00 AM – 11:50 AM"
    ]
  },
  afternoon: {
    name: "Afternoon Session",
    label: "Afternoon Session (12:00 PM – 3:00 PM)",
    slots: [
      "12:00 PM – 12:50 PM",
      "02:00 PM – 02:50 PM"
    ]
  }
};

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

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = getStoredUser();
  const bookingState = location.state || {};
  const [counselors, setCounselors] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    studentName: authUser?.name || "",
    email: authUser?.email || "",
    phone: "",
    counselorId: bookingState.counselorId || "",
    date: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  const availableSlots = selectedSession && SESSIONS[selectedSession]
    ? SESSIONS[selectedSession].slots
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.counselorId) {
      setErrorMessage("Please select a counselor.");
      return;
    }

    if (!formData.date) {
      setErrorMessage("Please choose an appointment date.");
      return;
    }

    if (!selectedSession) {
      setErrorMessage("Please choose a session (Morning or Afternoon).");
      return;
    }

    if (!selectedSlot) {
      setErrorMessage("Please select an available time slot.");
      return;
    }

    if (bookedSlots.includes(selectedSlot)) {
      setErrorMessage("This time slot is already booked. Please choose another time slot.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        session: SESSIONS[selectedSession].name,
        slot: selectedSlot,
        studentId: authUser?.studentId || authUser?.username || authUser?.id || null,
        source: bookingState.fromAssessment ? "assessment2" : "manual"
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/appointments`,
        payload,
        getAuthConfig()
      );

      navigate(`/status/${res.data._id}`);
    } catch (error) {
      console.error("Booking error:", error);
      const msg = error.response?.data?.message || "Booking failed. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
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

      {errorMessage && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#dc2626",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "16px"
          }}
        >
          ⚠️ {errorMessage}
        </div>
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
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="e.g. 9876543210"
          required
        />

        <label>Select Counselor / Teacher</label>
        <select
          name="counselorId"
          value={formData.counselorId}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Counselor --</option>
          {counselors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} {c.specialization ? `(${c.specialization})` : ""}
            </option>
          ))}
        </select>

        <label>Date</label>
        <input
          type="date"
          name="date"
          min={getTodayString()}
          value={formData.date}
          onChange={(e) => {
            handleChange(e);
            setSelectedSlot("");
          }}
          required
        />

        <label>Select Session</label>
        <select
          value={selectedSession}
          onChange={(e) => {
            setSelectedSession(e.target.value);
            setSelectedSlot("");
          }}
          required
        >
          <option value="">-- Select Session --</option>
          <option value="morning">{SESSIONS.morning.label}</option>
          <option value="afternoon">{SESSIONS.afternoon.label}</option>
        </select>

        {selectedSession && (
          <>
            <label>Available Time Slots ({SESSIONS[selectedSession].name})</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              required
            >
              <option value="">-- Select Time Slot --</option>
              {availableSlots.map((slot, index) => {
                const isBooked = bookedSlots.includes(slot);
                return (
                  <option key={index} value={slot} disabled={isBooked}>
                    {slot} {isBooked ? "(Already Booked)" : "— Available"}
                  </option>
                );
              })}
            </select>
          </>
        )}

        <button type="submit" disabled={submitting}>
          {submitting ? "Booking Appointment..." : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}

export default BookAppointment;
