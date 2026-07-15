import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import SideBar from "../Components/dashboard/SideBar";
import ThemeToggle from "../Components/shared/ThemeToggle";
import "../styles/dashboard.css";

const DashboardLayout = ({ token }) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  return (
    <div className="flex min-h-screen" 
         style={{ 
           backgroundColor: 'var(--theme-bg-secondary)', 
           color: 'var(--theme-text-primary)',
           transition: 'all 0.3s ease'
         }}>
      <div className="hidden lg:block fixed top-0 left-0 h-full z-20">
        <SideBar
          token={token}
          isExpanded={isSidebarExpanded}
          setIsExpanded={setIsSidebarExpanded}
        />
      </div>
      <Drawer
        placement="left"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={256}
        className="lg:hidden"
        styles={{
          body: { 
            padding: 0, 
            backgroundColor: 'var(--theme-bg-primary)',
            background: 'linear-gradient(135deg, var(--theme-bg-primary) 0%, var(--theme-bg-secondary) 100%)'
          },
          header: {
            backgroundColor: "var(--color-primary)",
            borderBottom: "none",
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)'
          },
        }}
        closeIcon={null}
      >
        <SideBar token={token} isExpanded={true} setIsExpanded={() => setIsDrawerVisible(false)} />
      </Drawer>
      <main
        className={`flex-1 transition-all duration-300 
              ${isSidebarExpanded ? "lg:ml-64" : "lg:ml-24"}`}
        style={{ 
          backgroundColor: 'var(--theme-bg-secondary)',
          minHeight: '100vh'
        }}
      >
        <header 
          className="sticky top-0 backdrop-blur-md shadow-lg p-4 flex justify-between items-center z-10"
          style={{ 
            backgroundColor: 'rgba(var(--theme-bg-primary-rgb, 255, 255, 255), 0.95)', 
            borderBottom: '1px solid var(--theme-border-light)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="lg:hidden">
            <Button
              type="primary"
              icon={<MenuOutlined />}
              onClick={() => setIsDrawerVisible(true)}
              aria-label="Open sidebar"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
                borderColor: 'transparent',
                borderRadius: '8px',
                width: '44px',
                height: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(174, 39, 45, 0.3)'
              }}
            />
          </div>

          {/* Theme Toggle for Dashboard */}
          <div className="flex items-center gap-4">
            <div style={{
              padding: '0.5rem',
              borderRadius: '12px',
              background: 'var(--theme-bg-secondary)',
              border: '1px solid var(--theme-border-light)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div style={{ 
          padding: '2rem',
          backgroundColor: 'var(--theme-bg-secondary)',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
