import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { EyeOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { App, Skeleton } from "antd";
import { deleteExpert } from "../../services/expertService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
const language_level = {
  4: "Excellent",
  3: "Very good",
  2: "Average",
  1: "basic",
};
const ExpertCard = ({ expert, onDeleteSuccess, fetchExperts }) => {
  console.log("expert: ", expert);
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [isDeleting, setIsDeleting] = useState(false);

  // const fullName = `${expert.first_name} ${expert.last_name}`;

  const expertTitle = expert.expertise_area;
  const language_skills =
    typeof expert.language_skills == "string"
      ? JSON.parse(expert.language_skills)
      : expert.language_skills;

  console.log("language_skills: ", typeof language_skills);

  const bio_placeholder = `An expert in ${expert.expertise_area}. Further details can be found in their CV.`;
  const avatar_placeholder = `https://i.pravatar.cc/150?u=${expert.id}`;

  const handleEdit = () => {
    navigate(`/dashboard/experts/edit/${expert.id}`);
  };

  const handleViewProfile = () => {
    navigate(`/dashboard/experts/${expert.id}`);
  };

  const handleDelete = () => {
    modal.confirm({
      icon: <ExclamationCircleFilled style={{ color: "red" }} />,
      title: (
        <h3 className="font-semibold text-md text-[var(--theme-text-primary)]">
          Are you sure you want to delete this expert?
        </h3>
      ),
      content: (
        <div className="text-md text-[var(--theme-text-secondary)] mt-2">
          <p>
            You are about to permanently delete{" "}
            <span className="font-bold">
              {expert.first_name && `${expert.first_name} ${expert.last_name}`}
            </span>
            . This action cannot be undone.
          </p>
        </div>
      ),

      okText: <span className="font-semibold">Delete</span>,
      okType: "danger",
      cancelText: <span className="font-semibold">Cancel</span>,
      okButtonProps: {
        className: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
      },
      async onOk() {
        setIsDeleting(true);
        message.loading({ content: "Deleting expert...", key: "deleting" });
        try {
          await deleteExpert(expert.id);
          message.success({
            content: "Expert deleted successfully!",
            key: "deleting",
            duration: 2,
          });
          if (fetchExperts) fetchExperts();
          if (onDeleteSuccess) {
            onDeleteSuccess(expert.id);
          }
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

  return (
    <div className="relative bg-[var(--theme-bg-primary)] p-4 rounded-lg shadow-sm border border-[var(--theme-border-light)] border-l-4 border-l-[var(--color-primary)] mb-4">
      <div className="absolute top-4 right-4 flex items-center space-x-1">
        <button
          onClick={handleViewProfile}
          className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full transition-colors"
          title="View"
        >
          <EyeOutlined style={{ fontSize: "18px" }} />
        </button>

        {expert?.yours && (
          <button
            onClick={handleEdit}
            className="p-2 text-[var(--theme-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full transition-colors"
            title="Edit"
          >
            <FiEdit3 size={18} />
          </button>
        )}

        {expert?.yours && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-[var(--theme-error)] hover:bg-[var(--theme-error)] rounded-full transition-colors"
            title="Delete"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-[140px_1fr] gap-x-3">
        {/* Code */}
        <div className="flex justify-end border-r pr-3 border-[var(--theme-border-light)]">
          <p className="text-sm text-[var(--theme-text-secondary)]">Code</p>
        </div>
        <div>
          <p className="text-sm text-[var(--theme-text-secondary)]">{expert.code}</p>
        </div>

        {/* Name */}
        <div className="flex justify-end border-r pr-3 border-[var(--theme-border-light)]">
          <p className="text-sm text-[var(--theme-text-secondary)]">Name</p>
        </div>
        <div>
          {expert.first_name ? (
            <p className="text-sm text-[var(--theme-text-secondary)]">
              {expert.first_name} {expert.last_name}
            </p>
          ) : (
            <Skeleton.Input
              active
              size="small"
              style={{ width: 200 }}
              className="bg-[var(--theme-bg-tertiary)]"
            />
          )}
        </div>

        {/* Nationality */}
        <div className="flex justify-end border-r pr-3 border-[var(--theme-border-light)]">
          <p className="text-sm text-[var(--theme-text-secondary)]">Nationality</p>
        </div>
        <div>
          <p className="text-sm text-[var(--theme-text-secondary)]">{expert?.nationality || "."}</p>
        </div>

        {/* Languages */}
        <div className="flex justify-end border-r pr-3 border-[var(--theme-border-light)]">
          <p className="text-sm text-[var(--theme-text-secondary)]">Languages</p>
        </div>
        <div>
          <p className="text-sm text-[var(--theme-text-secondary)]">
            {Array.isArray(language_skills)
              ? language_skills.map((l, i) => (
                  <span key={i}>
                    {l.language} ({language_level[l?.speaking]})
                    {i < language_skills.length - 1 ? ", " : ""}
                  </span>
                ))
              : "."}
          </p>
        </div>

        {/* Regions experience */}
        <div className="flex justify-end border-r pr-3 border-[var(--theme-border-light)] mt-2">
          <p className="text-sm text-[var(--theme-text-secondary)]">Regions experience</p>
        </div>
        <div className="mt-2">
          <p className="text-sm text-[var(--theme-text-muted)]">
            {expert.countries_of_work_experience || "."}
          </p>
        </div>

        {/* Sectors experience */}
        <div className="flex justify-end border-r pr-3 border-[var(--theme-border-light)]">
          <p className="text-sm text-[var(--theme-text-secondary)]">Sectors experience</p>
        </div>
        <div>
          <p className="text-sm text-[var(--theme-text-primary)]">{expertTitle || "."}</p>
        </div>

        {/* Seniority */}
        <div className="flex justify-end border-r pr-3 border-[var(--theme-border-light)]">
          <p className="text-sm text-[var(--theme-text-secondary)]">Seniority</p>
        </div>
        <div>
          <p className="text-sm text-[var(--theme-text-primary)]">{expert.year_of_experience}</p>
        </div>
      </div>
    </div>
  );
};

export default ExpertCard;
