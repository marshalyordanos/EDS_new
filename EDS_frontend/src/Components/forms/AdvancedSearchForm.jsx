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

import { sectorsData, geoData, fundingAgenciesData } from "../../constants/searchTaxonomy";


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
      <div className="bg-[var(--color-dark)] p-3">
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
