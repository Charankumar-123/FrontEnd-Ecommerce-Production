import React, { useState, useEffect } from "react";
import {
  getStoredDeliveryAddress,
  saveManualDeliveryAddress,
  detectLiveLocation,
} from "../../../Services/locationService";
import "./LocationModal.css";

const LocationModal = ({ isOpen, onClose, onLocationSelected }) => {
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'manual'
  const [currentAddress, setCurrentAddress] = useState(getStoredDeliveryAddress());
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState("");
  const [detectionSuccess, setDetectionSuccess] = useState(false);

  // Manual Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredDeliveryAddress();
      setCurrentAddress(stored);
      setFormData({
        name: stored.name || "",
        phone: stored.phone || "",
        houseNo: stored.houseNo || "",
        street: stored.street || "",
        city: stored.city || "",
        state: stored.state || "",
        pincode: stored.pincode || "",
      });
      setDetectionError("");
      setDetectionSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDetectLive = async () => {
    setIsDetecting(true);
    setDetectionError("");
    setDetectionSuccess(false);

    try {
      const liveAddr = await detectLiveLocation();
      setCurrentAddress(liveAddr);
      setDetectionSuccess(true);
      if (onLocationSelected) {
        onLocationSelected(liveAddr);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setDetectionError(err.message || "Failed to detect live location.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveManual = (e) => {
    e.preventDefault();
    if (!formData.city || !formData.pincode) {
      alert("Please provide at least City and Pincode.");
      return;
    }

    const saved = saveManualDeliveryAddress(formData);
    setCurrentAddress(saved);
    if (onLocationSelected) {
      onLocationSelected(saved);
    }
    onClose();
  };

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="location-modal-header">
          <div className="header-title-row">
            <span className="location-pin-icon">📍</span>
            <h3>Choose Delivery Location</h3>
          </div>
          <button className="location-modal-close" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        <p className="location-modal-subtitle">
          Select your delivery location to see accurate product availability, delivery times, and nearest warehouse dispatch.
        </p>

        {/* Tab Switcher */}
        <div className="location-tabs">
          <button
            className={`location-tab-btn ${activeTab === "live" ? "active" : ""}`}
            onClick={() => setActiveTab("live")}
          >
            🎯 Live GPS Location
          </button>
          <button
            className={`location-tab-btn ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            ✏️ Enter Manually
          </button>
        </div>

        {/* Current Active Location Pill */}
        <div className="current-location-preview">
          <span className="preview-label">Current Selection:</span>
          <div className="preview-details">
            <strong>
              {currentAddress.city} - {currentAddress.pincode}
            </strong>
            <p>{currentAddress.formattedAddress || currentAddress.street}</p>
            {currentAddress.isLive && (
              <span className="live-gps-badge">🛰️ Live GPS Coordinates Attached</span>
            )}
          </div>
        </div>

        {/* Tab 1: Live GPS Detection */}
        {activeTab === "live" && (
          <div className="tab-content live-tab-content">
            <div className="live-gps-action-box">
              <div className="gps-icon-halo">📡</div>
              <h4>Detect Real-Time Location</h4>
              <p>
                Click below to allow your browser to pinpoint your live location using GPS for the fastest, most accurate delivery routing.
              </p>

              <button
                className="detect-gps-btn"
                onClick={handleDetectLive}
                disabled={isDetecting}
              >
                {isDetecting ? (
                  <>
                    <span className="btn-spinner"></span> Pinpointing Live GPS...
                  </>
                ) : (
                  "🎯 Use My Current Live Location"
                )}
              </button>

              {detectionSuccess && (
                <div className="alert-box success">
                  ✓ Location successfully detected and applied! Closing...
                </div>
              )}

              {detectionError && (
                <div className="alert-box error">
                  <strong>⚠️ Detection issue:</strong> {detectionError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Manual Form Entry */}
        {activeTab === "manual" && (
          <form className="tab-content manual-form-content" onSubmit={handleSaveManual}>
            <div className="form-two-cols">
              <div className="form-group">
                <label>Recipient Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleManualChange}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleManualChange}
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Flat / House No. / Building</label>
              <input
                type="text"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleManualChange}
                placeholder="e.g. Flat 301, Sunrise Heights"
              />
            </div>

            <div className="form-group">
              <label>Street / Area / Landmark</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleManualChange}
                placeholder="e.g. Outer Ring Road, Near Metro Station"
              />
            </div>

            <div className="form-three-cols">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleManualChange}
                  placeholder="e.g. Bengaluru"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleManualChange}
                  placeholder="e.g. Karnataka"
                />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleManualChange}
                  placeholder="e.g. 560066"
                />
              </div>
            </div>

            <div className="manual-form-actions">
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="save-address-btn">
                💾 Save & Apply Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LocationModal;

