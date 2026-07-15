import { useState, useEffect } from 'react';
import { getExpertsRegisteredThisMonth } from '../../services/expertService';
import SearchBar from '../../Components/dashboard/SearchBar';
import ExpertList from '../../Components/dashboard/ExpertList';
import { Pagination, Spin, Alert } from 'antd';
import PageHeader from '../../Components/shared/PageHeader';
const ExpertsThisMonthPage = () => {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExperts, setTotalExperts] = useState(0);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getExpertsRegisteredThisMonth(currentPage) 
      .then(data => {
        setExperts(data.results);
        setTotalExperts(data.count);
      })
      .catch(error => {
        console.error("Failed to fetch experts for this month:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10"><Spin size="large" /></div>;
    }
    if (error) {
      return <Alert message="Error" description={error} type="error" showIcon />;
    }
    if (experts.length === 0) {
      return <div className="text-center text-[var(--theme-text-muted)] p-10">No experts registered this month.</div>;
    }
    return <ExpertList experts={experts} />;
  };

  return (
    <div>
      <PageHeader title="Experts Registered This Month" />
      <SearchBar />
      <div className="mt-6">
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
  );
};

export default ExpertsThisMonthPage;