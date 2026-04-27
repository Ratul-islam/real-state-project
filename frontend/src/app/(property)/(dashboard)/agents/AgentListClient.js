'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/common/DashboardHeader";
import MobileMenu from "@/components/common/mobile-menu";
import DboardMobileNavigation from "@/components/property/dashboard/DboardMobileNavigation";
import Footer from "@/components/property/dashboard/Footer";
import SidebarDashboard from "@/components/property/dashboard/SidebarDashboard";
import { deleteAgent, getAgents, updateAgent } from "@/services/agents/agents.service";

const AgentListClient = () => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");

  const fetchAgentsList = async () => {
    setLoading(true);
    try {
      const data = await getAgents();
      if (data?.success) {
        setAgents(data.data.agents || data.data);
      } else {
        setError(data?.message || "Failed to load agents.");
      }
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "An error occurred while fetching agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentsList();
  }, []);

  const handleDeactivate = async (id, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this agent?`)) return;
    
    try {
      // Call updateAgent to toggle the isActive field via PATCH
      const data = await updateAgent(id, { isActive: !currentStatus });
      
      if (data?.success) {
        fetchAgentsList(); // Refresh list
      } else {
        alert(data?.message || data?.error || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Error updating agent status.");
    }
  };

  const handleDeleteAgent = async (id) => {
    if (!window.confirm("Warning: Are you sure you want to permanently delete this agent?")) return;
    
    try {
      // Call deleteAgent service
      const data = await deleteAgent(id);
      
      if (data?.success) {
        fetchAgentsList(); // Refresh list
      } else {
        alert(data?.message || data?.error || "Failed to delete agent");
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Error deleting agent.");
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
                      <h2>Manage Agents</h2>
                      <p className="text">View, edit, or remove your property agents.</p>
                    </div>
                    <Link href="/agents/add" className="ud-btn btn-dark">
                      Add New Agent<i className="fal fa-arrow-right-long mx-2" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-xl-12">
                  <div className="ps-widget bgc-white bdrs12 default-box-shadow2 p30 mb30 overflow-hidden position-relative">
                    {loading ? (
                      <div>Loading agents...</div>
                    ) : error ? (
                      <div className="text-danger">{error}</div>
                    ) : (
                      <div className="packages_table table-responsive">
                        <table className="table-style3 table at-savesearch">
                          <thead className="t-head">
                            <tr>
                              <th scope="col">Name</th>
                              <th scope="col">Contact Info</th>
                              <th scope="col">Status</th>
                              <th scope="col">Action</th>
                            </tr>
                          </thead>
                          <tbody className="t-body">
                            {agents.map((agent) => (
                              <tr key={agent._id}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {agent.photoUrl ? (
                                      <img src={agent.photoUrl} alt="agent" style={{width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', marginRight: 15}} />
                                    ) : (
                                      <div style={{width: 50, height: 50, borderRadius: '50%', backgroundColor: '#eee', marginRight: 15}} />
                                    )}
                                    <div>
                                      <h6 className="mb-0">{agent.name}</h6>
                                      <span className="fz13">{agent.designation}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="fz14"><i className="fal fa-envelope mr10" /> {agent.email}</div>
                                  <div className="fz14 mt5"><i className="fal fa-phone mr10" /> {agent.phone}</div>
                                </td>
                                <td>
                                  <span className={`status-style ${agent.isActive ? 'style1' : 'style3'} px-3 py-1 bdrs8 fz12 fw600`}>
                                    {agent.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    
                                    {/* ✅ NEW: Edit Button */}
                                    <Link 
                                      href={`/agents/edit/${agent._id}`} 
                                      className="btn text-info mr15" 
                                      title="Edit Agent"
                                    >
                                      <i className="fal fa-pen" />
                                    </Link>

                                    {/* Activate / Deactivate Button */}
                                    <button 
                                      className="btn text-primary mr15" 
                                      onClick={() => handleDeactivate(agent._id, agent.isActive)}
                                      title={agent.isActive ? "Deactivate" : "Activate"}
                                    >
                                      <i className={`fal ${agent.isActive ? 'fa-ban' : 'fa-check'}`} />
                                    </button>

                                    {/* Delete Button */}
                                    <button 
                                      className="btn text-danger" 
                                      onClick={() => handleDeleteAgent(agent._id)}
                                      title="Delete Permanently"
                                    >
                                      <i className="fal fa-trash-alt" />
                                    </button>

                                  </div>
                                </td>
                              </tr>
                            ))}
                            {agents.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-center">No agents found.</td>
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

export default AgentListClient;