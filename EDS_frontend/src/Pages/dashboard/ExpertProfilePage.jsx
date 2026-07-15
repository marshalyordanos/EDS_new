import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  App,
  Spin,
  Button,
  Card,
  Avatar,
  Descriptions,
  Tag,
  Timeline,
  Space,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getExpertDetails,
  getNestedResourceList,
  deleteExpert,
} from "../../services/expertService";
import dayjs from "dayjs";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PDFViewer } from "@react-pdf/renderer";

import { MyDocument } from "../../Components/ReactPdf";
import protectedApiClient from "../../api/axios";
import PageHeader from "../../Components/shared/PageHeader";

const ExpertProfilePage = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [isDeleting, setIsDeleting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [expertData, setExpertData] = useState(null);
  const [error, setError] = useState(null);
  const url = encodeURI(expertData?.cv_file);
  const [role, setRole] = useState("");

  // const cvRef = useRef();
  // const handleDownloadPdf = () => {

  // };

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);
  console.log("expertData: ", expertData);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!expertId) return;
      setLoading(true);
      setError(null);
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

        console.log({
          expertDetails,
          personalDetailList,
          educationList,
          experienceList,
          expertiseList,
          researchList,
        });

        const personalDetail = personalDetailList[0] || {};
        const expertise = expertiseList[0] || {};
        const workExperiences = experienceList.filter(
          (exp) => exp.typee === "work_experience"
        );
        const certifications = experienceList.filter(
          (exp) => exp.typee === "certification"
        );

        const combinedData = {
          id: expertDetails.id,
          fullName: expertDetails.first_name
            ? `${expertDetails.first_name} ${expertDetails.last_name}`
            : null,
          email: expertDetails.email ? expertDetails.email : null,
          cv_file: expertDetails?.cv_file ? expertDetails?.cv_file : null,
          journals: expertDetails.journals,
          publications: expertDetails.publications,
          books: expertDetails.books,
          expertiseArea: expertDetails.expertise_area,
          cv_language: expertDetails.cv_language,
          nationality: expertDetails.nationality,
          registeredOn: dayjs(expertDetails.created_at).format("DD/MM/YYYY"),
          avatarUrl: `https://i.pravatar.cc/150?u=${expertDetails.id}`,
          yours: expertDetails.yours,
          personal: {
            ...personalDetail,
          },
          skills:
            expertDetails.expertise_area?.split(",").map((s) => s.trim()) || [],
          specialization: expertise.specialization || "",
          education: educationList,
          work_experience: workExperiences,
          certifications: certifications,
          research: researchList,
        };
        console.log("combinedData", combinedData);

        setExpertData(combinedData);
      } catch (err) {
        console.error("Failed to load expert profile:", err);
        setError("Could not load expert profile. Please try again later.");
        message.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [expertId, message]);

  const handleDelete = () => {
    modal.confirm({
      title: (
        <h3 className="font-semibold text-md text-[var(--theme-text-primary)]">
          Are you sure you want to delete this expert?
        </h3>
      ),
      content: (
        <div className="text-md text-[var(--theme-text-secondary)] mt-2">
          <p>
            You are about to permanently delete{" "}
            <span className="font-bold">{expertData.fullName}</span>. This
            action cannot be undone.
          </p>
        </div>
      ),

      okText: <span className="font-semibold">Delete</span>,
      okType: "danger",
      cancelText: <span className="font-semibold">Cancel</span>,
      okButtonProps: {
        className: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
      },
      cancelButtonProps: {
        className: "hover:border-[var(--color-gray-500)]",
      },
      async onOk() {
        setIsDeleting(true);
        message.loading({ content: "Deleting expert...", key: "deleting" });
        try {
          await deleteExpert(expertId);
          message.success({
            content: "Expert deleted successfully!",
            key: "deleting",
            duration: 2,
          });
          navigate("/dashboard/all");
        } catch (error) {
          console.error("Deletion failed:", error);
          message.error({
            content: "Failed to delete expert.",
            key: "deleting",
            duration: 2,
          });
        } finally {
          setIsDeleting(false);
        }
      },
      onCancel() {
        console.log("Deletion cancelled");
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Spin size="large" tip="Loading Expert Profile..." />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-[var(--theme-error)]">{error}</div>;
  }

  const SectionCard = ({ title, children }) => (
    <div className="bg-[var(--theme-bg-primary)] rounded-lg shadow-sm overflow-hidden border border-[var(--theme-border-light)]">
      <h3
        className="text-sm font-semibold text-white p-3"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {title}
      </h3>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Expert Profile" />
      
      {/* {expertData && (
        <PDFDownloadLink
          document={<MyDocument expert={expertData} />}
          fileName="expert-profile.pdf"
          style={{ textDecoration: "none" }}
        >
          {({ loading }) =>
            loading ? (
              <Button type="primary" icon={<DownloadOutlined />} loading>
                Preparing PDF...
              </Button>
            ) : (
              <div className="flex justify-end my-5">
                <Space className="mt-4 sm:mt-0" wrap>
                  <Button type="primary" icon={<DownloadOutlined />}>
                    Download CV
                  </Button>
                  <Link to={`/dashboard/experts/edit/${expertData.id}`}>
                    <Button type="primary" icon={<EditOutlined />}>
                      Edit CV
                    </Button>
                  </Link>
                  <Button
                    type="primary"
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    loading={isDeleting}
                  >
                    Delete CV
                  </Button>
                </Space>
              </div>
            )
          }
        </PDFDownloadLink>
      )} */}

      <div className="flex justify-end my-5">
        <Space className="mt-4 sm:mt-0" wrap>
          <a href={expertData.cv_file} download>
            <Button
              disabled={!(expertData.yours || role === "super_admin")}
              type="primary"
              icon={<DownloadOutlined />}
            >
              Download CV
            </Button>
          </a>

          {expertData.yours && (
            <Link to={`/dashboard/experts/edit/${expertData.id}`}>
              <Button type="primary" icon={<EditOutlined />}>
                Edit CV
              </Button>
            </Link>
          )}
          {expertData.yours && (
            <Button
              type="primary"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete CV
            </Button>
          )}
        </Space>
      </div>

      {/* <PDFViewer width="100%" height="600">
        <MyDocument expert={expertData} />
      </PDFViewer> */}
      <div>
        <div className="space-y-6">
          <SectionCard title="Personal Information">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Full Name">
                {expertData.yours || role === "super_admin" ? (
                  expertData.fullName
                ) : (
                  <>
                    {" "}
                    <Skeleton.Input
                      active={true}
                      size={"small"}
                      style={{ width: 200 }}
                      className="bg-[var(--theme-bg-tertiary)] "
                    />
                  </>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {expertData.yours || role === "super_admin" ? (
                  expertData.personal.gender
                ) : (
                  <>
                    {" "}
                    <Skeleton.Input
                      active={true}
                      size={"small"}
                      style={{ width: 100 }}
                      className="bg-[var(--theme-bg-tertiary)] "
                    />
                  </>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Nationality">
                {expertData.yours || role === "super_admin" ? (
                  expertData.nationality
                ) : (
                  <>
                    {" "}
                    <Skeleton.Input
                      active={true}
                      size={"small"}
                      style={{ width: 150 }}
                      className="bg-[var(--theme-bg-tertiary)] "
                    />
                  </>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {expertData.yours || role === "super_admin" ? (
                  expertData.email
                ) : (
                  <>
                    {" "}
                    <Skeleton.Input
                      active={true}
                      size={"small"}
                      style={{ width: 200 }}
                      className="bg-[var(--theme-bg-tertiary)] "
                    />
                  </>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {expertData.yours || role === "super_admin" ? (
                  expertData.personal.phone_number || "N/A"
                ) : (
                  <>
                    {" "}
                    <Skeleton.Input
                      active={true}
                      size={"small"}
                      style={{ width: 200 }}
                      className="bg-[var(--theme-bg-tertiary)] "
                    />
                  </>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Current Position">
                {expertData.personal.current_position || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="CV Language">
                {expertData.cv_language || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {expertData.yours || role === "super_admin" ? (
                  dayjs(expertData.personal.date_of_birth).format("DD/MM/YYYY")
                ) : (
                  <>
                    {" "}
                    <Skeleton.Input
                      active={true}
                      size={"small"}
                      style={{ width: 200 }}
                      className="bg-[var(--theme-bg-tertiary)] "
                    />
                  </>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Registered On">
                {expertData.registeredOn}
              </Descriptions.Item>
              {/* <Descriptions.Item label="Language Skills">
                  {expertData.personal.language_skills || "N/A"}
                </Descriptions.Item> */}
              {/* <Descriptions.Item label="Publications">
                  {expertData.personal.publications || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Journals">
                  {expertData.personal.journals || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Books">
                  {expertData.personal.books || "N/A"}
                </Descriptions.Item> */}
            </Descriptions>
          </SectionCard>

          <SectionCard title="Specialization & Skills">
            <div>
              <h4 className="text-sm font-semibold text-[var(--theme-text-muted)] mb-2">
                Skills
              </h4>
              <div className="mb-4">
                {expertData.specialization ? (
                  <Tag
                    color="geekblue"
                    style={{ fontSize: "14px", padding: "6px 12px" }}
                  >
                    {expertData.specialization}
                  </Tag>
                ) : (
                  <Tag style={{ fontSize: "14px", padding: "4px 10px" }}>
                    Not Specified
                  </Tag>
                )}
              </div>
              <h4 className="text-sm font-semibold text-[var(--theme-text-muted)] mb-1">
                Primary Specialization
              </h4>
              <div className="flex flex-wrap gap-2">
                {expertData?.skills && expertData.skills.length > 0 ? (
                  expertData?.skills?.map((skill, index) => (
                    <Tag color="blue" key={index}>
                      {skill}
                    </Tag>
                  ))
                ) : (
                  <p className="text-[var(--theme-text-muted)]">No skills listed.</p>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {expertData.work_experience &&
            expertData.work_experience.length > 0 && (
              <SectionCard title="Work Experience">
                <Timeline>
                  {expertData.work_experience.map((exp) => (
                    <Timeline.Item key={exp.id}>
                      <p className="font-semibold">
                        {exp.position_title} at {exp.organization_name}
                      </p>
                      <p className="text-sm text-[var(--theme-text-muted)]">
                        {dayjs(exp.start_date).format("MMM YYYY")} -{" "}
                        {exp.end_date
                          ? dayjs(exp.end_date).format("MMM YYYY")
                          : "Present"}
                      </p>
                      {exp.responsibilities && (
                        <p className="mt-1">{exp.responsibilities}</p>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </SectionCard>
            )}

          {expertData.certifications &&
            expertData.certifications.length > 0 && (
              <SectionCard title="Certifications ">
                <Timeline>
                  {expertData.certifications.map((cert) => (
                    <Timeline.Item key={cert.id}>
                      <p className="font-semibold">{cert.position_title}</p>
                      <p className="text-sm text-[var(--theme-text-muted)]">
                        From: {cert.organization_name}
                      </p>
                      <p className="text-sm text-[var(--theme-text-muted)]">
                        Issued: {dayjs(cert.start_date).format("MMM YYYY")}
                      </p>
                      {cert.responsibilities && (
                        <p className="mt-1">{cert.responsibilities}</p>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </SectionCard>
            )}

          <SectionCard title="Educational Background">
            <Timeline>
              {expertData.education.map((edu) => (
                <Timeline.Item key={edu.id}>
                  <p className="font-semibold">
                    {edu.education_level} in {edu.field_of_study}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    {edu.institution_name}
                  </p>
                  <p className="text-sm text-[var(--theme-text-muted)]">
                    Graduated: {dayjs(edu.year_of_grad).format("YYYY")}
                  </p>
                </Timeline.Item>
              ))}
            </Timeline>
          </SectionCard>

          {expertData.research && expertData.research.length > 0 && (
            <SectionCard title="Research Experience">
              <Timeline>
                {expertData.research.map((res) => (
                  <Timeline.Item key={res.id}>
                    <p className="font-semibold">
                      {res.position} at {res.client}
                    </p>
                    <p className="text-sm text-[var(--theme-text-muted)]">
                      {dayjs(res.start_date).format("MMM YYYY")} -{" "}
                      {res.end_date
                        ? dayjs(res.end_date).format("MMM YYYY")
                        : "Ongoing"}
                    </p>
                    {res.description && (
                      <p className="mt-1">{res.description}</p>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </SectionCard>
          )}

          {expertData.journals && (
            <SectionCard title="Journals ">
              <Timeline>
                <Timeline.Item key={expertData.id}>
                  <p className="text-sm text-[var(--theme-text-primary)]">{expertData.journals}</p>
                </Timeline.Item>
              </Timeline>
            </SectionCard>
          )}

          {expertData.publications && (
            <SectionCard title="Publications ">
              <Timeline>
                <Timeline.Item key={expertData.id}>
                  <p className="text-sm text-[var(--theme-text-primary)]">
                    {expertData.publications}
                  </p>
                </Timeline.Item>
              </Timeline>
            </SectionCard>
          )}
          {expertData.books && (
            <SectionCard title="Books ">
              <Timeline>
                <Timeline.Item key={expertData.id}>
                  <p className="text-sm text-[var(--theme-text-primary)]">{expertData.books}</p>
                </Timeline.Item>
              </Timeline>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertProfilePage;
