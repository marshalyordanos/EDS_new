import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../../config/api";
import PageHeader from "../../Components/shared/PageHeader";

export default function CreateAdmin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    company_name: "",
    role: "company",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCancel = () => {
    setFormData({ name: "", last_name: "", email: "", company_name: "", role: "company" });
    setErrors({});
    setSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "First name is required";
    if (!formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (formData.role === "company" && !formData.company_name.trim()) {
      newErrors.company_name = "Company name is required for company users";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setErrors({ submit: "Authentication token not found. Please log in again." });
        navigate("/login");
        return;
      }

      const payload = {
        first_name: formData.name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        company_name: formData.role === "company" ? formData.company_name : "",
      };

      const response = await fetch(API_CONFIG.API_URL + "/v1/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setErrors({ submit: "Authentication failed. Please log in again." });
          navigate("/login");
          return;
        }
        setErrors({ submit: result.message || result.detail || JSON.stringify(result) });
        return;
      }

      setSuccess(true);
      setFormData({ name: "", last_name: "", email: "", company_name: "", role: "company" });
    } catch (err) {
      setErrors({ submit: err.message || "Unexpected error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const roleLabels = {
    company: "Company User",
    admin: "Admin",
    content_manager: "Content Manager",
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Create New User" description={
          <>Add a new user to the system. The default password is{" "}
            <span className="font-mono bg-[var(--theme-bg-tertiary)] px-1 rounded">Dab@2025</span> — the user can change it after first login.</>
        } />

        {success && (
          <div className="mb-6 p-4 bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/20 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--theme-success)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-[var(--theme-success)] font-medium">
              {roleLabels[formData.role] || "User"} created successfully!
            </p>
          </div>
        )}

        <div className="bg-[var(--theme-bg-primary)] rounded-lg shadow-sm border border-[var(--theme-border-light)]">
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">First Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                      errors.name ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                      errors.last_name ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.last_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                      errors.email ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="company">Company User</option>
                    <option value="admin">Admin</option>
                    <option value="content_manager">Content Manager</option>
                  </select>
                </div>

                {formData.role === "company" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">Company Name *</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
                        errors.company_name ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                      }`}
                    />
                    {errors.company_name && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.company_name}</p>}
                  </div>
                )}

              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-[var(--theme-error)]/10 border border-[var(--theme-error)]/20 rounded-lg">
                <p className="text-[var(--theme-error)]">{errors.submit}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--theme-border-light)]">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-[var(--theme-border-medium)] text-[var(--theme-text-secondary)] rounded-md hover:bg-[var(--theme-bg-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Creating..." : `Create ${roleLabels[formData.role] || "User"}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
