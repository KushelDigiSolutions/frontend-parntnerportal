"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AffiliateDash.css";

// ✅ Helper function
function sortByDateDesc(list) {
  return [...list].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
}

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
  let referenceLink = "";
  try {
    const user = localStorage.getItem("user_data");
    if (user) {
      const userObj = JSON.parse(user);
      role = userObj?.role ?? role;
      partnerId = userObj?.id ?? null;
      referenceLink = `https://referral-client.vercel.app/?refer=${userObj?.refernceLink}` ?? "";
    }
  } catch { }

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("user_token");
      setLoading(true);
      setError("");
      try {
        if (role === "admin") {
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
          if (res.ok && data?.success) {
            setPartners(sortByDateDesc(data?.data ?? []));
          } else {
            setError(data?.message ?? "Failed to fetch partners");
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
          if (res.ok && data?.success) {
            const arr = Array.isArray(data?.data) ? data?.data : [data?.data];
            setStores(sortByDateDesc(arr));
          } else {
            setError(data?.message ?? "Failed to fetch stores");
          }
        }
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    }
    fetchData();
  }, [role, partnerId]);

  // ✅ copy referral link + show toast with link
  const handleCopyReferral = () => {
    if (referenceLink) {
      navigator?.clipboard?.writeText(referenceLink).then(() => {
        toast.success(<div>Referral link copied!</div>);
      });
    } else {
      toast.error("Referral link not found!");
    }
  };

  // Table data + pagination logic
  const tableData =
    role === "admin"
      ? Array.isArray(partners)
        ? partners?.filter((p) => p?.status?.toLowerCase() === "approved")
        : []
      : Array.isArray(stores)
        ? stores
        : [];

  const totalPages = Math.ceil(tableData?.length / itemsPerPage) ?? 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = tableData?.slice(startIndex, startIndex + itemsPerPage) ?? [];

  return (
    <div className="affiliate-container">
      {/* Header */}
      <div className="header">
        <h2>Dashboard</h2>
        {role === "partner" && (
          <button className="refer-btn" onClick={handleCopyReferral}>
            Refer New Client
          </button>
        )}
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      {/* Stats */}
      <div className="stats">
        {role === "partner" ? (
          <>
            <div className="stats-box earnings">
              <p>All time earnings</p>
              <h3>
                {stores?.reduce(
                  (total, store) => total + (Number(Math.floor(store?.earning)) || 0),
                  0
                )}
              </h3>
            </div>
            <div className="stats-box month">
              <p>Total Store Value</p>
              <h3>
                {stores
                  ?.filter((store) => store?.status?.toLowerCase() === "active")
                  ?.reduce(
                    (total, store) => total + (Number(Math.floor(store?.earning)) || 0),
                    0
                  )}
              </h3>
            </div>
          </>
        ) : (
          <>
            <div className="stats-box partner">
              <p>Partner</p>
              <h3>
                {partners?.filter((p) => p?.status?.toLowerCase() === "approved")?.length ?? 0}
              </h3>
            </div>
            <div
              className="stats-box request cursor-pointer"
              onClick={() => router.push("partner-request")}
            >
              <p>Request</p>
              <h3>
                {partners?.filter((p) => p?.status?.toLowerCase() === "pending")?.length ?? 0}
              </h3>
            </div>
          </>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        {role === "admin" ? (
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
                <tr>
                  <td colSpan="11" className="no-items">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="11" className="no-items">
                    {error}
                  </td>
                </tr>
              ) : currentData?.length > 0 ? (
                currentData?.map((item, index) => (
                  <tr key={item?.id}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      {item?.profileImage ? (
                        <img
                          src={item?.profileImage}
                          alt={item?.name}
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
                          {item?.name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      )}
                    </td>
                    <td>{item?.name}</td>
                    <td>{item?.email}</td>
                    <td>{item?.mobilePhone}</td>
                    <td className="capitalize">{item?.platform}</td>
                    <td>{item?.affiliate_handle}</td>
                    <td className="capitalize">
                      <span className={`status text-green-700 ${item?.status?.toLowerCase()}`}>
                        {item?.status}
                      </span>
                    </td>
                    <td>{item?.refernceLink}</td>
                    <td>{item?.created_at ? new Date(item?.created_at)?.toLocaleDateString() : ""}</td>
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
                        onClick={() => router.push(`/dashboard/partner/${item?.id}`)}
                      >
                        <FiEye style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="no-items">
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Store Name</th>
                <th>Store Owner</th>
                <th>Platform</th>
                <th>Earning</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Created At</th>
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
              ) : currentData?.length > 0 ? (
                currentData?.map((store, index) => (
                  <tr key={store?.partner_id}>
                    <td>{startIndex + index + 1}</td>
                    <td>{store?.store_name}</td>
                    <td>{store?.store_owner || "-"}</td>
                    <td className="capitalize">{store?.platform}</td>
                    <td>{Math.floor(store?.earning ?? 0)}</td>
                    <td>{Math.floor(store?.total_value ?? 0)}</td>
                    <td className="capitalize">
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: 11,
                          color: "#fff",
                          background:
                            store?.status?.toLowerCase() === "active"
                              ? "rgb(34 197 94)"
                              : "rgb(239 68 68)",
                        }}
                      >
                        {store?.status}
                      </span>
                    </td>
                    <td>
                      {store?.created_at ? new Date(store?.created_at)?.toLocaleDateString() : "-"}
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
                          router.push(`/dashboard/partner/store-detail/${store?.id}`)
                        }
                      >
                        <FiEye style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-items">
                    No stores found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
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
