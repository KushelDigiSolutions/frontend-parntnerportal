"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import "./AffiliateDash.css";

export default function AffiliateDash() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // role & partnerId from localStorage
  let role = "partner";
  let partnerId = null;
  try {
    const user = localStorage.getItem("user_data");
    if (user) {
      const userObj = JSON.parse(user);
      if (userObj?.role) role = userObj.role;
      if (userObj?.id) partnerId = userObj.id; // 👈 partner id from user_data
    }
  } catch { }

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("user_token");
      setLoading(true);
      setError("");
      try {
        if (role === "admin") {
          // Admin → Partners API
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
            setPartners(data?.data || []);
          } else {
            setError(data.message || "Failed to fetch partners");
          }
        } else if (role === "partner" && partnerId) {
          const res = await fetch(
            `https://partnerback.kdscrm.com/partner-store/partner/${partnerId}`,
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
            setStores(Array.isArray(data.data) ? data.data : [data.data]);
          } else {
            setError(data.message || "Failed to fetch stores");
          }
        }
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    }
    fetchData();
  }, [role, partnerId]);

  // Data based on role
  const tableData =
    role === "admin"
      ? Array.isArray(partners) ? partners.filter((p) => p.status?.toLowerCase() === "approved") : []
      : Array.isArray(stores) ? stores : [];


  // Pagination logic
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = tableData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="affiliate-container">
      {/* Header */}
      {role === "admin" ? (
        <div className="header">
          <h2>Dashboard</h2>
        </div>
      ) : (
        <div className="header">
          <h2>Dashboard</h2>
          <button className="refer-btn">Refer New Client</button>
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        {role === "partner" ? (
          <>
            <div className="stats-box earnings">
              <p>All time earnings</p>
              {/* <h3>{stores[0]?.earning || 0}</h3> */}
            </div>
            <div className="stats-box month">
              <p>Total Store Value</p>
              {/* <h3>{stores[0]?.total_value || 0}</h3> */}
            </div>
          </>
        ) : (
          <>
            <div className="stats-box partner">
              <p>Partner</p>
              <h3>{partners.filter((p) => p.status?.toLowerCase() === "approved").length}</h3>
            </div>
            <div
              className="stats-box request cursor-pointer"
              onClick={() => router.push("partner-request")}
            >
              <p>Request</p>
              <h3>{partners.filter((p) => p.status?.toLowerCase() === "pending").length}</h3>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {role === "admin" ? (
          // ✅ Admin Table
          <table>
            <thead>
              <tr>
                <th>#</th>
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
                <tr><td colSpan="11" className="no-items">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="11" className="no-items">{error}</td></tr>
              ) : currentData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr key={item.id}>
                    <td>{startIndex + index + 1}</td> {/* ✅ S.No */}
                    <td>
                      {item.profileImage ? (
                        <img
                          src={item.profileImage}
                          alt={item.name}
                          style={{ width: 32, height: 32, borderRadius: "50%" }}
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
                    <td className="capitalize">{item.platform}</td>
                    <td>{item.affiliate_handle}</td>
                    <td className="capitalize">
                      <span className={`status text-green-700  ${item.status?.toLowerCase()}`}>
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
                        onClick={() => router.push(`/dashboard/partner/${item.id}`)}
                      >
                        <FiEye style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="11" className="no-items">No items</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          // ✅ Partner Store Table
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
                {/* <th>End Date</th> */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="no-items">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="9" className="no-items">{error}</td></tr>
              ) : currentData.length > 0 ? (
                currentData.map((store, index) => (
                  <tr key={store.partner_id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{store.store_name}</td>
                    <td className="capitalize">{store.platform}</td>
                    <td>{Math.floor(store.earning)}</td>
                    <td>{Math.floor(store.total_value)}</td>
                    <td className="capitalize">
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: 11,
                          color: "#fff",
                          background:
                            store.status?.toLowerCase() === "active"
                              ? "rgb(34 197 94)" // ✅ green
                              : "rgb(239 68 68)", // ✅ red
                        }}
                      >
                        {store.status}
                      </span>
                    </td>

                    <td>
                      {store.created_at
                        ? new Date(store.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    {/* <td>
                      {store.end_date
                        ? new Date(store.end_date).toLocaleDateString()
                        : "-"}
                    </td> */}
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
                          router.push(`/dashboard/partner/store-detail/${store?.id}`)
                        }
                      >
                        <FiEye
                          style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="no-items">No stores found</td></tr>
              )}
            </tbody>
          </table>


        )}
      </div>

      {/* Pagination */}
      {tableData.length > 0 && (
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
    </div>
  );
}
