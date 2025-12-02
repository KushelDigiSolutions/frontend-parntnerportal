"use client";
import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import "./editprofile.css";

export default function ProfilePage() {
    const [userData, setUserData] = useState(null);
    const [profilePic, setProfilePic] = useState(null);
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [error, setError] = useState("");
    const [role, setRole] = useState("partner");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPasswordUpdateEnabled, setIsPasswordUpdateEnabled] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [profile, setProfile] = useState({
        id: userData?.id,
        name: "",
        email: "",
        mobilePhone: "",
        organization: "",
        country: "",
        city: "",
        description: "",
        password: "",
        confirmPassword: "",
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
                    `https://partnerback.krcustomizer.com/partner/getPartner/${userData?.id}`,
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

    const handleFileChange = async (e) => {
        const file = e?.target?.files?.[0];
        if (file) {
            // Show preview immediately
            const previewUrl = URL.createObjectURL(file);
            setProfilePic(previewUrl);

            // Upload image immediately
            const uploadedUrl = await uploadProfileImage(file);
            if (uploadedUrl) {
                setProfilePicFile(uploadedUrl); // Store the uploaded URL instead of file
                setProfilePic(uploadedUrl); // Update preview to actual uploaded image

                // Update localStorage immediately
                const updatedUserData = { ...userData, profileImage: uploadedUrl };
                localStorage.setItem("user_data", JSON.stringify(updatedUserData));
                setUserData(updatedUserData);

                alert("Profile image uploaded successfully!");
            } else {
                // Revert to original image if upload failed
                setProfilePic(userData?.profileImage || null);
            }
        }
    };

    const uploadProfileImage = async (file) => {
        if (!file) return null;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem("user_token");
            const res = await fetch('https://partnerback.krcustomizer.com/upload-image', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const json = await res.json();

            if (res.ok && json?.status) {
                return json?.data; // Return the secure_url
            } else {
                throw new Error(json?.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image: ' + error.message);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handlePasswordUpdateToggle = () => {
        if (isPasswordUpdateEnabled) {
            // If disabling, ask for confirmation
            const confirmDisable = window.confirm("Are you sure you want to cancel password update?");
            if (confirmDisable) {
                setIsPasswordUpdateEnabled(false);
                setProfile(prev => ({
                    ...prev,
                    password: "",
                    confirmPassword: "",
                }));
            }
        } else {
            // If enabling, ask for confirmation
            const confirmEnable = window.confirm("Do you want to update your password?");
            if (confirmEnable) {
                setIsPasswordUpdateEnabled(true);
            }
        }
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
            password: "",
            confirmPassword: "",
        }));
        setProfilePic(userData?.profileImage || null);
        setProfilePicFile(null);
        setIsPasswordUpdateEnabled(false);

        // Clear any temporary preview URLs
        const currentPreviewUrl = profilePic;
        if (currentPreviewUrl && currentPreviewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(currentPreviewUrl);
        }
    };

    const validatePasswordFields = () => {
        if (isPasswordUpdateEnabled) {
            if (!profile.password) {
                alert("Please enter new password");
                return false;
            }
            if (!profile.confirmPassword) {
                alert("Please enter confirm password");
                return false;
            }
            if (profile.password !== profile.confirmPassword) {
                alert("Password and confirm password do not match");
                return false;
            }
            if (profile.password.length < 6) {
                alert("Password must be at least 6 characters long");
                return false;
            }
        }
        return true;
    };

    // Partner update
    const updatePartnerProfile = async (e) => {
        e.preventDefault();
        if (!userData?.id) return alert("No user ID found.");

        if (!validatePasswordFields()) return;

        try {
            const token = localStorage.getItem("user_token");

            // Prepare payload - exclude password fields if not updating password
            const payload = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                mobilePhone: profile.mobilePhone,
                organization: profile.organization,
                country: profile.country,
                city: profile.city,
                description: profile.description,
            };

            // Add password field only if password update is enabled and passwords match
            if (isPasswordUpdateEnabled && profile.password === profile.confirmPassword) {
                payload.password = profile.password;
            }

            // Add profile image URL if it was uploaded
            if (profilePicFile && typeof profilePicFile === 'string') {
                payload.profileImage = profilePicFile; // Use profileImage as per your DB schema
            }

            const res = await fetch(`https://partnerback.krcustomizer.com/partner/updateProfile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (res.ok && json?.success) {
                alert("Profile updated successfully!");

                // Reset password fields after successful update
                if (isPasswordUpdateEnabled) {
                    setProfile(prev => ({
                        ...prev,
                        password: "",
                        confirmPassword: "",
                    }));
                    setIsPasswordUpdateEnabled(false);
                }

                // Reset file selection
                setProfilePicFile(null);
            } else {
                alert(json?.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("Network error");
        }
    };

    // Admin update
    const updateAdminProfile = async (e) => {
        e.preventDefault();
        if (!userData?.id) return alert("No user ID found.");

        if (!validatePasswordFields()) return;

        try {
            const token = localStorage.getItem("user_token");

            // Prepare payload - exclude password fields if not updating password
            const payload = {
                name: profile.name,
                email: profile.email,
            };

            // Add password field only if password update is enabled and passwords match
            if (isPasswordUpdateEnabled && profile.password === profile.confirmPassword) {
                payload.password = profile.password;
            }

            // Add profile image URL if it was uploaded
            if (profilePicFile && typeof profilePicFile === 'string') {
                payload.profileImage = profilePicFile;
            }

            const res = await fetch(`https://partnerback.krcustomizer.com/admin/update/${userData?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (res.ok && json?.success) {
                alert("Profile updated successfully!");

                // Reset password fields after successful update
                if (isPasswordUpdateEnabled) {
                    setProfile(prev => ({
                        ...prev,
                        password: "",
                        confirmPassword: "",
                    }));
                    setIsPasswordUpdateEnabled(false);
                }

                // Reset file selection
                setProfilePicFile(null);
            } else {
                alert(json?.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
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
                        <input type="file" id="upload" accept="image/*" onChange={handleFileChange} />
                        <label htmlFor="upload" className="upload-btn flex items-center gap-2">
                            <FiUpload size={16} />
                            {isUploading ? 'Uploading...' : 'Upload Photo'}
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

                        {/* Password Update Section */}
                        <div className="form-row">
                            <div className="form-col">
                                <div className="password-update-toggle">
                                    <p>Do You Want to update Password</p>
                                    <button
                                        type="button"
                                        className={`toggle-btn ${isPasswordUpdateEnabled ? 'active' : ''}`}
                                        onClick={handlePasswordUpdateToggle}
                                    >
                                        {isPasswordUpdateEnabled ? 'Cancel Password Update' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {isPasswordUpdateEnabled && (
                            <div className="form-row two-col">
                                <div className="form-col password-wrapper">
                                    <label>New Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={profile?.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-col password-wrapper">
                                    <label>Confirm Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={profile?.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FiEye size={18} /> : <FiEyeOff size={18} />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    onChange={handleChange}
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

                        <div className="form-row">
                            <div className="form-col">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={profile?.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password Update Section */}
                        <div className="form-row flex">
                            <div className="form-col">
                                <p className="text-lg font-medium">
                                    {isPasswordUpdateEnabled ? "No" : "Do You Want to update Password?"}
                                </p>
                            </div>
                            <div className="form-col flex ">
                                <button
                                    type="button"
                                    className={`toggle-btn ${isPasswordUpdateEnabled ? "active" : ""} px-4 py-2 bg-blue-500 text-white rounded-full transition-all duration-300 hover:bg-blue-600`}
                                    onClick={handlePasswordUpdateToggle}
                                >
                                    {isPasswordUpdateEnabled ? "Cancel Password Update" : "Yes"}
                                </button>
                            </div>
                        </div>

                        {isPasswordUpdateEnabled && (
                            <div className="form-row two-col">
                                <div className="form-col password-wrapper">
                                    <label>New Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={profile?.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                        </span>
                                    </div>
                                </div>
                                <div className="form-col password-wrapper">
                                    <label>Confirm Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={profile?.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                        />
                                        <span
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
                    <button
                        type="submit"
                        className={`save-btn ${isPasswordUpdateEnabled ? 'password-update-active' : ''}`}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Saving...' : 'Save changes'}
                        {isPasswordUpdateEnabled && <span className="update-indicator">🔒</span>}
                    </button>
                </div>
            </form>
        </div>
    );
}