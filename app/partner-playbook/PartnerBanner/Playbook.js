"use client";
import React, { useState } from "react";
import "./playbook.css";

export default function PartnerPlaybook() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div className="partner-playbook">
      <div className="left-section">
        <span className="badge">Partner Exclusive</span>
        <h1>Introducing Partner Playbook</h1>
        <p className="subtitle">
          Discover, Learn, Grow: A complete guide to succeed as a KR Customizer Partner.
        </p>

        <div className="info">
          <div>
            <h3>What is it?</h3>
            <p>
              The Partner Playbook is your one-stop shop for starting as a Partner,
              expanding your business, and managing issues effortlessly.
            </p>
          </div>
          <div>
            <h3>How does it help?</h3>
            <p>
              Find assets to build convincing sales presentations, streamline client onboarding,
              and offer exceptional service.
            </p>
          </div>
        </div>
      </div>

      <div className="right-section">
        <div className="video-card" onClick={openModal}>
          <img
            src="https://dashboard-assets.razorpay.com/dashboard/core-bundles/payments-dashboard/static/introduction-poster.491d8f292580adc2.svg"
            alt="Play Video"
            className="video-thumbnail"
          />
          <button className="play-btn">▶</button>
          <div className="tags">
            <span className="tag">KYC process</span>
            <span className="tag">Pitch decks</span>
            <span className="tag">Support</span>
          </div>
          <p className="watch-text">
            Watch this video<br />
            Learn how to unlock your business potential as a KR Customizer Partner
          </p>
        </div>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeModal}>
              ✖
            </button>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Qz-fMS4a_bA?autoplay=1"
              title="Partner Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}
