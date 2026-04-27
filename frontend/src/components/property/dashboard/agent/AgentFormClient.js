'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { createAgent, updateAgent, getAgentById } from "@/services/agents/agents.service";
import { uploadImage } from "@/services/listing/listings.service";

const AgentFormClient = ({ id }) => {

  console.log(id)
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    designation: "Real Estate Agent",
    photoUrl: "",
    bio: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      linkedin: "",
    },
  });

  // Fetch existing agent data if we are in "Edit Mode"
  useEffect(() => {
    if (!id) return;

    const fetchInitialData = async () => {
      try {
        const data = await getAgentById(id);
        if (data?.success) {
          const agent = data.data;
          setFormData({
            name: agent.name || "",
            email: agent.email || "",
            phone: agent.phone || "",
            whatsapp: agent.whatsapp || "",
            designation: agent.designation || "Real Estate Agent",
            photoUrl: agent.photoUrl || "",
            bio: agent.bio || "",
            socialMedia: {
              facebook: agent.socialMedia?.facebook || "",
              twitter: agent.socialMedia?.twitter || "",
              linkedin: agent.socialMedia?.linkedin || "",
            },
          });
        } else {
          setError(data?.message || "Failed to fetch agent details.");
        }
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Error fetching agent details.");
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Handle nested state for social media links
    if (name.startsWith("socialMedia.")) {
      const socialPlatform = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialMedia: { ...prev.socialMedia, [socialPlatform]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ New function to handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    setError("");

    try {
      const uploadedData = await uploadImage(file);
      
      // Your backend returns { type, url, originalName, mimetype }
      if (uploadedData && uploadedData.url) {
        setFormData((prev) => ({ ...prev, photoUrl: uploadedData.url }));
      } else {
        setError("Failed to get image URL from upload server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error uploading image. Please make sure it is a valid image file.");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let data;
      if (id) {
        data = await updateAgent(id, formData);
      } else {
        data = await createAgent(formData);
      }

      if (data?.success) {
        setSuccess(`Agent ${id ? "updated" : "added"} successfully! Redirecting...`);
        
        // Redirect back to agent list after 1.5 seconds
        setTimeout(() => {
          router.push("/agents"); 
        }, 1500);
      } else {
        setError(data?.message || data?.error || `Failed to ${id ? "update" : "create"} agent`);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.response?.data?.error || `An error occurred while ${id ? "updating" : "creating"} the agent.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader />
      <MobileMenu />

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
                      <h2>{id ? "Edit Agent" : "Add New Agent"}</h2>
                      <p className="text">
                        {id ? "Update the details of an existing agent." : "Create a public profile for a new property agent."}
                      </p>
                    </div>
                    <Link href="/dashboard/agents" className="ud-btn btn-white2">
                      <i className="fal fa-arrow-left-long mx-2" /> Back to List
                    </Link>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    <h4 className="title fz17 mb30">Agent Information</h4>
                    
                    {error && <div className="alert alert-danger bdrs8 mb-4">{error}</div>}
                    {success && <div className="alert alert-success bdrs8 mb-4">{success}</div>}

                    {fetching ? (
                      <div>Loading agent details...</div>
                    ) : (
                      <form className="form-style1" onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Full Name</label>
                              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                          </div>
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Email</label>
                              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                          </div>
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Phone</label>
                              <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
                            </div>
                          </div>
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">WhatsApp</label>
                              <input type="text" className="form-control" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                            </div>
                          </div>
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Designation</label>
                              <input type="text" className="form-control" name="designation" value={formData.designation} onChange={handleChange} />
                            </div>
                          </div>
                          
                          {/* ✅ Updated Photo Upload Field */}
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Profile Photo</label>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="form-control" 
                                onChange={handlePhotoUpload} 
                                disabled={imageUploading}
                              />
                              {imageUploading && <small className="text-info mt-2 d-block">Uploading image...</small>}
                              {formData.photoUrl && !imageUploading && (
                                <div className="mt-2 d-flex align-items-center">
                                  <img 
                                    src={formData.photoUrl} 
                                    alt="Agent preview" 
                                    style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%", marginRight: "10px" }} 
                                  />
                                  <small className="text-success">Photo ready!</small>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-sm-12">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Bio</label>
                              <textarea className="form-control" name="bio" rows={4} value={formData.bio} onChange={handleChange}></textarea>
                            </div>
                          </div>
                        </div>

                        <h4 className="title fz17 mb30 mt20">Social Media (Optional)</h4>
                        <div className="row">
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Facebook URL</label>
                              <input type="text" className="form-control" name="socialMedia.facebook" value={formData.socialMedia.facebook} onChange={handleChange} />
                            </div>
                          </div>
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">Twitter URL</label>
                              <input type="text" className="form-control" name="socialMedia.twitter" value={formData.socialMedia.twitter} onChange={handleChange} />
                            </div>
                          </div>
                          <div className="col-sm-6 col-xl-4">
                            <div className="mb20">
                              <label className="heading-color ff-heading fw600 mb10">LinkedIn URL</label>
                              <input type="text" className="form-control" name="socialMedia.linkedin" value={formData.socialMedia.linkedin} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12 text-end">
                          {/* Button is disabled if we are submitting or uploading an image */}
                          <button type="submit" className="ud-btn btn-dark" disabled={loading || imageUploading}>
                            {loading ? "Saving..." : id ? "Update Agent" : "Add Agent"} 
                            <i className="fal fa-arrow-right-long mx-2" />
                          </button>
                        </div>
                      </form>
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

export default AgentFormClient;