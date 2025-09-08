"use client";
import React, { useEffect, useState } from "react";
import "./partnersec.css";
import { FaYoutube } from "react-icons/fa";
import { FiCopy, FiEye, FiEdit } from "react-icons/fi";

export default function PartnerDashboard() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [videoUrl, setVideoUrl] = useState(""); // 👈 for video popup
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        url: "",
    });

    const [role, setRole] = useState("partner");

    useEffect(() => {
        try {
            const user = localStorage.getItem("user_data");
            if (user) {
                const userObj = JSON.parse(user);
                setRole(userObj?.role ?? "partner");
            }
        } catch { }
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("user_token");
            const res = await fetch("https://partnerback.kdscrm.com/api/playbooks", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok && data?.success) {
                setItems(Array.isArray(data?.data) ? data?.data : []);
            } else {
                setError(data?.message || "Failed to fetch data");
            }
        } catch {
            setError("Network error");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("user_token");
            const url = editingId
                ? `https://partnerback.kdscrm.com/api/playbooks/${editingId}`
                : "https://partnerback.kdscrm.com/api/playbooks";

            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok && data?.success) {
                setShowModal(false);
                setFormData({ title: "", description: "", url: "" });
                setEditingId(null);
                fetchItems();
            } else {
                alert(data?.message || "Failed to save item");
            }
        } catch {
            alert("Network error");
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item?.title ?? "",
            description: item?.description ?? "",
            url: item?.url ?? "",
        });
        setEditingId(item?.id);
        setShowModal(true);
    };

    // 👇 Video popup open
    const handleOpenVideo = (url) => {
        if (!url) return;
        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
            alert("Invalid YouTube URL");
            return;
        }
        setVideoUrl(url);
    };


    return (
        <div className="dashboard-container">
            {/* Top Search Bar */}
            <div className="topbar">
                <input
                    type="text"
                    placeholder="Type to search for different content piece"
                    className="search-bar"
                />
                <button className="search-btn">Search</button>
            </div>

            {/* Get Started Section */}
            <div className="section">
                <div className="section-header">
                    <h2>
                        <span className="check-icon">✔</span> Get Started{" "}
                        <span className="badge1">{items?.length} items</span>
                    </h2>
                    {role === "admin" && (
                        <button
                            className="add-btn"
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ title: "", description: "", url: "" });
                                setShowModal(true);
                            }}
                        >
                            + Add Items
                        </button>
                    )}
                </div>
                <p className="section-desc">
                    Steps and processes to begin your journey as a KR Customizer partner
                </p>

                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="no-items">
                                    Loading...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="4" className="no-items">
                                    {error}
                                </td>
                            </tr>
                        ) : items?.length ? (
                            items?.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <FaYoutube
                                            className="youtube-icon"
                                            title="Play Video"
                                            onClick={() => handleOpenVideo(item?.url)}
                                        />
                                    </td>
                                    <td
                                        className="title-cell"
                                    >
                                        {item?.title ?? "N/A"}
                                    </td>
                                    <td>{item?.description ?? "N/A"}</td>
                                    <td>
                                        <FiEye
                                            className="action-icon"
                                            title="View"
                                            onClick={() => handleOpenVideo(item?.url)}
                                        />
                                        <FiCopy
                                            className="action-icon"
                                            title="Copy"
                                            onClick={() =>
                                                item?.url &&
                                                navigator.clipboard.writeText(item?.url ?? "")
                                            }
                                        />
                                        {role === "admin" && (
                                            <FiEdit
                                                className="action-icon"
                                                title="Edit"
                                                onClick={() => handleEdit(item)}
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-items">
                                    No items found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Popup for Add/Edit */}
            {showModal && role === "admin" && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{editingId ? "Edit Item" : "Add New Item"}</h3>
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter Title"
                            value={formData?.title}
                            onChange={handleChange}
                        />
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Enter Description"
                            value={formData?.description}
                            onChange={handleChange}
                        />
                        <label>URL</label>
                        <input
                            type="text"
                            name="url"
                            placeholder="Enter URL"
                            value={formData?.url}
                            onChange={handleChange}
                        />
                        <div className="modal-actions">
                            <button className="save-btn" onClick={handleSubmit}>
                                {editingId ? "Update" : "Save"}
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                    setFormData({ title: "", description: "", url: "" });
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 👇 Video Popup Modal */}
            {videoUrl && (
                <div className="modal-overlay" onClick={() => setVideoUrl("")}>
                    <div className="modal video-modal" onClick={(e) => e.stopPropagation()}>
                        <iframe
                            width="100%"
                            height="400"
                            src={
                                videoUrl.includes("youtu.be")
                                    ? `https://www.youtube.com/embed/${videoUrl.split("/").pop()}`
                                    : videoUrl.replace("watch?v=", "embed/")
                            }
                            title="Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>

                        <button className="cancel-btn" onClick={() => setVideoUrl("")}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
