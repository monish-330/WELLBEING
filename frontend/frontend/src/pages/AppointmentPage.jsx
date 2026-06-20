import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PageBackButton from "../components/PageBackButton";
import BookAppointment from "../modules/appointments/BookAppointment";
import { apiJson } from "../utils/api";

// Status badge config
const STATUS_CONFIG = {
  Pending: {
    icon: "⏳",
    label: "Pending — Waiting for counselor",
    color: "#f59e0b",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  Confirmed: {
    icon: "✅",
    label: "Accepted by Counselor",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  Rejected: {
    icon: "❌",
    label: "Rejected",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
  "Reschedule Requested": {
    icon: "🔄",
    label: "Counselor asked you to reschedule",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#ddd6fe",
  },
  Completed: {
    icon: "🎉",
    label: "Session Completed",
    color: "#0284c7",
    bg: "#f0f9ff",
    border: "#bae6fd",
  },
  Cancelled: {
    icon: "🚫",
    label: "Cancelled",
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || {
    icon: "❓",
    label: status,
    color: "#888",
    bg: "#f5f5f5",
    border: "#ddd",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 14px",
        borderRadius: "999px",
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        color: cfg.color,
        fontWeight: 700,
        fontSize: "13px",
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

function AppointmentCard({ appt }) {
  const cfg = STATUS_CONFIG[appt.status] || {};
  const isActive = !["Rejected", "Cancelled", "Completed"].includes(appt.status);

  return (
    <div
      style={{
        background: "#fff",
        border: `1.5px solid ${cfg.border || "#e5e7eb"}`,
        borderRadius: "20px",
        padding: "22px 24px",
        marginBottom: "18px",
        boxShadow: "0 6px 24px rgba(180,100,140,0.09)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(180,100,140,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(180,100,140,0.09)";
      }}
    >
      {/* Status Badge */}
      <div style={{ marginBottom: "14px" }}>
        <StatusBadge status={appt.status} />
      </div>

      {/* Details Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px 24px",
          fontSize: "14px",
          color: "#555",
          marginBottom: "16px",
        }}
      >
        <div>
          <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: "12px", display: "block", marginBottom: "2px" }}>
            COUNSELOR
          </span>
          <span style={{ fontWeight: 700, color: "#1f2937" }}>
            {appt.counselorId?.name || "—"}
          </span>
        </div>
        <div>
          <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: "12px", display: "block", marginBottom: "2px" }}>
            DATE
          </span>
          <span style={{ fontWeight: 700, color: "#1f2937" }}>{appt.date}</span>
        </div>
        <div>
          <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: "12px", display: "block", marginBottom: "2px" }}>
            TIME SLOT
          </span>
          <span style={{ fontWeight: 700, color: "#1f2937" }}>{appt.slot}</span>
        </div>
        <div>
          <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: "12px", display: "block", marginBottom: "2px" }}>
            REASON
          </span>
          <span style={{ fontWeight: 700, color: "#1f2937" }}>
            {appt.reason || "—"}
          </span>
        </div>
      </div>

      {/* Completed remarks */}
      {appt.status === "Completed" && appt.remarks && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "14px",
            fontSize: "14px",
          }}
        >
          <strong style={{ color: "#16a34a" }}>📝 Counselor Remarks:</strong>
          <p style={{ margin: "6px 0 0", color: "#374151" }}>{appt.remarks}</p>
        </div>
      )}

      {/* Reschedule notice */}
      {appt.status === "Reschedule Requested" && (
        <div
          style={{
            background: "#faf5ff",
            border: "1px solid #ddd6fe",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "14px",
            fontSize: "14px",
            color: "#6d28d9",
            fontWeight: 600,
          }}
        >
          🔄 Your counselor has requested a reschedule. Please click "View Details" to pick a new date and time.
        </div>
      )}

      {/* Accepted notice */}
      {appt.status === "Confirmed" && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "14px",
            fontSize: "14px",
            color: "#166534",
            fontWeight: 600,
          }}
        >
          ✅ Your appointment is confirmed! Please be on time.
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <Link to={`/status/${appt._id}`} style={{ textDecoration: "none" }}>
          <button
            style={{
              background: "linear-gradient(135deg, #d84a7f, #e98998)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {appt.status === "Reschedule Requested" ? "🔄 Reschedule Now" : "📋 View Details & Chat"}
          </button>
        </Link>

        {isActive && (
          <span
            style={{
              fontSize: "12px",
              color: "#9a3f63",
              alignSelf: "center",
              fontStyle: "italic",
            }}
          >
            Active booking — new bookings locked until resolved.
          </span>
        )}
      </div>
    </div>
  );
}

export default function AppointmentPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);

  const hasActive = appointments.some((a) =>
    !["Rejected", "Cancelled", "Completed"].includes(a.status)
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (user?.role !== "student") return;
      try {
        const data = await apiJson("/api/appointments/mine");
        if (active) {
          // newest first
          setAppointments(
            Array.isArray(data)
              ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              : []
          );
        }
      } catch {
        if (active) setAppointments([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    // refresh every 10 seconds so status updates are visible
    const interval = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  if (user?.role === "counselor") {
    return <Navigate to={`/counselor-dashboard/${user.id}`} replace />;
  }

  return (
    <div className="app-container">
      <PageBackButton />

      <h2
        style={{
          textAlign: "center",
          color: "#bd3d6d",
          fontSize: "26px",
          fontWeight: 800,
          marginBottom: "6px",
        }}
      >
        📅 My Appointments
      </h2>
      <p
        style={{
          textAlign: "center",
          color: "#9ca3af",
          marginBottom: "28px",
          fontSize: "14px",
        }}
      >
        Track your booking status in real time
      </p>

      {/* ── Appointment List ── */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#aaa" }}>Loading appointments…</p>
      ) : appointments.length === 0 ? (
        <div
          className="content-card"
          style={{ textAlign: "center", padding: "32px", marginBottom: "24px" }}
        >
          <p style={{ fontSize: "40px", marginBottom: "10px" }}>📭</p>
          <p style={{ color: "#888", fontWeight: 600 }}>
            You have no appointments yet. Book one below!
          </p>
        </div>
      ) : (
        appointments.map((appt) => (
          <AppointmentCard key={appt._id} appt={appt} />
        ))
      )}

      {/* ── Book New Appointment ── */}
      {!loading && (
        <div style={{ marginTop: "10px" }}>
          {hasActive ? (
            <div
              style={{
                background: "#fff1f5",
                border: "1.5px solid #ffd0df",
                borderRadius: "16px",
                padding: "18px 22px",
                textAlign: "center",
                color: "#9a3f63",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              🔒 You have an active booking. You can book a new appointment once it is
              completed, rejected, or cancelled.
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowBook((v) => !v)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #d84a7f, #e98998)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "16px",
                  padding: "16px",
                  fontWeight: 800,
                  fontSize: "16px",
                  cursor: "pointer",
                  marginBottom: "18px",
                  transition: "opacity 0.2s",
                  boxShadow: "0 8px 24px rgba(216,74,127,0.25)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {showBook ? "✖ Close Booking Form" : "➕ Book New Appointment"}
              </button>
              {showBook && <BookAppointment />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
