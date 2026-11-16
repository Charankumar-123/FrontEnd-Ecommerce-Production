/**
 * locationService.js
 * Handles real-time browser GPS location detection, reverse geocoding,
 * and manual delivery address persistence in localStorage.
 */

const STORAGE_KEY = "userDeliveryAddress";
const EVENT_NAME = "userDeliveryAddressChanged";

const DEFAULT_ADDRESS = {
  name: "Default Customer",
  phone: "9876543210",
  houseNo: "Flat 402, Green Avenue",
  street: "Tech Park Main Road, Whitefield",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560066",
  latitude: 12.9716,
  longitude: 77.5946,
  isLive: false,
  formattedAddress: "Flat 402, Green Avenue, Tech Park Main Road, Whitefield, Bengaluru, Karnataka - 560066",
};

/**
 * Returns current stored delivery address or default fallback.
 */
export const getStoredDeliveryAddress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading stored delivery address:", e);
  }
  return DEFAULT_ADDRESS;
};

/**
 * Saves a manually entered delivery address.
 */
export const saveManualDeliveryAddress = (addressObj) => {
  const formattedAddress = [
    addressObj.houseNo,
    addressObj.street,
    addressObj.city,
    addressObj.state ? `${addressObj.state} - ${addressObj.pincode || ""}` : addressObj.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const complete = {
    ...DEFAULT_ADDRESS,
    ...addressObj,
    isLive: false,
    formattedAddress: formattedAddress || addressObj.formattedAddress || "Custom Address",
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complete));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: complete }));
  } catch (e) {
    console.error("Error saving manual delivery address:", e);
  }

  return complete;
};

/**
 * Reverse geocodes coordinates (latitude, longitude) into a structured address.
 * Uses OpenStreetMap Nominatim with BigDataCloud fallback.
 */
const reverseGeocode = async (latitude, longitude) => {
  // 1. Try OpenStreetMap Nominatim
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.state_district ||
        "Local Area";
      const state = addr.state || "";
      const pincode = addr.postcode || "";
      const street = [addr.road, addr.suburb, addr.neighbourhood]
        .filter(Boolean)
        .join(", ");

      return {
        city,
        state,
        pincode,
        street: street || data.name || "Live Detected Location",
        formattedAddress: data.display_name || `${city}, ${state} ${pincode}`,
      };
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode failed, trying fallback:", err);
  }

  // 2. Fallback to BigDataCloud client API (free, no key required)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (bdcRes.ok) {
      const bdcData = await bdcRes.json();
      const city = bdcData.city || bdcData.locality || "Current City";
      const state = bdcData.principalSubdivision || "";
      const pincode = bdcData.postcode || "";
      return {
        city,
        state,
        pincode,
        street: bdcData.localityInfo?.administrative?.[2]?.name || "Current Area",
        formattedAddress: `${city}, ${state} ${pincode}`.trim(),
      };
    }
  } catch (err) {
    console.warn("BigDataCloud reverse geocode failed:", err);
  }

  // 3. Fallback to raw coordinate string if APIs are unreachable
  return {
    city: "GPS Location",
    state: "",
    pincode: "",
    street: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
    formattedAddress: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
  };
};

/**
 * Triggers browser GPS detection and reverse geocoding.
 * Returns a Promise that resolves with the structured address.
 */
export const detectLiveLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          const geocoded = await reverseGeocode(latitude, longitude);
          const currentStored = getStoredDeliveryAddress();

          const liveAddress = {
            name: currentStored.name || "Customer",
            phone: currentStored.phone || "",
            houseNo: "Live Location",
            street: geocoded.street,
            city: geocoded.city,
            state: geocoded.state,
            pincode: geocoded.pincode,
            latitude,
            longitude,
            accuracy,
            isLive: true,
            formattedAddress: geocoded.formattedAddress,
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify(liveAddress));
          window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: liveAddress }));
          resolve(liveAddress);
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        let errorMsg = "Could not detect location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location permission denied. Please allow location access in your browser settings or enter your address manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location signal unavailable. Please enter your address manually.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Location request timed out. Please try again or enter your address manually.";
        }
        reject(new Error(errorMsg));
      },
      options
    );
  });
};

export { EVENT_NAME };

