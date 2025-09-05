"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { IoChevronBackOutline, IoClose } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiDelete, FiEye } from "react-icons/fi";
import "../../../AffiliateDash.css";
import "../../partner-details.css";
import "./storedetail.css"

export default function StoreDetailsPage() {
    const params = useParams();
    const { storeId } = params;
    const [store, setStore] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [comm, setComm] = useState(0);

    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    // Popup states
    const [viewPayment, setViewPayment] = useState(null);
    const [editPayment, setEditPayment] = useState(null); // create + update

    // delete confirmation
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;


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
                    setComm(((Math.floor(storeJson.data.earning) * 100) / Math.floor(storeJson.data.total_value)))
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
        marginBottom: "16px",
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
    const handleCreatePayment = async () => {
        if (!editPayment) return;
        try {
            const token = localStorage.getItem("user_token");
            const res = await fetch(
                `https://partnerback.kdscrm.com/api/store-payments`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        partner_id: store.partner_id,
                        store_id: storeId,
                        amount: Number(editPayment.amount),
                        commission: Number(editPayment.commission),
                        start_date: editPayment.start_date || null,
                        end_date: editPayment.end_date || null,
                        status: editPayment.status || "pending",
                    }),
                }
            );
            const json = await res.json();

            if (res.ok && json.success) {
                setPayments((prev) => [...prev, json.data]);
                setEditPayment(null);
            } else {
                console.error(json.message || "Failed to create payment");
            }
        } catch (err) {
            console.error("Network error");
        }
    };


    const handleUpdatePayment = async () => {
        if (!editPayment || !editPayment.id) return;
        try {
            const token = localStorage.getItem("user_token");
            const res = await fetch(
                `https://partnerback.kdscrm.com/api/store-payments/${editPayment.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        partner_id: store.partner_id,
                        store_id: storeId,
                        amount: Number(editPayment.amount),
                        commission: Number(editPayment.commission),
                        start_date: editPayment.start_date || null,
                        end_date: editPayment.end_date || null,
                        status: editPayment.status || "pending",
                    }),
                }
            );

            const json = await res.json();

            if (res.ok && json.success) {
                // 👇 yaha state ko direct update karenge bina refresh
                setPayments((prev) =>
                    prev.map((p) =>
                        p.id === editPayment.id
                            ? { ...p, ...editPayment } // local state se update kar diya
                            : p
                    )
                );
                setEditPayment(null);
            } else {
                console.error(json.message || "Failed to update payment");
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
            <div
                style={{ display: "flex", alignItems: "end", justifyContent: "space-between" }}
            >
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
                    <div>
                        <span>Name:</span> {store.store_name}
                    </div>
                    <div>
                        <span>Platform:</span> {store.platform}
                    </div>
                    <div>
                        <span>Total Value:</span> {Math.floor(store.total_value)}
                    </div>
                    <div>
                        <span>Earning:</span> {Math.floor(store.earning)}
                    </div>
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
                    <div>
                        <span>Commision:</span>{" "}
                        {comm}%
                    </div>
                </div>
            </div>

            {/* Payment details */}
            <div className="details-card">
                <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <h3 className="section-title">Payment Details</h3>
                    <button
                        style={primaryBtn}
                        onClick={() =>
                            setEditPayment({
                                amount: Math.floor(store.total_value),
                                commission: comm, // 👈 yaha store ka commission default aa jayega
                                status: "",
                            })
                        }
                    >
                        + Add Payment
                    </button>
                </div>

                {payments.length > 0 ? (
                    <>
                        {/* Table */}
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Amount</th>
                                        <th>Created Date</th>
                                        <th>End Date</th>
                                        <th>Earning</th>
                                        <th>Status</th>
                                        <th>Store Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/** Pagination Logic */}
                                    {payments
                                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                        .map((payment, idx) => (
                                            <tr key={payment.id}>
                                                <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td>{Math.floor(payment.amount)}</td>
                                                <td>
                                                    {payment.created_at
                                                        ? new Date(payment.created_at).toLocaleDateString()
                                                        : ""}
                                                </td>
                                                <td>
                                                    {payment.end_date
                                                        ? new Date(payment.end_date).toLocaleDateString()
                                                        : ""}
                                                </td>
                                                <td>
                                                    {Math.floor((payment.amount * payment.commission) / 100)}
                                                </td>
                                                <td>
                                                    <span
                                                        style={{
                                                            display: "inline-block",
                                                            padding: "4px 16px",
                                                            borderRadius: "50px",
                                                            color: "#fff",
                                                            background:
                                                                payment.status?.toLowerCase() === "paid"
                                                                    ? "rgb(50 200 100)" // green
                                                                    : payment.status?.toLowerCase() === "pending"
                                                                        ? "#facc15" // yellow
                                                                        : payment.status?.toLowerCase() === "failed"
                                                                            ? "#ef4444" // red
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
                                                                left: rect.left + window.scrollX,
                                                            });
                                                            setDropdownOpen(payment.id);
                                                        }}
                                                        type="button"
                                                    >
                                                        <BsThreeDotsVertical
                                                            style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }}
                                                        />
                                                    </button>

                                                    {/* Dropdown */}
                                                    {dropdownOpen === payment.id && (
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: "100%",
                                                                right: 0,
                                                                marginTop: 4,
                                                                background: "#fff",
                                                                border: "1px solid #eee",
                                                                borderRadius: 6,
                                                                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                                                                width: 160,
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
                                                                        partner_id: store.partner_id,
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
                                                                </svg>{" "}
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
                        {payments.length > itemsPerPage && (
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
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    « Prev
                                </button>

                                {Array.from({ length: Math.ceil(payments.length / itemsPerPage) }, (_, i) => (
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
                                    disabled={currentPage === Math.ceil(payments.length / itemsPerPage)}
                                    onClick={() => setCurrentPage((p) => p + 1)}
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


            {/* ------------------- VIEW POPUP ------------------- */}
            {viewPayment && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
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
                                <strong>Commission:</strong> {Math.floor(viewPayment.commission)}%
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

                        {/* Dynamic Heading */}
                        <h3 style={{ marginBottom: 12, fontSize: 20, fontWeight: 500 }}>
                            {editPayment.id ? "Update Payment" : "Add Payment"}
                        </h3>

                        {/* Amount */}
                        <label>Amount</label>
                        <input
                            style={inputStyle}
                            type="number"
                            value={editPayment.amount || ""}
                            onChange={(e) =>
                                setEditPayment({ ...editPayment, amount: e.target.value })
                            }
                        />

                        {/* Commission */}
                        <label>Commission</label>
                        <input
                            style={inputStyle}
                            type="number"
                            value={editPayment.commission || ""}
                            onChange={(e) =>
                                setEditPayment({ ...editPayment, commission: e.target.value })
                            }
                        />

                        {/* Start Date */}
                        <label>Start Date</label>
                        <input
                            style={inputStyle}
                            type="date"
                            value={
                                editPayment.start_date
                                    ? new Date(editPayment.start_date).toISOString().split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                setEditPayment({ ...editPayment, start_date: e.target.value })
                            }
                        />

                        {/* End Date */}
                        <label>End Date</label>
                        <input
                            style={inputStyle}
                            type="date"
                            value={
                                editPayment.end_date
                                    ? new Date(editPayment.end_date).toISOString().split("T")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                setEditPayment({ ...editPayment, end_date: e.target.value })
                            }
                        />

                        {/* Status */}
                        <label>Status</label>
                        <select
                            style={inputStyle}
                            value={editPayment?.status || ""}   // 👈 agar editPayment null hai to "pending"
                            onChange={(e) =>
                                setEditPayment({ ...editPayment, status: e.target.value })
                            }
                        >
                            <option value="" disabled>
                                -- Select Status --
                            </option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                        </select>


                        {/* Action Button (Dynamic text + function) */}
                        <button
                            style={primaryBtn}
                            onClick={editPayment.id ? handleUpdatePayment : handleCreatePayment}
                        >
                            {editPayment.id ? "Update Payment" : "Add Payment"}
                        </button>
                    </div>
                </div>
            )}




            {/* ------------------- DELETE POPUP ------------------- */}
            {deleteConfirm && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <IoClose
                            style={closeIconStyle}
                            onClick={() => setDeleteConfirm(null)}
                        />
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
