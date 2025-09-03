"use client";
import React, { useEffect, useState } from "react";
import Partner from "../Partner";
import { useParams } from "next/navigation";

export default function PartnerPage() {
  const params = useParams();
  const { id } = params;
  const [partner, setPartner] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPartnerAndStores() {
      setLoading(true);
      setError("");
      let partnerData = null;
      let storeData = [];
      try {
        const token = localStorage.getItem("user_token");
        // Fetch partner info
        const partnerRes = await fetch(`https://partnerback.kdscrm.com/partner/getPartner/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const partnerJson = await partnerRes.json();
        if (partnerRes.ok && partnerJson.success) {
          partnerData = partnerJson.data;
        } else {
          setError(partnerJson.message || "Failed to fetch partner data");
        }
        // Fetch partner stores
        const storeRes = await fetch(`https://partnerback.kdscrm.com/partner-store/partner/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const storeJson = await storeRes.json();
        if (storeRes.ok && storeJson.success) {
          storeData = Array.isArray(storeJson.data) ? storeJson.data : [];
        } else {
          setError(storeJson.message || "Failed to fetch store data");
        }
        setPartner(partnerData);
        setStores(storeData);
      } catch (err) {
        setError("Network error");
      }
      setLoading(false);
    }
    if (id) fetchPartnerAndStores();
  }, [id]);

  if (loading) return <div className="affiliate-container">Loading...</div>;
  if (error) return <div className="affiliate-container">{error}</div>;
  return <Partner partner={partner} stores={stores} />;
}
