"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { deleteListing } from "@/services/listing/listings.service";

const getStatusStyle = (status) => {
  switch (status) {
    case "Pending":
      return "pending-style style1";
    case "Published":
      return "pending-style style2";
    case "Processing":
      return "pending-style style3";
    default:
      return "pending-style style2";
  }
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatPrice = (price, currency = "USD", forRent = false) => {
  if (price == null) return "-";
  try {
    const nf = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    return forRent ? `${nf.format(price)}/mo` : nf.format(price);
  } catch {
    return String(price);
  }
};

const pickImage = (media) =>
  media?.cover?.url || media?.gallery?.[0]?.url || "/images/listings/list-1.jpg";

/* ---------------- Modal ---------------- */

const ConfirmDeleteModal = ({
  open,
  title,
  onClose,
  onConfirm,
  loading,
  error,
}) => {
  // prevent body scroll when modal open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,.5)" }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bdrs12">
          <div className="modal-header">
            <h5 className="modal-title">Delete listing?</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <div className="modal-body">
            <p className="mb10">
              You are about to delete:{" "}
              <span className="fw600">{title || "this listing"}</span>
            </p>
            <p className="text-danger mb0">
              This action cannot be undone.
            </p>

            {error ? (
              <div className="alert alert-danger mt15 mb0" role="alert">
                {error}
              </div>
            ) : null}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="ud-btn btn-white"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="ud-btn btn-theme"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Table ---------------- */

const PropertyDataTable = ({ items = [], loading = false }) => {
  // local copy so we can remove row without reloading
  const [rows, setRows] = useState(items);

  useEffect(() => {
    setRows(items);
  }, [items]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null); // { id, title }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const openDeleteModal = (property) => {
    const id = property._id || property.id;
    setSelected({ id, title: property.title || "Untitled" });
    setDeleteError("");
    setModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setModalOpen(false);
    setSelected(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!selected?.id) return;

    setDeleting(true);
    setDeleteError("");

    // optimistic remove
    const prevRows = rows;
    setRows((r) => r.filter((x) => (x._id || x.id) !== selected.id));

    try {
      await deleteListing(selected.id);
      setModalOpen(false);
      setSelected(null);
    } catch (err) {
      console.error(err);

      // rollback if failed
      setRows(prevRows);

      setDeleteError(
        "Failed to delete listing. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  const hasRows = rows?.length > 0;

  return (
    <>
      <ConfirmDeleteModal
        open={modalOpen}
        title={selected?.title}
        loading={deleting}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
      />

      <table className="table-style3 table at-savesearch">
        <thead className="t-head">
          <tr>
            <th>Listing title</th>
            <th>Date Published</th>
            <th>Status</th>
            <th>View</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody className="t-body">
          {loading ? (
            <tr>
              <td colSpan={5} className="vam">
                Loading…
              </td>
            </tr>
          ) : !hasRows ? (
            <tr>
              <td colSpan={5} className="vam">
                No properties found.
              </td>
            </tr>
          ) : (
            rows.map((property) => {
              const id = property._id || property.id;
              const title = property.title || "Untitled";
              const slug = property.slug;
              const location = property.locationText || property.city || "-";
              const price = formatPrice(
                property.price,
                property.currency,
                property.forRent
              );
              const datePublished = formatDate(property.createdAt);
              const status = property.status || "Published";
              const imageSrc = pickImage(property.media);

              return (
                <tr key={id}>
                  <th scope="row">
                    <div className="listing-style1 dashboard-style d-xxl-flex align-items-center mb-0">
                      <div className="list-thumb">
                        <Image
                          unoptimized
                          width={110}
                          height={94}
                          className="w-100"
                          src={imageSrc}
                          alt={title}
                        />
                      </div>

                      <div className="list-content py-0 p-0 mt-2 mt-xxl-0 ps-xxl-4">
                        <div className="h6 list-title">
                          <Link href={`/single/${slug}`}>{title}</Link>
                        </div>
                        <p className="list-text mb-0">{location}</p>
                        <div className="list-price">{price}</div>
                      </div>
                    </div>
                  </th>

                  <td className="vam">{datePublished}</td>

                  <td className="vam">
                    <span className={getStatusStyle(status)}>{status}</span>
                  </td>

                  <td className="vam">
                    <Link href={`/single/${slug}`}>View</Link>
                  </td>

                  <td className="vam">
                    <div className="d-flex">
                      <button
                        className="icon"
                        style={{ border: "none" }}
                        data-tooltip-id={`edit-${id}`}
                        type="button"
                        onClick={() =>
                          (window.location.href = `/dashboard-edit-property/${id}`)
                        }
                      >
                        <span className="fas fa-pen fa" />
                      </button>

                      <button
                        className="icon"
                        style={{ border: "none" }}
                        data-tooltip-id={`delete-${id}`}
                        type="button"
                        onClick={() => openDeleteModal(property)}
                        disabled={deleting && selected?.id === id}
                      >
                        <span className="flaticon-bin" />
                      </button>

                      <ReactTooltip id={`edit-${id}`} place="top" content="Edit" />
                      <ReactTooltip
                        id={`delete-${id}`}
                        place="top"
                        content={
                          deleting && selected?.id === id ? "Deleting…" : "Delete"
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </>
  );
};

export default PropertyDataTable;
