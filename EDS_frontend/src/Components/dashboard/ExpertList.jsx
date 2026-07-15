import ExpertCard from "./ExpertCard";
const ExpertList = ({ experts, onDeleteSuccess, fetchExperts }) => {
  if (!Array.isArray(experts)) {
    return <p className="text-center text-[var(--theme-text-muted)] mt-8">No experts found.</p>;
  }

  if (experts.length === 0) {
    return <p className="text-center text-[var(--theme-text-muted)] mt-8">No experts found.</p>;
  }

  return (
    <div className="space-y-4">
      {experts.map((expert) => (
        <ExpertCard
          fetchExperts={fetchExperts}
          key={expert.id}
          expert={expert}
          onDeleteSuccess={onDeleteSuccess}
        />
      ))}
    </div>
  );
};

export default ExpertList;
