"use client";
import React, { useEffect, useRef, useState } from "react";
import {
    FiEye,
    FiCheckCircle,
    FiPauseCircle,
    FiXCircle
} from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../dashboard/AffiliateDash.css";

export default function ReferClient() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [viewData, setViewData] = useState(null);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // filter state
    const [dateFilter, setDateFilter] = useState("");
    const [referredByFilter, setReferredByFilter] = useState("");

    useEffect(() => {
        (async () => {
            const token = localStorage.getItem("user_token");
            try {
                setLoading(true);
                const res = await fetch(
                    "https://partnerback.krcustomizer.com/api/refral",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await res.json();
                if (res.ok && data?.success) {
                    setRequests(Array.isArray(data?.data) ? data?.data : []);
                } else {
                    setError(data?.message || "Failed to fetch data");
                }
            } catch {
                setError("Network error");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // filter logic (date + referred by)
    const filterData = (data) => {
        let out = Array.isArray(data) ? data.slice() : [];

        // date filter
        if (dateFilter && dateFilter !== "all") {
            const today = new Date();
            out = out.filter((item) => {
                const created = new Date(item?.created_at);
                if (dateFilter === "today") {
                    return created.toDateString() === today.toDateString();
                } else if (dateFilter === "7days") {
                    const past7 = new Date();
                    past7.setDate(today.getDate() - 7);
                    return created >= past7;
                } else if (dateFilter === "30days") {
                    const past30 = new Date();
                    past30.setDate(today.getDate() - 30);
                    return created >= past30;
                }
                return true;
            });
        }

        // referred by filter
        if (referredByFilter && referredByFilter !== "all") {
            out = out.filter((item) => (item?.partner_name || "").toString() === referredByFilter);
        }

        return out;
    };

    const filteredData = filterData(requests);

    const partnerNames = Array.from(
        new Set(
            (requests || [])
                .map((r) => (r?.partner_name || "").toString())
                .filter((n) => n && n !== "")
        )
    );

    // pagination logic
    const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
    const currentData = filteredData?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Status Update API call
    const handleStatusUpdate = async (id, newStatus) => {
        const token = localStorage.getItem("user_token");
        try {
            const res = await fetch(
                `https://partnerback.krcustomizer.com/api/refral/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );
            const data = await res.json();
            if (res.ok && data?.success) {
                setRequests((prev) =>
                    prev.map((req) =>
                        req.id === id ? { ...req, status: newStatus } : req
                    )
                );
            } else {
                alert(data?.message || "Failed to update status");
            }
        } catch {
            alert("Network error while updating status");
        }
    };

    return (
        <div className="affiliate-container">
            <div className="header">
                <h2>Referred Clients</h2>
            </div>

            <div className="filter-container">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <select
                        id="dateFilter"
                        value={dateFilter}
                        onChange={(e) => {
                            setDateFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="" disabled>
                            Filter by Date
                        </option>
                        <option value="all">All</option>
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                    </select>

                    <select
                        id="referredByFilter"
                        value={referredByFilter}
                        onChange={(e) => {
                            setReferredByFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="" disabled>
                            Filter by Referred
                        </option>
                        <option value="all">All</option>
                        {partnerNames.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>


            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Store Name</th>
                            <th>Referred By</th>
                            <th>Status</th>
                            <th>
                                Created At
                            </th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <TableMessage colSpan={9} text="Loading..." />
                        ) : error ? (
                            <TableMessage colSpan={9} text={error} />
                        ) : currentData?.length ? (
                            currentData?.map((item, index) => (
                                <tr key={item?.id}>
                                    <td>
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td>{item?.name || "-"}</td>
                                    <td>{item?.email || "-"}</td>
                                    <td>{item?.phone || "-"}</td>
                                    <td>{item?.store_name || "-"}</td>
                                    <td>{item?.partner_name || "-"}</td>
                                    <td>
                                        <StatusBadge status={item?.status} />
                                    </td>
                                    <td>
                                        {item?.created_at
                                            ? new Date(
                                                item?.created_at
                                            )?.toLocaleDateString("en-GB")
                                            : "-"}
                                    </td>
                                    <td>
                                        <DropdownMenu
                                            item={item}
                                            onView={() => setViewData(item)}
                                            onStatusUpdate={handleStatusUpdate}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <TableMessage colSpan={9} text="No requests" />
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredData?.length > itemsPerPage && totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            )}

            {/* Popup */}
            {viewData && (
                <DetailsPopup
                    data={viewData}
                    onClose={() => setViewData(null)}
                />
            )}
        </div>
    );
}

/* ---------- Status Badge ---------- */
function StatusBadge({ status }) {
    const normalized = status?.toLowerCase();

    let color = "#6b7280";
    let bg = "#f3f4f6";

    if (normalized === "confirmed") {
        color = "#0f766e";
        bg = "#d1fae5";
    } else if (normalized === "hold") {
        color = "#92400e";
        bg = "#fef3c7";
    } else if (normalized === "failed") {
        color = "#991b1b";
        bg = "#fee2e2";
    }

    return (
        <span
            style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 600,
                color,
                backgroundColor: bg,
                textTransform: "capitalize",
            }}
        >
            {status || "-"}
        </span>
    );
}

/* ---------- Reusable Components ---------- */
function TableMessage({ colSpan, text }) {
    return (
        <tr>
            <td colSpan={colSpan} className="no-items">
                {text}
            </td>
        </tr>
    );
}

function Pagination({ totalPages, currentPage, setCurrentPage }) {
    return (
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
    );
}

function DetailsPopup({ data, onClose }) {
    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
                <button style={closeBtnStyle} onClick={onClose}>
                    &times;
                </button>
                <h2 style={{ marginBottom: 16, fontWeight: 600, fontSize: 20 }}>
                    Partner Details
                </h2>
                <div style={gridStyle}>
                    <div>
                        <b>Name:</b> {data?.name || "-"}
                    </div>
                    <div>
                        <b>Email:</b> {data?.email || "-"}
                    </div>
                    <div>
                        <b>Mobile:</b> {data?.phone || "-"}
                    </div>
                    <div>
                        <b>Store Name:</b> {data?.store_name || "-"}
                    </div>
                    <div>
                        <b>Referred By:</b> {data?.partner_name || "-"}
                    </div>
                    <div>
                        <b>Country:</b> {data?.country || "-"}
                    </div>
                    <div>
                        <b>City:</b> {data?.city || "-"}
                    </div>
                    <div>
                        <b>Website:</b> {data?.website || "-"}
                    </div>
                    <div>
                        <b>Status:</b> <StatusBadge status={data?.status} />
                    </div>
                    <div style={{ gridColumn: "1/3" }}>
                        <b>Created At:</b>{" "}
                        {data?.created_at
                            ? new Date(data?.created_at)?.toLocaleDateString("en-GB")
                            : "-"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DropdownMenu({ item, onView, onStatusUpdate }) {
    const [open, setOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const toggleDropdown = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const width = 180;
            let left = rect?.left + window.scrollX;
            if (left + width > window.innerWidth - 12) {
                left = window.innerWidth - width - 12;
            }
            setDropdownPos({ top: rect?.bottom + window.scrollY, left });
        }
        setOpen((prev) => !prev);
    };

    return (
        <div style={{ position: "relative" }} ref={ref}>
            <button style={menuBtnStyle} onClick={toggleDropdown}>
                <BsThreeDotsVertical style={{ color: "#4f46e5", fontSize: 18 }} />
            </button>
            {open && (
                <div style={{ ...dropdownStyle, ...dropdownPos }}>
                    <DropdownItem
                        icon={<FiEye style={{ color: "#4f46e5", fontSize: 18 }} />}
                        label="View"
                        onClick={() => {
                            setOpen(false);
                            onView(item);
                        }}
                    />
                    <DropdownItem
                        icon={<FiCheckCircle style={{ color: "green", fontSize: 18 }} />}
                        label="Confirm"
                        onClick={() => {
                            setOpen(false);
                            onStatusUpdate(item.id, "confirmed");
                        }}
                    />
                    <DropdownItem
                        icon={<FiPauseCircle style={{ color: "orange", fontSize: 18 }} />}
                        label="Hold"
                        onClick={() => {
                            setOpen(false);
                            onStatusUpdate(item.id, "hold");
                        }}
                    />
                    <DropdownItem
                        icon={<FiXCircle style={{ color: "red", fontSize: 18 }} />}
                        label="Failed"
                        onClick={() => {
                            setOpen(false);
                            onStatusUpdate(item.id, "failed");
                        }}
                    />
                </div>
            )}
        </div>
    );
}

function DropdownItem({ icon, label, onClick }) {
    const [hover, setHover] = useState(false);
    return (
        <div
            style={{
                padding: "10px 18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: hover ? "#f3f4f6" : "#fff",
                fontWeight: 500,
                fontSize: 15,
                transition: "background 0.15s",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {icon}
            {label}
        </div>
    );
}

/* ---------- Inline Styles ---------- */
const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.25)",
    zIndex: 2000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};
const popupStyle = {
    background: "#fff",
    borderRadius: 10,
    minWidth: 340,
    maxWidth: 720,
    width: "100%",   
    padding: 32,
    boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
    position: "relative",
};
const closeBtnStyle = {
    position: "absolute",
    top: 10,
    right: 16,
    fontSize: 22,
    border: "none",
    background: "none",
    cursor: "pointer",
};
const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    fontSize: 15,
};
const menuBtnStyle = {
    borderRadius: 4,
    background: "#fff",
    padding: 4,
    display: "flex",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
};
const dropdownStyle = {
    position: "fixed",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 6,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    zIndex: 1000,
    minWidth: 160,
    overflow: "hidden",
};
