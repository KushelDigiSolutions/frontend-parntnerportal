"use client";
import React from "react";
import "./growbanner.css";
import { FaFolder } from "react-icons/fa";

export default function GrowBusiness() {
  const businessItems = [
    {
      title: "Marketing Assets",
      description:
        "Promote yourself as a KR Customizer partner with capabilities to help clients with their payments and beyond",
      count: "2 items",
    },
    {
      title: "Prospecting and Closing",
      description:
        "Portray yourself as an expert at payments by identifying client needs and objections",
      count: "2 items",
    },
    {
      title: "Pitch decks",
      description:
        "Make compelling sales presentations using industry specific partner decks",
      count: "1 item",
    },
    {
      title: "Product Brochures",
      description:
        "Let your clients see the detailed features of different KR Customizer products and choose what fits their business needs",
      count: "5 items",
    },
    {
      title: "Product Videos",
      description:
        "Help your clients better visualize KR Customizer products and their benefits",
      count: "4 items",
    },
  ];

  return (
    <div className="business-container">
      {/* Grow Business Section */}
      <div className="section">
        <h2>
          📈 Grow Your Business <span className="badge1">14 items</span>
        </h2>
        <p className="section-desc">
          Read to use sales and marketing collaterals to empower you to get more
          clients as a KR Customizer partner
        </p>

        <div className="list-container">
          {businessItems.map((item, index) => (
            <div className="list-card" key={index}>
              <FaFolder className="folder-icon" />
              <div className="list-info">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="list-footer">
                <span>{item.count}</span>
                <a href="#">View all</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
