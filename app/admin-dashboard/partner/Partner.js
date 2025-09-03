"use client";
import React, { useState } from "react";
import "./partner-details.css";
import "../AffiliateDash.css";
import { useParams } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiEye } from "react-icons/fi";

export default function Partner({ partner, stores = [] }) {
    const params = useParams();
    console.log("Partner page params:", params);

    if (!partner)
        return <div className="affiliate-container">No partner data found.</div>;

    // Pagination for stores
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil((stores?.length || 0) / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStores = stores.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="affiliate-container">
            {/* Partner Name Heading with Back Button */}
            <div style={{ display: 'flex', alignItems: 'end', }}>
                <button
                    onClick={() => window.history.back()}
                    style={{
                        display: 'flex', alignItems: 'center', 
                        padding: '4px 12px', cursor: 'pointer', fontWeight: 'bold', color: '#333',
                    }}
                >
                    <IoChevronBackOutline style={{ fontSize: '1.1rem', marginRight: '4px' }} />
                    Back
                </button>
                <h2 className="partner-heading" style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#333', margin: 0 }}>
                    {partner.name || "Unknown"}
                </h2>
            </div>
            {/* Partner Details Section */}
            <div className="details-card">
                <h3 className="section-title">Partner Details</h3>
                <div className="details-grid">
                    <div><span>Name:</span> {partner.name}</div>
                    <div><span>Email:</span> {partner.email}</div>
                    <div><span>Phone:</span> {partner.mobilePhone}</div>
                    <div><span>Platform:</span> {partner.platform}</div>
                    <div><span>Affiliate Handle:</span> {partner.affiliate_handle}</div>
                    <div>
                        <span>Status:</span>{" "}
                        <strong className={`status ${partner.status?.toLowerCase()}`}>
                            {partner.status}
                        </strong>
                    </div>
                    <div><span>Reference Link:</span> {partner.refernceLink}</div>
                    <div><span>Description:</span> {partner.description}</div>
                    <div><span>Additional Info:</span> {partner.additional_info}</div>
                    <div>
                        <span>Created At:</span>{" "}
                        {partner.created_at ? new Date(partner.created_at).toLocaleDateString() : ""}
                    </div>
                </div>
            </div>

            {/* Stores Section */}
            {stores.length > 0 && (
                <div className="details-card">
                    <h3 className="section-title">Stores Details</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Store Name</th>
                                    <th>Platform</th>
                                    <th>Earning</th>
                                    <th>Total Value</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentStores.length > 0 ? (
                                    currentStores.map((store, idx) => (
                                        <tr key={store.id}>
                                            <td>{startIndex + idx + 1}</td>
                                            <td>{store.store_name}</td>
                                            <td className="capitalize">{store.platform}</td>
                                            <td>{store.earning}</td>
                                            <td>{store.total_value}</td>
                                            <td className="capitalize">
                                                <span className={`status ${store.status?.toLowerCase()}`}>
                                                    {store.status}
                                                </span>
                                            </td>
                                            <td>
                                                {store.created_at ? new Date(store.created_at).toLocaleDateString() : ""}
                                            </td>
                                            <td>
                                                <button
                                                    style={{
                                                        borderRadius: 4,
                                                        background: "#fff",
                                                        padding: 4,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 8,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                    title="View"
                                                    onClick={() => alert(`Store ID: ${store.id}`)}
                                                >
                                                    <FiEye style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="no-items">No stores</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {stores.length > 0 && (
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
            )}
        </div>
    );
}
