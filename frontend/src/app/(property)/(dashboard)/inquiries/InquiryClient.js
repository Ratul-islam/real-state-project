'use client'

import { useEffect, useState } from "react";
import Link from "next/link"; // ✅ Added Link import
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";

import { getInquiries, updateInquiryStatus, deleteInquiry } from "@/services/inquiry/inquiry.service";

const InquiryListClient = () => {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiriesList = async () => {
    setLoading(true);
    try {
      const data = await getInquiries();
      if (data?.success || data?.status === "success" || data?.statusCode === 200) {
        setInquiries(data.data?.inquiries || data.data || []);
      } else {
        setError(data?.message || "Failed to load inquiries.");
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "An error occurred while fetching inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiriesList();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const data = await updateInquiryStatus(id, newStatus);
      if (data?.success || data?.status === "success" || data?.statusCode === 200) {
        fetchInquiriesList(); 
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      } else {
        alert(data?.message || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Error updating inquiry status.");
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Warning: Are you sure you want to permanently delete this inquiry?")) return;
    
    try {
      const data = await deleteInquiry(id);
      
      if (data?.success || data?.status === "success" || data?.statusCode === 200) {
        fetchInquiriesList(); 
        if (selectedInquiry && selectedInquiry._id === id) setSelectedInquiry(null);
      } else {
        alert(data?.message || "Failed to delete inquiry");
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Error deleting inquiry.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <DashboardHeader />
      <MobileMenu />

      {/* ✅ EXPANDED VIEW MODAL */}
      {selectedInquiry && (
        <div 
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", 
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
          }}
          onClick={() => setSelectedInquiry(null)}
        >
          <div 
            className="bgc-white bdrs12 default-box-shadow2 p30 position-relative" 
            style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedInquiry(null)}
              className="position-absolute"
              style={{ top: "20px", right: "20px", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}
            >
              <i className="fal fa-times"></i>
            </button>

            <h4 className="title fz17 mb30">Inquiry Details</h4>

            {/* Sender Info */}
            <div className="mb20">
              <h6 className="fz15 mb10">Sender Information</h6>
              <div className="p-3 bgc-f7 bdrs8">
                <p className="mb-1"><strong>Name:</strong> {selectedInquiry.name}</p>
                <p className="mb-1">
                  <strong>Email:</strong> <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> <a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a>
                </p>
                <p className="mb-0 text-muted fz13">Sent: {formatDate(selectedInquiry.createdAt)}</p>
              </div>
            </div>

            {/* ✅ Context with Images and Links */}
            <div className="mb20">
              <h6 className="fz15 mb10">Context</h6>
              <div className="p-3 bgc-f7 bdrs8 d-flex flex-column gap-3">
                
                {/* Property Context */}
                {selectedInquiry.listing ? (
                  <div className="d-flex align-items-center">
                    <img 
                      src={selectedInquiry.listing.media?.cover?.url || "/images/listings/default-property.jpg"} 
                      alt="Property" 
                      style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "8px", marginRight: "15px" }} 
                    />
                    <div>
                      <span className="badge bg-primary mb-1">Property</span>
                      <br/>
                      {/* 👉 Adjust this href to match your public property URL path */}
                      <Link 
                        href={`/property/${selectedInquiry.listing.slug || selectedInquiry.listing._id}`} 
                        target="_blank" 
                        className="fw600 fz15 text-dark text-decoration-underline"
                      >
                        {selectedInquiry.listing.title} <i className="fal fa-external-link-alt fz13 ml5 text-primary"></i>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="mb-0"><strong>Property:</strong> General Inquiry (No property specified)</p>
                )}
                
                {/* Agent Context */}
                {selectedInquiry.agent && (
                  <div className="d-flex align-items-center border-top pt-3">
                    <img 
                      src={selectedInquiry.agent.photoUrl || "/images/about/agent-p.jpg"} 
                      alt="Agent" 
                      style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%", marginRight: "15px" }} 
                    />
                    <div>
                      <span className="badge bg-info mb-1">Agent</span>
                      <br/>
                      {/* 👉 Admin clicks this to go straight to editing the agent */}
                      <Link 
                        href={`/agents/edit/${selectedInquiry.agent._id}`} 
                        target="_blank" 
                        className="fw600 fz15 text-dark text-decoration-underline"
                      >
                        {selectedInquiry.agent.name} <i className="fal fa-external-link-alt fz13 ml5 text-primary"></i>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="mb30">
              <h6 className="fz15 mb10">Message</h6>
              <div className="p-3 bgc-f7 bdrs8" style={{ whiteSpace: "pre-wrap" }}>
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status & Close */}
            <div className="d-flex align-items-center justify-content-between border-top pt20">
              <div className="d-flex align-items-center">
                <strong className="mr15">Status:</strong>
                <select 
                  className="form-select fz14 shadow-none" 
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry._id, e.target.value)}
                  style={{ width: "140px", marginLeft: "10px" }}
                >
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <button className="ud-btn btn-white" onClick={() => setSelectedInquiry(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard_content_wrapper">
        <div className="dashboard dashboard_wrapper pr30 pr0-xl">
          <SidebarDashboard />

          <div className="dashboard__main pl0-md">
            <div className="dashboard__content bgc-f7">
              <div className="row pb40">
                <div className="col-lg-12">
                  <DboardMobileNavigation />
                </div>
                <div className="col-lg-12">
                  <div className="dashboard_title_area d-flex align-items-center justify-content-between">
                    <div>
                      <h2>Manage Inquiries</h2>
                      <p className="text">Review and manage contact requests from clients.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    {loading ? (
                      <div>Loading inquiries...</div>
                    ) : error ? (
                      <div className="text-danger">{error}</div>
                    ) : (
                      <div className="packages_table table-responsive">
                        <table className="table-style3 table at-savesearch">
                          <thead className="t-head">
                            <tr>
                              <th scope="col">Sender Details</th>
                              <th scope="col">Context</th>
                              <th scope="col">Message</th>
                              <th scope="col">Status</th>
                              <th scope="col">Action</th>
                            </tr>
                          </thead>
                          <tbody className="t-body">
                            {inquiries.map((inquiry) => (
                              <tr key={inquiry._id}>
                                {/* Sender Info */}
                                <td>
                                  <div>
                                    <h6 className="mb-0">{inquiry.name}</h6>
                                    <div className="fz14 mt5"><i className="fal fa-envelope mr10" /> {inquiry.email}</div>
                                    <div className="fz14 mt5"><i className="fal fa-phone mr10" /> {inquiry.phone}</div>
                                    <div className="fz13 mt5 text-muted">Sent: {formatDate(inquiry.createdAt)}</div>
                                  </div>
                                </td>

                                {/* ✅ Context with mini thumbnails */}
                                <td style={{ maxWidth: "250px" }}>
                                  {inquiry.listing && (
                                    <div className="mb10 d-flex align-items-center">
                                      <img 
                                        src={inquiry.listing.media?.cover?.url || "/images/listings/default-property.jpg"} 
                                        alt="thumb" 
                                        style={{width: "35px", height: "35px", objectFit: "cover", borderRadius: "4px", marginRight: "10px"}}
                                      />
                                      <div>
                                        <span className="badge bg-primary d-inline-block mb-1">Property</span><br/>
                                        <span className="fz13 fw600 text-truncate d-inline-block" style={{maxWidth: "180px"}}>
                                          {inquiry.listing.title}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {inquiry.agent && (
                                    <div className="mb0 d-flex align-items-center">
                                      <img 
                                        src={inquiry.agent.photoUrl || "/images/about/agent-p.jpg"} 
                                        alt="thumb" 
                                        style={{width: "30px", height: "30px", objectFit: "cover", borderRadius: "50%", marginRight: "10px"}}
                                      />
                                      <div>
                                        <span className="badge bg-info d-inline-block mb-1">Agent</span><br/>
                                        <span className="fz13 fw600 text-truncate d-inline-block" style={{maxWidth: "180px"}}>
                                          {inquiry.agent.name}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </td>

                                {/* Message Truncated */}
                                <td style={{ maxWidth: "200px" }}>
                                  <p className="fz14 text-truncate mb-0" title={inquiry.message}>
                                    {inquiry.message}
                                  </p>
                                </td>

                                {/* Status */}
                                <td>
                                  <select 
                                    className="form-select fz14 shadow-none" 
                                    value={inquiry.status}
                                    onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                                    style={{ 
                                      width: "120px", 
                                      backgroundColor: 
                                        inquiry.status === "pending" ? "#fff3cd" :
                                        inquiry.status === "contacted" ? "#cce5ff" :
                                        inquiry.status === "resolved" ? "#d4edda" : "#e2e3e5"
                                    }}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="archived">Archived</option>
                                  </select>
                                </td>

                                {/* Actions */}
                                <td>
                                  <div className="d-flex align-items-center">
                                    <button 
                                      className="btn text-info mr15" 
                                      onClick={() => setSelectedInquiry(inquiry)}
                                      title="View Full Details"
                                    >
                                      <i className="fal fa-eye fz18" />
                                    </button>

                                    <button 
                                      className="btn text-danger" 
                                      onClick={() => handleDeleteInquiry(inquiry._id)}
                                      title="Delete Permanently"
                                    >
                                      <i className="fal fa-trash-alt fz18" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {inquiries.length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center py-4">No inquiries found.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export default InquiryListClient;