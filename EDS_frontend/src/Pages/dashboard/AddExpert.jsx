"use client"

import { useState } from "react"
import PageHeader from "../../Components/shared/PageHeader";

export default function AddExpert() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    specialization: "",
    bio: "",
    phone: "",
    location: "",
    experience: "",
    education: "",
    certifications: [],
    languages: [],
    availability: "AVAILABLE",
    hourlyRate: "",
    profileImage: null,
    cvFile: null,
    linkedinUrl: "",
    portfolioUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const specializations = [
  "Accountant",
  "Architect",
  "Artist",
  "Business Analyst",
  "Chef",
  "Cleaner",
  "Consultant",
  "Customer Service Representative",
  "Data Analyst",
  "Designer",
  "Doctor",
  "Driver",
  "Electrician",
  "Engineer",
  "Entrepreneur",
  "Farmer",
  "Journalist",
  "Lawyer",
  "Mechanic",
  "Nurse",
  "Pharmacist",
  "Plumber",
  "Police Officer",
  "Professor",
  "Receptionist",
  "Researcher",
  "Salesperson",
  "Scientist",
  "Security Guard",
  "Shopkeeper",
  "Software Developer",
  "Student",
  "Surgeon",
  "Teacher",
  "Technician",
  "Therapist",
  "Waiter/Waitress",
  "Writer",
  "Other"
]

  const availableLanguages = [
    "English",
    "French",
    "Spanish",
    "German",
    "Italian",
    "Portuguese",
    "Arabic",
    "Chinese",
    "Japanese",
    "Korean",
    "Russian",
    "Hindi",
    "Swahili",
    "Amharic",
    "Other",
  ]

  const availableCertifications = [
    "Board Certified",
    "Fellowship Trained",
    "PhD",
    "MD",
    "MBBS",
    "DO",
    "RN",
    "NP",
    "PA",
    "PharmD",
    "DDS",
    "DVM",
    "Other",
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
 
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }))
  }

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value],
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.title.trim()) {
      newErrors.title = "Professional title is required"
    }

    if (!formData.specialization) {
      newErrors.specialization = "Specialization is required"
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required"
    } else if (formData.bio.length < 50) {
      newErrors.bio = "Bio must be at least 50 characters"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.experience.trim()) {
      newErrors.experience = "Years of experience is required"
    }

    if (formData.languages.length === 0) {
      newErrors.languages = "At least one language must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
    
      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Expert created:", formData)
      setSuccess(true)

     
      setFormData({
        name: "",
        email: "",
        title: "",
        specialization: "",
        bio: "",
        phone: "",
        location: "",
        experience: "",
        education: "",
        certifications: [],
        languages: [],
        availability: "AVAILABLE",
        profileImage: null,
        cvFile: null,
        linkedinUrl: "",
        portfolioUrl: "",
      })
    } catch (error) {
      setErrors({ submit: "Failed to add expert. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Add New Expert" description="Add a new expert to the platform with their professional details and qualifications." />

        {success && (
          <div className="mb-6 p-4 bg-[var(--theme-success)]/10 border border-[var(--theme-success)]/20 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--theme-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[var(--theme-success)] font-medium">Expert added successfully!</p>
            </div>
          </div>
        )}
=
        <div className="bg-[var(--theme-bg-primary)] rounded-lg shadow-sm border border-[var(--theme-border-light)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
           
            <div>
              <h2 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Full Name <span className="text-[var(--theme-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)] ${
                      errors.name ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Email Address <span className="text-[var(--theme-error)]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)] ${
                      errors.email ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Phone Number <span className="text-[var(--theme-error)]">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)] ${
                      errors.phone ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                  />
                </svg>
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Professional Title <span className="text-[var(--theme-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)] ${
                      errors.title ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                    placeholder="e.g., Senior Cardiologist"
                  />
                  {errors.title && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.title}</p>}
                </div>

           
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Specialization <span className="text-[var(--theme-error)]">*</span>
                  </label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)] ${
                      errors.specialization ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  {errors.specialization && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.specialization}</p>}
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Years of Experience <span className="text-[var(--theme-error)]">*</span>
                  </label>
                  <input
                    type="number"
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)] ${
                      errors.experience ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                    }`}
                    placeholder="Years"
                  />
                  {errors.experience && <p className="mt-1 text-sm text-[var(--theme-error)]">{errors.experience}</p>}
                </div>

                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]"
                    placeholder="University, Degree"
                  />
                </div>

             
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Availability Status
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>

              </div>

            
              <div className="mt-6">
                <label htmlFor="bio" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                  Professional Bio <span className="text-[var(--theme-error)]">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)] ${
                    errors.bio ? "border-[var(--theme-error)]" : "border-[var(--theme-border-medium)]"
                  }`}
                  placeholder="Describe professional background, expertise, and experience (minimum 50 characters)"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && <p className="text-sm text-[var(--theme-error)]">{errors.bio}</p>}
                  <p className="text-sm text-[var(--theme-text-muted)] ml-auto">{formData.bio.length}/500</p>
                </div>
              </div>
            </div>


            <div>
              <h2 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
                Certifications & Languages
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-3">Certifications</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableCertifications.map((cert) => (
                    <label key={cert} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.certifications.includes(cert)}
                        onChange={() => handleArrayChange("certifications", cert)}
                        className="w-4 h-4 text-[var(--theme-error)] border-[var(--theme-border-medium)] rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-[var(--theme-text-secondary)]">{cert}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-3">
                  Languages <span className="text-[var(--theme-error)]">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableLanguages.map((lang) => (
                    <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang)}
                        onChange={() => handleArrayChange("languages", lang)}
                        className="w-4 h-4 text-[var(--theme-error)] border-[var(--theme-border-medium)] rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-[var(--theme-text-secondary)]">{lang}</span>
                    </label>
                  ))}
                </div>
                {errors.languages && <p className="mt-2 text-sm text-[var(--theme-error)]">{errors.languages}</p>}
              </div>
            </div>


            <div>
              <h2 className="text-xl font-semibold text-[var(--theme-text-primary)] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[var(--theme-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Documents & Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label htmlFor="cvFile" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    CV/Resume Upload
                  </label>
                  <input
                    type="file"
                    id="cvFile"
                    name="cvFile"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]"
                  />
                  <p className="mt-1 text-xs text-[var(--theme-text-muted)]">PDF, DOC, or DOCX files only</p>
                </div>

                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label htmlFor="portfolioUrl" className="block text-sm font-medium text-[var(--theme-text-secondary)] mb-2">
                    Portfolio/Website
                  </label>
                  <input
                    type="url"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[var(--theme-border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-error)] focus:border-[var(--theme-error)]"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{errors.submit}</p>
              </div>
            )}

       
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--theme-border-light)]">
              <button
                type="button"
                className="px-6 py-2 border border-[var(--theme-border-medium)] text-[var(--theme-text-secondary)] rounded-md hover:bg-[var(--theme-bg-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? "Adding Expert..." : "Add Expert"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}