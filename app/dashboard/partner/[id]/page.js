"use client";
import React, { useEffect, useState } from "react";
import Partner from "../Partner";
import { useParams } from "next/navigation";

export default function PartnerPage() {
  const params = useParams();
  const { id } = params;
  const [partner, setPartner] = useState(null);
  const [stores, setStores] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function fetchPartnerAndStores() {
    setLoading(true);
    setError("");
    let partnerData = null;
    let storeData = [];
    try {
      const token = localStorage.getItem("user_token");
      // Fetch partner info
      const partnerRes = await fetch(`https://partnerback.krcustomizer.com/partner/getPartner/${id}`, {
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
      const storeRes = await fetch(`https://partnerback.krcustomizer.com/partner-store/partner/${id}`, {
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
  useEffect(() => {

    if (id) fetchPartnerAndStores();
  }, [id]);

  // Handler for creating a store (called from Partner.js)
  async function handleAddStore(formData, resetForm, closeModal) {
    setAddLoading(true);
    // Calculate earning
    const commissionNum = parseFloat(formData.commission);
    const totalValueNum = parseFloat(formData.total_value);
    const earning = ((commissionNum / 100) * totalValueNum).toFixed(2);
    const payload = {
      partner_id: partner?.id,
      store_owner:formData?.store_owner,
      store_name: formData.store_name,
      platform: formData.platform,
      total_value: totalValueNum,
      earning: parseFloat(earning),
    };
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("https://partnerback.krcustomizer.com/partner-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // After successful creation, re-fetch partner and stores
        await fetchPartnerAndStores();
        if (resetForm) resetForm();
        if (closeModal) closeModal();
      } else {
        alert(data.message || "Failed to create store");
      }
    } catch (err) {
      alert("Network error");
    }
    setAddLoading(false);
  }

  async function handleUpdateStore(storeId, formData, resetForm, closeModal) {
    // Convert values to numbers
    const totalValueNum = parseFloat(formData.total_value) || 0;
    const commissionNum = parseFloat(formData.commission) || 0;

    // Calculate earning (commission % of total value)
    const earning = (totalValueNum * commissionNum) / 100;

    const payload = {
      store_name: formData.store_name,
      store_owner: formData.store_owner,
      platform: formData.platform,
      total_value: totalValueNum,
      // commission: commissionNum,
      earning: earning,
    };

    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch(`https://partnerback.krcustomizer.com/partner-store/${storeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const storeRes = await fetch(
          `https://partnerback.krcustomizer.com/partner-store/partner/${partner.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const storeJson = await storeRes.json();
        if (storeRes.ok && storeJson.success) {
          setStores(storeJson.data);
        } else {
          console.error("Failed to refresh stores:", storeJson.message);
        }
        if (resetForm) resetForm();
        if (closeModal) closeModal();
      } else {
        alert(data.message || "Failed to update store");
      }
    } catch (err) {
      alert("Network error");
    }
  }

  const updateStatus = async (storeId, status, reason = null) => {
    try {
      const token = localStorage.getItem("user_token");

      const requestBody = { status };
      if (status === "inactive" && reason) {
        requestBody.inactive_reason = reason;
      }

      const res = await fetch(`https://partnerback.krcustomizer.com/partner-store/${storeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        console.log("Status updated:", data.message || "Success");

        // ✅ Refresh all stores for the partner
        const storeRes = await fetch(
          `https://partnerback.krcustomizer.com/partner-store/partner/${partner.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const storeJson = await storeRes.json();
        if (storeRes.ok && storeJson.success) {
          setStores(storeJson.data);
        } else {
          console.error("Failed to refresh stores:", storeJson.message);
        }
      } else {
        console.error("Update failed:", data.message || "Something went wrong");
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error, please try again.");
    }
  };



  if (loading) return <div className="affiliate-container">Loading...</div>;
  // if (error) return <div className="affiliate-container">{error}</div>;
  return <Partner
    partner={partner}
    stores={stores}
    onAddStore={handleAddStore}
    onUpdateStore={handleUpdateStore}
    addLoading={addLoading}
    onUpdateStatus={updateStatus}
  />;
}
