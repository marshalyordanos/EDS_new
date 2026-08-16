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
import ConsoleStepForm from "../../Components/forms/ConsoleStepForm";
import CvPaperPreview from "../../Components/dashboard/CvPaperPreview";
import { subCategory } from "../../constants/searchTaxonomy";
import { createExpert, buildExpertCv } from "../../services/expertService";
import { getNameList } from "country-list";
import { Space, Table, Tag } from "antd";

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

import { nationalityOptions as nationalitys } from "../../constants/searchTaxonomy";


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

  /* Shared by the real submit and by "Save & finish later" — a draft is
     allowed to have missing sections, so every branch here tolerates
     undefined values rather than assuming full-step validation already ran. */
  const buildCvPayload = (expertId, finalValues) => ({
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
          institution_name: edu?.institution_name,
          education_level: edu?.education_level,
          field_of_study: edu?.field_of_study,
          year_of_grad: edu?.year_of_grad
            ? edu.year_of_grad.format("YYYY-MM-DD")
            : null,
        }))
      : [],
    experience: [
      ...(finalValues.work_experience_list || []).map((exp) => ({
        ...exp,
        start_date: exp?.start_date ? exp.start_date.format("YYYY-MM-DD") : null,
        end_date: exp?.end_date ? exp.end_date.format("YYYY-MM-DD") : null,
        typee: "work_experience",
      })),
      ...(finalValues.certification_list || []).map((cert) => ({
        ...cert,
        start_date: cert?.start_date ? cert.start_date.format("YYYY-MM-DD") : null,
        end_date: cert?.end_date ? cert.end_date.format("YYYY-MM-DD") : null,
        typee: "certification",
      })),
    ],
    expertise: finalValues.expertise,
    research_experience: finalValues.research_experience
      ? finalValues.research_experience.map((res) => ({
          position: res?.position,
          client: res?.client,
          country: res?.country,
          contact_person: res?.contact_person,
          email: res?.email,
          phone_number: res?.phone_number,
          start_date: res?.start_date ? res.start_date.format("YYYY-MM-DD") : null,
          end_date: res?.end_date ? res.end_date.format("YYYY-MM-DD") : null,
          description: res?.description,
        }))
      : [],
  });

  const handleBuildCvSubmit = async (finalValues) => {
    const expertId = createdExpertId;

    if (!expertId) {
      message.error(
        "Could not build CV because the expert was not created first. Please go back."
      );
      return;
    }

    const payload = buildCvPayload(expertId, finalValues);

    message.loading("Building CV...", 0);

    try {
      await buildExpertCv(expertId, payload);
      message.destroy();
      message.success("CV saved.");
      // Land back on the workspace this task started from, not the raw
      // unfiltered expert list.
      navigate("/dashboard/search");
    } catch (error) {
      message.destroy();
      const errorMessage =
        error.response?.data?.detail ||
        "Failed to create CV. Please check the details and try again.";
      message.error(errorMessage);
      console.error("Submission failed:", error.response?.data || error.message);
    }
  };

  /* "Save & finish later": persists whatever is currently filled in against
     the expert step 1 already created, with no validation requirement, then
     lets the shell send the operator back to search. */
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const handleSaveDraft = async (currentValues) => {
    const expertId = createdExpertId;
    if (!expertId) return false; // shell hides the button until this exists

    setIsSavingDraft(true);
    try {
      await buildExpertCv(expertId, buildCvPayload(expertId, currentValues));
      message.success("Saved. You can search for this expert to continue later.");
      return true;
    } catch (error) {
      message.error("Could not save your progress. Please try again.");
      console.error("Draft save failed:", error.response?.data || error.message);
      return false;
    } finally {
      setIsSavingDraft(false);
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
      description: "Who the expert is and how to reach them.",
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
      description: "Add each qualification, most recent first.",
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
      description: "Roles held and credentials earned.",
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
      description: "Specialisation and searchable keywords.",
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
      description: "Projects and studies. Optional.",
      optional: true,
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
    <ConsoleStepForm
      form={form}
      steps={buildCvSteps}
      onSubmit={handleBuildCvSubmit}
      onStep1Next={handleStep1Next}
      isStep1Submitting={isStep1Submitting}
      submitButtonText="Register expert"
      title="Build CV"
      preview={CvPaperPreview}
      onSaveDraft={handleSaveDraft}
      isSavingDraft={isSavingDraft}
      hasRecord={Boolean(createdExpertId)}
    />
  );
};

export default BuildCvPage;
