import { useState, useMemo, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Checkbox,
  Button,
  Col,
  Row,
  Space,
  Table,
  message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import protectedApiClient from "../../api/axios";
import { getNameList } from "country-list";

const sectorsData = [
  {
    category: "Ag. & Rural Dev.",
    subCategories: [
      "Agro-industry / Food / Nutrition",
      "Biotechnology",
      "Credit / Insurance / Clearing / Economics / Finance",
      "Cultivation / Harvesting / Crop",
      "Drying / Processing / Scarifying / Pelletizing",
      "Early Warning Systems / Surveillance (Crops)",
      "Farm / Co-operatives / Associations / Community Centres / Community Participation",
      "Fisheries / Aquaculture",
      "Forestry",
      "Fruits & Vegetables",
      "Horticulture",
      "Land / Erosion / Soil / Conservation",
      "Mapping / Cadastre",
      "Meat & Dairy",
      "Mechanisation / Production",
      "Packaging / Storage / Distribution / Marketing",
      "Pest / Disease / Weed",
      "Policy / Planning / Systems / Institutions",
      "Procurement / Machinery / Equipment / Infrastructure",
      "Seeds / Fertilisers / Agro-Chemicals / Pesticides",
      "Semi-arid & arid agriculture",
      "Sub-tropical & tropical agriculture",
      "Testing / Quality Control",
      "Veterinary",
      "Water / Drainage / Irrigation / Flood / Well / Hydrology / Water Sanitation",
      "Zoology / Livestock / Animals / Breeding / Genetics / Cattle / Entomology",
    ],
  },
  {
    category: "Comm. & P.Info",
    subCategories: [
      "Advertising / Information Campaign / Awareness-raising Campaign",
      "Communications",
      "Conferences / Events / Seminars",
      "Information Management / Knowledge Sharing",
      "Journalism",
      "Marketing",
      "Multi-Media",
      "Printing / Publishing",
      "Public Affairs / Public Relations",
      "Media / Radio / Television / Newspapers / Film / Photography",
      "Strategy & Policy",
      "Translation / Interpretation",
      "Writing & Editing / Press Release / Speech",
    ],
  },
  {
    category: "Const. & Engineering",
    subCategories: [
      "Building / Construction / Civil Works / Demolition",
      "Buildings / Offices / Houses",
      "Dredging & Reclamation",
      "Equipment / Material / Procurement / Contracting",
      "Finance / Bonds / Insurance / Cost",
      "Highways / Roads / Bridges / Tunnels",
      "Hydraulic Engineering (dams, pipelines, etc)",
      "Landscape Engineering",
      "Legislation / Permits / Standards",
      "Planning / Architecture / Engineering",
      "Rehabilitation and maintenance works",
      "Site Selection & Land Use",
      "Testing / Assessment / Metering / Protection / Signalling",
      "Works supervision",
    ],
  },
  {
    category: "Consumer Protection",
    subCategories: [
      "Comparative testing",
      "Consumer associations / groups",
      "Consumer protection / Consumer policy / Market surveillance",
      "Consumer redress",
      "Consumer representation",
      "Contracts / Contract terms",
      "Cosmetics / Household appliances / Cars / Dangerous substances/ Hazardous substances / Toys",
      "Information / Labelling",
      "Marketing practices / Sales methods",
      "Product quality control",
      "Product Safety / Food Safety / SPS (Sanitary / Phytosanitary)",
      "Standardisation / Certification / Accreditation / Conformity assessment / Metrology / Laboratory",
      "Sustainable consumption",
      "Warnings",
      "Warranty",
    ],
  },
  {
    category: "Economic Dev",
    subCategories: [
      "Business Centres / Incubators / Business Development / Business Plans / Clustering",
      "Co-operatives",
      "Corporate Governance",
      "Econometrics / Statistics / Income Distribution",
      "Economic Systems / Planning",
      "Employment / Labour",
      "Handicraft",
      "Household / Income Generation",
      "Macroeconomics / Crisis",
      "Matching Grants",
      "Mergers & Acquisitions / Partnerships / Joint Ventures",
      "Micro-Credit",
      "Microeconomics",
      "Privatisation / Public-Private Partnership",
      "Re-engineering (company) / Liquidation",
      "Restructuring (sector / industry)",
      "Small & Medium-Sized Enterprises (SMEs) / Start-ups",
      "Tourism / Hotels / Restaurants / Catering",
    ],
  },
  {
    category: "Education",
    subCategories: [
      "Adult Education / Non-Formal / Literacy",
      "Continuing",
      "Curriculum",
      "Distance Education / e-Learning / Education Technology / Exchange / Scholarship",
      "Facilities / Architecture / Physical Planning / Location",
      "Finance / Accounting / Audit",
      "Higher / University",
      "Library / Documentation Centre",
      "Manpower / Personnel",
      "Marginalised groups / Handicapped / Girls & Women / School attendance",
      "Performance / Examinations / Testing / Measurement / Inspectorate / Supervision / National Qualification framework (NQF)",
      "Policy / Planning / Systems / Institutions / Evaluation / Decentralisation",
      "Pre-School / Early Childhood",
      "Primary",
      "Procurement / Equipment / Materials / Media / Techniques / Textbooks / Publishing / Radio & Television",
      "Research & Development",
      "Secondary",
      "Teachers Training",
      "Technical / Industrial / Vocational",
      "Tertiary",
    ],
  },
  {
    category: "Energy",
    subCategories: [
      "Conservation / Saving / Recovery / Renewable",
      "Drilling / Production / Distribution / Reserves",
      "Electric",
      "Financials / Pricing / Tariffs",
      "Geothermal / Solar / Bio-Mass / Wind / Sea",
      "Heating / Co-Generation",
      "Hydroelectric",
      "Mining / Coal / Lignite / Anthracite",
      "Nuclear",
      "Oil / Gas / Petrol",
      "Planning / Policy",
      "Procurement / Equipment",
    ],
  },
  {
    category: "Environment",
    subCategories: [
      "Bio-diversity / Eco Systems",
      "Botany",
      "Climate / Cyclone",
      "Coastal Zone Management / Marine Biology",
      "Drought & Desertification",
      "Environmental Engineering / Science & Technology",
      "Historic & Cultural Heritage",
      "Natural disasters / Prevention",
      "Natural resources / Earth & Space sciences / Ecology",
      "Policy & Strategy (incl. Sustainability)",
      "Pollution (Air / Water / Soil / Noise / Industrial / Oil)",
      "Procurement",
      "Protected Areas / Parks / Reserves",
      "Protection / Bio-economy / Green economy",
      "Remote Sensing / Early Warning Systems / Surveillance",
      "Standards",
      "Surveys / Impact Assessment",
      "Topography / Geology / Earth Observation",
      "Urban Environment",
      "Waste / Toxic / Hazardous / Solid / Clean Technologies / Processing",
      "Wildlife",
    ],
  },
  {
    category: "Finance & Banking",
    subCategories: [
      "Audit / Accountancy / Due Diligence / Inventory",
      "Balance of Payments",
      "Banking system",
      "Budgets / Public Finance",
      "Capital / Reserves / Liquidity / Cash Flow / Liability / Creditors / Treasury",
      "Co-financing",
      "Corporate finance",
      "Credit / Letters of Credit / Loans / Credit Guarantees",
      "Currency / Exchange",
      "Debt / Indebtedness",
      "Financial Institutions",
      "Insurance",
      "Investment / Venture capital / Portfolio / Securities / Bonds / Stocks / Equities / Funds",
      "Leasing",
      "Market Instruments / Derivatives / Financial Markets / Exchanges",
      "Monetary / Fiscal Policy",
      "Money laundering / Fraud",
      "Payments / Mobile Banking / E-Banking",
      "Pensions",
      "Policy / Planning / Systems",
      "Regulations / Crisis",
      "Reporting / Finance Management",
      "Risk / Sensitivity / Market analysis / Forecasting / Models / Projection",
      "Structural Adjustment",
      "Taxation / Collection",
    ],
  },
  {
    category: "Health",
    subCategories: [
      "Bio-Medicine",
      "Diseases / Vaccination / Epidemic / Prevention / Risks",
      "Economics & Finances / Health Insurance",
      "Genetics",
      "Health Care Buildings / Hospital",
      "HIV / AIDS / STD",
      "Manpower",
      "Maternal-Child health / Maternity / Family planning / Reproductive health / Nursing",
      "Mental Health / Disabled",
      "Nutrition",
      "Occupational Health",
      "Patients' rights / Protection",
      "Pharmaceuticals / Drugs",
      "Policy / Planning / Systems / Organisation / Administration / Management / Systems / e-Health",
      "Primary Health Care",
      "Private Health Care Systems / Infrastructure",
      "Procurement / Logistics / Equipment / Supplies / Distribution / Delivery",
      "Public Health Care Systems / Infrastructure / Districts",
      "Research",
      "Safety / Liability",
      "Sanitation",
    ],
  },
  {
    category: "Humanitarian Aid",
    subCategories: [
      "Food Aid",
      "Land Mines / Mine Clearance",
      "Logistics / Procurement / Equipment",
      "Medical Aid",
      "Policy / Planning",
      "Prevention / Preparedness",
      "Refugees / Returnees / Displaced",
      "Temporary Shelters",
    ],
  },
  {
    category: "It",
    subCategories: [
      "Artificial intelligence",
      "Automation",
      "Computer Networks / Operations / Maintenance and Support / Security",
      "Computer-Assisted Design (CAD/CAM)",
      "Databases / Warehouses / Data Recovery",
      "Decision Support Systems",
      "Geographical Information / Localisation / Surveillance Systems",
      "Hardware / Equipment / Software",
      "Information society / Policy",
      "Internet / Web-based Platforms / e-Commerce / e-Governance",
      "Management Information Systems (MIS)",
      "Teletext",
      "Web Design",
    ],
  },
  {
    category: "Law",
    subCategories: [
      "Administrative Law",
      "Anti-corruption",
      "Bankruptcy / Creditors Rights / Insolvency",
      "Civil law / Public law / Election law / Political Party Law",
      "Commercial / Trade / Contract / Corporate / Industrial / Economic / Competition Law",
      "Computer / e-Commerce / Internet",
      "Constitutional Law",
      "Courts / Tribunals / Law Enforcement / Justice",
      "Criminal Law",
      "Environmental / Energy Law",
      "Financial / Banking / Investment Law",
      "Governmental Law",
      "Human Rights Protection Law",
      "Immigration Law",
      "Insurance Law",
      "International Law",
      "Judges",
      "Labour Law",
      "Law / Legislation / Legal Framework / Regulation / RIA / Reform",
      "Law Harmonisation / Approximation / Pre-accession / Acquis communautaire / European Law",
      "Patent / Trademark / Copyright / Intellectual Property",
      "Property / Estates / Trusts",
      "Secured Transactions / Privacy / Data protection",
      "Securities",
      "State Enterprises Law",
      "Taxation / Income / Chartered Surveyors",
      "Torts / Dispute Settlement / Dialogue / Arbitration / Litigation / Mediation",
      "Transport Law",
    ],
  },
  {
    category: "Prog Management",
    subCategories: [
      "Co-ordination / Aid co-ordination",
      "Cost / Benefits Analysis / Project Budgeting",
      "Country Programming / Programme Development",
      "Identification / Needs Analysis / Formulation / Feasibility Study",
      "Management Systems & Techniques",
      "Monitoring & Evaluation & Assessment / (impact) Studies / Project Audit / Survey",
      "Performance Appraisal",
      "Personnel / Human Resources Management",
      "Procurement / Tender evaluation",
      "Project Cycle Management / Project implementation",
      "Secretarial & Administrative Support",
      "Total Quality Management (TQM) / Quality Control",
      "Training",
    ],
  },
  {
    category: "Public Administration",
    subCategories: [
      "Administrative Agencies",
      "Budget / Budget Support / Public Investment / Finances / Debt",
      "Customs / Excise",
      "Elections / Polling / Voters",
      "Fight against drugs",
      "Foreign Affairs / Diplomacy",
      "Governance",
      "Justice and Home Affairs / Asylum / Immigration / Borders / Passport",
      "Manpower / Recruitment / HR / Grading",
      "Parliament / Political Parties",
      "Planning / Policy / Systems",
      "Police / Defence / Interior / Security / Prison / Fire fighting system",
      "Public Procurement",
      "Public utilities",
      "Reform / Institutional strengthening",
      "Regional / Municipal / Local Authorities / Decentralisation",
      "Regional Country Co-operation / European Integration",
      "Regional Funds",
      "State Enterprises",
      "Terrorism / Corruption / Fight against human traffic",
      "Twinning",
    ],
  },
  {
    category: "Science & Research",
    subCategories: [
      "Chemistry",
      "Earth sciences",
      "Human Sciences",
      "Information Sciences",
      "Life and Health Sciences",
      "Other Sciences",
      "Physics",
      "Procurement / Equipment",
    ],
  },
  {
    category: "Social",
    subCategories: [
      "Anthropology / Tribal / Ethnic Groups",
      "Classification / Norms / Standards",
      "Conflict / Post conflict / Conflict prevention / Political crises",
      "Culture / Religion / Sport / Arts",
      "Democracy / Human Rights",
      "Family Planning",
      "Gender / Women / Equal Opportunities / Discrimination / Re-integration",
      "Migration / Settlement / Resettlement / Border Crossing",
      "Pastoral Groups / Nomads",
      "Policy / Planning / Systems / Reform / Poverty Alleviation",
      "Procurement / Equipment / Vehicles / Supplies / Facilities / Rent",
      "Self-help / Grass-roots",
      "Social Security / Pension / Protection",
      "Statistics / Demography / Population / Census / Opinion Polling / Research",
      "Volunteering / NGO / CBO / Trade Unions / Civil Society",
      "Vulnerable Groups / Street Children / Minorities",
      "Youth",
    ],
  },
  {
    category: "Telecommunications",
    subCategories: [
      "Mobile systems / Services / Equipment",
      "Policy / Planning / Teletext",
      "Post / Courier service",
      "Procurement / Equipment / Systems",
      "Tariffs",
    ],
  },
  {
    category: "Trade & Industry",
    subCategories: [
      "Chambers of Commerce",
      "Commodities / Raw Materials",
      "Export / Competition",
      "Foreign Direct Investments / Investment promotion",
      "Free Trade Zones / Industrial Parks / Estates",
      "Import",
      "Industry / Industrial Products",
      "Licencing / Patents / Trademarks",
      "Logistics",
      "Market Analysis / Market Surveillance",
      "Marketing / Direct Marketing",
      "Policy / Planning",
      "Pricing",
      "Procurement / Purchasing & Supply / Sales",
      "Promotion / Aids / Facilitation",
      "Retail Management",
      "Sponsorship",
      "Tariff / Barriers / Contracts / Terms / Restrictions",
      "Trade / Global trade",
    ],
  },
  {
    category: "Transport",
    subCategories: [
      "Air / Aviation / Airport",
      "Freight / Cargo",
      "Inter-modal / Multi-modal",
      "Investment / Finances",
      "Logistics",
      "Navigational Aids",
      "Policy & Planning / Models",
      "Procurement / Equipment / Vehicles / Maintenance",
      "Rail",
      "Regulation & Pricing",
      "Road / Public transportation",
      "Safety",
      "Traffic / Origin-Destination Surveys",
      "Warehouses & Storage",
      "Water Navigation / Ports / Shipping",
    ],
  },
  {
    category: "Humanitarian",
    subCategories: [
      "Food Aid",
      "Land Mines / Mine Clearance",
      "Logistics / Procurement / Equipment",
      "Medical Aid",
      "Policy / Planning",
      "Prevention / Preparedness",
      "Refugees / Returnees / Displaced",
      "Temporary Shelters",
    ],
  },
  {
    category: "Urban Development",
    subCategories: [
      "Community Participation / Employment",
      "Energy",
      "Engineering / Infrastructure / Implementation / Building / Works Supervision",
      "Finance / Budgeting / Investment / Valuation / Taxation",
      "Land Use",
      "Pedestrian",
      "Planning / Models / Policies",
      "Property / Facilities / Asset Management",
      "Public utilities",
      "Self-help Programmes",
      "Services / Facilities / Maintenance / Cleaning services",
      "Shelter / Housing / Habitat",
      "Slums",
      "Standards & Regulations",
      "Survey",
      "Transport",
      "Water / Drainage / Irrigation / Flood / Well / Hydrology",
    ],
  },
];

const geoData = [
  {
    category: "Central & Eastern Europe",
    subCategories: [
      "Armenia",
      "Azerbaijan",
      "Belarus",
      "Czech Republic",
      "Estonia",
      "Georgia",
      "Hungary",
      "Latvia",
      "Lithuania",
      "Moldova",
      "Poland",
      "Russian Federation",
      "Slovakia",
      "Slovenia",
      "Ukraine",
    ],
  },
  {
    category: "South-East Europe",
    subCategories: [
      "Albania",
      "Bosnia and Herzegovina",
      "Bulgaria",
      "Croatia",
      "Cyprus",
      "Kosovo",
      "Montenegro",
      "North Macedonia",
      "Romania",
      "Serbia",
    ],
  },
  {
    category: "Western Europe",
    subCategories: [
      "Andorra",
      "Austria",
      "Belgium",
      "Denmark",
      "Faroe Islands",
      "Finland",
      "France",
      "Germany",
      "Gibraltar",
      "Greece",
      "Greenland",
      "Iceland",
      "Ireland",
      "Italy",
      "Liechtenstein",
      "Luxembourg",
      "Malta",
      "Monaco",
      "Netherlands",
      "Norway",
      "Portugal",
      "San Marino",
      "Spain",
      "Svalbard and Jan Mayen Islands",
      "Sweden",
      "Switzerland",
      "United Kingdom",
      "Vatican City",
    ],
  },

  {
    category: "Central Africa",
    subCategories: [
      "Burundi",
      "Cameroon",
      "Central African Republic",
      "Chad",
      "Congo (Brazaville)",
      "Congo, Democratic Republic of the",
      "Equatorial Guinea",
      "Gabon",
      "Rwanda",
      "The Sahel",
    ],
  },
  {
    category: "Eastern Africa",
    subCategories: [
      "Comoros",
      "Djibouti",
      "Eritrea",
      "Ethiopia",
      "Heard and McDonald Islands",
      "Kenya",
      "Madagascar",
      "Mayotte",
      "Reunion (France)",
      "Seychelles",
      "Somalia",
      "South Sudan",
      "Sudan",
      "Tanzania",
      "Uganda",
    ],
  },
  {
    category: "Northern Africa",
    subCategories: [
      "Algeria",
      "Egypt",
      "Libya",
      "Mauritania",
      "Morocco",
      "Tunisia",
      "Western Sahara",
    ],
  },
  {
    category: "Southern Africa",
    subCategories: [
      "Angola",
      "Botswana",
      "Lesotho",
      "Malawi",
      "Mauritius",
      "Mozambique",
      "Namibia",
      "Saint Helena",
      "South Africa",
      "Swaziland / Kingdom of Eswatini",
      "Zambia",
    ],
  },
  {
    category: "Western Africa",
    subCategories: [
      "Benin",
      "Burkina Faso",
      "Cape Verde",
      "Gambia, The",
      "Ghana",
      "Guinea",
      "Guinea-Bissau",
      "Ivory Coast",
      "Liberia",
      "Mali",
      "Niger",
      "Nigeria",
      "Sao Tome and Principe",
      "Senegal",
      "Sierra Leone",
      "Togo",
    ],
  },
  {
    category: "Central Asia",
    subCategories: [
      "Kazakhstan",
      "Kyrgyz Republic",
      "Tajikistan",
      "Turkmenistan",
      "Uzbekistan",
    ],
  },
  {
    category: "Middle East",
    subCategories: [
      "Bahrain",
      "Iran Islamic Republic",
      "Iraq",
      "Israel",
      "Jordan",
      "Kuwait",
      "Lebanon",
      "Oman",
      "Palestine / West Bank and Gaza",
      "Qatar",
      "Saudi Arabia",
      "Syria",
      "Turkey",
      "United Arab Emirates",
      "Yemen",
    ],
  },
  {
    category: "North-East Asia",
    subCategories: [
      "China",
      "Hong Kong (China)",
      "Japan",
      "Korea, North",
      "Korea, South",
      "Macau (China)",
      "Mongolia",
    ],
  },
  {
    category: "South-East Asia",
    subCategories: [
      "Brunei Darussalam",
      "Cambodia",
      "East Timor",
      "Indonesia",
      "Laos",
      "Malaysia",
      "Myanmar",
      "Philippines",
      "Singapore",
      "Taiwan",
      "Thailand",
      "Vietnam",
    ],
  },
  {
    category: "Southern Asia",
    subCategories: [
      "Afghanistan",
      "Bangladesh",
      "Bhutan",
      "British Indian Ocean Territory",
      "India",
      "Maldives",
      "Nepal",
      "Pakistan",
      "Sri Lanka",
    ],
  },
  {
    category: "Oceania",
    subCategories: [
      "American Samoa",
      "Australia",
      "Christmas Island",
      "Cocos (Keeling) Islands",
      "Cook Islands",
      "Fiji",
      "French Polynesia",
      "Kiribati",
      "Marshall Islands",
      "Micronesia, Federated States of",
      "Nauru",
      "New Caledonia",
      "New Zealand",
      "Niue",
      "Norfolk Island",
      "Northern Mariana Islands",
      "Palau",
      "Papua New Guinea",
      "Samoa",
      "Solomon Islands",
      "Tokelau",
      "Tonga",
      "Tuvalu",
      "Vanuatu",
      "Wallis and Futuna",
    ],
  },
  {
    category: "Central America",
    subCategories: [
      "Anguilla",
      "Antigua and Barbuda",
      "Aruba",
      "Bahamas",
      "Barbados",
      "Belize",
      "Bermuda",
      "Cayman Islands",
      "Costa Rica",
      "Cuba",
      "Dominica",
      "Dominican Republic",
      "El Salvador",
      "Grenada",
      "Guadeloupe (France)",
      "Guatemala",
      "Haiti",
      "Honduras",
      "Jamaica",
      "Martinique (France)",
      "Mexico",
      "Montserrat",
      "Netherlands Antilles",
      "Nicaragua",
      "Panama",
      "Puerto Rico",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Vincent and the Grenadines",
      "Trinidad and Tobago",
      "Turks and Caicos Islands",
      "Virgin Islands (British)",
      "Virgin Islands (USA)",
    ],
  },
  {
    category: "North America",
    subCategories: [
      "Canada",
      "Saint Pierre and Miquelon",
      "United States of America",
    ],
  },
  {
    category: " South America",
    subCategories: [
      "Brunei Darussalam",
      "Cambodia",
      "East Timor",
      "Indonesia",
      "Laos",
    ],
  },
  {
    category: "South",
    subCategories: [
      "Argentina",
      "Bolivia",
      "Brazil",
      "Chile",
      "Colombia",
      "Ecuador",
      "Falkland Islands",
      "French Guiana",
      "Guyana",
      "Paraguay",
      "Peru",
      "Pitcairn Island",
      "South Georgia and the South Sandwich Islands",
      "Suriname",
      "Uruguay",
      "Venezuela",
    ],
  },
];

const fundingAgenciesData = [
  "ADB – Asian Development Bank",
  "AfDB – African Development Bank",
  "EIB – European Investment Bank",
  "GCF – Green Climate Fund",
  "GF – The Global Fund to Fight AIDS, Tuberculosis and Malaria",
  "GIZ – Deutsche Gesellschaft für Internationale Zusammenarbeit",
  "Global Affairs Canada (AMC)",
  "JICA – Japan International Cooperation Agency",
  "KOICA – Korea International Cooperation Agency",
  "NORAD – Norwegian Agency for Development Cooperation",
  "SIDA – Swedish International Development Cooperation Agency",
  "UNDP – United Nations Development Programme",
  "UNFPA – United Nations Population Fund",
  "UNHCR – United Nations High Commissioner for Refugees",
  "UNICEF – United Nations Children’s Fund",
  "UNWFP – United Nations World Food Programme",
  "USAID – U.S. Agency for International Development",
  "WB – World Bank",
  "WHO – World Health Organization",
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

const education = [
  { value: "Accounting" },
  { value: "Agriculture and Rural Development" },
  { value: "Architecture" },
  { value: "Arts & Humanities" },
  { value: "Banking" },
  { value: "Biology" },
  { value: "Biotechnology / Genetics" },
  { value: "Botany" },
  { value: "Business / Management" },
  { value: "Cartography / Topography" },
  { value: "Chemistry" },
  { value: "Communication" },
  { value: "Econometrics" },
  { value: "Economics" },
  { value: "Education" },
  { value: "Education-primary" },
  { value: "Education-secondary" },
  { value: "Education-tertiary" },
  { value: "Engineering" },
  { value: "Engineering-chemical" },
  { value: "Engineering-civil and environmental" },
  { value: "Engineering-construction" },
  { value: "Engineering-electrical" },
  { value: "Engineering-electronic" },
  { value: "Engineering-industrial" },
  { value: "Engineering-mechanical" },
  { value: "Environment" },
  { value: "Finance / Accounting / Audit" },
  { value: "Geography" },
  { value: "Geology" },
  { value: "Health" },
  { value: "Health-medicine" },
  { value: "Health-nursing" },
  { value: "Health-pharmacy" },
  { value: "Health-psychology" },
  { value: "Health-veterinary" },
  { value: "History" },
  { value: "Human Resource Management" },
  { value: "Human Rights" },
  { value: "International Business" },
  { value: "International Relations" },
  { value: "IT / Information Science" },
  { value: "Journalism / Media" },
  { value: "Languages" },
  { value: "Law" },
  { value: "Law - European Union" },
  { value: "Law-civil" },
  { value: "Law-commercial" },
  { value: "Law-criminal" },
  { value: "Law-international" },
  { value: "Law-public" },
  { value: "Marketing" },
  { value: "Mathematics" },
  { value: "Philosophy" },
  { value: "Physics" },
  { value: "Political Science" },
  { value: "Public Affairs / Administration" },
  { value: "Public Relations" },
  { value: "Secretariat" },
  { value: "Social policy" },
  { value: "Social sciences" },
  { value: "Sociology / Anthropology" },
  { value: "Statistics" },
  { value: "Technical Sciences" },
  { value: "Telecommunications" },
  { value: "Tourism" },
  { value: "Trade" },
  { value: "Urban development" },
];
const language_level = {
  4: "Excellent",
  3: "Very good",
  2: "Average",
  1: "basic",
};

const SelectAllCheckbox = ({
  form,
  data,
  namePath,
  activeCategory,
  labelPrefix,
}) => {
  const allOptions = useMemo(
    () =>
      data.find((item) => item.category === activeCategory)?.subCategories ||
      [],
    [data, activeCategory],
  );
  const selectedValues = Form.useWatch(namePath, form) || [];

  const onCheckAllChange = (e) => {
    form.setFieldValue(namePath, e.target.checked ? allOptions : []);
  };

  const isChecked =
    selectedValues.length === allOptions.length && allOptions.length > 0;
  const isIndeterminate =
    selectedValues.length > 0 && selectedValues.length < allOptions.length;

  return (
    <Checkbox
      onChange={onCheckAllChange}
      checked={isChecked}
      indeterminate={isIndeterminate}
    >
      {`${labelPrefix} ${activeCategory}`}
    </Checkbox>
  );
};

const AdvancedSearchForm = ({ onSearch, datas, setDatas }) => {
  const [form] = Form.useForm();
  const [activeSector, setActiveSector] = useState(sectorsData[0].category);
  const [activeGeo, setActiveGeo] = useState(geoData[0].category);
  const [company, setCompany] = useState([]);
  const [lang, setLang] = useState("");
  const [langLevel, setLangLevel] = useState("");
  // const [datas, setDatas] = useState([]);

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
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];
  const onFinish = (values) => {
    console.log("Form values collected by AdvancedSearchForm:", values);
    if (onSearch) {
      onSearch(values);
    }
  };
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

  const fetchCompany = async () => {
    try {
      const response = await protectedApiClient.get(
        "/api/v1/users/company-names/",
      );
      setCompany(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch experts:",
        error.response ? error.response.data : error.message,
      );
      throw error;
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  // for clearing the form
  const onClear = () => {
    form.resetFields();
    setActiveSector(sectorsData[0].category);
    setActiveGeo(geoData[0].category);
  };

  // component for our custom styled cards
  const TitledCard = ({ title, children }) => (
    <div className="bg-[var(--theme-bg-primary)] rounded-lg shadow-md overflow-hidden">
      <div className="bg-[var(--color-primary)] p-3">
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="space-y-8"
    >
      {/* Top Search Bar */}
      <TitledCard title="Keywords Search">
        <div className="flex border-[var(--theme-border-medium)] pb-3">
          <div className="w-1/5 pt-1">
            <span className="font-semibold text-[var(--theme-text-secondary)]">
              Expert name
            </span>
          </div>
          <div className="w-4/5">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col">
                <Form.Item name="firstName" noStyle>
                  <Input />
                </Form.Item>
                <span className=" mt-1">First name</span>
              </div>
              <div className="flex flex-col">
                <Form.Item name="lastName" noStyle>
                  <Input />
                </Form.Item>
                <span className=" mt-1">Family name</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex pt-3">
          <div className="w-1/5 pt-1">
            <span className="font-semibold text-[var(--theme-text-secondary)]">
              Keyword search
            </span>
          </div>
          <div className="w-4/5">
            <div className="flex items-start gap-2">
              <div>
                <Form.Item name="keywordOption" noStyle initialValue="all">
                  <Select style={{ width: 150 }}>
                    <Select.Option value="all">all of the words</Select.Option>
                    <Select.Option value="any">any of the words</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              <div className="flex-1">
                <Form.Item name="keywords" noStyle>
                  <Input />
                </Form.Item>
              </div>
            </div>
            <p className="text-sm text-[var(--theme-info)] mt-3">
              This searches the entire content of all the online CVs.
            </p>
          </div>
        </div>
      </TitledCard>
      <div className="flex justify-start mt-6">
        <Space>
          <Button type="primary" htmlType="submit">
            SEARCH
          </Button>
          <Button type="primary" onClick={onClear}>
            CLEAR ALL
          </Button>
        </Space>
      </div>

      {/* Sectors of Experience Panel  */}
      <TitledCard title="Sectors of expert's experience">
        <div className="flex border rounded-lg max-h-96 overflow-hidden">
          <div className="w-1/3 border-r bg-[var(--theme-bg-primary)] p-4 overflow-y-auto">
            <div className="space-y-2">
              {sectorsData.map((item) => (
                <div
                  key={item.category}
                  onClick={() => setActiveSector(item.category)}
                  className={`p-2 rounded cursor-pointer transition-all text-sm ${
                    activeSector === item.category
                      ? "text-[var(--color-primary)] font-bold underline underline-offset-4 decoration-2 decoration-accent"
                      : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)]"
                  }`}
                >
                  {item.category}
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/3 flex flex-col">
            <div className="p-3 bg-[var(--theme-bg-tertiary)] border-b sticky top-0 z-10">
              <SelectAllCheckbox
                form={form}
                data={sectorsData}
                namePath={["sectors", activeSector]}
                activeCategory={activeSector}
                labelPrefix="Select all sub-sectors in"
              />
            </div>
            <div className="p-4 overflow-y-auto">
              {sectorsData.map((sector) => (
                <div
                  key={sector.category}
                  style={{
                    display:
                      activeSector === sector.category ? "block" : "none",
                  }}
                >
                  <Form.Item name={["sectors", sector.category]} noStyle>
                    <Checkbox.Group className="w-full">
                      <div className="space-y-3">
                        {sector.subCategories.map((subCategory) => (
                          <div key={subCategory}>
                            <Checkbox value={subCategory}>
                              {subCategory}
                            </Checkbox>
                          </div>
                        ))}
                      </div>
                    </Checkbox.Group>
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TitledCard>

      {/*Countries of expert's experience Panel */}
      <TitledCard title="Countries of expert's experience">
        <div className="flex border rounded-lg max-h-96 overflow-hidden">
          <div className="w-1/3 border-r bg-[var(--theme-bg-primary)] p-4 overflow-y-auto">
            <div className="space-y-2">
              {geoData.map((item) => (
                <div
                  key={item.category}
                  onClick={() => setActiveGeo(item.category)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    activeGeo === item.category
                      ? "text-[var(--color-primary)] font-bold underline underline-offset-4 decoration-2 decoration-accent"
                      : "text-[var(--theme-text-secondary)] hover:bg-[var(--theme-bg-tertiary)]"
                  }`}
                >
                  {item.category}
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/3 flex flex-col">
            <div className="p-3 bg-[var(--theme-bg-tertiary)] border-b sticky top-0 z-10">
              <SelectAllCheckbox
                form={form}
                data={geoData}
                namePath={["geographical", activeGeo]}
                activeCategory={activeGeo}
                labelPrefix="Select all countries in"
              />
            </div>
            <div className="p-4 overflow-y-auto">
              {geoData.map((geo) => (
                <div
                  key={geo.category}
                  style={{
                    display: activeGeo === geo.category ? "block" : "none",
                  }}
                >
                  <Form.Item name={["geographical", geo.category]} noStyle>
                    <Checkbox.Group className="w-full">
                      <div className="space-y-3">
                        {geo.subCategories.map((subCategory) => (
                          <div key={subCategory}>
                            <Checkbox value={subCategory}>
                              {subCategory}
                            </Checkbox>
                          </div>
                        ))}
                      </div>
                    </Checkbox.Group>
                  </Form.Item>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TitledCard>

      <TitledCard title="Funding agencies of expert's experience">
        <Form.Item name="fundingAgencies" noStyle>
          <Checkbox.Group style={{ width: "100%" }}>
            <Row gutter={[16, 16]}>
              {fundingAgenciesData.map((agency) => (
                <Col xs={24} sm={12} md={8} key={agency}>
                  <Checkbox value={agency}>{agency}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </TitledCard>

      <TitledCard title="Search Options">
        <div style={{ maxWidth: "800px" }}>
          <Form.Item
            name="database"
            label="Database"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select
              placeholder="-all-"
              mode="multiple"
              options={company.map((c) => ({ value: c }))}
            />
          </Form.Item>
          {/* <Form.Item
              name="pastExperience"
              label="Time-frame of past relevant experience"
            >
              <Input />
            </Form.Item> */}
          <Form.Item
            name="experienceOnProjects"
            label="Consider experience on
  at least (n. of projects)"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select
              options={[
                { value: 2, label: "2 projects" },
                { value: 5, label: "5 projects" },
                { value: 10, label: "10 projects" },
              ]}
              placeholder=""
            />
          </Form.Item>
          <Form.Item
            name="currentlyWorkingIn"
            label="Currently working in"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select
              placeholder="-all-"
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
            name="cv_language"
            label="CV language"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select
              options={[{ value: "English" }, { value: "Amharic" }]}
              placeholder=""
            />
          </Form.Item>
          <Form.Item
            name="nationality"
            label="Nationality"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select
              placeholder="-all-"
              mode="multiple"
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
            name="education"
            label="Education"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select placeholder="-all-" options={education} mode="multiple" />
          </Form.Item>

          {/* <Form.Item name="language" label="Language">
              <Select options={languages} placeholder="-all-" mode="multiple" />
            </Form.Item> */}
          <Form.Item
            name="seniority"
            label="Seniority"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Select
              options={[
                { value: "lt_5", label: "Less than 5 years" },
                { value: "btw_0_5", label: "Between 0 and 5 years" },
                { value: "gt_5", label: "Over 5 years" },

                { value: "lt_10", label: "Less than 10 years" },
                { value: "btw_5_10", label: "Between 5 and 10 years" },
                { value: "gt_10", label: "Over 10 years" },

                { value: "lt_15", label: "Less than 15 years" },
                { value: "btw_10_15", label: "Between 10 and 15 years" },
                { value: "gt_15", label: "Over 15 years" },

                { value: "lt_20", label: "Less than 20 years" },
                { value: "btw_15_20", label: "Between 15 and 20 years" },
                { value: "gt_20", label: "Over 20 years" },
              ]}
              placeholder="-all-"
            />
          </Form.Item>

          <Form.Item
            label="Language"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
          >
            <Row gutter={8}>
              <Col flex="auto">
                <Select
                  options={languages}
                  placeholder="Select language"
                  onChange={(v) => setLang(v)}
                  value={lang}
                  // mode="multiple"
                />
              </Col>
              <Col flex="auto">
                <Select
                  options={[
                    { value: 0, label: "----" },

                    { value: 4, label: "Excellent" },
                    { value: 3, label: language_level[3] },
                    { value: 2, label: language_level[2] },
                    { value: 1, label: language_level[1] },
                  ]}
                  onChange={(v) => setLangLevel(v)}
                  value={langLevel}
                  placeholder="Select level"
                  // mode="multiple"
                />
              </Col>
              <Col flex="none">
                <Button
                  type="primary"
                  onClick={() => {
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
                      setLang("-all-");
                      setLangLevel("");
                    } else {
                      message.error("Already Added");
                    }
                  }}
                >
                  Add
                </Button>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            label=" "
            colon={false}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Table
              columns={columns}
              dataSource={datas}
              pagination={false}
              size="small"
              locale={{ emptyText: "No languages added" }}
            />
          </Form.Item>
        </div>
      </TitledCard>
      <div className="flex justify-end  ">
        <Space>
          <Button type="primary" onClick={onClear}>
            CLEAR ALL
          </Button>
          <Button type="primary" htmlType="submit">
            SEARCH
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default AdvancedSearchForm;
