import { useState, useEffect } from "react";
import { getAllExperts } from "../../services/expertService";
import PageHeader from "../../Components/shared/PageHeader";
import SearchBar from "../../Components/dashboard/SearchBar";
import ExpertList from "../../Components/dashboard/ExpertList";
import { Pagination, Spin, Alert } from "antd";
const AllExpertsPage = () => {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExperts, setTotalExperts] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchExperts = () => {
    setIsLoading(true);
    setError(null);
    getAllExperts(currentPage)
      .then((data) => {
        setExperts(data.results);
        setTotalExperts(data.count);
      })
      .catch((error) => {
        console.error("Failed to fetch experts:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchExperts();
  }, [currentPage]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="dashboard-loading">
          <Spin size="large" />
          <p className="dashboard-meta">Loading experts...</p>
        </div>
      );
    }
    if (error) {
      return (
        <Alert message="Error" description={error} type="error" showIcon />
      );
    }
    if (experts.length === 0) {
      return (
        <div className="dashboard-empty">
          <div className="dashboard-empty-title">No Experts Found</div>
          <div className="dashboard-empty-description">No experts registered this month.</div>
        </div>
      );
    }
    return <ExpertList experts={experts} fetchExperts={fetchExperts} />;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-main-content">
        <PageHeader title="All Experts" />
        
        <SearchBar />
        
        <div className="dashboard-card mt-6">
          {renderContent()}
        </div>

        <div className="flex justify-center mt-8">
          {!isLoading && totalExperts > 0 && (
            <Pagination
              current={currentPage}
              total={totalExperts}
              pageSize={10}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AllExpertsPage;
