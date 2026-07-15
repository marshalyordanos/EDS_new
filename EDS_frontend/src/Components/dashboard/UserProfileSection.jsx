import { Avatar, Popover, Button, Modal, Form } from "antd";
import { useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import ChangePasswordForm from "../forms/ChangePasswordForm";

const UserProfileSection = ({ fullName, email, isExpanded, token }) => {
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
      <Popover content={popoverContent} trigger="click" placement="bottomRight">
        <div className="flex items-center w-full p-2 rounded-lg cursor-pointer hover:bg-white/10">
          <Avatar size={40} icon={<UserOutlined />} />
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded ? "ml-3" : "w-0"
            }`}
          >
            <span className="font-semibold text-white truncate">
              {fullName}
            </span>
            <span className="text-sm text-[var(--theme-text-muted)] truncate">{email}</span>
          </div>
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
