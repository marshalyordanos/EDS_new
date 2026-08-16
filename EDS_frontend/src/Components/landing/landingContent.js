/**
 * Static marketing copy for the landing page.
 *
 * Kept out of the components so wording can be edited without touching JSX,
 * and so each section stays purely presentational. Icons are stored as raw
 * SVG path data and rendered by the sections.
 */

export const CAPABILITIES = [
  {
    title: "Advanced search and filtering",
    text: "Powerful filters and smart suggestions surface the right expert by skillset, geography, sector, language and availability. Results in seconds.",
    path: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14M20 20l-3.6-3.6",
  },
  {
    title: "Comprehensive dashboard",
    text: "Real-time dashboards showing expert profiles, sector statistics, project involvements and decision-making analytics. All in one place.",
    path: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  },
  {
    title: "Real-time registration",
    text: "Seamless onboarding of new experts with automated form validation, duplicate detection and instant updates to the central database.",
    path: "M12 2c5 0 9 1.3 9 3s-4 3-9 3-9-1.3-9-3 4-3 9-3M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3",
  },
  {
    title: "Secure admin access",
    text: "Role-based access controls and end-to-end encryption ensure data integrity, privacy compliance and trusted multi-organisation collaboration.",
    path: "M3 11h18v11H3zM7 11V7a5 5 0 0 1 10 0v4",
  },
  {
    title: "Sector intelligence",
    text: "Deep analytics on expert distribution by country, field, gender and experience level. Actionable insight for planning and recruitment.",
    path: "M18 20V10M12 20V4M6 20v-6",
  },
  {
    title: "Multi-organisation collaboration",
    text: "Invite partners, share expert shortlists and co-manage projects across teams. Full audit trails and permission controls at every level.",
    path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  },
];

/** A real sequence, which is why these carry numbers. */
export const WORKFLOW = [
  {
    title: "Register",
    text: "Create your organisation account and get verified platform access.",
  },
  {
    title: "Search",
    text: "Enter keywords, sector or country to surface relevant experts instantly.",
  },
  {
    title: "Filter",
    text: "Narrow by experience, language, availability, gender and more.",
  },
  {
    title: "Connect",
    text: "Access full verified profiles and reach out directly through the platform.",
  },
];

export const SECTORS = [
  { name: "Healthcare", path: "M22 12h-4l-3 9L9 3l-3 9H2" },
  { name: "Legal", path: "M12 3v18M3 6l9-3 9 3M5 21h14" },
  { name: "Finance", path: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" },
  { name: "Technology", path: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8L7 17M17 7l2.8-2.8" },
  { name: "Engineering", path: "M4 2h16v20H4zM9 22V12h6v10" },
  { name: "Education", path: "M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5" },
  { name: "Agriculture", path: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12" },
  { name: "Social services", path: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.7z" },
  { name: "Policy and govt", path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" },
  { name: "Research", path: "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" },
  { name: "Logistics", path: "M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" },
  { name: "Creative arts", path: "M12 19l7-7 3 3-7 7zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" },
  { name: "Environment", path: "M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7" },
  { name: "Statistics", path: "M18 20V10M12 20V4M6 20v-6" },
];

export const TRUST = [
  {
    title: "Verified profiles",
    text: "Every expert undergoes a rigorous multi-step verification process before being listed in the database.",
    path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  },
  {
    title: "Data privacy",
    text: "End-to-end encryption and GDPR-aligned data practices protect expert and organisation data at every level.",
    path: "M3 11h18v11H3zM7 11V7a5 5 0 0 1 10 0v4",
  },
  {
    title: "Research-backed",
    text: "Built by DAB Development Research, a proven institution in African development, research and professional training.",
    path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M23 21v-2a4 4 0 0 0-3-3.87",
  },
  {
    title: "Always current",
    text: "Real-time registration and update systems keep the database fresh, accurate and up to date.",
    path: "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15",
  },
];
