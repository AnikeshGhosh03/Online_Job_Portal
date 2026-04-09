import React, { useContext, useState, useEffect } from "react";
import { assets, viewApplicationsPageData } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import Loading from "../components/Loading";
import { toast } from "react-toastify";

const ViewApplications = () => {
  const { backendUrl, companyToken } = useContext(AppContext);

  const [applicants, setApplicants] = useState(false);

  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/company/applicants", {
        headers: { token: companyToken },
      });

      if (data.success) {
        setApplicants(data.applications.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchCompanyJobApplications error:", error.message);
    }
  };

  const changeJobApplication = async (id, status) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/company/change-status",
        { id, status },
        { headers: { token: companyToken } }
      );

      if (data.success) {
        fetchCompanyJobApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update application status.');
    }
  };

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplications();
    }
  }, [companyToken]);

  return applicants ? (
    applicants.length === 0 ? (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-xl sm:text-2xl">No applications available.</p>
      </div>
    ) : (
      <div className="container mx-auto p-4">
        <div>
          <table className="w-full max-w-4xl bg-white border border-gray-300 max-sm:text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">User name</th>
                <th className="px-4 py-2 text-left max-sm:hidden">Job Title</th>
                <th className="px-4 py-2 text-left max-sm:hidden">Location</th>
                <th className="px-4 py-2 text-left">Resume</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {applicants
                .filter((item) => item.jobId && item.userId)
                .map((applicant, index) => (
                  <tr key={index} className="text-gray-700">
                    <td className="px-4 py-2 text-center border-b">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-center border-b">
                      <div className="flex items-center">
                        <img
                          className="w-10 h-10 rounded-full mr-3 max-sm:hidden"
                          src={applicant.userId.image}
                          alt=""
                        />
                        <span>{applicant.userId.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-b max-sm:hidden">
                      {applicant.jobId.title}
                    </td>
                    <td className="px-4 py-2 border-b max-sm:hidden">
                      {applicant.jobId.location}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <a
                        className="bg-blue-50 text-blue-400 py-3 px-1 rounded-md inline-flex gap-2 items-center transition-all duration-200 hover:bg-blue-100 hover:text-blue-600 hover:shadow-sm"
                        href={applicant.userId.resume}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Resume <img src={assets.resume_download_icon} alt="" />
                      </a>
                    </td>
                    <td className="px-4 py-3 border-b relative">
                      {applicant.status === "Pending" ? (
                        <div className="relative inline-block text-left group">
                          <button className="text-gray-500 action-button">
                            ...
                          </button>
                          <div className="z-10 hidden absolute right-0 md:left-0 top-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow group-hover:block">
                            <button
                              onClick={() =>
                                changeJobApplication(applicant._id, "Accepted")
                              }
                              className="block w-full text-left px-4 py-2 text-blue-500 hover:bg-blue-50 transition-colors duration-150"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                changeJobApplication(applicant._id, "Rejected")
                              }
                              className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition-colors duration-150"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>{applicant.status}</div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  ) : (
    <Loading />
  );
};

export default ViewApplications;
