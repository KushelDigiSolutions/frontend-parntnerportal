"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export function SessionProvider({ children }) {
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Global fetch override to detect 401 Unauthorized
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        setIsExpired(true);
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch; // cleanup
    };
  }, []);

  return (
    <SessionContext.Provider value={{ isExpired, setIsExpired }}>
      {children}

      {/* ✅ Session Expired Popup */}
      {isExpired && pathname !== "/login" && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backdropFilter: "blur(6px)", // background blur
            background: "rgba(0,0,0,0.4)", // dark overlay
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              padding: "32px 24px",
              borderRadius: "16px",
              maxWidth: "420px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              backdropFilter: "blur(12px)", // glass effect
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#1e1e2f",
              }}
            >
              Session Expired
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                color: "#555",
                fontSize: "15px",
                lineHeight: "1.5",
              }}
            >
              Your session has expired for security reasons.
              <br />
              Please login again to continue.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                setIsExpired(false);
                router.push("/login");
              }}
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "15px",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </SessionContext.Provider>
  );
}
