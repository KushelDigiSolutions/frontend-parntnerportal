"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import "../../../AffiliateDash.css";
import "../../partner-details.css";

export default function StoreDetailsPage() {
    const params = useParams();
    const { storeId } = params;
    const [store, setStore] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // Popup states
    const [viewPayment, setViewPayment] = useState(null);
    const [editPayment, setEditPayment] = useState(null); // also used for create

    // delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const dropdownRefs = useRef({});

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownOpen !== null) {
                const ref = dropdownRefs.current[dropdownOpen];
                if (ref && !ref.contains(event.target)) {
                    setDropdownOpen(null);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);

    useEffect(() => {
        async function fetchStoreDetails() {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("user_token");
                // Store details
                const storeRes = await fetch(
                    `https://partnerback.kdscrm.com/partner-store/${storeId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const storeJson = await storeRes.json();
                if (storeRes.ok && storeJson.success) {
                    setStore(storeJson.data);
                } else {
                    setError(storeJson.message || "Failed to fetch store details");
                }

                // Payment details
                const paymentRes = await fetch(
                    `https://partnerback.kdscrm.com/api/store-payments/${storeId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const paymentJson = await paymentRes.json();
                if (paymentRes.ok && paymentJson.success) {
                    setPayments(paymentJson.data || []);
                } else {
                    setError(paymentJson.message || "Failed to fetch payment details");
                }
            } catch (err) {
                setError("Network error");
            }
            setLoading(false);
        }
        if (storeId) fetchStoreDetails();
    }, [storeId]);

    if (loading) return <div className="affiliate-container">Loading...</div>;
    if (!store) return <div className="affiliate-container">No store found.</div>;

    // ---------------- STYLES ----------------
    const modalOverlay = {
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
    };

    const modalCard = {
        background: "#fff",
        padding: "24px",
        borderRadius: "12px",
        width: "600px",
        maxWidth: "95%",
        position: "relative",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    };

    const inputStyle = {
        width: "100%",
        padding: "8px 12px",
        marginBottom: "12px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        fontSize: "14px",
    };

    const buttonRow = {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "16px",
    };

    const primaryBtn = {
        background: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        cursor: "pointer",
        fontWeight: "bold",
        marginBottom: "16px"
    };

    const dangerBtn = {
        background: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        cursor: "pointer",
        fontWeight: "bold",
    };

    const secondaryBtn = {
        background: "#eee",
        color: "#333",
        border: "none",
        borderRadius: "6px",
        padding: "8px 16px",
        cursor: "pointer",
        fontWeight: "bold",
    };

    const closeIconStyle = {
        position: "absolute",
        top: "12px",
        right: "12px",
        cursor: "pointer",
        fontSize: "20px",
        color: "#555",
    };

    // ---------------- HANDLERS ----------------
    const handleSavePayment = async () => {
        if (!editPayment) return;
        try {
            const token = localStorage.getItem("user_token");
            const isUpdate = !!editPayment.id;
            const url = isUpdate
                ? `https://partnerback.kdscrm.com/api/store-payments/${editPayment.id}`
                : `https://partnerback.kdscrm.com/api/store-payments/${storeId}`;
            const method = isUpdate ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: Number(editPayment.amount),
                    commission: Number(editPayment.commission),
                    status: editPayment.status,
                }),
            });
            const json = await res.json();

            if (res.ok && json.success) {
                if (isUpdate) {
                    setPayments((prev) =>
                        prev.map((p) =>
                            p.id === editPayment.id ? { ...p, ...editPayment } : p
                        )
                    );
                } else {
                    setPayments((prev) => [...prev, json.data]);
                }
                setEditPayment(null);
            } else {
                console.error(json.message || "Failed to save payment");
            }
        } catch (err) {
            console.error("Network error");
        }
    };

    const handleDeletePayment = async () => {
        if (!deleteConfirm) return;
        try {
            const token = localStorage.getItem("user_token");
            const res = await fetch(
                `https://partnerback.kdscrm.com/api/store-payments/${deleteConfirm.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const json = await res.json();
            if (res.ok && json.success) {
                alert("Payment deleted!");
                setPayments(payments.filter((p) => p.id !== deleteConfirm.id));
                setDeleteConfirm(null);
            } else {
                alert(json.message || "Failed to delete payment");
            }
        } catch (err) {
            alert("Network error");
        }
    };

    return (
        <div className="affiliate-container">
            {/* Back + Title */}
            <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "end" }}>
                    <button
                        onClick={() => window.history.back()}
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
                        {store.store_name || "Unknown Store"}
                    </h2>
                </div>
            </div>

            {/* Store details */}
            <div className="details-card">
                <h3 className="section-title">Store Details</h3>
                <div className="details-grid">
                    <div><span>Name:</span> {store.store_name}</div>
                    <div><span>Platform:</span> {store.platform}</div>
                    <div><span>Total Value:</span> {store.total_value}</div>
                    <div><span>Earning:</span> {store.earning}</div>
                    <div>
                        <span>Status:</span>{" "}
                        <strong className={`status ${store.status?.toLowerCase()}`}>
                            {store.status}
                        </strong>
                    </div>
                    <div>
                        <span>Created At:</span>{" "}
                        {store.created_at
                            ? new Date(store.created_at).toLocaleDateString()
                            : ""}
                    </div>
                </div>
            </div>

            {/* Payment details */}
            <div className="details-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="section-title">Payment Details</h3>
                    <button
                        style={primaryBtn}
                        onClick={() =>
                            setEditPayment({ amount: "", commission: "", status: "unpaid" })
                        }
                    >
                        + Add Payment
                    </button>
                </div>

                {payments.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Amount</th>
                                    <th>Created Date</th>
                                    <th>End Date</th>
                                    <th>Commission</th>
                                    <th>Status</th>
                                    <th>Store Name</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{payment.id}</td>
                                        <td>{payment.amount}</td>
                                        <td>{payment.created_at ? new Date(payment.created_at).toLocaleDateString() : ""}</td>
                                        <td>{payment.end_date ? new Date(payment.end_date).toLocaleDateString() : ""}</td>
                                        <td>{payment.commission}</td>
                                        <td>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    padding: "4px 16px",
                                                    borderRadius: "50px",
                                                    color: "#fff",
                                                    background:
                                                        payment.status?.toLowerCase() === "paid"
                                                            ? "rgb(114 218 152)"
                                                            : payment.status?.toLowerCase() === "unpaid"
                                                                ? "#ef4444"
                                                                : "#888",
                                                    fontSize: 13,
                                                    textTransform: "capitalize",
                                                }}
                                            >
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td>{store.store_name || "-"}</td>
                                        <td
                                            style={{ position: "relative" }}
                                            ref={(el) => (dropdownRefs.current[payment.id] = el)}
                                        >
                                            <button
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: 4,
                                                }}
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setDropdownPosition({
                                                        top: rect.bottom + window.scrollY + 4,
                                                        left: rect.right + window.scrollX - 150,
                                                    });
                                                    setDropdownOpen(payment.id);
                                                }}
                                                type="button"
                                            >
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    fill="none"
                                                    stroke="#4f46e5"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle cx="12" cy="12" r="10" />
                                                    <circle cx="12" cy="8" r="1" />
                                                    <circle cx="12" cy="12" r="1" />
                                                    <circle cx="12" cy="16" r="1" />
                                                </svg>
                                            </button>

                                            {/* Dropdown */}
                                            {dropdownOpen === payment.id && (
                                                <div
                                                    style={{
                                                        position: "fixed",
                                                        top: dropdownPosition.top,
                                                        left: dropdownPosition.left,
                                                        background: "#fff",
                                                        border: "1px solid #eee",
                                                        borderRadius: 6,
                                                        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                                        minWidth: 150,
                                                        zIndex: 2000,
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
                                                        👁 View
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
                                                            setEditPayment(payment);
                                                        }}
                                                    >
                                                        ✏️ Update
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
                                                        🗑 Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>No payment details found.</div>
                )}
            </div>

            {/* ------------------- VIEW POPUP ------------------- */}
            {viewPayment && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        {/* Close Button */}
                        <IoClose style={closeIconStyle} onClick={() => setViewPayment(null)} />

                        <h3 style={{ marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
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
                                <strong>ID:</strong> {viewPayment.id}
                            </p>
                            <p>
                                <strong>Amount:</strong> {viewPayment.amount}
                            </p>
                            <p>
                                <strong>Commission:</strong> {viewPayment.commission}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                <span
                                    style={{
                                        color:
                                            viewPayment.status?.toLowerCase() === "paid"
                                                ? "green"
                                                : "red",
                                        fontWeight: "500",
                                        textTransform: "capitalize",
                                    }}
                                >
                                    {viewPayment.status}
                                </span>
                            </p>
                            <p>
                                <strong>Start Date:</strong>{" "}
                                {viewPayment.created_at
                                    ? new Date(viewPayment.created_at).toLocaleDateString()
                                    : "-"}
                            </p>
                            <p>
                                <strong>End Date:</strong>{" "}
                                {viewPayment.end_date
                                    ? new Date(viewPayment.end_date).toLocaleDateString()
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>
            )}


            {/* ------------------- CREATE/UPDATE POPUP ------------------- */}
            {editPayment && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <IoClose style={closeIconStyle} onClick={() => setEditPayment(null)} />
                        <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: "600", color: "#111" }}>
                            {editPayment.id ? "Update Payment" : "Create Payment"}
                        </h3>

                        <label>Amount</label>
                        <input
                            style={inputStyle}
                            type="number"
                            value={editPayment.amount}
                            onChange={(e) => setEditPayment({ ...editPayment, amount: e.target.value })}
                        />

                        <label>Commission (%)</label>
                        <input
                            style={inputStyle}
                            type="number"
                            value={editPayment.commission}
                            onChange={(e) => setEditPayment({ ...editPayment, commission: e.target.value })}
                        />

                        <label>Status</label>
                        <select
                            style={inputStyle}
                            value={editPayment.status}
                            onChange={(e) => setEditPayment({ ...editPayment, status: e.target.value })}
                        >
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                        </select>

                        <button
                            style={{
                                width: "100%",
                                marginTop: "16px",
                                background: "#4f46e5",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "12px 16px",
                                cursor: "pointer",
                                fontWeight: "600",
                                fontSize: "15px",
                            }}
                            onClick={handleSavePayment}
                        >
                            {editPayment.id ? "Update Payment" : "Create Payment"}
                        </button>
                    </div>
                </div>
            )}

            {/* ------------------- DELETE POPUP ------------------- */}
            {deleteConfirm && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <IoClose style={closeIconStyle} onClick={() => setDeleteConfirm(null)} />
                        <h3 style={{ marginBottom: 12 }}>Delete Payment</h3>
                        <p>Are you sure you want to delete this payment?</p>
                        <div style={buttonRow}>
                            <button style={secondaryBtn} onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button style={dangerBtn} onClick={handleDeletePayment}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
