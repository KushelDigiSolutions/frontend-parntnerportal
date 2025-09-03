"use client";
import React, { useEffect, useRef, useState } from "react";
import { FiEye } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdCheckCircle, MdCancel } from "react-icons/md";
import "../admin-dashboard/AffiliateDash.css";

export default function PartnerRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [activeTab, setActiveTab] = useState('all');
    const [viewData, setViewData] = useState(null);

    useEffect(() => {
        async function fetchRequests() {
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
                    // Only show pending requests
                    setRequests(
                        Array.isArray(data.data)
                            ? data.data.filter((p) => p.status?.toLowerCase() !== "approved")
                            : []
                    );
                } else {
                    setError(data.message || "Failed to fetch data");
                }

            } catch (err) {
                setError("Network error");
            }
            setLoading(false);
        }
        fetchRequests();
    }, []);

    // Calculate pending and rejected counts
    const pendingRequest = requests.filter((p) => p.status?.toLowerCase() === "pending")
    const rejectedRequest = requests.filter((p) => p.status?.toLowerCase() === "rejected")
    console.log(requests);

    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = activeTab === 'all' ? requests : (activeTab === "Pending" ? pendingRequest : rejectedRequest).slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="affiliate-container">
            <div className="header">
                <div>
                    <h2>Partner Requests</h2>
                </div>
            </div>

            <div className="stats" >
                <div className="stats-box partner cursor-pointer" onClick={() => setActiveTab('Pending')}>
                    <p>Pending</p>
                    <h3>{pendingRequest.length}</h3>
                </div>
                <div className="stats-box request cursor-pointer" onClick={() => setActiveTab('Rejected')}>
                    <p>Rejected</p>
                    <h3>{rejectedRequest.length}</h3>
                </div>
            </div>
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
                                                position: "relative",
                                            }}
                                        >
                                            <DropdownMenu item={item} onView={() => setViewData(item)} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="no-items">
                                    No requests
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Pagination */}
            {requests.length > 0 && (
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
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next »
                    </button>
                </div>
            )}
            {/* Popup for view details */}
            {viewData && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.25)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }} onClick={() => setViewData(null)}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 10,
                        minWidth: 340,
                        maxWidth: 630,
                        padding: 32,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                        position: 'relative',
                    }} onClick={e => e.stopPropagation()}>
                        <button style={{position:'absolute',top:10,right:16,fontSize:22,border:'none',background:'none',cursor:'pointer'}} onClick={() => setViewData(null)}>&times;</button>
                        <h2 style={{marginBottom:16,fontWeight:600,fontSize:20}}>Partner Details</h2>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,fontSize:15}}>
                            <div><b>Name:</b> {viewData.name}</div>
                            <div><b>Email:</b> {viewData.email}</div>
                            <div><b>Mobile:</b> {viewData.mobilePhone}</div>
                            <div><b>Platform:</b> {viewData.platform}</div>
                            <div><b>Affiliate Handle:</b> {viewData.affiliate_handle}</div>
                            <div><b>Status:</b> {viewData.status}</div>
                            <div style={{gridColumn:'1/3'}}><b>Reference Link:</b> {viewData.refernceLink}</div>
                            <div style={{gridColumn:'1/3'}}><b>Description:</b> {viewData.description}</div>
                            <div style={{gridColumn:'1/3'}}><b>Additional Info:</b> {viewData.additional_info}</div>
                            <div style={{gridColumn:'1/3'}}><b>Created At:</b> {viewData.created_at ? new Date(viewData.created_at).toLocaleDateString() : ''}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DropdownMenu({ item, onView }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    const [loadingType, setLoadingType] = useState(null); // null | 'approve' | 'reject'
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    async function handleApprove() {
        setLoadingType('approve');
        try {
            const token = localStorage.getItem("user_token");
            const res = await fetch("https://partnerback.kdscrm.com/partner/approvePartner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ partnerId: item.id }), // changed from id to partnerId
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Partner approved successfully");
                setOpen(false);
                window.location.reload();
            } else {
                alert(data.message || "Failed to approve partner");
            }
        } catch (err) {
            alert("Network error");
        }
        setLoadingType(null);
    }

    async function handleReject() {
        setLoadingType('reject');
        try {
            const token = localStorage.getItem("user_token");
            const res = await fetch("https://partnerback.kdscrm.com/partner/rejectPartner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ partnerId: item.id }), // changed from id to partnerId
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert("Partner rejected successfully");
                setOpen(false);
                window.location.reload();
            } else {
                alert(data.message || "Failed to reject partner");
            }
        } catch (err) {
            alert("Network error");
        }
        setLoadingType(null);
    }

    const handleDropdownOpen = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            // Adjust left if dropdown would overflow right edge
            const dropdownWidth = 180; // px, adjust if needed
            let left = rect.left + window.scrollX;
            if (left + dropdownWidth > window.innerWidth - 12) {
                left = window.innerWidth - dropdownWidth - 12; // 12px margin from right
            }
            setDropdownPos({
                top: rect.bottom + window.scrollY,
                left,
            });
        }
        setOpen((o) => !o);
    };

    return (
        <div style={{ position: "relative" }} ref={ref}>
            <button
                style={{
                    borderRadius: 4,
                    background: "#fff",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: 'none',
                    cursor: "pointer",
                }}
                onClick={handleDropdownOpen}
                disabled={loadingType !== null}
            >
                <BsThreeDotsVertical style={{ color: "#4f46e5", fontSize: 18 }} />
            </button>
            {open && (
                <div style={{
                    position: "fixed",
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    background: "#fff",
                    border: "1px solid #eee",
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    zIndex: 1000,
                    minWidth: 140,
                    width: 130,
                    overflow: 'hidden',
                }}>
                    <DropdownItem icon={<FiEye style={{color:'#4f46e5', fontSize:18}} />} label="View" onClick={() => { setOpen(false); onView(item); }} />
                    <DropdownItem icon={<MdCheckCircle style={{color:'#22c55e', fontSize:18}} />} label={loadingType === 'approve' ? "Approving..." : "Approved"} onClick={handleApprove} disabled={loadingType !== null} />
                    <DropdownItem icon={<MdCancel style={{color:'#ef4444', fontSize:18}} />} label={loadingType === 'reject' ? "Rejecting..." : "Rejected"} onClick={handleReject} disabled={loadingType !== null} />
                </div>
            )}
        </div>
    );
}

function DropdownItem({ icon, label, onClick, disabled }) {
    const [hover, setHover] = useState(false);
    return (
        <div
            style={{
                padding: "10px 18px",
                cursor: disabled ? "not-allowed" : "pointer",
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: hover && !disabled ? '#f3f4f6' : '#fff',
                fontWeight: 500,
                fontSize: 15,
                transition: 'background 0.15s',
                opacity: disabled ? 0.6 : 1,
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={disabled ? undefined : onClick}
        >
            {icon}
            {label}
        </div>
    );
}
