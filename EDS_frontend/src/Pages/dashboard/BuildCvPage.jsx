import { data, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  App,
  Button,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import MultiStepForm from "../../Components/forms/MultiStepForm ";
import { createExpert, buildExpertCv } from "../../services/expertService";
import { getNameList } from "country-list";
import { Space, Table, Tag } from "antd";
import PageHeader from "../../Components/shared/PageHeader";

const { Option } = Select;

const capitalize = (s) => {
  if (typeof s !== "string" || s.length === 0) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const countryOptions = Object.entries(getNameList())
  .map(([name]) => ({
    label: capitalize(name),
    value: capitalize(name),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const nationalitys = [
  { value: "Afghan", label: "Afghan" },
  { value: "Albanian", label: "Albanian" },
  { value: "Algerian", label: "Algerian" },
  { value: "American", label: "American" },
  { value: "Andorran", label: "Andorran" },
  { value: "Angolan", label: "Angolan" },
  { value: "Antiguan", label: "Antiguan" },
  { value: "Argentine", label: "Argentine" },
  { value: "Armenian", label: "Armenian" },
  { value: "Australian", label: "Australian" },
  { value: "Austrian", label: "Austrian" },
  { value: "Azerbaijani", label: "Azerbaijani" },
  { value: "Bahamian", label: "Bahamian" },
  { value: "Bahraini", label: "Bahraini" },
  { value: "Bangladeshi", label: "Bangladeshi" },
  { value: "Barbadian", label: "Barbadian" },
  { value: "Basotho", label: "Basotho" },
  { value: "Belarusian", label: "Belarusian" },
  { value: "Belgian", label: "Belgian" },
  { value: "Belizean", label: "Belizean" },
  { value: "Beninese", label: "Beninese" },
  { value: "Bhutanese", label: "Bhutanese" },
  { value: "Bolivian", label: "Bolivian" },
  { value: "Bosnian", label: "Bosnian" },
  { value: "Botswanan", label: "Botswanan" },
  { value: "Brazilian", label: "Brazilian" },
  { value: "British", label: "British" },
  { value: "Bruneian", label: "Bruneian" },
  { value: "Bulgarian", label: "Bulgarian" },
  { value: "Burkinabé", label: "Burkinabé" },
  { value: "Burmese", label: "Burmese" },
  { value: "Burundian", label: "Burundian" },
  { value: "Cabo Verdean", label: "Cabo Verdean" },
  { value: "Cambodian", label: "Cambodian" },
  { value: "Cameroonian", label: "Cameroonian" },
  { value: "Canadian", label: "Canadian" },
  { value: "Central African", label: "Central African" },
  { value: "Chadian", label: "Chadian" },
  { value: "Chilean", label: "Chilean" },
  { value: "Chinese", label: "Chinese" },
  { value: "Colombian", label: "Colombian" },
  { value: "Comoran", label: "Comoran" },
  { value: "Congolese", label: "Congolese" },
  { value: "Costa Rican", label: "Costa Rican" },
  { value: "Croatian", label: "Croatian" },
  { value: "Cuban", label: "Cuban" },
  { value: "Cypriot", label: "Cypriot" },
  { value: "Czech", label: "Czech" },
  { value: "Danish", label: "Danish" },
  { value: "Djiboutian", label: "Djiboutian" },
  { value: "Dominican", label: "Dominican" },
  { value: "Dutch", label: "Dutch" },
  { value: "East Timorese", label: "East Timorese" },
  { value: "Ecuadorian", label: "Ecuadorian" },
  { value: "Egyptian", label: "Egyptian" },
  { value: "Emirati", label: "Emirati" },
  { value: "English", label: "English" },
  { value: "Equatoguinean", label: "Equatoguinean" },
  { value: "Eritrean", label: "Eritrean" },
  { value: "Estonian", label: "Estonian" },
  { value: "Ethiopian", label: "Ethiopian" },
  { value: "Fijian", label: "Fijian" },
  { value: "Finnish", label: "Finnish" },
  { value: "French", label: "French" },
  { value: "Gabonese", label: "Gabonese" },
  { value: "Gambian", label: "Gambian" },
  { value: "Georgian", label: "Georgian" },
  { value: "German", label: "German" },
  { value: "Ghanaian", label: "Ghanaian" },
  { value: "Greek", label: "Greek" },
  { value: "Grenadian", label: "Grenadian" },
  { value: "Guatemalan", label: "Guatemalan" },
  { value: "Guinean", label: "Guinean" },
  { value: "Bissau-Guinean", label: "Bissau-Guinean" },
  { value: "Guyanese", label: "Guyanese" },
  { value: "Haitian", label: "Haitian" },
  { value: "Honduran", label: "Honduran" },
  { value: "Hungarian", label: "Hungarian" },
  { value: "Icelander", label: "Icelander" },
  { value: "Indian", label: "Indian" },
  { value: "Indonesian", label: "Indonesian" },
  { value: "Iranian", label: "Iranian" },
  { value: "Iraqi", label: "Iraqi" },
  { value: "Irish", label: "Irish" },
  { value: "Israeli", label: "Israeli" },
  { value: "Italian", label: "Italian" },
  { value: "Ivorian", label: "Ivorian" },
  { value: "Jamaican", label: "Jamaican" },
  { value: "Japanese", label: "Japanese" },
  { value: "Jordanian", label: "Jordanian" },
  { value: "Kazakhstani", label: "Kazakhstani" },
  { value: "Kenyan", label: "Kenyan" },
  { value: "Kittitian", label: "Kittitian" },
  { value: "Kosovar", label: "Kosovar" },
  { value: "Kuwaiti", label: "Kuwaiti" },
  { value: "Kyrgyzstani", label: "Kyrgyzstani" },
  { value: "Lao", label: "Lao" },
  { value: "Latvian", label: "Latvian" },
  { value: "Lebanese", label: "Lebanese" },
  { value: "Liberian", label: "Liberian" },
  { value: "Libyan", label: "Libyan" },
  { value: "Liechtensteiner", label: "Liechtensteiner" },
  { value: "Lithuanian", label: "Lithuanian" },
  { value: "Luxembourger", label: "Luxembourger" },
  { value: "Macedonian", label: "Macedonian" },
  { value: "Malagasy", label: "Malagasy" },
  { value: "Malawian", label: "Malawian" },
  { value: "Malaysian", label: "Malaysian" },
  { value: "Maldivian", label: "Maldivian" },
  { value: "Malian", label: "Malian" },
  { value: "Maltese", label: "Maltese" },
  { value: "Marshallese", label: "Marshallese" },
  { value: "Mauritanian", label: "Mauritanian" },
  { value: "Mauritian", label: "Mauritian" },
  { value: "Mexican", label: "Mexican" },
  { value: "Micronesian", label: "Micronesian" },
  { value: "Moldovan", label: "Moldovan" },
  { value: "Monacan", label: "Monacan" },
  { value: "Mongolian", label: "Mongolian" },
  { value: "Montenegrin", label: "Montenegrin" },
  { value: "Moroccan", label: "Moroccan" },
  { value: "Mozambican", label: "Mozambican" },
  { value: "Namibian", label: "Namibian" },
  { value: "Nauruan", label: "Nauruan" },
  { value: "Nepalese", label: "Nepalese" },
  { value: "New Zealander", label: "New Zealander" },
  { value: "Nicaraguan", label: "Nicaraguan" },
  { value: "Nigerien", label: "Nigerien" },
  { value: "Nigerian", label: "Nigerian" },
  { value: "Ni-Vanuatu", label: "Ni-Vanuatu" },
  { value: "North Korean", label: "North Korean" },
  { value: "Norwegian", label: "Norwegian" },
  { value: "Omani", label: "Omani" },
  { value: "Pakistani", label: "Pakistani" },
  { value: "Palauan", label: "Palauan" },
  { value: "Palestinian", label: "Palestinian" },
  { value: "Panamanian", label: "Panamanian" },
  { value: "Papua New Guinean", label: "Papua New Guinean" },
  { value: "Paraguayan", label: "Paraguayan" },
  { value: "Peruvian", label: "Peruvian" },
  { value: "Filipino", label: "Filipino" },
  { value: "Polish", label: "Polish" },
  { value: "Portuguese", label: "Portuguese" },
  { value: "Qatari", label: "Qatari" },
  { value: "Romanian", label: "Romanian" },
  { value: "Russian", label: "Russian" },
  { value: "Rwandan", label: "Rwandan" },
  { value: "Saint Lucian", label: "Saint Lucian" },
  { value: "Salvadoran", label: "Salvadoran" },
  { value: "Sammarinese", label: "Sammarinese" },
  { value: "Samoan", label: "Samoan" },
  { value: "São Toméan", label: "São Toméan" },
  { value: "Saudi", label: "Saudi" },
  { value: "Scottish", label: "Scottish" },
  { value: "Senegalese", label: "Senegalese" },
  { value: "Serbian", label: "Serbian" },
  { value: "Seychellois", label: "Seychellois" },
  { value: "Sierra Leonean", label: "Sierra Leonean" },
  { value: "Singaporean", label: "Singaporean" },
  { value: "Slovak", label: "Slovak" },
  { value: "Slovene", label: "Slovene" },
  { value: "Solomon Islander", label: "Solomon Islander" },
  { value: "Somali", label: "Somali" },
  { value: "South African", label: "South African" },
  { value: "South Korean", label: "South Korean" },
  { value: "South Sudanese", label: "South Sudanese" },
  { value: "Spanish", label: "Spanish" },
  { value: "Sri Lankan", label: "Sri Lankan" },
  { value: "Sudanese", label: "Sudanese" },
  { value: "Surinamese", label: "Surinamese" },
  { value: "Swazi", label: "Swazi" },
  { value: "Swedish", label: "Swedish" },
  { value: "Swiss", label: "Swiss" },
  { value: "Syrian", label: "Syrian" },
  { value: "Tajikistani", label: "Tajikistani" },
  { value: "Tanzanian", label: "Tanzanian" },
  { value: "Thai", label: "Thai" },
  { value: "Togolese", label: "Togolese" },
  { value: "Tongan", label: "Tongan" },
  { value: "Trinidadian", label: "Trinidadian" },
  { value: "Tunisian", label: "Tunisian" },
  { value: "Turkish", label: "Turkish" },
  { value: "Turkmen", label: "Turkmen" },
  { value: "Tuvaluan", label: "Tuvaluan" },
  { value: "Ugandan", label: "Ugandan" },
  { value: "Ukrainian", label: "Ukrainian" },
  { value: "Uruguayan", label: "Uruguayan" },
  { value: "Uzbekistani", label: "Uzbekistani" },
  { value: "Vatican", label: "Vatican" },
  { value: "Venezuelan", label: "Venezuelan" },
  { value: "Vietnamese", label: "Vietnamese" },
  { value: "Vincentian", label: "Vincentian" },
  { value: "Welsh", label: "Welsh" },
  { value: "Yemeni", label: "Yemeni" },
  { value: "Zambian", label: "Zambian" },
  { value: "Zimbabwean", label: "Zimbabwean" },
];

const subCategory = [
  { value: "Agro-industry" },
  { value: "Food" },
  { value: "Nutrition" },
  { value: "Biotechnology" },
  { value: "Credit" },
  { value: "Insurance" },
  { value: "Clearing" },
  { value: "Economics" },
  { value: "Finance" },
  { value: "Cultivation" },
  { value: "Harvesting" },
  { value: "Crop" },
  { value: "Drying" },
  { value: "Processing" },
  { value: "Scarifying" },
  { value: "Pelletizing" },
  { value: "Early Warning Systems" },
  { value: "Surveillance (Crops)" },
  { value: "Farm" },
  { value: "Co-operatives" },
  { value: "Associations" },
  { value: "Community Centres" },
  { value: "Community Participation" },
  { value: "Fisheries" },
  { value: "Aquaculture" },
  { value: "Forestry" },
  { value: "Fruits & Vegetables" },
  { value: "Horticulture" },
  { value: "Land" },
  { value: "Erosion" },
  { value: "Soil" },
  { value: "Conservation" },
  { value: "Mapping" },
  { value: "Cadastre" },
  { value: "Meat" },
  { value: "Dairy" },
  { value: "Mechanisation" },
  { value: "Production" },
  { value: "Packaging" },
  { value: "Storage" },
  { value: "Distribution" },
  { value: "Marketing" },
  { value: "Pest" },
  { value: "Disease" },
  { value: "Weed" },
  { value: "Policy" },
  { value: "Planning" },
  { value: "Systems" },
  { value: "Institutions" },
  { value: "Procurement" },
  { value: "Machinery" },
  { value: "Equipment" },
  { value: "Infrastructure" },
  { value: "Seeds" },
  { value: "Fertilisers" },
  { value: "Agro-Chemicals" },
  { value: "Pesticides" },
  { value: "Semi-arid agriculture" },
  { value: "arid agriculture" },
  { value: "Sub-tropical agriculture" },
  { value: "tropical agriculture" },
  { value: "Testing" },
  { value: "Quality Control" },
  { value: "Veterinary" },
  { value: "Water" },
  { value: "Drainage" },
  { value: "Irrigation" },
  { value: "Flood" },
  { value: "Well" },
  { value: "Hydrology" },
  { value: "Water Sanitation" },
  { value: "Zoology" },
  { value: "Livestock" },
  { value: "Animals" },
  { value: "Breeding" },
  { value: "Genetics" },
  { value: "Cattle" },
  { value: "Entomology" },
  { value: "Advertising" },
  { value: "Information Campaign" },
  { value: "Awareness-raising Campaign" },
  { value: "Communications" },
  { value: "Conferences" },
  { value: "Events" },
  { value: "Seminars" },
  { value: "Information Management" },
  { value: "Knowledge Sharing" },
  { value: "Journalism" },
  { value: "Multi-Media" },
  { value: "Printing" },
  { value: "Publishing" },
  { value: "Public Affairs" },
  { value: "Public Relations" },
  { value: "Media" },
  { value: "Radio" },
  { value: "Television" },
  { value: "Newspapers" },
  { value: "Film" },
  { value: "Photography" },
  { value: "Strategy & Policy" },
  { value: "Translation" },
  { value: "Interpretation" },
  { value: "Writing & Editing" },
  { value: "Press Release" },
  { value: "Speech" },
  { value: "Building" },
  { value: "Construction" },
  { value: "Civil Works" },
  { value: "Demolition" },
  { value: "Buildings" },
  { value: "Offices" },
  { value: "Houses" },
  { value: "Dredging & Reclamation" },
  { value: "Material" },
  { value: "Contracting" },
  { value: "Bonds" },
  { value: "Cost" },
  { value: "Highways" },
  { value: "Roads" },
  { value: "Bridges" },
  { value: "Tunnels" },
  { value: "Hydraulic Engineering (dams, pipelines, etc)" },
  { value: "Landscape Engineering" },
  { value: "Legislation" },
  { value: "Permits" },
  { value: "Standards" },
  { value: "Architecture" },
  { value: "Engineering" },
  { value: "Rehabilitation and maintenance works" },
  { value: "Site Selection" },
  { value: "Land Use" },
  { value: "Assessment" },
  { value: "Metering" },
  { value: "Protection" },
  { value: "Signalling" },
  { value: "Works supervision" },
  { value: "Comparative testing" },
  { value: "Consumer associations" },
  { value: "groups" },
  { value: "Consumer protection" },
  { value: "Consumer policy" },
  { value: "Market surveillance" },
  { value: "Consumer redress" },
  { value: "Consumer representation" },
  { value: "Contracts" },
  { value: "Contract terms" },
  { value: "Cosmetics" },
  { value: "Household appliances" },
  { value: "Cars" },
  { value: "Dangerous substances" },
  { value: "Hazardous substances" },
  { value: "Toys" },
  { value: "Information" },
  { value: "Labelling" },
  { value: "Marketing practices" },
  { value: "Sales methods" },
  { value: "Product quality control" },
  { value: "Product Safety" },
  { value: "Food Safety" },
  { value: "SPS (Sanitary / Phytosanitary)" },
  { value: "Standardisation" },
  { value: "Certification" },
  { value: "Accreditation" },
  { value: "Conformity assessment" },
  { value: "Metrology" },
  { value: "Laboratory" },
  { value: "Sustainable consumption" },
  { value: "Warnings" },
  { value: "Warranty" },
  { value: "Business Centres" },
  { value: "Incubators" },
  { value: "Business Development" },
  { value: "Business Plans" },
  { value: "Clustering" },
  { value: "Co-operatives" },
  { value: "Corporate Governance" },
  { value: "Econometrics" },
  { value: "Statistics" },
  { value: "Income Distribution" },
  { value: "Economic Systems" },
  { value: "Planning" },
  { value: "Employment" },
  { value: "Labour" },
  { value: "Handicraft" },
  { value: "Household" },
  { value: "Income Generation" },
  { value: "Macroeconomics" },
  { value: "Crisis" },
  { value: "Matching Grants" },
  { value: "Mergers & Acquisitions" },
  { value: "Partnerships" },
  { value: "Joint Ventures" },
  { value: "Micro-Credit" },
  { value: "Microeconomics" },
  { value: "Privatisation" },
  { value: "Public-Private Partnership" },
  { value: "Re-engineering (company)" },
  { value: "Liquidation" },
  { value: "Restructuring (sector" },
  { value: "industry)" },
  { value: "Small & Medium-Sized Enterprises (SMEs)" },
  { value: "Start-ups" },
  { value: "Tourism" },
  { value: "Hotels" },
  { value: "Restaurants" },
  { value: "Catering" },
  { value: "Adult Education" },
  { value: "Non-Formal" },
  { value: "Literacy" },
  { value: "Continuing" },
  { value: "Curriculum" },
  { value: "Distance Education" },
  { value: "e-Learning" },
  { value: "Education Technology" },
  { value: "Exchange" },
  { value: "Scholarship" },
  { value: "Facilities" },
  { value: "Architecture" },
  { value: "Physical Planning" },
  { value: "Location" },
  { value: "Finance" },
  { value: "Accounting" },
  { value: "Audit" },
  { value: "Higher" },
  { value: "University" },
  { value: "Library" },
  { value: "Documentation Centre" },
  { value: "Manpower" },
  { value: "Personnel" },
  { value: "Marginalised groups" },
  { value: "Handicapped" },
  { value: "Girls & Women" },
  { value: "School attendance" },
  { value: "Performance" },
  { value: "Examinations" },
  { value: "Testing" },
  { value: "Measurement" },
  { value: "Inspectorate" },
  { value: "Supervision" },
  { value: "National Qualification framework (NQF)" },
  { value: "Policy" },
  { value: "Systems" },
  { value: "Institutions" },
  { value: "Evaluation" },
  { value: "Decentralisation" },
  { value: "Pre-School" },
  { value: "Early Childhood" },
  { value: "Primary" },
  { value: "Procurement" },
  { value: "Equipment" },
  { value: "Materials" },
  { value: "Media" },
  { value: "Techniques" },
  { value: "Textbooks" },
  { value: "Publishing" },
  { value: "Radio & Television" },
  { value: "Research & Development" },
  { value: "Secondary" },
  { value: "Teachers Training" },
  { value: "Technical" },
  { value: "Industrial" },
  { value: "Vocational" },
  { value: "Tertiary" },
  { value: "Conservation" },
  { value: "Saving" },
  { value: "Recovery" },
  { value: "Renewable" },
  { value: "Drilling" },
  { value: "Production" },
  { value: "Distribution" },
  { value: "Reserves" },
  { value: "Electric" },
  { value: "Financials" },
  { value: "Pricing" },
  { value: "Tariffs" },
  { value: "Geothermal" },
  { value: "Solar" },
  { value: "Bio-Mass" },
  { value: "Wind" },
  { value: "Sea" },
  { value: "Heating" },
  { value: "Co-Generation" },
  { value: "Hydroelectric" },
  { value: "Mining" },
  { value: "Coal" },
  { value: "Lignite" },
  { value: "Anthracite" },
  { value: "Nuclear" },
  { value: "Oil" },
  { value: "Gas" },
  { value: "Petrol" },
  { value: "Planning" },
  { value: "Policy" },
  { value: "Procurement" },
  { value: "Equipment" },
  { value: "Bio-diversity" },
  { value: "Eco Systems" },
  { value: "Botany" },
  { value: "Climate" },
  { value: "Cyclone" },
  { value: "Coastal Zone Management" },
  { value: "Marine Biology" },
  { value: "Drought & Desertification" },
  { value: "Environmental Engineering" },
  { value: "Science & Technology" },
  { value: "Historic & Cultural Heritage" },
  { value: "Natural disasters" },
  { value: "Prevention" },
  { value: "Natural resources" },
  { value: "Earth & Space sciences" },
  { value: "Ecology" },
  { value: "Policy & Strategy (incl. Sustainability)" },
  { value: "Pollution (Air)" },
  { value: "Pollution (Water)" },
  { value: "Pollution (Soil)" },
  { value: "Pollution (Noise)" },
  { value: "Pollution (Industrial)" },
  { value: "Pollution (Oil)" },
  { value: "Protected Areas" },
  { value: "Parks" },
  { value: "Reserves" },
  { value: "Protection" },
  { value: "Bio-economy" },
  { value: "Green economy" },
  { value: "Remote Sensing" },
  { value: "Early Warning Systems" },
  { value: "Surveillance" },
  { value: "Standards" },
  { value: "Surveys" },
  { value: "Impact Assessment" },
  { value: "Topography" },
  { value: "Geology" },
  { value: "Earth Observation" },
  { value: "Urban Environment" },
  { value: "Waste" },
  { value: "Toxic" },
  { value: "Hazardous" },
  { value: "Solid" },
  { value: "Clean Technologies" },
  { value: "Processing" },
  { value: "Wildlife" },
  { value: "Audit" },
  { value: "Accountancy" },
  { value: "Due Diligence" },
  { value: "Inventory" },
  { value: "Balance of Payments" },
  { value: "Banking system" },
  { value: "Budgets" },
  { value: "Public Finance" },
  { value: "Capital" },
  { value: "Reserves" },
  { value: "Liquidity" },
  { value: "Cash Flow" },
  { value: "Liability" },
  { value: "Creditors" },
  { value: "Treasury" },
  { value: "Co-financing" },
  { value: "Corporate finance" },
  { value: "Credit" },
  { value: "Letters of Credit" },
  { value: "Loans" },
  { value: "Credit Guarantees" },
  { value: "Currency" },
  { value: "Exchange" },
  { value: "Debt" },
  { value: "Indebtedness" },
  { value: "Financial Institutions" },
  { value: "Insurance" },
  { value: "Investment" },
  { value: "Venture capital" },
  { value: "Portfolio" },
  { value: "Securities" },
  { value: "Bonds" },
  { value: "Stocks" },
  { value: "Equities" },
  { value: "Funds" },
  { value: "Leasing" },
  { value: "Market Instruments" },
  { value: "Derivatives" },
  { value: "Financial Markets" },
  { value: "Exchanges" },
  { value: "Monetary" },
  { value: "Fiscal Policy" },
  { value: "Money laundering" },
  { value: "Fraud" },
  { value: "Payments" },
  { value: "Mobile Banking" },
  { value: "E-Banking" },
  { value: "Pensions" },
  { value: "Policy" },
  { value: "Planning" },
  { value: "Systems" },
  { value: "Regulations" },
  { value: "Crisis" },
  { value: "Reporting" },
  { value: "Finance Management" },
  { value: "Risk" },
  { value: "Sensitivity" },
  { value: "Market analysis" },
  { value: "Forecasting" },
  { value: "Models" },
  { value: "Projection" },
  { value: "Structural Adjustment" },
  { value: "Taxation" },
  { value: "Collection" },
  { value: "Bio-Medicine" },
  { value: "Diseases" },
  { value: "Vaccination" },
  { value: "Epidemic" },
  { value: "Prevention" },
  { value: "Risks" },
  { value: "Economics & Finances" },
  { value: "Health Insurance" },
  { value: "Genetics" },
  { value: "Health Care Buildings" },
  { value: "Hospital" },
  { value: "HIV" },
  { value: "AIDS" },
  { value: "STD" },
  { value: "Manpower" },
  { value: "Maternal-Child health" },
  { value: "Maternity" },
  { value: "Family planning" },
  { value: "Reproductive health" },
  { value: "Nursing" },
  { value: "Mental Health" },
  { value: "Disabled" },
  { value: "Nutrition" },
  { value: "Occupational Health" },
  { value: "Patients' rights" },
  { value: "Protection" },
  { value: "Pharmaceuticals" },
  { value: "Drugs" },
  { value: "Policy" },
  { value: "Planning" },
  { value: "Systems" },
  { value: "Organisation" },
  { value: "Administration" },
  { value: "Management" },
  { value: "e-Health" },
  { value: "Primary Health Care" },
  { value: "Private Health Care Systems" },
  { value: "Infrastructure" },
  { value: "Procurement" },
  { value: "Logistics" },
  { value: "Equipment" },
  { value: "Supplies" },
  { value: "Distribution" },
  { value: "Delivery" },
  { value: "Public Health Care Systems" },
  { value: "Districts" },
  { value: "Research" },
  { value: "Safety" },
  { value: "Liability" },
  { value: "Sanitation" },
  { value: "Food Aid" },
  { value: "Land Mines" },
  { value: "Mine Clearance" },
  { value: "Medical Aid" },
  { value: "Prevention" },
  { value: "Preparedness" },
  { value: "Refugees" },
  { value: "Returnees" },
  { value: "Displaced" },
  { value: "Temporary Shelters" },
  { value: "Artificial intelligence" },
  { value: "Automation" },
  { value: "Computer Networks" },
  { value: "Operations" },
  { value: "Maintenance and Support" },
  { value: "Security" },
  { value: "Computer-Assisted Design (CAD/CAM)" },
  { value: "Databases" },
  { value: "Warehouses" },
  { value: "Data Recovery" },
  { value: "Decision Support Systems" },
  { value: "Geographical Information" },
  { value: "Localisation" },
  { value: "Surveillance Systems" },
  { value: "Hardware" },
  { value: "Software" },
  { value: "Information society" },
  { value: "Internet" },
  { value: "Web-based Platforms" },
  { value: "e-Commerce" },
  { value: "e-Governance" },
  { value: "Management Information Systems (MIS)" },
  { value: "Teletext" },
  { value: "Web Design" },
  { value: "Administrative Law" },
  { value: "Anti-corruption" },
  { value: "Bankruptcy" },
  { value: "Creditors Rights" },
  { value: "Insolvency" },
  { value: "Civil law" },
  { value: "Public law" },
  { value: "Election law" },
  { value: "Political Party Law" },
  { value: "Commercial Law" },
  { value: "Trade Law" },
  { value: "Contract Law" },
  { value: "Corporate Law" },
  { value: "Industrial Law" },
  { value: "Economic Law" },
  { value: "Competition Law" },
  { value: "Computer Law" },
  { value: "e-Commerce Law" },
  { value: "Internet Law" },
  { value: "Constitutional Law" },
  { value: "Courts" },
  { value: "Tribunals" },
  { value: "Law Enforcement" },
  { value: "Justice" },
  { value: "Criminal Law" },
  { value: "Environmental Law" },
  { value: "Energy Law" },
  { value: "Financial Law" },
  { value: "Banking Law" },
  { value: "Investment Law" },
  { value: "Governmental Law" },
  { value: "Human Rights Protection Law" },
  { value: "Immigration Law" },
  { value: "Insurance Law" },
  { value: "International Law" },
  { value: "Judges" },
  { value: "Labour Law" },
  { value: "Law" },
  { value: "Legislation" },
  { value: "Legal Framework" },
  { value: "Regulation" },
  { value: "RIA" },
  { value: "Reform" },
  { value: "Law Harmonisation" },
  { value: "Approximation" },
  { value: "Pre-accession" },
  { value: "Acquis communautaire" },
  { value: "European Law" },
  { value: "Patent" },
  { value: "Trademark" },
  { value: "Copyright" },
  { value: "Intellectual Property" },
  { value: "Property" },
  { value: "Estates" },
  { value: "Trusts" },
  { value: "Secured Transactions" },
  { value: "Privacy" },
  { value: "Data protection" },
  { value: "Securities" },
  { value: "State Enterprises Law" },
  { value: "Taxation" },
  { value: "Income" },
  { value: "Chartered Surveyors" },
  { value: "Torts" },
  { value: "Dispute Settlement" },
  { value: "Dialogue" },
  { value: "Arbitration" },
  { value: "Litigation" },
  { value: "Mediation" },
  { value: "Transport Law" },
  { value: "Co-ordination" },
  { value: "Aid co-ordination" },
  { value: "Cost Analysis" },
  { value: "Benefits Analysis" },
  { value: "Project Budgeting" },
  { value: "Country Programming" },
  { value: "Programme Development" },
  { value: "Identification" },
  { value: "Needs Analysis" },
  { value: "Formulation" },
  { value: "Feasibility Study" },
  { value: "Management Systems & Techniques" },
  { value: "Monitoring" },
  { value: "Evaluation" },
  { value: "Assessment" },
  { value: "(impact) Studies" },
  { value: "Project Audit" },
  { value: "Survey" },
  { value: "Performance Appraisal" },
  { value: "Personnel" },
  { value: "Human Resources Management" },
  { value: "Procurement" },
  { value: "Tender evaluation" },
  { value: "Project Cycle Management" },
  { value: "Project implementation" },
  { value: "Secretarial Support" },
  { value: "Administrative Support" },
  { value: "Total Quality Management (TQM)" },
  { value: "Quality Control" },
  { value: "Training" },
  { value: "Administrative Agencies" },
  { value: "Budget" },
  { value: "Budget Support" },
  { value: "Public Investment" },
  { value: "Finances" },
  { value: "Debt" },
  { value: "Customs" },
  { value: "Excise" },
  { value: "Elections" },
  { value: "Polling" },
  { value: "Voters" },
  { value: "Fight against drugs" },
  { value: "Foreign Affairs" },
  { value: "Diplomacy" },
  { value: "Governance" },
  { value: "Justice and Home Affairs" },
  { value: "Asylum" },
  { value: "Immigration" },
  { value: "Borders" },
  { value: "Passport" },
  { value: "Manpower" },
  { value: "Recruitment" },
  { value: "HR" },
  { value: "Grading" },
  { value: "Parliament" },
  { value: "Political Parties" },
  { value: "Planning" },
  { value: "Policy" },
  { value: "Systems" },
  { value: "Police" },
  { value: "Defence" },
  { value: "Interior" },
  { value: "Security" },
  { value: "Prison" },
  { value: "Fire fighting system" },
  { value: "Public Procurement" },
  { value: "Public utilities" },
  { value: "Institutional strengthening" },
  { value: "Regional Authorities" },
  { value: "Municipal Authorities" },
  { value: "Local Authorities" },
  { value: "Decentralisation" },
  { value: "Regional Country Co-operation" },
  { value: "European Integration" },
  { value: "Regional Funds" },
  { value: "State Enterprises" },
  { value: "Terrorism" },
  { value: "Corruption" },
  { value: "Fight against human traffic" },
  { value: "Twinning" },
  { value: "Chemistry" },
  { value: "Earth sciences" },
  { value: "Human Sciences" },
  { value: "Information Sciences" },
  { value: "Life and Health Sciences" },
  { value: "Other Sciences" },
  { value: "Physics" },
  { value: "Procurement" },
  { value: "Equipment" },
  { value: "Anthropology" },
  { value: "Tribal" },
  { value: "Ethnic Groups" },
  { value: "Classification" },
  { value: "Norms" },
  { value: "Standards" },
  { value: "Conflict" },
  { value: "Post conflict" },
  { value: "Conflict prevention" },
  { value: "Political crises" },
  { value: "Culture" },
  { value: "Religion" },
  { value: "Sport" },
  { value: "Arts" },
  { value: "Democracy" },
  { value: "Human Rights" },
  { value: "Family Planning" },
  { value: "Gender" },
  { value: "Women" },
  { value: "Equal Opportunities" },
  { value: "Discrimination" },
  { value: "Re-integration" },
  { value: "Migration" },
  { value: "Settlement" },
  { value: "Resettlement" },
  { value: "Border Crossing" },
  { value: "Pastoral Groups" },
  { value: "Nomads" },
  { value: "Policy" },
  { value: "Planning" },
  { value: "Systems" },
  { value: "Reform" },
  { value: "Poverty Alleviation" },
  { value: "Vehicles" },
  { value: "Supplies" },
  { value: "Facilities" },
  { value: "Rent" },
  { value: "Self-help" },
  { value: "Grass-roots" },
  { value: "Social Security" },
  { value: "Pension" },
  { value: "Protection" },
  { value: "Statistics" },
  { value: "Demography" },
  { value: "Population" },
  { value: "Census" },
  { value: "Opinion Polling" },
  { value: "Research" },
  { value: "Volunteering" },
  { value: "NGO" },
  { value: "CBO" },
  { value: "Trade Unions" },
  { value: "Civil Society" },
  { value: "Vulnerable Groups" },
  { value: "Street Children" },
  { value: "Minorities" },
  { value: "Youth" },
  { value: "Mobile systems" },
  { value: "Services" },
  { value: "Post" },
  { value: "Courier service" },
  { value: "Teletext" },
  { value: "Tariffs" },
  { value: "Chambers of Commerce" },
  { value: "Commodities" },
  { value: "Raw Materials" },
  { value: "Export" },
  { value: "Competition" },
  { value: "Foreign Direct Investments" },
  { value: "Investment promotion" },
  { value: "Free Trade Zones" },
  { value: "Industrial Parks" },
  { value: "Estates" },
  { value: "Import" },
  { value: "Industry" },
  { value: "Industrial Products" },
  { value: "Licencing" },
  { value: "Patents" },
  { value: "Trademarks" },
  { value: "Logistics" },
  { value: "Market Analysis" },
  { value: "Market Surveillance" },
  { value: "Marketing" },
  { value: "Direct Marketing" },
  { value: "Policy" },
  { value: "Planning" },
  { value: "Pricing" },
  { value: "Procurement" },
  { value: "Purchasing & Supply" },
  { value: "Sales" },
  { value: "Promotion" },
  { value: "Aids" },
  { value: "Facilitation" },
  { value: "Retail Management" },
  { value: "Sponsorship" },
  { value: "Tariff" },
  { value: "Barriers" },
  { value: "Contracts" },
  { value: "Terms" },
  { value: "Restrictions" },
  { value: "Trade" },
  { value: "Global trade" },
  { value: "Air" },
  { value: "Aviation" },
  { value: "Airport" },
  { value: "Freight" },
  { value: "Cargo" },
  { value: "Inter-modal" },
  { value: "Multi-modal" },
  { value: "Investment" },
  { value: "Finances" },
  { value: "Navigational Aids" },
  { value: "Models" },
  { value: "Equipment" },
  { value: "Vehicles" },
  { value: "Maintenance" },
  { value: "Rail" },
  { value: "Regulation" },
  { value: "Road" },
  { value: "Public transportation" },
  { value: "Safety" },
  { value: "Traffic" },
  { value: "Origin-Destination Surveys" },
  { value: "Warehouses" },
  { value: "Storage" },
  { value: "Water Navigation" },
  { value: "Ports" },
  { value: "Shipping" },
  { value: "Food Aid" },
  { value: "Land Mines" },
  { value: "Mine Clearance" },
  { value: "Medical Aid" },
  { value: "Prevention" },
  { value: "Preparedness" },
  { value: "Refugees" },
  { value: "Returnees" },
  { value: "Displaced" },
  { value: "Temporary Shelters" },
  { value: "Community Participation" },
  { value: "Employment" },
  { value: "Energy" },
  { value: "Engineering" },
  { value: "Infrastructure" },
  { value: "Implementation" },
  { value: "Building" },
  { value: "Works Supervision" },
  { value: "Finance" },
  { value: "Budgeting" },
  { value: "Investment" },
  { value: "Valuation" },
  { value: "Taxation" },
  { value: "Land Use" },
  { value: "Pedestrian" },
  { value: "Planning" },
  { value: "Models" },
  { value: "Policies" },
  { value: "Property" },
  { value: "Facilities" },
  { value: "Asset Management" },
  { value: "Public utilities" },
  { value: "Self-help Programmes" },
  { value: "Services" },
  { value: "Maintenance" },
  { value: "Cleaning services" },
  { value: "Shelter" },
  { value: "Housing" },
  { value: "Habitat" },
  { value: "Slums" },
  { value: "Standards & Regulations" },
  { value: "Survey" },
  { value: "Transport" },
  { value: "Water" },
  { value: "Drainage" },
  { value: "Irrigation" },
  { value: "Flood" },
  { value: "Well" },
  { value: "Hydrology" },
];

const languages = [
  { value: "English" },
  { value: "French" },
  { value: "Spanish" },
  { value: "German" },
  { value: "Italian" },
  { value: "Portuguese" },
  { value: "Russian" },
  { value: "Abkhazian" },
  { value: "Afan (Oromo)" },
  { value: "Afar" },
  { value: "Afrikaans" },
  { value: "Albanian" },
  { value: "Amharic" },
  { value: "Arabic" },
  { value: "Armenian" },
  { value: "Assamese" },
  { value: "Aymara" },
  { value: "Azerbaijani" },
  { value: "Bambara" },
  { value: "Bashkir" },
  { value: "Basque" },
  { value: "Bengali;Bangla" },
  { value: "Bhutani" },
  { value: "Bihari" },
  { value: "Bislama" },
  { value: "Bosnian" },
  { value: "Breton" },
  { value: "Bulgarian" },
  { value: "Burmese" },
  { value: "Byelorussian" },
  { value: "Cambodian / Khmer" },
  { value: "Catalan" },
  { value: "Chewa / Nyanja / Chichewa" },
  { value: "Chinese / Mandarin" },
  { value: "Corsican" },
  { value: "Creol" },
  { value: "Croatian" },
  { value: "Czech" },
  { value: "Danish" },
  { value: "Dari" },
  { value: "Dutch / Flemish" },
  { value: "Estonian" },
  { value: "Ewe (Togo)" },
  { value: "Faroese" },
  { value: "Fiji" },
  { value: "Filipino" },
  { value: "Finnish" },
  { value: "Frisian" },
  { value: "Fulfude" },
  { value: "Galician" },
  { value: "Gallo" },
  { value: "Georgian" },
  { value: "Ghanaian" },
  { value: "Greek" },
  { value: "Greenlandic" },
  { value: "Guarani" },
  { value: "Gujarati" },
  { value: "Hausa" },
  { value: "Hebrew" },
  { value: "Hindi" },
  { value: "Hungarian" },
  { value: "Ibo" },
  { value: "Icelandic" },
  { value: "Indonesian / Bahasa" },
  { value: "Inuktitut" },
  { value: "Inupiak" },
  { value: "Irish" },
  { value: "Ishan" },
  { value: "Japanese" },
  { value: "Javanese" },
  { value: "Kannada" },
  { value: "Kashmiri" },
  { value: "Kazakh" },
  { value: "Kinyarwanda" },
  { value: "Kirghiz" },
  { value: "Korean" },
  { value: "Krio" },
  { value: "Krio / Pidgen" },
  { value: "Kurdish" },
  { value: "Kurundi" },
  { value: "Lao" },
  { value: "Latin" },
  { value: "Latvian;Lettish" },
  { value: "Lingala" },
  { value: "Lithuanian" },
  { value: "Luganda" },
  { value: "Luhya" },
  { value: "Luo / Dholuo" },
  { value: "Lusoga" },
  { value: "Luxembourgish" },
  { value: "Macedonian" },
  { value: "Malagasy" },
  { value: "Malay" },
  { value: "Malayalam" },
  { value: "Maltese" },
  { value: "Maori" },
  { value: "Marathi" },
  { value: "Moldavian" },
  { value: "Mongolian" },
  { value: "Montenegrin" },
  { value: "Nauru" },
  { value: "Ndbele" },
  { value: "Neo-Melanesian" },
  { value: "Nepali" },
  { value: "Newari" },
  { value: "Norwegian" },
  { value: "Oriya" },
  { value: "Pashto; Pushto" },
  { value: "Persian (Farsi)" },
  { value: "Pidgin" },
  { value: "Polish" },
  { value: "Punjabi" },
  { value: "Quechua" },
  { value: "Romanian" },
  { value: "Rukiga" },
  { value: "Runyankole" },
  { value: "Samoan" },
  { value: "Sangho" },
  { value: "Sanskrit" },
  { value: "Santali" },
  { value: "Scots Gaelic" },
  { value: "Serbian" },
  { value: "Sesotho" },
  { value: "Setswana" },
  { value: "Shona" },
  { value: "Sindhi" },
  { value: "Singhalese" },
  { value: "Siswati" },
  { value: "Slovak" },
  { value: "Slovenian" },
  { value: "Somali" },
  { value: "Sundanese" },
  { value: "Swahili / Kiswahili" },
  { value: "Swedish" },
  { value: "Tagalog" },
  { value: "Taiwanese" },
  { value: "Tajik" },
  { value: "Tamil" },
  { value: "Tatar" },
  { value: "Telugu" },
  { value: "Tetum" },
  { value: "Thai" },
  { value: "Tibetan" },
  { value: "Tigrinya" },
  { value: "Tonga" },
  { value: "Tsonga" },
  { value: "Turkish" },
  { value: "Turkmen" },
  { value: "Twi" },
  { value: "Uigur" },
  { value: "Ukrainian" },
  { value: "Urdu" },
  { value: "Uzbek" },
  { value: "Vietnamese" },
  { value: "Welsh" },
  { value: "Wolof" },
  { value: "Xhosa" },
  { value: "Yiddish" },
  { value: "Yoruba" },
  { value: "Zarma" },
  { value: "Zhuang" },
  { value: "Zulu" },
];
const language_level = {
  4: "Excellent",
  3: "Very good",
  2: "Average",
  1: "basic",
};
const BuildCvPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [createdExpertId, setCreatedExpertId] = useState(null);
  const [isStep1Submitting, setIsStep1Submitting] = useState(false);
  const [form] = Form.useForm();
  const [lang, setLang] = useState("");
  const [langLevel, setLangLevel] = useState("");
  const [datas, setDatas] = useState([]);

  const userId = localStorage.getItem("userId");
  const columns = [
    {
      title: "Language",
      dataIndex: "lang",
      key: "lang",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Level",
      dataIndex: "langLevel",
      key: "langLevel",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              console.log(datas, record);
              const x = datas.filter((d) => d.key != record.key);
              setDatas(x);
            }}
            type="primary"
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  // const [options,setOptions] =
  const handleStep1Next = async (formfinalValues) => {
    const expertiseArray = formfinalValues.expertise_area || [];
    const expertiseString = expertiseArray.join(", ");
    const formattedLanguages = datas.map((item) => ({
      language: item.lang,
      reading: item.langLevel,
      speaking: item.langLevel,
      writing: item.langLevel,
    }));
    const personalInfoPayload = {
      first_name: formfinalValues.firstName,
      last_name: formfinalValues.lastName,
      email: formfinalValues.email,
      expertise_area: expertiseString,
      nationality: formfinalValues.nationality,
      country: formfinalValues.country,
      countries_of_work_experience:
        formfinalValues.countries_of_work_experience.join(","),

      cv_language: formfinalValues.cv_language,
      year_of_experience: formfinalValues.year_of_experience,
      registered_by: userId,
      journals: formfinalValues.journals,
      books: formfinalValues.books?.join(","),
      publications: formfinalValues.publications,
      language_skills: formattedLanguages,
    };
    setIsStep1Submitting(true);
    message.loading("Creating expert profile...", 0);

    try {
      const newExpert = await createExpert(personalInfoPayload);
      message.destroy();
      message.success("Expert profile created successfully!");
      setCreatedExpertId(newExpert.id);
      setIsStep1Submitting(false);
      return true;
    } catch (error) {
      message.destroy();
      setIsStep1Submitting(false);
      const errorMessage =
        error.response?.data?.email?.[0] || "Failed to create expert.";
      message.error(errorMessage);
      return false;
    }
  };

  const handleBuildCvSubmit = async (finalValues) => {
    const expertId = createdExpertId;

    if (!expertId) {
      message.error(
        "Could not build CV because the expert was not created first. Please go back."
      );
      return;
    }

    console.log(`Building CV for expert with ID: ${expertId}`);
    console.log("Original form finalValues from AntD:", finalValues);

    const payload = {
      expert_id: expertId,
      personal_detail: {
        date_of_birth: finalValues.date_of_birth
          ? finalValues.date_of_birth.format("YYYY-MM-DD")
          : null,
        gender: finalValues.gender,
        country: finalValues.country,
        phone_number: finalValues.phone_number,
        email: finalValues.email,
        cv_language: finalValues.cv_language,
        current_position: finalValues.current_position,
        name_suffix: finalValues.name_suffix,
        language_skills: finalValues.language_skills,
        publications: finalValues.publications,
        journals: finalValues.journals,
        books: finalValues.books ? finalValues.books.join(", ") : "",
      },
      education: finalValues.education
        ? finalValues.education.map((edu) => ({
            institution_name: edu.institution_name,
            education_level: edu.education_level,
            field_of_study: edu.field_of_study,
            year_of_grad: edu.year_of_grad
              ? edu.year_of_grad.format("YYYY-MM-DD")
              : null,
          }))
        : [],
      experience: [
        ...(finalValues.work_experience_list || []).map((exp) => ({
          ...exp,
          start_date: exp.start_date
            ? exp.start_date.format("YYYY-MM-DD")
            : null,
          end_date: exp.end_date ? exp.end_date.format("YYYY-MM-DD") : null,
          typee: "work_experience",
        })),
        ...(finalValues.certification_list || []).map((cert) => ({
          ...cert,
          start_date: cert.start_date
            ? cert.start_date.format("YYYY-MM-DD")
            : null,
          end_date: cert.end_date ? cert.end_date.format("YYYY-MM-DD") : null,
          typee: "certification",
        })),
      ],
      expertise: finalValues.expertise,
      research_experience: finalValues.research_experience
        ? finalValues.research_experience.map((res) => ({
            position: res.position,
            client: res.client,
            country: res.country,
            contact_person: res.contact_person,
            email: res.email,
            phone_number: res.phone_number,
            start_date: res.start_date
              ? res.start_date.format("YYYY-MM-DD")
              : null,
            end_date: res.end_date ? res.end_date.format("YYYY-MM-DD") : null,
            description: res.description,
          }))
        : [],
    };

    console.log("Transformed payload being sent to backend:", payload);

    message.loading("Building CV...", 0);

    try {
      const responseData = await buildExpertCv(expertId, payload);

      message.destroy();
      console.log("Server Response:", responseData);
      navigate("/dashboard/all");
    } catch (error) {
      message.destroy();
      const errorData = error.response?.data;
      console.error("Backend validation error:", errorData);
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to create CV. Please check the details and try again.";
      message.error(errorMessage);
      console.error("Submission failed:", error);
    }
  };

  const sortedSubCategory = subCategory
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.value.toLowerCase() === item.value.toLowerCase()
        )
    )
    .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));

  const buildCvSteps = [
    {
      title: "Personal Info",
      fields: [
        "firstName",
        "lastName",
        "gender",
        "current_position",
        "name_suffix",
        "date_of_birth",
        "nationality",
        "cv_language",
        "email",
        "phone_number",
        "expertise_area",
        "year_of_experience",
        "countries_of_work_experience",
        "country",
        // "language_skills",
        "publications",
        "journals",
        "books",
      ],
      content: (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-5">
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter first name" size="large" />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter last name" size="large" />
            </Form.Item>
            <Form.Item label="Gender" name="gender">
              <Select placeholder="Select gender" size="large">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Current Position Title" name="current_position">
              <Input placeholder="e.g., TEAM LEADER" size="large" />
            </Form.Item>
            <Form.Item label="Name Suffix / Title" name="name_suffix">
              <Input placeholder="e.g., (PhD), PMP, etc." size="large" />
            </Form.Item>
            <Form.Item label="Date of Birth" name="date_of_birth">
              <DatePicker
                style={{ width: "100%" }}
                size="large"
                placeholder="Select date"
              />
            </Form.Item>
            <Form.Item label="Nationality" name="nationality">
              <Select
                size="large"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={nationalitys}
              />
            </Form.Item>

            <Form.Item
              label="CV Language"
              name="cv_language"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select language" size="large">
                <Option value="English">English</Option>
                <Option value="Amharic">Amharic</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input placeholder="example@email.com" size="large" />
            </Form.Item>
            <Form.Item label="Phone Number" name="phone_number">
              <Input placeholder="Enter phone number" size="large" />
            </Form.Item>
            <Form.Item label="Area of Expertise" name="expertise_area">
              <Select
                options={sortedSubCategory}
                // mode="tags"
                mode="multiple"
                placeholder="Type and press Enter to add expertise areas"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Years of Experience"
              name="year_of_experience"
              rules={[
                { required: true, message: "Please enter years of experience" },
              ]}
            >
              <InputNumber
                min={0}
                max={50}
                placeholder="e.g., 10"
                style={{ width: "100%" }}
                size="large"
              />
            </Form.Item>

            {/* <div className="md:col-span-2">
              <Form.Item label="Language Skills" name="language_skills">
                <Input.TextArea
                  placeholder="List language skills, e.g., English (Fluent), French (Basic)"
                  rows={3}
                />
              </Form.Item>
            </div> */}
            <div className="md:col-span-2  gap-5 flex flex-wrap flex-row   w-full flex-1 ">
              <div className="flex gap-3 flex-row flex-wrap  items-center flex-1">
                <div className="flex-1">
                  <p>Language</p>
                  <Select
                    options={languages}
                    className="flex-1 w-[200px]"
                    placeholder="-all-"
                    onChange={(v) => setLang(v)}
                    value={lang}
                    // mode="multiple"
                  />
                </div>
                <div className="flex-1">
                  <p>Level</p>
                  <Select
                    className="flex-1 w-[200px]"
                    options={[
                      { value: 4, label: "Excellent" },
                      { value: 3, label: language_level[3] },
                      { value: 2, label: language_level[2] },
                      { value: 1, label: language_level[1] },
                    ]}
                    onChange={(v) => setLangLevel(v)}
                    value={langLevel}
                    placeholder=""
                    // mode="multiple"
                  />
                </div>
                <div className={"  mx-5"}>
                  <Button
                    onClick={() => {
                      if (!lang || !langLevel) {
                        message.error("Select language and its level first!");

                        return;
                      }
                      const x = datas.some((d) => d.lang == lang);
                      console.log("datas:: ", datas);

                      if (!x) {
                        setDatas([
                          ...datas,
                          {
                            key: datas.length + 1,
                            lang: lang,
                            langLevel: langLevel,
                          },
                        ]);
                        setLang("");
                        setLangLevel("");
                      } else {
                        message.error("Already Added");
                      }
                    }}
                    type="primary"
                    // className="text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <Table columns={columns} dataSource={datas} />
              </div>{" "}
            </div>
            <div className="md:col-span-2">
              <Form.Item
                label="Countries of work experience"
                name="countries_of_work_experience"
              >
                <Select
                  size="large"
                  allowClear
                  mode="multiple"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={countryOptions}
                />
              </Form.Item>
              <Form.Item label="Current Working country" name="country">
                <Select
                  size="large"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={countryOptions}
                />
              </Form.Item>
            </div>
            <div className="md:col-span-2">
              <Form.Item label="Publications" name="publications">
                <Input.TextArea placeholder="List any publications" rows={3} />
              </Form.Item>
            </div>
            <div className="md:col-span-2">
              <Form.Item label="Journals" name="journals">
                <Input.TextArea placeholder="List any journals" rows={3} />
              </Form.Item>
            </div>
            <div className="md:col-span-2">
              <Form.Item label="Books" name="books">
                <Select
                  onChange={(v) => console.log(v)}
                  onKeyUp={(e) => console.log(e.target.value)}
                  // options={[{ value: "123" }, { value: "klj" }]}
                  mode="tags"
                  placeholder="Type book titles and press Enter"
                  size="large"
                />
              </Form.Item>
            </div>
          </div>
        </>
      ),
    },

    {
      title: "Education",
      fields: ["education"],
      content: (
        <Form.List name="education">
          {(fields, { add, remove }) => (
            <div className="space-y-6 mt-4">
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="p-4 border rounded-lg relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Form.Item
                      {...restField}
                      label="Institution Name"
                      name={[name, "institution_name"]}
                      rules={[
                        { required: true, message: "Institution is required" },
                      ]}
                    >
                      <Input
                        placeholder="e.g.,  University of Agricultural Science, India"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Education Level"
                      name={[name, "education_level"]}
                      rules={[{ required: true }]}
                    >
                      <Select placeholder="Select level" size="large">
                        <Option value="masters">Masters</Option>
                        <Option value="phd">PhD</Option>
                        <Option value="degree">Degree</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Field of Study"
                      name={[name, "field_of_study"]}
                      rules={[{ required: true }]}
                    >
                      <Input
                        placeholder="e.g., Computer Science"
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      label="Year of Graduation"
                      name={[name, "year_of_grad"]}
                    >
                      <DatePicker style={{ width: "100%" }} size="large" />
                    </Form.Item>
                  </div>
                  <MinusCircleOutlined
                    className="absolute top-4 right-4 text-[var(--theme-error)]"
                    onClick={() => remove(name)}
                  />
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Education
                </Button>
              </Form.Item>
            </div>
          )}
        </Form.List>
      ),
    },

    {
      title: "Experience & Certifications",
      fields: ["work_experience_list", "certification_list"],
      content: (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-4  pb-2">Work Experience</h3>
          <Form.List name="work_experience_list">
            {(fields, { add, remove }) => (
              <div className="space-y-6">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-5">
                      <Form.Item
                        {...restField}
                        label="Position Title"
                        name={[name, "position_title"]}
                      >
                        <Input
                          placeholder="e.g., Senior Developer"
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Organization Name"
                        name={[name, "organization_name"]}
                      >
                        <Input placeholder="e.g., Tech Company" size="large" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Country"
                        name={[name, "country"]}
                      >
                        <Select
                          size="large"
                          allowClear
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={countryOptions}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Start Date"
                        name={[name, "start_date"]}
                        rules={[{ required: true }]}
                      >
                        <DatePicker style={{ width: "100%" }} size="large" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="End Date"
                        name={[name, "end_date"]}
                      >
                        <DatePicker style={{ width: "100%" }} size="large" />
                      </Form.Item>
                      <div className="md:col-span-2">
                        <Form.Item
                          {...restField}
                          label="Responsibilities"
                          name={[name, "responsibilities"]}
                        >
                          <Input.TextArea
                            placeholder="Describe your responsibilities..."
                            rows={3}
                          />
                        </Form.Item>
                      </div>
                      <div className="md:col-span-2">
                        <Form.Item
                          {...restField}
                          label="Description"
                          name={[name, "description"]}
                        >
                          <Input.TextArea
                            placeholder="Any additional details..."
                            rows={2}
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <MinusCircleOutlined
                      className="absolute top-4 right-4 text-[var(--theme-error)]"
                      onClick={() => remove(name)}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Work Experience
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
          <h3 className="text-xl font-semibold mt-10 mb-4  pb-2">
            Certifications{" "}
          </h3>
          <Form.List name="certification_list">
            {(fields, { add, remove }) => (
              <div className="space-y-6">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="p-4 border rounded-lg relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-5">
                      <Form.Item
                        {...restField}
                        label="Certification Title"
                        name={[name, "position_title"]}
                      >
                        <Input
                          placeholder="e.g., Project Management Professional (PMP)"
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Issuing Organization"
                        name={[name, "organization_name"]}
                      >
                        <Input
                          placeholder="e.g., Project Management Institute"
                          size="large"
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Country"
                        name={[name, "country"]}
                      >
                        <Select
                          size="large"
                          allowClear
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={countryOptions}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Issue Date"
                        name={[name, "start_date"]}
                        rules={[{ required: true }]}
                      >
                        <DatePicker style={{ width: "100%" }} size="large" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        label="Expiration Date"
                        name={[name, "end_date"]}
                      >
                        <DatePicker style={{ width: "100%" }} size="large" />
                      </Form.Item>
                      <div className="md:col-span-2">
                        <Form.Item
                          {...restField}
                          label="Responsibilities"
                          name={[name, "responsibilities"]}
                        >
                          <Input.TextArea
                            placeholder="Describe your responsibilities..."
                            rows={3}
                          />
                        </Form.Item>
                      </div>
                      <div className="md:col-span-2">
                        <Form.Item
                          {...restField}
                          label="Description"
                          name={[name, "description"]}
                        >
                          <Input.TextArea
                            placeholder="Any additional details..."
                            rows={2}
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <MinusCircleOutlined
                      className="absolute top-4 right-4 text-[var(--theme-error)]"
                      onClick={() => remove(name)}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Certification
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
        </div>
      ),
    },

    {
      title: "Expertise",
      fields: [
        ["expertise", "specialization"],
        ["expertise", "key_words"],
      ],
      content: (
        <>
          <div className="mt-4  font-semibold ">
            <Form.Item
              label="Primary Specialization"
              name={["expertise", "specialization"]}
            >
              <Input
                placeholder="e.g., Web Development, Agricultural Economics"
                size="large"
              />
            </Form.Item>
            <Form.Item
              label="Skills"
              name={["expertise", "key_words"]}
              help="Type a skill and press Enter to add it."
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add skills"
                size="large"
              />
            </Form.Item>
          </div>
        </>
      ),
    },

    {
      title: "Research Experience",
      fields: ["research_experience"],
      content: (
        <Form.List name="research_experience">
          {(fields, { add, remove }) => (
            <div className="space-y-6 mt-4">
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="p-4 border rounded-lg relative">
                  <h3 className="font-bold text-xl mb-2">
                    Research Experience #{name + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 mt-5">
                    <Form.Item
                      {...restField}
                      label="Position"
                      name={[name, "position"]}
                    >
                      <Input
                        placeholder="e.g., Research Assistant"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Client/University"
                      name={[name, "client"]}
                    >
                      <Input
                        placeholder="e.g., University Research Lab"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Country"
                      name={[name, "country"]}
                    >
                      <Select
                        size="large"
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        options={countryOptions}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Contact Person"
                      name={[name, "contact_person"]}
                    >
                      <Input placeholder="e.g., Dr. Smith" size="large" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Start Date"
                      name={[name, "start_date"]}
                    >
                      <DatePicker style={{ width: "100%" }} size="large" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="End Date"
                      name={[name, "end_date"]}
                    >
                      <DatePicker style={{ width: "100%" }} size="large" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Contact Email"
                      name={[name, "email"]}
                      // rules={[{ required: true }]}
                    >
                      <Input
                        placeholder="e.g., research@example.com"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Contact Phone"
                      name={[name, "phone_number"]}
                    >
                      <Input placeholder="e.g., +2519..." size="large" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Project Name"
                      name={[name, "project_name"]}
                    >
                      <Input
                        placeholder="e.g., Coffee Value Chain Improvement Project"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      label="Category"
                      name={[name, "category"]}
                    >
                      <Input
                        placeholder="e.g., Agriculture, Public Health, Infrastructure"
                        size="large"
                      />
                    </Form.Item>
                    <div className="md:col-span-2">
                      <Form.Item
                        label="Description"
                        name={[name, "description"]}
                      >
                        <Input.TextArea
                          placeholder="Describe the research experience..."
                          rows={4}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <MinusCircleOutlined
                    className="absolute top-4 right-4 text-[var(--theme-error)]"
                    onClick={() => remove(name)}
                  />
                </div>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Research Experience
                </Button>
              </Form.Item>
            </div>
          )}
        </Form.List>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Build CV" description="Fill in the details below to create a new CV for an expert." />
      <div className="bg-[var(--theme-bg-primary)] p-8 rounded-lg shadow-md w-full flex-1 flex flex-col">
        <MultiStepForm
          form={form}
          steps={buildCvSteps}
          onSubmit={handleBuildCvSubmit}
          onStep1Next={handleStep1Next}
          isStep1Submitting={isStep1Submitting}
          submitButtonText="Register"
        />
      </div>
    </div>
  );
};

export default BuildCvPage;
