"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import "./AffiliateDash.css";

export default function AffiliateDash() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("user_token");
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          "https://partnerback.kdscrm.com/partner/getAllPartners",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          // Only show approved partners
          setPartners(data?.data)
          // setPartners(Array.isArray(data.data) ? data.data.filter((p) => p.status?.toLowerCase() === "approved") : []);
        } else {
          setError(data.message || "Failed to fetch data");
        }
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Get role from localStorage
  let role = "partner";
  try {
    const user = localStorage.getItem("user_data");
    if (user) {
      const userObj = JSON.parse(user);
      if (userObj?.role) role = userObj.role;
    }
  } catch { }

  const approvedPartners = partners.filter((p) => p.status?.toLowerCase() === "approved");
  // Pagination logic
  const totalPages = Math.ceil(approvedPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;  
  const currentData = approvedPartners.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="affiliate-container">
      {/* Header */}
      {role === "admin" ? (
        <div className="header">
          <div>
            <h2>Dashboard</h2>
          </div>
        </div>
      ) : (
        <div className="header">
          <div>
            <h2>Dashboard</h2>
          </div>
          <button className="refer-btn">Refer New Client</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        {role === "partner" ? (
          <>
            <div className="stats-box earnings">
              <p>All time earnings</p>
              <h3>0</h3>
            </div>
            <div className="stats-box month">
              <p>Last month earnings</p>
              <h3>0</h3>
            </div>
          </>
        ) : (
          <>
            <div className="stats-box partner">
              <p>Partner</p>
              <h3>{approvedPartners.length}</h3>
            </div>
            <div className="stats-box request cursor-pointer" onClick={() => router.push('partner-request')}>
              <p>Request</p>
              <h3>{partners.filter((p) => p.status?.toLowerCase() === "pending").length}</h3>
              {console.log(partners.filter((p) => p.status?.toLowerCase() === "pending").length)}

            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Platform</th>
              <th>Affiliate Handle</th>
              <th>Status</th>
              <th>Reference Link</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="no-items">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="10" className="no-items">
                  {error}
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.profileImage ? (
                      <img
                        src={item.profileImage}
                        alt={item.name}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          display: "inline-block",
                          borderRadius: "50%",
                          background: "#eee",
                          textAlign: "center",
                          lineHeight: "32px",
                        }}
                      >
                        {item.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{item.mobilePhone}</td>
                  <td className="capitalize">{item.platform}</td>
                  <td>{item.affiliate_handle}</td>
                  <td className="capitalize">
                    <span
                      className={`status ${item.status?.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.refernceLink}</td>
                  <td>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : ""}
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        style={{
                          borderRadius: 4,
                          background: "#fff",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: 'pointer',
                        }}
                        onClick={() => router.push(`/admin-dashboard/partner/${item.id}`)}
                      >
                        <FiEye style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-items">
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {partners.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            « Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next »
          </button>
        </div>
      )}
    </div>
  );
}
