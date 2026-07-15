import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Typography, Select, Space} from 'antd';
import { searchExperts } from '../../services/expertService'; 
import ExpertList from '../../Components/dashboard/ExpertList'; 
import PageHeader from '../../Components/shared/PageHeader';
const { Title } = Typography;
const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = Object.fromEntries(searchParams.entries());
        if (ordering) {
          params.ordering = ordering;
        }
        console.log("Fetching experts with params:", params);
        
        const response = await searchExperts(params);
        setExperts(response); 
      } catch (err) {
        setError('Failed to load search results. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams,ordering]); 

  const handleOrderChange = (value) => {
    setOrdering(value || ''); 
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-[var(--theme-error)]">{error}</div>;
  }

  const handleDeletionSuccess = (deletedExpertId) => {
    setExperts(currentExperts => 
      currentExperts.filter(expert => expert.id !== deletedExpertId)
    );
  };
  return (
    <div>
       <PageHeader title="Search Results">
         <Space>
            <span style={{ fontWeight: 500 }}>Sort By</span>
           <Select
            value={ordering}
            onChange={handleOrderChange}
            placeholder="Default Order"
            style={{ width: 200 }}
            allowClear
           >
             <Select.Option value="first_name">Name (A-Z)</Select.Option>
             <Select.Option value="-first_name">Name (Z-A)</Select.Option>
             <Select.Option value="-created_at">Newest First</Select.Option>
             <Select.Option value="created_at">Oldest First</Select.Option>
           </Select>
         </Space>
       </PageHeader>
      
              <ExpertList 
              experts={experts} 
              onDeleteSuccess={handleDeletionSuccess} />

    </div>
  );
};

export default SearchResultsPage;