import { useState, useEffect } from 'react';
import { getExpertsWithOutdatedCVs } from '../../services/expertService';
import SearchBar from '../../Components/dashboard/SearchBar';
import ExpertList from '../../Components/dashboard/ExpertList';
import PageHeader from "../../Components/shared/PageHeader";

const ExpertsWithOutdatedCVsPage = () => {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getExpertsWithOutdatedCVs() 
      .then(data => {
        setExperts(data);
      })
      .catch(error => {
        console.error("Failed to fetch experts with outdated CVs:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div>
      <PageHeader title="Experts with CVs not updated" /> 
      <SearchBar/>
      <div className="mt-6">
      {isLoading ? (
        <p className="text-center text-[var(--theme-text-muted)]">Loading experts...</p>
      ) : (
        <ExpertList experts={experts} />
      )}
      </div>
    </div>
  );
};

export default ExpertsWithOutdatedCVsPage;