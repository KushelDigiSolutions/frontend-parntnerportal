"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../dashboard/AffiliateDash.css"; // same CSS reuse kar lo

export default function DealDash() {
    const router = useRouter();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [requests, setRequests] = useState([]);


    // filter state
    const [dateFilter, setDateFilter] = useState("all");

    // role & partnerId from localStorage
    let role = "partner";
    let partnerId = null;
    try {
        const user = localStorage.getItem("user_data");
        if (user) {
            const userObj = JSON.parse(user);
            role = userObj?.role ?? role;
            partnerId = userObj?.id ?? null;
        }
    } catch { }

    useEffect(() => {
        async function fetchDeals() {
            const token = localStorage.getItem("user_token");
            setLoading(true);
            setError("");
            try {
                if (role === "partner" && partnerId) {
                    const res = await fetch(
                        `https://partnerback.kdscrm.com/partner-store/partner/${partnerId}?status=active`,
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
                        setDeals(Array.isArray(data?.data) ? data?.data : [data?.data]);
                    } else {
                        setError(data?.message ?? "Failed to fetch deals");
                    }
                }
            } catch (err) {
                setError("Network error");
            }
            setLoading(false);
        }
        fetchDeals();
    }, [role, partnerId]);

    // filter logic
    const filterByDate = (data) => {
        if (dateFilter === "all") return data;
        const today = new Date();
        return data.filter((item) => {
            const created = new Date(item?.created_at);
            if (dateFilter === "today") {
                return (
                    created.toDateString() === today.toDateString()
                );
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
    };

    const filteredData = filterByDate(requests);

    // ✅ Table data + pagination logic (only active deals)
    const tableData = Array.isArray(deals)
        ? deals.filter((deal) => deal?.status?.toLowerCase() === "active")
        : [];

    const totalPages = Math.ceil(tableData?.length / itemsPerPage) ?? 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData =
        tableData?.slice(startIndex, startIndex + itemsPerPage) ?? [];

    return (
        <div className="affiliate-container">
            {/* Header */}
            <div className="header">
                <h2>Deals</h2>
            </div>

            <div className="filter-container">
                <label htmlFor="dateFilter">Filter by Date:</label>
                <select
                    id="dateFilter"
                    value={dateFilter}
                    onChange={(e) => {
                        setDateFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>

            <ToastContainer position="top-center" autoClose={3000} theme="colored" />

            {/* Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Store Name</th>
                            <th>Store Owner</th>
                            <th>Platform</th>
                            <th>Earning</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="no-items">
                                    Loading...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="8" className="no-items">
                                    {error}
                                </td>
                            </tr>
                        ) : currentData?.length > 0 ? (
                            currentData?.map((deal, index) => (
                                <tr key={deal?.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td>{deal?.store_name}</td>
                                    <td>{deal?.store_owner || "-"}</td>
                                    <td className="capitalize">{deal?.platform}</td>
                                    <td className="capitalize">{Math.floor(deal?.earning)}</td>
                                    <td>{Math.floor(deal?.total_value ?? 0)}</td>
                                    <td className="capitalize">
                                        <span
                                            style={{
                                                display: "inline-block",
                                                padding: "4px 12px",
                                                borderRadius: "16px",
                                                fontSize: 11,
                                                color: "#fff",
                                                background:
                                                    deal?.status?.toLowerCase() === "active"
                                                        ? "rgb(34 197 94)"
                                                        : "rgb(239 68 68)",
                                            }}
                                        >
                                            {deal?.status}
                                        </span>
                                    </td>
                                    <td>
                                        {deal?.created_at
                                            ? new Date(deal?.created_at)?.toLocaleDateString()
                                            : "-"}
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
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                router.push(`/deals/store-detail/${deal?.id}`)
                                            }
                                        >
                                            <FiEye
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
                                <td colSpan="8" className="no-items">
                                    No active deals found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {tableData?.length > 5 && (
                <div className="pagination">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        « Prev
                    </button>
                    {Array.from({ length: totalPages ?? 1 }, (_, i) => (
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
        </div>
    );
}
