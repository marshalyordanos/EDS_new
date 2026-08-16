import PageHeader from "../../Components/shared/PageHeader";
import MultiStepForm from "../../Components/forms/MultiStepForm ";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, App, Upload, InputNumber } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { createExpertWithCv, uploadCv } from "../../services/expertService";
import { getNameList } from "country-list";
import { subCategory } from "../../constants/searchTaxonomy";
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

const QuickUploadPage = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  // Step 1 data is held here until final submit - nothing is created early.
  const [pendingPersonalInfo, setPendingPersonalInfo] = useState(null);
  // Step 1 no longer hits the API, so it never shows a submitting state.
  const [isStep1Submitting] = useState(false);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);
  const userId = localStorage.getItem("userId");
  const [formated, setFormated] = useState(true);

  const sortedSubCategory = subCategory
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) => t.value.toLowerCase() === item.value.toLowerCase()
        )
    )
    .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()));

  // Sort alphabetically
  // const sortedSubCategory = uniqueSubCategory.sort((a, b) =>
  //   a.value.toLowerCase().localeCompare(b.value.toLowerCase())
  // );

  const steps = [
    {
      title: "Personal Detail",
      fields: [
        "firstName",
        "lastName",
        "country",
        "cv_language",
        "email",
        "expertise_area",
        "year_of_experience",
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
            <Form.Item label="CV Language" name="cv_language">
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
            <Form.Item
              label="Area of Expertise"
              name="expertise_area"
              rules={[
                {
                  required: true,
                  message: "Please enter at least one expertise area.",
                },
              ]}
            >
              <Select
                mode="multiple"
                options={sortedSubCategory}
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
          </div>
        </>
      ),
    },
    {
      title: "CV Upload",
      fields: ["cv_file"],
      content: (
        <>
          <p className="dashboard-meta text-center mb-4">
            Please upload the expert's CV file. Accepted formats: PDF, DOC,
            DOCX.
          </p>
          <div className="flex gap-3 my-4 mt-8">
            <button
              onClick={() => setFormated(true)}
              className={`dashboard-btn-ghost ${
                formated ? "!bg-[var(--color-primary)] !text-white !border-[var(--color-primary)]" : ""
              }`}
            >
              Formatted
            </button>
            <button
              onClick={() => setFormated(false)}
              className={`dashboard-btn-ghost ${
                !formated ? "!bg-[var(--color-primary)] !text-white !border-[var(--color-primary)]" : ""
              }`}
            >
              Unformatted
            </button>
          </div>
          <Form.Item
            label="Upload CV"
            name="cv_file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: "Please upload a CV file" }]}
          >
            <Upload name="cv" accept=".pdf,.docx" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Click to Upload CV</Button>
            </Upload>
          </Form.Item>
        </>
      ),
    },
  ];
  const handleStep1Next = async (values) => {
    const expertiseArray = values.expertise_area || [];
    const expertiseString = expertiseArray.join(", ");
    const personalInfo = {
      first_name: values.firstName,
      last_name: values.lastName,
      email: values.email,
      expertise_area: expertiseString,
      nationality: values.nationality,
      cv_language: values.cv_language,
      year_of_experience: values.year_of_experience,
      registered_by: userId,
    };

    // Nothing is created yet - the expert and CV are saved together in one
    // atomic request at final submit, so a failed CV upload leaves no record.
    setPendingPersonalInfo(personalInfo);
    return true;
  };

  const handleFinalSubmit = async (values) => {
    if (!pendingPersonalInfo) {
      message.error("Expert details are missing. Please go back to step one.");
      return;
    }

    setIsFinalSubmitting(true);
    message.loading({ content: "Registering expert...", key: "finalSubmit" });

    try {
      const cvFile = values.cv_file[0].originFileObj;

      if (formated) {
        // Formatted CVs go through the parse-and-save endpoint, which creates
        // the expert and its related records from the file in one call.
        const cvFormData = new FormData();
        cvFormData.append("cv_file", cvFile);
        await uploadCv(cvFormData);
      } else {
        // Expert + CV in a single atomic request: if the CV fails to save,
        // the expert is rolled back and nothing is persisted.
        await createExpertWithCv(pendingPersonalInfo, cvFile);
      }

      message.destroy("finalSubmit");
      message.success("Expert and CV registered successfully!");
      navigate("/dashboard/all");
    } catch (error) {
      message.destroy("finalSubmit");
      const data = error.response?.data;
      message.error(
        data?.email?.[0] ||
          data?.cv_file?.[0] ||
          data?.error ||
          "Registration failed - nothing was saved. Please try again."
      );
      console.error("Registration failed:", error);
    } finally {
      setIsFinalSubmitting(false);
    }
  };
  return (
    <div className="dashboard-container">
      <div className="dashboard-main-content">
        <PageHeader title="Register New Expert" description="Follow the steps below to quickly add a new expert by uploading their CV." />
        
        <div className="dashboard-card flex-1 flex flex-col">
          <MultiStepForm
            form={form}
            steps={steps}
            onSubmit={handleFinalSubmit}
            onStep1Next={handleStep1Next}
            isStep1Submitting={isStep1Submitting}
            isSubmitting={isFinalSubmitting}
            submitButtonText="Register"
          />
        </div>
      </div>
    </div>
  );
};

export default QuickUploadPage;
