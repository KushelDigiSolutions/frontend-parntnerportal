"use client";
import React, { useState, useEffect } from "react";
import "./AffiliateDash.css";
import { BsThreeDotsVertical } from "react-icons/bs";

export default function AffiliateDash() {
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
          setPartners(Array.isArray(data.data) ? data.data : []);
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

  // Pagination logic
  const totalPages = Math.ceil(partners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = partners.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="affiliate-container">
      {/* Header */}
      <div className="header">
        <div>
          <h2>Start Referring</h2>
          {/* <p>This is Dummy</p> */}
        </div>
        <button className="refer-btn">+ Refer New Client</button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div>
          <p>All time earnings</p>
          <h3>$0</h3>
        </div>
        <div>
          <p>Last month earnings</p>
          <h3>$0</h3>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
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
              {currentData.length > 0 ? (
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
                    <td>{item.platform}</td>
                    <td>{item.affiliate_handle}</td>
                    <td>
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
                            border: "1px solid #c3dafe",
                            borderRadius: 4,
                            background: "#fff",
                            padding: 4,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <BsThreeDotsVertical
                            style={{ color: "#444", fontSize: 16 }}
                          />
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
        )}
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
