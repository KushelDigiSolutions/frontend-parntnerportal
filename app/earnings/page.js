"use client";

import { useEffect, useRef, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEye } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import "./earning.css";

export default function EarningsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewPayment, setViewPayment] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});

  // 🔹 Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownOpen !== null) {
        const dropdownEl = document.getElementById("dropdown-menu");
        if (dropdownEl && !dropdownEl.contains(event.target)) {
          setDropdownOpen(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Fetch earnings payments for partner
  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("user_token");
      const partner = JSON.parse(localStorage.getItem("user_data"));
      const res = await fetch(
        `https://partnerback.krcustomizer.com/api/store-payments/earn/${partner?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json();
      if (res.ok && json?.success) {
        setPayments(json?.data ?? []);
      } else {
        setError(json?.message ?? "Failed to fetch payments");
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Refetch payments when window gains focus (e.g., after navigating back from partner page)
  useEffect(() => {
    const handleFocus = () => {
      fetchPayments();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 🔹 Filter payments based on selected date range
  const filteredPayments = payments.filter((p) => {
    const paymentStart = p?.created_at ? new Date(p.created_at) : null;
    const paymentEnd = p?.end_date ? new Date(p.end_date) : null;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return paymentStart >= start && paymentEnd <= end;
    }
    if (start && !end) {
      return paymentStart >= start;
    }
    if (!start && end) {
      return paymentEnd <= end;
    }
    return true;
  });

  const paginatedPayments =
    filteredPayments?.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ) ?? [];

  // 🔹 handle dropdown position
  const openDropdown = (paymentId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left - 120, // dropdown width adjust karo
      zIndex: 3000,
    });
    setDropdownOpen(paymentId);
  };

  return (
    <div className="affiliate-container">
      {/* Heading */}
      <h2 className="partner-heading" style={{ marginBottom: "10px" }}>
        Earnings
      </h2>

      {/* 🔹 Date Filter UI */}
      <div className="filter-bar">
        <div className="filter-field">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="filter-field">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button
          className="reset-btn"
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setCurrentPage(1);
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Store Owner</th>
              <th>Amount</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Earning</th>
              <th>Status</th>
              <th>Store Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="no-items">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="no-items">
                  {error}
                </td>
              </tr>
            ) : paginatedPayments?.length > 0 ? (
              paginatedPayments?.map((payment, idx) => (
                <tr key={payment?.id}>
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td>{payment?.store_owner ?? "-"}</td>
                  <td>{Math.floor(payment?.amount ?? 0)}</td>
                  <td>
                    {payment?.created_at
                      ? new Date(payment?.created_at)?.toLocaleDateString(
                          "en-GB"
                        )
                      : ""}
                  </td>
                  <td>
                    {payment?.end_date
                      ? new Date(payment?.end_date)?.toLocaleDateString("en-GB")
                      : ""}
                  </td>
                  <td>
                    {Math.floor(
                      ((payment?.amount ?? 0) * (payment?.commission ?? 0)) /
                        100
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 16px",
                        borderRadius: "50px",
                        color: "#fff",
                        background:
                          payment?.status?.toLowerCase() === "paid"
                            ? "rgb(50 200 100)"
                            : payment?.status?.toLowerCase() === "pending"
                            ? "#facc15"
                            : payment?.status?.toLowerCase() === "failed"
                            ? "#ef4444"
                            : "#888",
                        fontSize: 13,
                        textTransform: "capitalize",
                      }}
                    >
                      {payment?.status ?? "-"}
                    </span>
                  </td>
                  <td>{payment?.store_name ?? "-"}</td>
                  <td>
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                      }}
                      onClick={(e) => openDropdown(payment?.id, e)}
                    >
                      <BsThreeDotsVertical
                        style={{
                          color: "#4f46e5",
                          fontSize: 18,
                          marginRight: 4,
                        }}
                      />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-items">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPayments?.length > itemsPerPage && (
        <div className="pagination-bar">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            « Prev
          </button>

          {Array.from(
            { length: Math.ceil(filteredPayments?.length / itemsPerPage) },
            (_, i) => (
              <button
                key={i}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            )
          )}

          <button
            className="page-btn"
            disabled={
              currentPage === Math.ceil(filteredPayments?.length / itemsPerPage)
            }
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next »
          </button>
        </div>
      )}

      {/* FIXED DROPDOWN */}
      {dropdownOpen && (
        <div
          id="dropdown-menu"
          style={{
            ...dropdownStyle,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            width: 100,
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              background: "none",
              border: "none",
              padding: "10px 16px",
              fontSize: 15,
              color: "#333",
              cursor: "pointer",
              textAlign: "left",
            }}
            onClick={() => {
              const selected = payments.find((p) => p.id === dropdownOpen);
              setDropdownOpen(null);
              setViewPayment(selected);
            }}
          >
            <FiEye style={{ marginRight: 8 }} /> View
          </button>
        </div>
      )}

      {/* VIEW POPUP */}
      {viewPayment && (
        <div className="modal-overlay">
          <div className="modal-card">
            <IoClose
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                cursor: "pointer",
              }}
              onClick={() => setViewPayment(null)}
            />
            <h3 style={{ marginBottom: "16px" }}>Payment Details</h3>
            <p>
              <strong>Amount:</strong> {Math.floor(viewPayment?.amount) ?? "-"}
            </p>
            <p>
              <strong>Commission:</strong>{" "}
              {Math.floor(viewPayment?.commission) ?? "-"}%
            </p>
            <p>
              <strong>Status:</strong> {viewPayment?.status ?? "-"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
