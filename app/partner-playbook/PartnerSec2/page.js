"use client";
import React from "react";
import "./partnersec.css";
import { FaYoutube } from "react-icons/fa";
import { FiCopy, FiEye } from "react-icons/fi";

export default function PartnerDashboard() {
    const getStartedItems = [
        {
            title: "Welcome",
            description: "4 steps to succeed as a Partner",
        },
        {
            title: "Add/Onboard Clients",
            description: "Learn how to add your clients to KR Customizer as your referral",
        },
        {
            title: "Complete Your KYC",
            description:
                "Post adding a referral, complete KYC for your Partner account and become eligible for Partner rewards",
        },
        {
            title: "Activate Client Account",
            description:
                "Steps to help you perform KYC for your client's account",
        },
        {
            title: "Claim Your Commission",
            description:
                "Learn how to settle your partner commission with utmost ease",
        },
        {
            title: "Ask For Help",
            description: "Steps to raise support ticket for any query",
        },
    ];

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

            {/* Tabs */}
            <div className="tabs">
                {/* <span className="active">Get Started</span> */}
                {/* <span>Grow Your Business</span>
        <span>Help & Support</span> */}
            </div>

            {/* Get Started Section */}
            <div className="section">
                <h2>
                    <span className="check-icon">✔</span> Get Started{" "}
                    <span className="badge1">6 items</span>
                </h2>
                <p className="section-desc">
                    Steps and processes to begin your journey as a KR Customizer partner
                </p>

                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getStartedItems.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <FaYoutube className="youtube-icon" /> {item.title}
                                </td>
                                <td>{item.description}</td>
                                <td>
                                    <FiEye className="action-icon" />
                                    <FiCopy className="action-icon" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Grow Your Business Section */}
            {/* <div className="section">
                <h2>
                    📈 Grow Your Business <span className="badge1">14 items</span>
                </h2>
                <p className="section-desc">
                    Read to use sales and marketing collaterals to empower you to get more
                    clients as a KR Customizer partner
                </p>

                <div className="card">
                    <span className="folder-icon">📂</span>
                    <div>
                        <h3>Marketing Assets</h3>
                        <p>
                            Promote yourself as a KR Customizer partner with capabilities to help
                            clients with their payments and beyond
                        </p>
                    </div>
                    <div className="card-footer">
                        <span>2 items</span>
                        <a href="#">View all</a>
                    </div>
                </div>
                <div className="card">
                    <span className="folder-icon">📂</span>
                    <div>
                        <h3>Marketing Assets</h3>
                        <p>
                            Promote yourself as a KR Customizer partner with capabilities to help
                            clients with their payments and beyond
                        </p>
                    </div>
                    <div className="card-footer">
                        <span>2 items</span>
                        <a href="#">View all</a>
                    </div>
                </div>
                <div className="card">
                    <span className="folder-icon">📂</span>
                    <div>
                        <h3>Marketing Assets</h3>
                        <p>
                            Promote yourself as a KR Customizer partner with capabilities to help
                            clients with their payments and beyond
                        </p>
                    </div>
                    <div className="card-footer">
                        <span>2 items</span>
                        <a href="#">View all</a>
                    </div>
                </div>
                <div className="card">
                    <span className="folder-icon">📂</span>
                    <div>
                        <h3>Marketing Assets</h3>
                        <p>
                            Promote yourself as a KR Customizer partner with capabilities to help
                            clients with their payments and beyond
                        </p>
                    </div>
                    <div className="card-footer">
                        <span>2 items</span>
                        <a href="#">View all</a>
                    </div>
                </div>
            </div> */}

           
        </div>
    );
}
