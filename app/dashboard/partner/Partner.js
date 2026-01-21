"use client";
import React, { useState, useRef, useEffect } from "react";
import "./partner-details.css";
import "../AffiliateDash.css";
import { useParams } from "next/navigation";
import { IoChevronBackOutline } from "react-icons/io5";
import { FiEye } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";

// Modal styles
const modalOverlayStyle = {
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
const modalBoxStyle = {
  background: "#fff",
  borderRadius: 8,
  padding: 32,
  minWidth: 480,
  maxWidth: 400,
  boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
  position: "relative",
};
const closeBtnStyle = {
  position: "absolute",
  top: 12,
  right: 16,
  background: "none",
  border: "none",
  fontSize: 22,
  cursor: "pointer",
};

export default function Partner({
  partner,
  stores = [],
  onAddStore,
  onUpdateStore,
  addLoading,
  onUpdateStatus,
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatingStore, setDeactivatingStore] = useState(null);
  const [deactivationReason, setDeactivationReason] = useState("");
  const [editStore, setEditStore] = useState(null);
  const [newStore, setNewStore] = useState({
    store_name: "",
    store_owner: "",
    platform: "",
    commission: "",
    total_value: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRefs = useRef({}); // store refs for each dropdown

  const handleAddStoreChange = (e) => {
    const { name, value } = e.target;
    setNewStore((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    console.log(newStore);

    if (onAddStore) {
      await onAddStore(
        newStore,
        () =>
          setNewStore({
            store_name: "",
            store_owner: "",
            platform: "",
            commission: "",
            total_value: "",
          }),
        () => setShowAddModal(false)
      );
    }
  };

  const handleDeactivateSubmit = async (e) => {
    e.preventDefault();
    if (onUpdateStatus && deactivatingStore) {
      await onUpdateStatus(deactivatingStore?.id, "inactive", deactivationReason);
      setShowDeactivateModal(false);
      setDeactivatingStore(null);
      setDeactivationReason("");
      setDropdownOpen(null);
    }
  };

  const params = useParams();
  console.log("Partner page params:", params);

  if (!partner)
    return <div className="affiliate-container">No partner data found.</div>;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil((stores?.length || 0) / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStores = stores?.slice(startIndex, startIndex + itemsPerPage) || [];

  const dropdownItemStyle = {
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
    transition: "background 0.15s",
  };

  // Proper outside click handler
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

  return (
    <div className="affiliate-container">
      {/* Partner Name Heading */}
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
          }}
        >
          {partner?.name || "Unknown"}
        </h2>
      </div>
      {/* Partner Details */}
      <div className="details-card">
        <h3 className="section-title">Partner Details</h3>
        <div className="details-grid">
          <div>
            <span>Name:</span> {partner?.name || "-"}
          </div>
          <div>
            <span>Email:</span> {partner?.email || "-"}
          </div>
          <div>
            <span>Phone:</span> {partner?.mobilePhone || "-"}
          </div>
          <div>
            <span>Platform:</span> <span className="capitalize !font-medium">{partner?.platform || "-"}</span>
          </div>
          {/* <div>
            <span>Affiliate Handle:</span> {partner?.affiliate_handle || "-"}
          </div> */}
          <div>
            <span>Country:</span> {partner?.country || "-"}
          </div>
          <div>
            <span>City:</span> {partner?.city || "-"}
          </div>
          <div>
            <span>Status:</span>{" "}
            <strong className={`status ${partner?.status?.toLowerCase() || ""}`}>
              {partner?.status || "-"}
            </strong>
          </div>
          <div>
            <span>Reference Link:</span> {partner?.refernceLink || "-"}
          </div>
          <div>
            <span>Description:</span> {partner?.description || "-"}
          </div>
          <div>
            <span>Additional Info:</span> {partner?.additional_info || "-"}
          </div>
          <div>
            <span>Organization Name:</span> {partner?.organization || "-"}
          </div>
          <div>
            <span>Created At:</span>{" "}
            {partner?.created_at
              ? new Date(partner.created_at).toLocaleDateString("en-GB")
              : "-"}
          </div>
        </div>
      </div>

      {/* Stores Section */}

      <div className="details-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <h3 className="section-title" style={{ margin: 0, border: "none" }}>
            Stores
          </h3>
          <button
            style={{
              padding: "6px 16px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "1rem",
            }}
            onClick={() => setShowAddModal(true)}
          >
            Add Store
          </button>
        </div>

        {/* Add/Update Modal */}
        {showAddModal && (
          <div style={modalOverlayStyle}>
            <div style={modalBoxStyle}>
              <button
                style={closeBtnStyle}
                onClick={() => {
                  setShowAddModal(false);
                  setNewStore({
                    store_name: "",
                    store_owner: "",
                    platform: "",
                    commission: "",
                    total_value: "",
                  });
                  setEditStore(null);
                }}
                title="Close"
              >
                ×
              </button>
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 18,
                  fontWeight: 600,
                  fontSize: 18,
                }}
              >
                {editStore ? "Update Store" : "Add Store"}
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (editStore) {
                    await onUpdateStore(
                      editStore?.id,
                      newStore,
                      () =>
                        setNewStore({
                          store_name: "",
                          store_owner: "",
                          platform: "",
                          commission: "",
                          total_value: "",
                        }),
                      () => setShowAddModal(false)
                    );
                    setEditStore(null);
                  } else {
                    await handleAddStoreSubmit(e);
                  }
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>Store Name</label>
                  <input name="store_name" value={newStore?.store_name || ""} onChange={handleAddStoreChange} required style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>Store Owner</label>
                  <input name="store_owner" value={newStore?.store_owner || ""} onChange={handleAddStoreChange} required style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>
                    Platform
                  </label>
                  <select
                    name="platform"
                    value={newStore?.platform || ""}
                    onChange={handleAddStoreChange}
                    required
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      background: "#fff",
                      fontSize: 15,
                    }}
                  >
                    <option value="">-- Select Platform --</option>
                    <option value="shopify">Shopify</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="bigcommerce">BigCommerce</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>Commission (%)</label>
                  <input name="commission" value={newStore?.commission || ""} onChange={handleAddStoreChange} required type="text" min="0" max="100" style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} placeholder="e.g. 75" />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 4 }}>Total Value</label>
                  <input name="total_value" value={newStore?.total_value || ""} onChange={handleAddStoreChange} required type="number" min="0" step="0.01" style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }} placeholder="e.g. 1200.00" />
                </div>
                <button type="submit" style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: 4, padding: "8px 20px", fontWeight: 600, fontSize: 16, cursor: "pointer", width: "100%" }}>{editStore ? "Update Store" : "Add Store"}</button>
              </form>
            </div>
          </div>
        )}

        {/* Deactivation Modal */}
        {showDeactivateModal && (
          <div style={modalOverlayStyle}>
            <div style={modalBoxStyle}>
              <button
                style={closeBtnStyle}
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivatingStore(null);
                  setDeactivationReason("");
                }}
                title="Close"
              >
                ×
              </button>
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: 18,
                  fontWeight: 600,
                  fontSize: 18,
                  color: "#ef4444",
                }}
              >
                Deactivate Store
              </h3>
              <p style={{ marginBottom: 16, color: "#666" }}>
                Are you sure you want to deactivate "{deactivatingStore?.store_name}"? Please provide a reason for deactivation.
              </p>
              <form onSubmit={handleDeactivateSubmit}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>
                    Reason for Deactivation <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    required
                    rows={4}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                      fontSize: 14,
                      fontFamily: "inherit",
                      resize: "vertical",
                    }}
                    placeholder="Please explain why this store is being deactivated..."
                  />
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeactivateModal(false);
                      setDeactivatingStore(null);
                      setDeactivationReason("");
                    }}
                    style={{
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 16px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: 4,
                      padding: "8px 16px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Deactivate Store
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stores Table */}
        <div className="table-container" style={{ overflow: 'visible' }}>
          <table style={{ overflow: 'visible' }}>
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
            <tbody style={{ overflow: 'visible' }}>
              {currentStores?.length > 0 ? (
                currentStores.map((store, idx) => (
                  <tr key={store?.id} style={{ overflow: 'visible' }}>
                    <td>{startIndex + idx + 1}</td>
                    <td>{store?.store_name || '-'}</td>
                    <td>{store?.store_owner || '-'}</td>
                    <td className="capitalize">{store?.platform || '-'}</td>
                    <td>{Math.floor(store?.earning || 0)}</td>
                    <td>{Math.floor(store?.total_value || 0)}</td>
                    <td className="capitalize">
                      <span className={`status ${store?.status?.toLowerCase() || ""}`}>
                        {store?.status || '-'}
                      </span>
                    </td>
                    <td>
                      {store?.created_at
                        ? new Date(store.created_at).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td style={{ overflow: 'visible', position: 'relative' }}>
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block"
                        }}
                        ref={(el) => (dropdownRefs.current[store?.id] = el)}
                      >
                        <button
                          style={{
                            borderRadius: 4,
                            background: "#fff",
                            padding: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            border: "none",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpen(dropdownOpen === store?.id ? null : store?.id);
                          }}
                          type="button"
                        >
                          <BsThreeDotsVertical
                            style={{ color: "#4f46e5", fontSize: 18, marginRight: 4 }}
                          />
                        </button>
                        {dropdownOpen === store?.id && (
                          <div
                            style={{
                              position: "absolute",
                              top: "-5%",
                              right: "-110%",
                              transform: "translateX(-50%)",
                              background: "#fff",
                              border: "1px solid #eee",
                              borderRadius: 6,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              minWidth: 140,
                              zIndex: 9999,
                              marginTop: 8,
                              overflow: 'visible'
                            }}
                          >
                            <button
                              style={{
                                ...dropdownItemStyle,
                                borderBottom: '1px solid #f5f5f5'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                              onClick={() => {
                                setDropdownOpen(null);
                                window.location.href = `/dashboard/partner/store/${store?.id}`;
                              }}
                            >
                              <FiEye style={{ marginRight: 8 }} /> View
                            </button>
                            <button
                              style={{
                                ...dropdownItemStyle,
                                borderBottom: '1px solid #f5f5f5'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                              onClick={() => {
                                setDropdownOpen(null);
                                setEditStore(store);
                                setNewStore({
                                  store_name: store?.store_name || "",
                                  store_owner: store?.store_owner || "",
                                  platform: store?.platform || "",
                                  commission:
                                    ((store?.earning || 0) / (store?.total_value || 1)) * 100 || "",
                                  earning: Math.floor(store?.earning || 0),
                                  total_value: Math.floor(store?.total_value || 0) || "",
                                });
                                setShowAddModal(true);
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
                            {store?.status?.toLowerCase() === "active" ? (
                              <button
                                style={{
                                  ...dropdownItemStyle,
                                  borderBottom: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => {
                                  setDeactivatingStore(store);
                                  setShowDeactivateModal(true);
                                  setDropdownOpen(null);
                                }}
                              >
                                <svg
                                  style={{ marginRight: 8 }}
                                  width="18"
                                  height="18"
                                  fill="none"
                                  stroke="#ef4444"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M15 9l-6 6M9 9l6 6" />
                                </svg>{" "}
                                Inactive
                              </button>
                            ) : (
                              <button
                                style={{
                                  ...dropdownItemStyle,
                                  borderBottom: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0fdf4'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => {
                                  onUpdateStatus?.(store?.id, "active");
                                  setDropdownOpen(null);
                                }}
                              >
                                <svg
                                  style={{ marginRight: 8 }}
                                  width="18"
                                  height="18"
                                  fill="none"
                                  stroke="#22c55e"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  viewBox="0 0 24 24"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M9 12l2 2 4-4" />
                                </svg>{" "}
                                Active
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-items">
                    No stores
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(stores?.length || 0) > 4 && (
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

    </div>
  );
}