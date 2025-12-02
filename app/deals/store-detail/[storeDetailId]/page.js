"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import "../../../dashboard/AffiliateDash.css";
import "../../../dashboard/partner/partner-details.css";
import "./storedetail.css"

export default function PartnerDetailsPage() {
    const params = useParams();
    const { storeDetailId } = params;
    const [store, setStore] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [comm, setComm] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        async function fetchStoreDetails() {
            setLoading(true);
            setError("");
            try {
                const token = localStorage.getItem("user_token");

                // ✅ Partner-specific store API
                const storeRes = await fetch(
                    `https://partnerback.krcustomizer.com/partner-store/${storeDetailId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const storeJson = await storeRes.json();

                if (storeRes.ok && storeJson.success) {
                    setStore(storeJson.data);
                    setComm(
                        Math.floor(storeJson.data.earning * 100) /
                        Math.floor(storeJson.data.total_value)
                    );
                } else {
                    setError(storeJson.message || "Failed to fetch store details");
                }

                // ✅ Payments for this partner’s store
                const paymentRes = await fetch(
                    `https://partnerback.krcustomizer.com/api/store-payments?store_id=${storeDetailId}`,
                    {
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
        if (storeDetailId) fetchStoreDetails();
    }, [storeDetailId]);

    if (loading) return <div className="affiliate-container">Loading...</div>;
    if (!store) return <div className="affiliate-container">No store found.</div>;

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
                        <span>Store Name:</span> {store.store_name}
                    </div>
                    <div>
                        <span>Store Owner:</span> {store.store_owner}
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
                        <strong className={`status ${store.status?.toLowerCase()} capitalize`}>
                            {store.status}
                        </strong>
                    </div>
                    <div>
                        <span>Created At:</span>{" "}
                        {store.created_at
                            ? new Date(store.created_at).toLocaleDateString("en-GB")
                            : ""}
                    </div>
                    <div>
                        <span>Commission:</span> {comm}%
                    </div>
                    {store?.inactive_reason && <div>
                        <span>Reason:</span> {store?.inactive_reason}
                    </div>}
                </div>
            </div>

            {/* Payment details */}
            <div className="details-card">
                <h3 className="section-title">Payment Details</h3>
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
                            </tr>
                        </thead>

                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-items">No payments found</td>
                                </tr>
                            ) : (
                                payments
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((payment, idx) => (
                                        <tr key={payment.id}>
                                            <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                            <td>{Math.floor(payment?.amount)}</td>
                                            <td>
                                                {payment.created_at
                                                    ? new Date(payment?.created_at).toLocaleDateString("en-GB")
                                                    : ""}
                                            </td>
                                            <td>
                                                {payment.end_date
                                                    ? new Date(payment.end_date).toLocaleDateString("en-GB")
                                                    : ""}
                                            </td>
                                            <td>{Math.floor((payment.amount * payment.commission) / 100)}</td>
                                            <td>
                                                <span
                                                    style={{
                                                        display: "inline-block",
                                                        padding: "4px 16px",
                                                        borderRadius: "50px",
                                                        color: "#fff",
                                                        background:
                                                            payment.status?.toLowerCase() === "paid"
                                                                ? "rgb(50 200 100)"
                                                                : payment.status?.toLowerCase() === "pending"
                                                                    ? "#facc15"
                                                                    : payment.status?.toLowerCase() === "failed"
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
                                        </tr>
                                    ))
                            )}
                        </tbody>

                    </table>
                </div>

                {/* Pagination */}
                {/* ✅ Pagination with Prev/Next */}
                {payments.length > itemsPerPage && (
                    <div className="pagination-container">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="page-btn"
                        >
                            « Prev
                        </button>

                        {Array.from(
                            { length: Math.ceil(payments.length / itemsPerPage) },
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
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(p + 1, Math.ceil(payments.length / itemsPerPage))
                                )
                            }
                            disabled={currentPage === Math.ceil(payments.length / itemsPerPage)}
                            className="page-btn"
                        >
                            Next »
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
