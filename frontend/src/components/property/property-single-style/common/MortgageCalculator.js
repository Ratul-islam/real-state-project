"use client";

import React, { useMemo, useState } from "react";

function parseMoney(v) {
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function parsePercent(v) {
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0";
  return x.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function calcMonthlyPI({ totalAmount, downPayment, annualRatePct, years }) {
  const P = Math.max(0, totalAmount - downPayment);
  const r = Math.max(0, annualRatePct) / 100 / 12;
  const n = Math.max(1, Math.round(years * 12));

  if (r === 0) return P / n;

  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

const MortgageCalculator = ({ property }) => {
  const suggestedTotal = property?.price ? Number(property.price) : 250000;

  const [inputs, setInputs] = useState({
    totalAmount: suggestedTotal,
    downPayment: 0,
    interestRate: 3.5,
    loanYears: 30,
    propertyTax: 0,
    homeInsurance: 0,
  });

  const [submitted, setSubmitted] = useState(false);

  const computed = useMemo(() => {
    const totalAmount = parseMoney(inputs.totalAmount);
    const downPayment = parseMoney(inputs.downPayment);
    const annualRatePct = parsePercent(inputs.interestRate);
    const years = parseMoney(inputs.loanYears) || 1;

    const yearlyTax = parseMoney(inputs.propertyTax);
    const yearlyIns = parseMoney(inputs.homeInsurance);

    const monthlyPI = calcMonthlyPI({
      totalAmount,
      downPayment,
      annualRatePct,
      years,
    });

    const monthlyTax = yearlyTax / 12;
    const monthlyIns = yearlyIns / 12;

    const totalMonthly = monthlyPI + monthlyTax + monthlyIns;

    const pct = (x) => (totalMonthly > 0 ? (x / totalMonthly) * 100 : 0);

    return {
      monthlyPI,
      monthlyTax,
      monthlyIns,
      totalMonthly,
      pctPI: pct(monthlyPI),
      pctTax: pct(monthlyTax),
      pctIns: pct(monthlyIns),
    };
  }, [inputs]);

  const resultItems = useMemo(() => {
    return [
      { label: "Principal and Interest", value: formatUSD(computed.monthlyPI) },
      { label: "Property Taxes", value: formatUSD(computed.monthlyTax) },
      { label: "Homeowners' Insurance", value: formatUSD(computed.monthlyIns) },
    ];
  }, [computed]);

  const onField = (key) => (e) => {
    setInputs((p) => ({ ...p, [key]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const invalid = (key) => {
    if (!submitted) return false;
    const v = inputs[key];
    if (key === "loanYears") return parseMoney(v) <= 0;
    if (key === "interestRate") return parsePercent(v) < 0;
    if (key === "totalAmount") return parseMoney(v) <= 0;
    return false;
  };

  return (
    <>
      <div className="col-md-12">
        <div className="d-flex align-items-center flex-wrap calculator-chart-percent">
          <div
            className="principal-interest-st"
            style={{ width: `${computed.pctPI}%` }}
          />
          <div
            className="property-tax-st"
            style={{ width: `${computed.pctTax}%` }}
          />
          <div
            className="home-insurance-st"
            style={{ width: `${computed.pctIns}%` }}
          />
        </div>

        <ul className="list-result-calculator d-md-flex flex-wrap justify-content-between bdrb1 mt20 ps-0 pb15 mb-0">
          {resultItems.map((item, index) => (
            <li key={index} className="d-sm-flex align-items-center">
              <span className="name-result text">{item.label}</span>
              <span className="principal-interest-val fw600">{item.value}</span>
            </li>
          ))}
        </ul>

        <form className="comments_form mt30" onSubmit={onSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-4">
                <label className="fw600 ff-heading mb-2">Total Amount</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="$250000"
                  value={inputs.totalAmount}
                  onChange={onField("totalAmount")}
                  required
                />
                {invalid("totalAmount") && (
                  <p style={{ color: "red", marginTop: 6, marginBottom: 0 }}>
                    Total Amount must be greater than 0
                  </p>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="fw600 ff-heading mb-2">Down Payment</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="$2304"
                  value={inputs.downPayment}
                  onChange={onField("downPayment")}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="fw600 ff-heading mb-2">Interest Rate</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="3.5%"
                  value={inputs.interestRate}
                  onChange={onField("interestRate")}
                  required
                />
                {invalid("interestRate") && (
                  <p style={{ color: "red", marginTop: 6, marginBottom: 0 }}>
                    Interest Rate must be 0 or more
                  </p>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="fw600 ff-heading mb-2">
                  Loan Terms (Years)
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="30"
                  value={inputs.loanYears}
                  onChange={onField("loanYears")}
                  required
                />
                {invalid("loanYears") && (
                  <p style={{ color: "red", marginTop: 6, marginBottom: 0 }}>
                    Loan Terms must be greater than 0
                  </p>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="fw600 ff-heading mb-2">Property Tax</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="$1000 (yearly)"
                  value={inputs.propertyTax}
                  onChange={onField("propertyTax")}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-4">
                <label className="fw600 ff-heading mb-2">Home Insurance</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="$1000 (yearly)"
                  value={inputs.homeInsurance}
                  onChange={onField("homeInsurance")}
                />
              </div>
            </div>

            <div className="col-md-12">
              <button type="submit" className="ud-btn btn-white2">
                Calculate
                <i className="fal fa-arrow-right-long" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default MortgageCalculator;
