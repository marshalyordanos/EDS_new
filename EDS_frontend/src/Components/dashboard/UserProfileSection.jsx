import { Popover, Button, Modal, Form } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import ChangePasswordForm from "../forms/ChangePasswordForm";

const ROLE_LABELS = {
  admin: "System Admin",
  company: "Company Admin",
  content_manager: "Content Manager",
};

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

const UserProfileSection = ({ fullName, email, role, isExpanded, token }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const popoverContent = (
    <ul className="space-y-1 w-38">
      <li>
        <button
          className="w-full text-center p-2 rounded-lg font-semibold text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] cursor-pointer !text-[16px] active:bg-[var(--color-primary)] active:!text-white transition-colors"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Change Password
        </button>
      </li>
      <li>
        <button
          className="w-full text-center p-2 rounded-lg  font-semibold flex items-center justify-center gap-2 text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] cursor-pointer !text-[16px] active:bg-[var(--color-primary)] active:!text-white transition-colors"
          onClick={() => {
            navigate("/login");
            token(null);
            localStorage.clear();
          }}
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </li>
    </ul>
  );

  return (
    <>
      <Popover content={popoverContent} trigger="click" placement="rightBottom">
        <div className="con-rail-user" title={isExpanded ? undefined : fullName}>
          <span className="con-avatar">{initialsOf(fullName)}</span>
          {isExpanded && (
            <div className="con-rail-who">
              <b>{fullName}</b>
              <small>{ROLE_LABELS[role] || email}</small>
            </div>
          )}
        </div>
      </Popover>

      <Modal
        title={
          <div style={{ fontSize: "20px", color: "var(--color-gray-800)" }}>
            Change Your Password
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        afterClose={() => form.resetFields()}
        styles={{
          header: {
            marginBottom: "24px",
          },
        }}
      >
        <ChangePasswordForm
          form={form}
          onSuccess={() => setIsModalOpen(false)}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default UserProfileSection;
