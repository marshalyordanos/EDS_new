import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  App,
  Button,
  Spin,
  InputNumber,
  Table,
  Space,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import MultiStepForm from "../../Components/forms/MultiStepForm ";
import { getNameList } from "country-list";
import dayjs from "dayjs";
import {
  getExpertDetails,
  updateExpert,
  getNestedResourceList,
  updateNestedResource,
  createNestedResource,
  deleteNestedResource,
} from "../../services/expertService";
import PageHeader from "../../Components/shared/PageHeader";

const { Option } = Select;
const capitalize = (s) => {
  if (typeof s !== "string" || s.length === 0) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

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

const countryOptions = Object.entries(getNameList())
  .map(([name]) => ({
    label: capitalize(name),
    value: capitalize(name),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const parseLanguageSkills = (languageSkillsJson) => {
  try {
    const parsed = JSON.parse(languageSkillsJson);
    return parsed.map((item, index) => ({
      key: index + 1,
      lang: item.language.toLowerCase(),
      langLevel: Math.max(item.reading, item.speaking, item.writing),
    }));
  } catch (e) {
    console.error("Invalid languageSkills JSON:", e);
    return [];
  }
};

const language_level = {
  4: "Excellent",
  3: "Very good",
  2: "Average",
  1: "basic",
};
const EditExpertPage = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { expertId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [datas, setDatas] = useState([]);
  const [lang, setLang] = useState("");
  const [langLevel, setLangLevel] = useState("");

  const [nestedIds, setNestedIds] = useState({
    personalDetail: null,
    expertise: null,
  });

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
  useEffect(() => {
    if (!expertId) return;
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [
          expertDetails,
          personalDetailList,
          educationList,
          experienceList,
          expertiseList,
          researchList,
        ] = await Promise.all([
          getExpertDetails(expertId),
          getNestedResourceList(expertId, "personal_detail"),
          getNestedResourceList(expertId, "education"),
          getNestedResourceList(expertId, "work_experience"),
          getNestedResourceList(expertId, "expertise"),
          getNestedResourceList(expertId, "research_experience"),
        ]);
        const personalDetail = personalDetailList[0] || {};
        const expertise = expertiseList[0] || {};

        const d = parseLanguageSkills(expertDetails.language_skills);
        setDatas(d);

        setNestedIds({
          personalDetail: personalDetail.id || null,
          expertise: expertise.id || null,
        });

        const workExperienceList = experienceList
          .filter((exp) => exp.typee === "work_experience")
          .map((exp) => ({
            ...exp,
            start_date: exp.start_date ? dayjs(exp.start_date) : null,
            end_date: exp.end_date ? dayjs(exp.end_date) : null,
          }));

        const certificationList = experienceList
          .filter((exp) => exp.typee === "certification")
          .map((cert) => ({
            ...cert,
            start_date: cert.start_date ? dayjs(cert.start_date) : null,
            end_date: cert.end_date ? dayjs(cert.end_date) : null,
          }));

        const formData = {
          firstName: expertDetails.first_name,
          lastName: expertDetails.last_name,
          email: expertDetails.email,
          expertise_area: expertDetails.expertise_area,
          nationality: expertDetails.nationality,
          country: expertDetails.country,
          cv_language: expertDetails.cv_language,
          year_of_experience: expertDetails.year_of_experience,

          gender: personalDetail.gender,
          phone_number: personalDetail.phone_number,
          current_position: personalDetail.current_position,
          name_suffix: personalDetail.name_suffix,
          date_of_birth: personalDetail.date_of_birth
            ? dayjs(personalDetail.date_of_birth)
            : null,
          language_skills: personalDetail.language_skills,
          publications: personalDetail.publications,
          journals: personalDetail.journals,
          books: personalDetail.books
            ? personalDetail.books.split(", ").filter((b) => b)
            : [],

          expertise: {
            specialization: expertise.specialization,
            key_words: expertise.key_words || [],
          },
          education: educationList.map((edu) => ({
            ...edu,
            year_of_grad: edu.year_of_grad ? dayjs(edu.year_of_grad) : null,
          })),
          work_experience_list: workExperienceList,
          certification_list: certificationList,
          research_experience: researchList.map((res) => ({
            ...res,
            start_date: res.start_date ? dayjs(res.start_date) : null,
            end_date: res.end_date ? dayjs(res.end_date) : null,
          })),
        };

        form.setFieldsValue(formData);
        setOriginalData({
          ...formData,
          experience: experienceList,
        });
      } catch (error) {
        console.error("Failed to load full expert profile:", error);
        message.error("Failed to load expert data. Please try again");
        navigate("/dashboard/");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [expertId, form, message, navigate]);

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
        "language_skills",
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
                mode="tags"
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
                    className="flex-1 w-[300px]"
                    placeholder="-select-"
                    onChange={(v) => setLang(v)}
                    value={lang}
                    // mode="multiple"
                  />
                </div>
                <div className="flex-1">
                  <p>Level</p>
                  <Select
                    className="flex-1 w-[300px]"
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
                <div className={"mt-0 mb-4 mx-5"}>
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
          <div className="mt-4">
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
                  <h3 className="font-semibold mb-2">
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

  const handleUpdateSubmit = async (formValues) => {
    setIsSubmitting(true);
    message.loading({ content: "Saving changes...", key: "update" });
    try {
      const updatePromises = [];

      const formattedLanguages = datas.map((item) => ({
        language: item.lang,
        reading: item.langLevel,
        speaking: item.langLevel,
        writing: item.langLevel,
      }));
      const expertPayload = {
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        email: formValues.email,
        expertise_area: formValues.expertise_area,
        country: formValues.country,
        nationality: formValues.nationality,
        cv_language: formValues.cv_language,
        year_of_experience: formValues.year_of_experience,
        journals: formValues.journals,
        books: formValues.books?.join(","),
        publications: formValues.publications,
        language_skills: formattedLanguages,
      };
      updatePromises.push(updateExpert(expertId, expertPayload));

      const personalDetailPayload = {
        gender: formValues.gender,
        phone_number: formValues.phone_number,
        email: formValues.email,
        country: formValues.country,
        cv_language: formValues.cv_language,
        current_position: formValues.current_position,
        name_suffix: formValues.name_suffix,
        date_of_birth: formValues.date_of_birth
          ? formValues.date_of_birth.format("YYYY-MM-DD")
          : null,
        language_skills: formValues.language_skills,
        publications: formValues.publications,
        journals: formValues.journals,
        books: formValues.books ? formValues.books.join(", ") : "",
      };
      if (nestedIds.personalDetail) {
        updatePromises.push(
          updateNestedResource(
            expertId,
            "personal_detail",
            nestedIds.personalDetail,
            personalDetailPayload
          )
        );
      } else if (
        Object.values(personalDetailPayload).some(
          (v) => v !== null && v !== undefined && v !== ""
        )
      ) {
        updatePromises.push(
          createNestedResource(
            expertId,
            "personal_detail",
            personalDetailPayload
          )
        );
      }

      const expertisePayload = {
        specialization: formValues.expertise.specialization,
        key_words: formValues.expertise.key_words,
      };
      if (nestedIds.expertise) {
        updatePromises.push(
          updateNestedResource(
            expertId,
            "expertise",
            nestedIds.expertise,
            expertisePayload
          )
        );
      } else if (
        expertisePayload.specialization ||
        (expertisePayload.key_words && expertisePayload.key_words.length > 0)
      ) {
        updatePromises.push(
          createNestedResource(expertId, "expertise", expertisePayload)
        );
      }

      await Promise.all(updatePromises);

      const handleListUpdate = async (resourceName, originalList, newList) => {
        const listPromises = [];
        const newListIds = new Set(
          newList.map((item) => item.id).filter(Boolean)
        );

        for (const item of newList) {
          const payload = { ...item };
          delete payload.id;
          delete payload.expert;

          if (payload.year_of_grad)
            payload.year_of_grad = payload.year_of_grad.format("YYYY-MM-DD");
          if (payload.start_date)
            payload.start_date = payload.start_date.format("YYYY-MM-DD");
          if (payload.end_date)
            payload.end_date = payload.end_date.format("YYYY-MM-DD");

          if (item.id) {
            listPromises.push(
              updateNestedResource(expertId, resourceName, item.id, payload)
            );
          } else {
            listPromises.push(
              createNestedResource(expertId, resourceName, payload)
            );
          }
        }

        for (const item of originalList) {
          if (!newListIds.has(item.id)) {
            listPromises.push(
              deleteNestedResource(expertId, resourceName, item.id)
            );
          }
        }

        return Promise.all(listPromises);
      };

      const workExperiences = (formValues.work_experience_list || []).map(
        (exp) => ({
          ...exp,
          typee: "work_experience",
        })
      );

      const certifications = (formValues.certification_list || []).map(
        (cert) => ({
          ...cert,
          typee: "certification",
        })
      );

      const combinedExperience = [...workExperiences, ...certifications];

      await handleListUpdate(
        "education",
        originalData.education,
        formValues.education || []
      );
      await handleListUpdate(
        "work_experience",
        originalData.experience,
        combinedExperience
      );
      await handleListUpdate(
        "research_experience",
        originalData.research_experience,
        formValues.research_experience || []
      );
      message.success({
        content: "Changes saved successfully!",
        key: "update",
        duration: 2,
      });
      navigate("/dashboard/");
    } catch (error) {
      console.error("Failed to save changes:", error);
      message.error({
        content: "Failed to save one or more sections.",
        key: "update",
        duration: 2,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Spin size="large" tip="Loading Expert Data..." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Expert Profile" description="Update the details for the expert below." />
      <div className="bg-[var(--theme-bg-primary)] p-8 rounded-lg shadow-md w-full flex-1 flex flex-col">
        <MultiStepForm
          form={form}
          steps={buildCvSteps}
          onSubmit={handleUpdateSubmit}
          submitButtonText="Save Changes"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default EditExpertPage;
