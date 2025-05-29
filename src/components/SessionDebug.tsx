"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function SessionDebug() {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || process.env.NODE_ENV === "production") return null;

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const buttonStyle = {
    position: "fixed" as const,
    bottom: "20px",
    right: "20px",
    padding: "8px 16px",
    background: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    zIndex: 9999,
  };

  const debugPanelStyle = {
    position: "fixed" as const,
    bottom: "80px",
    right: "20px",
    width: "400px",
    maxHeight: "80vh",
    overflow: "auto",
    background: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "16px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    zIndex: 9999,
  };

  return (
    <>
      <button onClick={toggleVisibility} style={buttonStyle}>
        🔐 Session
      </button>

      {isVisible && (
        <div style={debugPanelStyle}>
          <h3 style={{ margin: "0 0 16px 0" }}>Session Diagnostics</h3>

          <div style={{ marginBottom: "12px" }}>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  status === "authenticated"
                    ? "green"
                    : status === "loading"
                    ? "orange"
                    : "red",
                fontWeight: "bold",
              }}
            >
              {status}
            </span>
          </div>

          {session ? (
            <>
              <div style={{ marginBottom: "12px" }}>
                <strong>User:</strong> {session.user?.name || "Not informed"}
              </div>
              <div style={{ marginBottom: "12px" }}>
                <strong>Email:</strong> {session.user?.email || "Not informed"}
              </div>
              {session.user?.id && (
                <div style={{ marginBottom: "12px" }}>
                  <strong>ID:</strong> {session.user.id}
                </div>
              )}
              {session.user?.token && (
                <div style={{ marginBottom: "12px" }}>
                  <strong>Token:</strong>{" "}
                  <div
                    style={{
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {session.user.token.substring(0, 15)}...
                  </div>
                </div>
              )}

              <div style={{ marginTop: "20px" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>Full Session:</h4>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "8px",
                    borderRadius: "4px",
                    overflow: "auto",
                    maxHeight: "200px",
                    fontSize: "12px",
                  }}
                >
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <div style={{ color: "red" }}>No active session found.</div>
          )}

          <button
            onClick={toggleVisibility}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              background: "#f0f0f0",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
