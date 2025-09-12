"use client";
import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import "./editprofile.css";

export default function ProfilePage() {
    const [userData, setUserData] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [error, setError] = useState("");
    const [role, setRole] = useState("partner");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [profile, setProfile] = useState({
        id: userData?.id,
        name: "",
        email: "",
        mobilePhone: "",
        organization: "",
        country: "",
        city: "",
        description: "",
        currentPassword: "",
        newPassword: "",
    });

    // Fetch user data from localStorage
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user_data"));
        if (storedUser) {
            setUserData(storedUser);
            setRole(storedUser?.role || "partner");
            setProfilePic(storedUser?.profileImage || null);
            setProfile(prev => ({
                ...prev,
                id: storedUser?.id,
                name: storedUser?.name || "",
                email: storedUser?.email || "",
            }));
        }
    }, []);

    // Fetch full profile for partner
    useEffect(() => {
        if (!userData || role !== "partner") return;

        async function fetchPartnerProfile() {
            try {
                const token = localStorage.getItem("user_token");
                const res = await fetch(
                    `https://partnerback.kdscrm.com/partner/getPartner/${userData?.id}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const json = await res.json();

                if (res.ok && json?.success) {
                    setProfile(prev => ({
                        ...prev,
                        name: json?.data?.name || prev?.name,
                        email: json?.data?.email || prev?.email,
                        mobilePhone: json?.data?.mobilePhone || "",
                        organization: json?.data?.organization || "",
                        country: json?.data?.country || "",
                        city: json?.data?.city || "",
                        description: json?.data?.description || "",
                    }));
                    if (json?.data?.profilePic) setProfilePic(json?.data?.profilePic);
                } else {
                    setError(json?.message || "Failed to fetch profile");
                }
            } catch (err) {
                setError("Network error");
            }
        }

        fetchPartnerProfile();
    }, [userData, role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e?.target?.files?.[0];
        if (file) setProfilePic(URL.createObjectURL(file));
    };

    const handleCancel = () => {
        if (!userData) return;
        setProfile(prev => ({
            ...prev,
            name: userData?.name || "",
            email: userData?.email || "",
            mobilePhone: "",
            organization: "",
            country: "",
            city: "",
            description: "",
            currentPassword: "",
            newPassword: "",
        }));
        setProfilePic(userData?.profileImage || null);
    };

    // Partner update
    const updatePartnerProfile = async (e) => {
        e.preventDefault();
        if (!userData?.id) return alert("No user ID found.");

        try {
            const token = localStorage.getItem("user_token");

            // 🔑 filter password fields
            const payload = { ...profile };
            if (!payload.currentPassword) delete payload.currentPassword;
            if (!payload.newPassword) delete payload.newPassword;

            const res = await fetch(`https://partnerback.kdscrm.com/partner/updateProfile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (res.ok && json?.success) alert("Profile updated successfully!");
            else alert(json?.message || "Failed to update profile");
        } catch {
            alert("Network error");
        }
    };

    // Admin update
    const updateAdminProfile = async (e) => {
        e.preventDefault();
        if (!userData?.id) return alert("No user ID found.");

        try {
            const token = localStorage.getItem("user_token");

            // 🔑 filter password fields
            const payload = { ...profile };
            if (!payload.currentPassword) delete payload.currentPassword;
            if (!payload.newPassword) delete payload.newPassword;

            const res = await fetch(`https://partnerback.kdscrm.com/admin/update/${userData?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (res.ok && json?.success) alert("Profile updated successfully!");
            else alert(json?.message || "Failed to update profile");
        } catch {
            alert("Network error");
        }
    };


    const handleSubmit = role === "admin" ? updateAdminProfile : updatePartnerProfile;

    return (
        <div className="profile-container">
            <h2 className="profile-title">Edit Profile</h2>
            <p className="profile-subtitle">Manage your profile and account settings.</p>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form className="profile-form" onSubmit={handleSubmit} autoComplete="off">
                {/* Profile Photo */}
                <div className="form-profile">
                    <label className="font-bold">Profile photo</label>
                    <div className="profile-photo">
                        <img
                            src={profilePic || "https://cdn-icons-png.flaticon.com/512/17446/17446833.png"}
                            alt="Profile"
                            className="photo-preview"
                        />
                        <input type="file" id="upload" onChange={handleFileChange} />
                        {/* <label htmlFor="upload" className="upload-btn">Upload Photo</label> */}
                        <label htmlFor="upload" className="upload-btn flex items-center gap-2">
                            <FiUpload size={16} /> Upload Photo
                        </label>
                    </div>
                </div>

                {/* Admin View */}
                {role === "admin" && (
                    <>
                        <div className="form-row two-col">
                            <div className="form-col">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile?.name}
                                    onChange={handleChange}
                                    placeholder="Enter admin name"
                                />
                            </div>
                            <div className="form-col">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile?.email}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-col password-wrapper">
                                <label>Current Password</label>
                                <div className="password-input">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={profile?.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter current password"
                                    />
                                    <span
                                        className="password-toggle"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                    </span>
                                </div>
                            </div>
                            <div className="form-col password-wrapper">
                                <label>New Password</label>
                                <div className="password-input">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={profile?.newPassword}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                    />
                                    <span
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Partner View */}
                {role === "partner" && (
                    <>
                        <div className="form-row two-col">
                            <div className="form-col">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile?.name}
                                />
                            </div>
                            <div className="form-col">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile?.email}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-col">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="mobilePhone"
                                    value={profile?.mobilePhone}
                                    onChange={handleChange}
                                    placeholder="+(xxx)xxx-xx-xx"
                                />
                            </div>
                            <div className="form-col">
                                <label>Company</label>
                                <input
                                    type="text"
                                    name="organization"
                                    value={profile?.organization}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-col">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={profile?.country}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                            <div className="form-col">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile?.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row two-col">
                            <div className="form-col">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={profile?.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-col">
                                <label>Password</label>
                                <div className="two-col flex-1">
                                    <div className="form-col password-wrapper">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            name="currentPassword"
                                            value={profile?.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Enter current password"
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                        </span>
                                    </div>

                                    <div className="form-col password-wrapper">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            value={profile?.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                    <button type="submit" className="save-btn">Save changes</button>
                </div>
            </form>
        </div>
    );
}
