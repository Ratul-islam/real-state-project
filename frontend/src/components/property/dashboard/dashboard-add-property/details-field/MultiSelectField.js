"use client";
import React, { useEffect, useState } from "react";
import Select from "react-select";

const options = {
  floorNo: ["1st", "2nd", "3rd", "4th"],
  energyClass: ["All Listing", "Active", "Sold", "Processing"],
  energyIndex: ["All Cities", "Pending", "Processing", "Published"],
};

const customStyles = {
  option: (styles, { isFocused, isSelected }) => ({
    ...styles,
    backgroundColor: isSelected
      ? "#eb6753"
      : isFocused
      ? "#eb675312"
      : undefined,
  }),
};

const MultiSelectField = () => {
  const [showSelect, setShowSelect] = useState(false);
  const [floorNo, setFloorNo] = useState("");

  useEffect(() => {
    setShowSelect(true);
  }, []);

  const fieldTitles = ["Floors no", "Energy Class", "Energy index in kWh/m2a"];

  return (
    <>
      {Object.keys(options).map((key, index) => (
        <div className="col-sm-6 col-xl-4" key={index}>
          <div className="mb20">
            <label className="heading-color ff-heading fw600 mb10">
              {fieldTitles[index]}
            </label>

            <div className="location-area">
              {key === "floorNo" ? (
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter floor number"
                  value={floorNo}
                  onChange={(e) => setFloorNo(e.target.value)}
                  required
                />
              ) : (
                showSelect && (
                  <Select
                    styles={customStyles}
                    className="select-custom pl-0"
                    classNamePrefix="select"
                    isMulti
                    required
                    options={options[key].map((item) => ({
                      value: item,
                      label: item,
                    }))}
                  />
                )
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default MultiSelectField;