"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "next/navigation";
import { IoChevronBackOutline, IoClose } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiDelete, FiEye } from "react-icons/fi";
import "../../../AffiliateDash.css";
import "../../partner-details.css";
import "./storedetail.css";

export default function StoreDetailsPage() {
  // ================= HOOKS & STATE =================
  const params = useParams();
  const { storeId } = params || {};

  const [store, setStore] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comm, setComm] = useState(0);

  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Modal states
  const [viewPayment, setViewPayment] = useState(null);
  const [editPayment, setEditPayment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const dropdownRefs = useRef({});

  // ================= COMPUTED VALUES =================
  const calculatedCommission = useMemo(() => {
    const totalValue = Math.floor(store?.total_value || 0);
    const earning = Math.floor(store?.earning || 0);
    return totalValue > 0 ? Math.floor((earning * 100) / totalValue) : 0;
  }, [store?.total_value, store?.earning]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return payments?.slice(startIndex, endIndex) || [];
  }, [payments, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil((payments?.length || 0) / itemsPerPage);
  }, [payments?.length, itemsPerPage]);

  // ================= EVENT HANDLERS =================
  const handleClickOutside = useCallback(
    (event) => {
      if (dropdownOpen !== null) {
        const ref = dropdownRefs.current?.[dropdownOpen];
        if (ref && !ref.contains(event?.target)) {
          setDropdownOpen(null);
        }
      }
    },
    [dropdownOpen],
  );

  const handleDropdownToggle = useCallback((paymentId, event) => {
    const rect = event?.currentTarget?.getBoundingClientRect();
    if (rect) {
      setDropdownPosition({
        top: rect.bottom + (window?.scrollY || 0) + 4,
        left: rect.left + (window?.scrollX || 0),
      });
      setDropdownOpen(paymentId);
    }
  }, []);

  const handleCloseModals = useCallback(() => {
    setViewPayment(null);
    setEditPayment(null);
    setDeleteConfirm(null);
  }, []);

  const handleEditPaymentChange = useCallback((field, value) => {
    setEditPayment((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  // ================= API CALLS =================
  const getAuthHeaders = useCallback(() => {
    const token = localStorage?.getItem("user_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, []);

  const fetchStoreDetails = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    setError("");

    try {
      const headers = getAuthHeaders();

      // Fetch store details
      const storeRes = await fetch(
        `https://partnerback.krcustomizer.com/partner-store/${storeId}`,
        { method: "GET", headers },
      );
      const storeJson = await storeRes.json();

      if (storeRes?.ok && storeJson?.success) {
        setStore(storeJson?.data || null);
        const totalValue = Math.floor(storeJson?.data?.total_value || 0);
        const earning = Math.floor(storeJson?.data?.earning || 0);
        setComm(totalValue > 0 ? Math.floor((earning * 100) / totalValue) : 0);
      } else {
        setError(storeJson?.message || "Failed to fetch store details");
      }

      // Fetch payment details
      const paymentRes = await fetch(
        `https://partnerback.krcustomizer.com/api/store-payments?store_id=${storeId}`,
        { method: "GET", headers },
      );
      const paymentJson = await paymentRes.json();

      if (paymentRes?.ok && paymentJson?.success) {
        setPayments(paymentJson?.data || []);
      } else {
        setError(paymentJson?.message || "Failed to fetch payment details");
      }
    } catch (err) {
      setError("Network error occurred");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [storeId, getAuthHeaders]);

  const handleCreatePayment = useCallback(async () => {
    if (!editPayment || !store?.partner_id) return;

    try {
      const headers = getAuthHeaders();
      const res = await fetch(
        `https://partnerback.krcustomizer.com/api/store-payments`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            partner_id: store?.partner_id,
            store_id: storeId,
            amount: Number(editPayment?.amount || 0),
            commission: Number(editPayment?.commission || 0),
            start_date: editPayment?.start_date || null,
            end_date: editPayment?.end_date || null,
            status: editPayment?.status || "pending",
          }),
        },
      );
      const json = await res.json();

      if (res?.ok && json?.success) {
        setPayments((prev) => [...(prev || []), json?.data].filter(Boolean));
        setEditPayment(null);
      } else {
        console.error(json?.message || "Failed to create payment");
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  }, [editPayment, store?.partner_id, storeId, getAuthHeaders]);

  const handleUpdatePayment = useCallback(async () => {
    if (!editPayment?.id || !store?.partner_id) return;

    try {
      const headers = getAuthHeaders();
      const res = await fetch(
        `https://partnerback.krcustomizer.com/api/store-payments/${editPayment.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            partner_id: store?.partner_id,
            store_id: storeId,
            amount: Number(editPayment?.amount || 0),
            commission: Number(editPayment?.commission || 0),
            start_date: editPayment?.start_date || null,
            end_date: editPayment?.end_date || null,
            status: editPayment?.status || "pending",
          }),
        },
      );
      const json = await res.json();

      if (res?.ok && json?.success) {
        setPayments((prev) =>
          (prev || []).map((p) =>
            p?.id === editPayment?.id ? { ...p, ...editPayment } : p,
          ),
        );
        setEditPayment(null);
      } else {
        console.error(json?.message || "Failed to update payment");
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  }, [editPayment, store?.partner_id, storeId, getAuthHeaders]);

  const handleDeletePayment = useCallback(async () => {
    if (!deleteConfirm?.id) return;

    try {
      const token = localStorage?.getItem("user_token");
      const res = await fetch(
        `https://partnerback.krcustomizer.com/api/store-payments/${deleteConfirm.id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      const json = await res.json();

      if (res?.ok && json?.success) {
        alert("Payment deleted!");
        setPayments((prev) =>
          (prev || []).filter((p) => p?.id !== deleteConfirm?.id),
        );
        setDeleteConfirm(null);
      } else {
        alert(json?.message || "Failed to delete payment");
      }
    } catch (err) {
      alert("Network error occurred");
      console.error("Delete error:", err);
    }
  }, [deleteConfirm?.id]);

  // ================= EFFECTS =================
  useEffect(() => {
    document?.addEventListener("mousedown", handleClickOutside);
    return () => document?.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    fetchStoreDetails();
  }, [fetchStoreDetails]);

  // ================= UTILITY FUNCTIONS =================
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-GB");
    } catch {
      return "";
    }
  }, []);

  const formatDateForInput = useCallback((dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")?.[0] || "";
    } catch {
      return "";
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "paid":
        return "rgb(50 200 100)";
      case "pending":
        return "#facc15";
      case "failed":
        return "#ef4444";
      default:
        return "#888";
    }
  }, []);

  const calculateEarning = useCallback((amount, commission) => {
    return Math.floor((Number(amount || 0) * Number(commission || 0)) / 100);
  }, []);

  // ================= STYLES =================
  const styles = {
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalCard: {
      background: "#fff",
      padding: "24px",
      borderRadius: "12px",
      width: "600px",
      maxWidth: "95%",
      position: "relative",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
    inputStyle: {
      width: "100%",
      padding: "8px 12px",
      marginBottom: "12px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "14px",
    },
    buttonRow: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "16px",
    },
    primaryBtn: {
      background: "#4f46e5",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "8px 16px",
      cursor: "pointer",
      fontWeight: "bold",
      marginBottom: "16px",
    },
    dangerBtn: {
      background: "#ef4444",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      padding: "8px 16px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    secondaryBtn: {
      background: "#eee",
      color: "#333",
      border: "none",
      borderRadius: "6px",
      padding: "8px 16px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    closeIconStyle: {
      position: "absolute",
      top: "12px",
      right: "12px",
      cursor: "pointer",
      fontSize: "20px",
      color: "#555",
    },
  };

  // ================= RENDER CONDITIONS =================
  if (loading) return <div className="affiliate-container">Loading...</div>;
  if (!store) return <div className="affiliate-container">No store found.</div>;

  // ================= RENDER =================
  return (
    <div className="affiliate-container">
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          alignItems: "end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "end" }}>
          <button
            onClick={() => window?.history?.back()}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 12px",
              cursor: "pointer",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            <IoChevronBackOutline
              style={{ fontSize: "1.1rem", marginRight: "4px" }}
            />
            Back
          </button>
          <h2
            className="partner-heading"
            style={{
              fontWeight: "bold",
              fontSize: "1.4rem",
              color: "#333",
              margin: 0,
              marginLeft: "12px",
            }}
          >
            {store?.store_name || "Unknown Store"}
          </h2>
        </div>
      </div>

      {/* Store Details Card */}
      <div className="details-card">
        <h3 className="section-title">Store Details</h3>
        <div className="details-grid">
          <div>
            <span>Store Name:</span> {store?.store_name || "-"}
          </div>
          <div>
            <span>Store Owner:</span> {store?.store_owner || "-"}
          </div>
          <div className="flex">
            <span>Platform:</span>{" "}
            <p className=" capitalize ">{store?.platform || "-"}</p>
          </div>
          <div>
            <span>Total Value:</span> {Math.floor(store?.total_value || 0)}
          </div>
          <div>
            <span>Earning:</span> {Math.floor(store?.earning || 0)}
          </div>
          <div className="flex">
            <span>Status:</span>{" "}
            <p className="capitalize">
              <strong
                className={`status ${store?.status?.toLowerCase() || ""}`}
              >
                {store?.status || "Unknown"}
              </strong>
            </p>
          </div>
          <div>
            <span>Created At:</span> {formatDate(store?.created_at)}
          </div>
          <div>
            <span>Commission:</span> {calculatedCommission}%
          </div>
          {store?.inactive_reason && (
            <div>
              <span>Reason:</span> {store?.inactive_reason}
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Card */}
      <div className="details-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 className="section-title">Payment Details</h3>
          <button
            style={styles.primaryBtn}
            onClick={() =>
              setEditPayment({
                amount: Math.floor(store?.total_value || 0),
                commission: calculatedCommission,
                status: "",
              })
            }
          >
            + Add Payment
          </button>
        </div>

        {(payments?.length || 0) > 0 ? (
          <>
            {/* Payments Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
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
                  {paginatedPayments?.map((payment, idx) => (
                    <tr key={payment?.id || idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{Math.floor(payment?.amount || 0)}</td>
                      <td>{formatDate(payment?.created_at)}</td>
                      <td>{formatDate(payment?.end_date)}</td>
                      <td>
                        {calculateEarning(payment?.amount, payment?.commission)}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 16px",
                            borderRadius: "50px",
                            color: "#fff",
                            background: getStatusColor(payment?.status),
                            fontSize: 13,
                            textTransform: "capitalize",
                          }}
                        >
                          {payment?.status || "Unknown"}
                        </span>
                      </td>
                      <td>{store?.store_name || "-"}</td>
                      <td
                        style={{ position: "relative" }}
                        ref={(el) => {
                          if (el && payment?.id) {
                            dropdownRefs.current[payment.id] = el;
                          }
                        }}
                      >
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                          }}
                          onClick={(e) => handleDropdownToggle(payment?.id, e)}
                          type="button"
                        >
                          <BsThreeDotsVertical
                            style={{
                              color: "#4f46e5",
                              fontSize: 18,
                              marginRight: 4,
                            }}
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen === payment?.id && (
                          <div
                            style={{
                              position: "fixed",
                              top: 500,
                              left: 1230,
                              background: "#fff",
                              border: "1px solid #eee",
                              borderRadius: 6,
                              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                              width: 160,
                              zIndex: 9999,
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
                                setDropdownOpen(null);
                                setViewPayment(payment);
                              }}
                            >
                              <FiEye style={{ marginRight: 8 }} /> View
                            </button>

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
                                setDropdownOpen(null);
                                setEditPayment({
                                  ...payment,
                                  partner_id: store?.partner_id,
                                  store_id: storeId,
                                });
                              }}
                            >
                              <svg
                                style={{ marginRight: 8 }}
                                width="18"
                                height="18"
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                              </svg>
                              Update
                            </button>

                            <button
                              style={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                                background: "none",
                                border: "none",
                                padding: "10px 16px",
                                fontSize: 15,
                                color: "#ef4444",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              onClick={() => {
                                setDropdownOpen(null);
                                setDeleteConfirm(payment);
                              }}
                            >
                              <FiDelete style={{ marginRight: 8 }} /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 16,
                  gap: 8,
                }}
              >
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  « Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next »
                </button>
              </div>
            )}
          </>
        ) : (
          <div>No payment details found.</div>
        )}
      </div>

      {/* View Payment Modal */}
      {viewPayment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <IoClose
              style={styles.closeIconStyle}
              onClick={() => setViewPayment(null)}
            />

            <h3
              style={{
                marginBottom: "16px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Payment Details
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px 32px",
              }}
            >
              <p>
                <strong>ID:</strong> {viewPayment?.id || "-"}
              </p>
              <p>
                <strong>Amount:</strong> {viewPayment?.amount || 0}
              </p>
              <p>
                <strong>Commission:</strong>{" "}
                {Math.floor(viewPayment?.commission || 0)}%
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: getStatusColor(viewPayment?.status),
                    fontWeight: "500",
                    textTransform: "capitalize",
                  }}
                >
                  {viewPayment?.status || "Unknown"}
                </span>
              </p>
              <p>
                <strong>Start Date:</strong>{" "}
                {formatDate(viewPayment?.created_at)}
              </p>
              <p>
                <strong>End Date:</strong> {formatDate(viewPayment?.end_date)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create/Update Payment Modal */}
      {editPayment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <IoClose
              style={styles.closeIconStyle}
              onClick={() => setEditPayment(null)}
            />

            <h3 style={{ marginBottom: 12, fontSize: 20, fontWeight: 500 }}>
              {editPayment?.id ? "Update Payment" : "Add Payment"}
            </h3>

            <label>Amount</label>
            <input
              style={styles.inputStyle}
              type="number"
              value={editPayment?.amount || ""}
              onChange={(e) =>
                handleEditPaymentChange("amount", e.target?.value)
              }
            />

            <label>Commission</label>
            <input
              style={styles.inputStyle}
              type="number"
              value={editPayment?.commission || ""}
              onChange={(e) =>
                handleEditPaymentChange("commission", e.target?.value)
              }
            />

            <label>Start Date</label>
            <input
              style={styles.inputStyle}
              type="date"
              value={formatDateForInput(editPayment?.start_date)}
              onChange={(e) =>
                handleEditPaymentChange("start_date", e.target?.value)
              }
            />

            <label>End Date</label>
            <input
              style={styles.inputStyle}
              type="date"
              value={formatDateForInput(editPayment?.end_date)}
              onChange={(e) =>
                handleEditPaymentChange("end_date", e.target?.value)
              }
            />

            <label>Status</label>
            <select
              style={styles.inputStyle}
              value={editPayment?.status || ""}
              onChange={(e) =>
                handleEditPaymentChange("status", e.target?.value)
              }
            >
              <option value="" disabled>
                -- Select Status --
              </option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>

            <button
              style={styles.primaryBtn}
              onClick={
                editPayment?.id ? handleUpdatePayment : handleCreatePayment
              }
            >
              {editPayment?.id ? "Update Payment" : "Add Payment"}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <IoClose
              style={styles.closeIconStyle}
              onClick={() => setDeleteConfirm(null)}
            />
            <h3 style={{ marginBottom: 12 }}>Delete Payment</h3>
            <p>Are you sure you want to delete this payment?</p>
            <div style={styles.buttonRow}>
              <button
                style={styles.secondaryBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button style={styles.dangerBtn} onClick={handleDeletePayment}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
