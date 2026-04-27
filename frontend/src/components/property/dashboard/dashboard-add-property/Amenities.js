import React, { useEffect, useMemo } from "react";
const amenitiesData = {
  column1: [
    { label: "Air Conditioning" },
    { label: "Heating" },
    { label: "WiFi" },
    { label: "TV Cable" },
    { label: "Intercom" },
    { label: "Electricity Backup" },
    { label: "Gas Line" },
    { label: "Water Supply" },
  ],

  column2: [
    { label: "Refrigerator" },
    { label: "Microwave" },
    { label: "Oven" },
    { label: "Dishwasher" },
    { label: "Washer" },
    { label: "Dryer" },
    { label: "Laundry Room" },
    { label: "Laundry Service" },
  ],

  column3: [
    { label: "Swimming Pool" },
    { label: "Gym" },
    { label: "Sauna" },
    { label: "Spa / Jacuzzi" },
    { label: "Yoga Room" },
    { label: "Community Hall" },
    { label: "Playground" },
    { label: "Garden / Lawn" },
  ],

  column4: [
    { label: "Parking" },
    { label: "Garage" },
    { label: "Visitor Parking" },
    { label: "Elevator / Lift" },
    { label: "Wheelchair Accessible" },
    { label: "Storage Room" },
    { label: "Basement" },
    { label: "Attic" },
  ],

  column5: [
    { label: "Security Guard" },
    { label: "CCTV Surveillance" },
    { label: "Fire Alarm" },
    { label: "Fire Exit" },
    { label: "Smoke Detector" },
    { label: "Gated Community" },
    { label: "Doorman" },
    { label: "Concierge" },
  ],

  column6: [
    { label: "Balcony" },
    { label: "Terrace" },
    { label: "Rooftop Access" },
    { label: "Front Yard" },
    { label: "Backyard" },
    { label: "BBQ Area" },
    { label: "Outdoor Shower" },
    { label: "Private Space" },
  ],

  column7: [
    { label: "Lake View" },
    { label: "Sea View" },
    { label: "City View" },
    { label: "Park View" },
    { label: "Garden View" },
    { label: "Corner Plot" },
    { label: "South Facing" },
    { label: "North Facing" },
  ],

  column8: [
    { label: "Pet Friendly" },
    { label: "Furnished" },
    { label: "Semi-Furnished" },
    { label: "Unfurnished" },
    { label: "Serviced Apartment" },
    { label: "Smart Home Features" },
    { label: "Solar Panels" },
    { label: "EV Charging" },
  ],
};

const flattenAmenities = (data) =>
  Object.values(data).flat().map((a) => a.label);

const Amenities = ({ value, onChange, errors = {}, touched = false, disabled = false }) => {
  const allAmenityLabels = useMemo(() => flattenAmenities(amenitiesData), []);

  const features = Array.isArray(value?.features) ? value.features : [];
  const tags = Array.isArray(value?.tags) ? value.tags : [];

  // Optional: apply defaults only if creating and features are empty
  useEffect(() => {
    if (features.length) return;

    const defaults = allAmenityLabels.filter((label) => {
      const item = Object.values(amenitiesData).flat().find((x) => x.label === label);
      return Boolean(item?.defaultChecked);
    });

    if (defaults.length) {
      onChange?.({ features: defaults });
    }
  }, [allAmenityLabels]);

  const toggleFeature = (label) => {
    const set = new Set(features);
    if (set.has(label)) set.delete(label);
    else set.add(label);

    onChange?.({ features: Array.from(set) });
  };

  const isChecked = (label) => features.includes(label);

  // Simple comma-separated tags input (optional)
  const handleTagsChange = (e) => {
    const next = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onChange?.({ tags: next });
  };

  return (
    <div className="row">
      {Object.keys(amenitiesData).map((columnKey, index) => (
        <div key={columnKey} className="col-sm-6 col-lg-3 col-xxl-2">
          <div className="checkbox-style1">
            {amenitiesData[columnKey].map((amenity) => (
              <label key={amenity.label} className="custom_checkbox">
                {amenity.label}
                <input
                  type="checkbox"
                  checked={isChecked(amenity.label)}
                  onChange={() => toggleFeature(amenity.label)}
                  disabled={disabled}
                />
                <span className="checkmark" />
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* Optional tags */}
      <div className="col-12 mt-3">
        <label className="form-label fw600">Tags (comma separated)</label>
        <input
          type="text"
          className="form-control"
          value={tags.join(", ")}
          onChange={handleTagsChange}
          disabled={disabled}
          placeholder="e.g. family, city-center, renovated"
        />
        {touched && errors?.tags && (
          <div className="text-danger mt-1" style={{ fontSize: 13 }}>
            {errors.tags}
          </div>
        )}
      </div>

      {touched && errors?.features && (
        <div className="col-12">
          <div className="text-danger mt-2" style={{ fontSize: 13 }}>
            {errors.features}
          </div>
        </div>
      )}
    </div>
  );
};

export default Amenities;
