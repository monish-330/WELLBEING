import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./CounselorDashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" ? "https://wellbeing-backend-764z.onrender.com" : "");

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
    ? { headers: { Authorization: `Bearer ${token}` } }
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

function CounselorDashboard({ forcedCounselorId = "" }) {
  const params = useParams();
  const authUser = getStoredUser();
  const counselorId = forcedCounselorId || authUser?.id || authUser?._id || params.id;

  const [appointments, setAppointments] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [selectedTab, setSelectedTab] = useState("Bookings"); // "Bookings", "Accepted", "Completed", "Cancelled", "All"
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSession, setRescheduleSession] = useState("morning");
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleBookedSlots, setRescheduleBookedSlots] = useState([]);

  // Chat state
  const [chatAppointmentId, setChatAppointmentId] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState({});

  const fetchAppointments = useCallback(async () => {
    if (!counselorId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/appointments/counselor/${counselorId}`,
        getAuthConfig()
      );
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error fetching counselor appointments:", err);
      setAppointments([]);
    }
  }, [counselorId]);

  // Initial fetch and 5-second polling for real-time synchronization
  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const fetchMessages = async (appointmentId) => {
    if (!appointmentId) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/appointments/${appointmentId}/messages`,
        getAuthConfig()
      );
      setMessages((prev) => ({ ...prev, [appointmentId]: res.data || [] }));
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (chatAppointmentId) {
      fetchMessages(chatAppointmentId);
      const messageInterval = setInterval(() => {
        fetchMessages(chatAppointmentId);
      }, 3000);
      return () => clearInterval(messageInterval);
    }
  }, [chatAppointmentId]);

  // Fetch booked slots when counselor selects reschedule date
  useEffect(() => {
    if (!counselorId || !rescheduleDate) {
      setRescheduleBookedSlots([]);
      return;
    }
    axios
      .get(`${API_BASE_URL}/api/appointments/booked-slots`, {
        ...getAuthConfig(),
        params: { counselorId, date: rescheduleDate }
      })
      .then((res) => setRescheduleBookedSlots(res.data || []))
      .catch(() => setRescheduleBookedSlots([]));
  }, [counselorId, rescheduleDate]);

  const handleAccept = async (appointmentId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/appointments/accept/${appointmentId}`,
        {},
        getAuthConfig()
      );
      alert("Appointment accepted successfully.");
      await fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to accept appointment");
    }
  };

  const handleReject = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to reject this appointment request?")) return;
    try {
      await axios.put(
        `${API_BASE_URL}/api/appointments/reject/${appointmentId}`,
        {},
        getAuthConfig()
      );
      alert("Appointment rejected.");
      await fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reject appointment");
    }
  };

  const openRescheduleModal = (appt) => {
    setReschedulingId(appt._id);
    setRescheduleDate(appt.date || getTodayString());
    setRescheduleSession("morning");
    setRescheduleSlot("");
  };

  const handleSaveReschedule = async (appointmentId) => {
    if (!rescheduleDate || !rescheduleSlot) {
      alert("Please select both a new date and a time slot.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/appointments/reschedule/${appointmentId}`,
        {
          date: rescheduleDate,
          session: SESSIONS[rescheduleSession].name,
          slot: rescheduleSlot
        },
        getAuthConfig()
      );
      alert("Appointment rescheduled successfully!");
      setReschedulingId(null);
      await fetchAppointments();
    } catch (err) {
      console.error("Reschedule failed:", err);
      alert(err.response?.data?.message || "Failed to reschedule appointment.");
    }
  };

  const completeSession = async (appointmentId) => {
    if (!remarks[appointmentId] || !remarks[appointmentId].trim()) {
      alert("Please enter remarks before completing the session");
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/api/appointments/complete/${appointmentId}`,
        { remarks: remarks[appointmentId] },
        getAuthConfig()
      );
      alert("Session completed successfully");
      await fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to complete session");
    }
  };

  const cancelBooking = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/appointments/${appointmentId}`,
        getAuthConfig()
      );
      alert("Booking cancelled successfully");
      await fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel booking");
    }
  };

  const sendMessage = async (appointmentId) => {
    if (!newMessage[appointmentId] || !newMessage[appointmentId].trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/appointments/${appointmentId}/message`,
        {
          text: newMessage[appointmentId],
          senderName: authUser?.name || "Counselor"
        },
        getAuthConfig()
      );
      setNewMessage((prev) => ({ ...prev, [appointmentId]: "" }));
      fetchMessages(appointmentId);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthDays = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const getNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });
  const monthDays = getMonthDays(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= monthDays; i++) {
    calendarDays.push(i);
  }

  // Filter appointments according to active tab
  const getTabFilteredAppointments = () => {
    return appointments.filter((appointment) => {
      const status = appointment.status;
      if (selectedTab === "Bookings") {
        return status === "Pending" || status === "Rescheduled" || status === "Reschedule Requested";
      }
      if (selectedTab === "Accepted") {
        return status === "Confirmed" || status === "Accepted";
      }
      if (selectedTab === "Completed") {
        return status === "Completed";
      }
      if (selectedTab === "Cancelled") {
        return status === "Cancelled" || status === "Rejected";
      }
      return true; // "All"
    });
  };

  const tabAppointments = getTabFilteredAppointments();

  // If a specific date is selected on the calendar, filter by date; otherwise show all tab appointments
  const selectedDateString = selectedDate ? formatDateString(selectedDate) : null;
  const displayedAppointments = selectedDateString
    ? tabAppointments.filter((a) => a.date === selectedDateString)
    : tabAppointments;

  // Counts for tabs
  const countBookings = appointments.filter(
    (a) => a.status === "Pending" || a.status === "Rescheduled" || a.status === "Reschedule Requested"
  ).length;
  const countAccepted = appointments.filter((a) => a.status === "Confirmed" || a.status === "Accepted").length;
  const countCompleted = appointments.filter((a) => a.status === "Completed").length;
  const countCancelled = appointments.filter((a) => a.status === "Cancelled" || a.status === "Rejected").length;

  return (
    <div className="counselor-dashboard">
      <h2>Counselor Calendar Dashboard</h2>

      <div className="dashboard-tabs" style={{ marginBottom: "20px" }}>
        <button
          className={selectedTab === "Bookings" ? "active-tab" : ""}
          onClick={() => setSelectedTab("Bookings")}
        >
          Pending ({countBookings})
        </button>
        <button
          className={selectedTab === "Accepted" ? "active-tab" : ""}
          onClick={() => setSelectedTab("Accepted")}
        >
          Accepted ({countAccepted})
        </button>
        <button
          className={selectedTab === "Completed" ? "active-tab" : ""}
          onClick={() => setSelectedTab("Completed")}
        >
          Completed ({countCompleted})
        </button>
        <button
          className={selectedTab === "Cancelled" ? "active-tab" : ""}
          onClick={() => setSelectedTab("Cancelled")}
        >
          Cancelled / Rejected ({countCancelled})
        </button>
        <button
          className={selectedTab === "All" ? "active-tab" : ""}
          onClick={() => setSelectedTab("All")}
        >
          All ({appointments.length})
        </button>
      </div>

      {/* Calendar Section */}
      <div className="calendar-section">
        <div className="calendar-header">
          <button onClick={getPreviousMonth} className="nav-btn">
            ← Previous
          </button>
          <h3>{monthName}</h3>
          <button onClick={getNextMonth} className="nav-btn">
            Next →
          </button>
        </div>

        <div className="calendar-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="calendar-cell empty"></div>;
            }

            const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const cellDateString = formatDateString(cellDate);
            const dateAppts = tabAppointments.filter((a) => a.date === cellDateString);
            const appointmentCount = dateAppts.length;
            const isSelected = selectedDateString === cellDateString;

            return (
              <div
                key={day}
                className={`calendar-cell ${isSelected ? "selected" : ""} ${
                  appointmentCount > 0 ? "has-appointments" : ""
                }`}
                onClick={() => {
                  setSelectedDate(isSelected ? null : cellDate);
                }}
              >
                <div className="day-number">{day}</div>
                {appointmentCount > 0 && (
                  <div className="appointment-count">
                    {appointmentCount} {appointmentCount === 1 ? "Appt" : "Appts"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Details & Appointment List Section */}
      <div className="details-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ margin: 0 }}>
            {selectedDateString
              ? `Appointments on ${selectedDate.toLocaleDateString("default", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
              : `${selectedTab} Appointments (${displayedAppointments.length})`}
          </h3>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                background: "#f3f4f6",
                color: "#4b5563",
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              ✖ Clear Date Filter (View All)
            </button>
          )}
        </div>

        {displayedAppointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#888" }}>
            <p style={{ fontSize: "36px", marginBottom: "8px" }}>📭</p>
            <p>No appointments found {selectedDateString ? "for this selected date" : `under "${selectedTab}"`}.</p>
          </div>
        ) : (
          <div className="appointments-list">
            {displayedAppointments.map((appointment) => {
              const isAccepted = appointment.status === "Confirmed" || appointment.status === "Accepted";
              const isPending = appointment.status === "Pending" || appointment.status === "Rescheduled";
              const isCancelled = appointment.status === "Cancelled";
              const isRejected = appointment.status === "Rejected";

              return (
                <div key={appointment._id} className="appointment-detail-card">
                  <div className="appointment-info">
                    <p>
                      <b>Student Name:</b>{" "}
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937" }}>
                        {appointment.studentName}
                      </span>
                    </p>
                    <p>
                      <b>Email:</b> {appointment.email}
                    </p>
                    <p>
                      <b>Phone:</b> {appointment.phone || "—"}
                    </p>
                    <p>
                      <b>Date:</b> {appointment.date}
                    </p>
                    <p>
                      <b>Session:</b> {appointment.session || "Scheduled Session"}
                    </p>
                    <p>
                      <b>Time Slot:</b>{" "}
                      <span style={{ fontWeight: 700, color: "#9a3f63" }}>
                        {appointment.slot}
                      </span>
                    </p>
                    <p>
                      <b>Status:</b>{" "}
                      <span
                        className={`status-badge status-${appointment.status.toLowerCase().replace(" ", "-")}`}
                        style={{
                          background: isCancelled ? "#fef2f2" : isAccepted ? "#f0fdf4" : isPending ? "#fffbeb" : "#f3f4f6",
                          color: isCancelled ? "#dc2626" : isAccepted ? "#16a34a" : isPending ? "#d97706" : "#4b5563",
                          border: `1px solid ${isCancelled ? "#fecaca" : isAccepted ? "#bbf7d0" : isPending ? "#fde68a" : "#e5e7eb"}`
                        }}
                      >
                        {isAccepted ? "Accepted" : appointment.status}
                        {isCancelled && appointment.cancelledBy && ` (by ${appointment.cancelledBy})`}
                      </span>
                    </p>
                  </div>

                  {/* Pending Actions: Accept, Reject, Reschedule */}
                  {isPending && (
                    <div className="action-buttons" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => handleAccept(appointment._id)}
                        className="btn-accept"
                      >
                        ✔ Accept Appointment
                      </button>
                      <button
                        onClick={() => handleReject(appointment._id)}
                        className="btn-cancel"
                        style={{ background: "#dc2626" }}
                      >
                        ✖ Reject
                      </button>
                      <button
                        onClick={() => openRescheduleModal(appointment)}
                        className="btn-reschedule"
                      >
                        🔄 Reschedule Appointment
                      </button>
                    </div>
                  )}

                  {/* Reschedule Selector Form */}
                  {reschedulingId === appointment._id && (
                    <div
                      style={{
                        background: "#fff7fa",
                        border: "1.5px solid #ffd0df",
                        borderRadius: "14px",
                        padding: "18px",
                        marginTop: "16px"
                      }}
                    >
                      <h4 style={{ margin: "0 0 12px", color: "#bd3d6d" }}>
                        🔄 Reschedule Appointment for {appointment.studentName}
                      </h4>

                      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        Select New Date:
                      </label>
                      <input
                        type="date"
                        min={getTodayString()}
                        value={rescheduleDate}
                        onChange={(e) => {
                          setRescheduleDate(e.target.value);
                          setRescheduleSlot("");
                        }}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px" }}
                      />

                      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        Select Session:
                      </label>
                      <select
                        value={rescheduleSession}
                        onChange={(e) => {
                          setRescheduleSession(e.target.value);
                          setRescheduleSlot("");
                        }}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "12px" }}
                      >
                        <option value="morning">{SESSIONS.morning.label}</option>
                        <option value="afternoon">{SESSIONS.afternoon.label}</option>
                      </select>

                      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                        Select Available Time Slot:
                      </label>
                      <select
                        value={rescheduleSlot}
                        onChange={(e) => setRescheduleSlot(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "16px" }}
                      >
                        <option value="">-- Choose New Time Slot --</option>
                        {SESSIONS[rescheduleSession].slots.map((slot, idx) => {
                          const isBooked = rescheduleBookedSlots.includes(slot);
                          return (
                            <option key={idx} value={slot} disabled={isBooked}>
                              {slot} {isBooked ? "(Already Booked)" : "— Available"}
                            </option>
                          );
                        })}
                      </select>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleSaveReschedule(appointment._id)}
                          style={{
                            background: "linear-gradient(135deg, #d84a7f, #e98998)",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 18px",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          Save New Date & Slot
                        </button>
                        <button
                          onClick={() => setReschedulingId(null)}
                          style={{
                            background: "#e5e7eb",
                            color: "#374151",
                            border: "none",
                            borderRadius: "10px",
                            padding: "10px 18px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Accepted / Confirmed Actions */}
                  {isAccepted && (
                    <div className="confirmed-actions">
                      <p style={{ color: "#16a34a", fontWeight: "bold", margin: "0 0 12px" }}>
                        ✅ Appointment Accepted & Scheduled
                      </p>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
                        <button
                          onClick={() => setChatAppointmentId(chatAppointmentId === appointment._id ? null : appointment._id)}
                          className="btn-chat"
                        >
                          💬 {chatAppointmentId === appointment._id ? "Close" : "Open"} Chat with Student
                        </button>
                        <button
                          onClick={() => openRescheduleModal(appointment)}
                          className="btn-reschedule"
                        >
                          🔄 Reschedule
                        </button>
                        <button
                          onClick={() => cancelBooking(appointment._id)}
                          className="btn-cancel"
                        >
                          Cancel Appointment
                        </button>
                      </div>

                      {chatAppointmentId === appointment._id && (
                        <div className="chat-box">
                          <div className="messages-display">
                            {!messages[appointment._id] || messages[appointment._id].length === 0 ? (
                              <p className="no-messages">No messages yet with {appointment.studentName}.</p>
                            ) : (
                              messages[appointment._id].map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`message ${msg.sender === "counselor" ? "counselor-msg" : "student-msg"}`}
                                >
                                  <p className="msg-sender">{msg.senderName}</p>
                                  <p className="msg-text">{msg.text}</p>
                                  <p className="msg-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="message-input-box">
                            <textarea
                              placeholder="Type your message to student..."
                              value={newMessage[appointment._id] || ""}
                              onChange={(e) =>
                                setNewMessage((prev) => ({ ...prev, [appointment._id]: e.target.value }))
                              }
                              rows="2"
                            />
                            <button
                              onClick={() => sendMessage(appointment._id)}
                              className="send-msg-btn"
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="remarks-section">
                        <label>
                          <b>Session Remarks (for completion):</b>
                        </label>
                        <textarea
                          placeholder="Enter summary and guidance for the student..."
                          value={remarks[appointment._id] || ""}
                          onChange={(e) =>
                            setRemarks({ ...remarks, [appointment._id]: e.target.value })
                          }
                        />
                        <button
                          onClick={() => completeSession(appointment._id)}
                          className="btn-complete"
                        >
                          ✔ Complete Session
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Completed info */}
                  {appointment.status === "Completed" && (
                    <div className="completed-info">
                      <p style={{ color: "#16a34a", fontWeight: "bold", margin: "0 0 8px" }}>
                        🎉 Session Completed
                      </p>
                      <p>
                        <b>Teacher / Counselor Remarks:</b> {appointment.remarks || "No remarks provided"}
                      </p>
                    </div>
                  )}

                  {/* Cancelled info */}
                  {isCancelled && (
                    <div
                      style={{
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginTop: "12px",
                        color: "#991b1b"
                      }}
                    >
                      <strong style={{ display: "block", marginBottom: "4px" }}>
                        🚫 Appointment Cancelled
                      </strong>
                      <p style={{ margin: 0, fontSize: "14px" }}>
                        {appointment.cancelledBy === "student"
                          ? `The student (${appointment.studentName}) cancelled this appointment booking request.`
                          : "This appointment was cancelled by the counselor."}
                      </p>
                    </div>
                  )}

                  {/* Rejected info */}
                  {isRejected && (
                    <div
                      style={{
                        background: "#fff1f2",
                        border: "1px solid #fecdd3",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        marginTop: "12px",
                        color: "#be123c"
                      }}
                    >
                      <strong>❌ Appointment Rejected</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CounselorDashboard;