import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useUser();
  const { getToken } = useAuth();

  const [searchFilter, setSearchFilter] = useState({ title: '', location: '' });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);
  const [companyToken, setCompanyToken] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userApplications, setUserApplications] = useState([]);
  const [userLoading, setUserLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/jobs');
      if (data.success) {
        setJobs(data.jobs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchJobs error:", error.message);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/company', {
        headers: { token: companyToken },
      });
      if (data.success) {
        setCompanyData(data.company);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("fetchCompanyData error:", error.message);
    }
  };

  // Returns true if user was found/created successfully, false otherwise
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      if (!token) return false;

      const res = await axios.get(`${backendUrl}/api/user/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.user) {
        setUserData(res.data.user);
        return true;
      }
      // User not in DB yet — fall through to creation
    } catch (error) {
      const status = error.response?.status;
      if (status === 401 || status === 404) {
        // Token not propagated yet or user not in DB — will retry or create below
      } else {
        // Genuine unexpected error — log only, no toast on initial load
        console.error("fetchUserData error:", error.message);
        return false;
      }
    }

    // User not found — create them
    try {
      if (!user?.id) return false;

      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress || "";
      const name =
        user.fullName?.trim() ||
        [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
        user.username ||
        (email ? email.split("@")[0] : "User");
      const image =
        user.imageUrl?.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

      const token = await getToken();
      if (!token) return false;

      const createRes = await axios.post(
        `${backendUrl}/api/user/create`,
        { clerkId: user.id, name: name || "User", email: email || `${user.id}@clerk.user`, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (createRes.data.success) {
        setUserData(createRes.data.user);
        return true;
      }
      return false;
    } catch (createError) {
      console.error("User creation error:", createError.message);
      return false;
    }
  };

  // Returns true on success — callers can chain fetchUserApplications after this
  const fetchUserApplications = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get(backendUrl + '/api/user/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserApplications(data.applications);
      }
      // Silently ignore auth errors — user may not be synced to DB yet
    } catch (error) {
      const status = error.response?.status;
      if (status !== 401 && status !== 403) {
        console.error("fetchUserApplications error:", error.message);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    const storedCompanyToken = localStorage.getItem('companyToken');
    if (storedCompanyToken) setCompanyToken(storedCompanyToken);
  }, []);

  useEffect(() => {
    if (companyToken) fetchCompanyData();
  }, [companyToken]);

  // Sequence: fetch user first, then applications — avoids 401 race condition
  useEffect(() => {
    if (!user?.id) return;
    fetchUserData().then((ok) => {
      if (ok) fetchUserApplications();
    });
  }, [user]);

  // Retry if userData still null after 1.5s (token may not have been ready)
  useEffect(() => {
    if (!user?.id || userData) return;
    const t = setTimeout(() => {
      fetchUserData().then((ok) => {
        if (ok) fetchUserApplications();
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [user?.id, userData]);

  const value = {
    setSearchFilter,
    searchFilter,
    isSearched,
    setIsSearched,
    setJobs,
    jobs,
    showRecruiterLogin,
    setShowRecruiterLogin,
    companyToken,
    setCompanyToken,
    companyData,
    setCompanyData,
    backendUrl,
    userData,
    setUserData,
    userApplications,
    setUserApplications,
    fetchUserData,
    fetchUserApplications,
    userLoading,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
