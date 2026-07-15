import { useState } from "react";
import AdvancedSearchForm from "../../Components/forms/AdvancedSearchForm";
import { data, useNavigate } from "react-router-dom";
import PageHeader from "../../Components/shared/PageHeader";
const SearchPage = () => {
  const [datas, setDatas] = useState([]);

  const navigate = useNavigate();
  const handleSearch = (formValues) => {
    console.log("Received raw form values in SearchPage:", formValues);

    const params = {};
    if (formValues.firstName) params.first_name = formValues.firstName;
    if (formValues.lastName) params.last_name = formValues.lastName;
    if (formValues.database) params.database = formValues.database;
    if (formValues.cv_language) params.cv_language = formValues.cv_language;

    if (formValues.currentlyWorkingIn)
      params.currentlyWorkingIn = formValues.currentlyWorkingIn;

    if (formValues.experienceOnProjects)
      params.experienceOnProjects = formValues.experienceOnProjects;

    if (formValues.pastExperience)
      params.year_of_experience = formValues.pastExperience;
    if (formValues.nationality) params.nationality = formValues.nationality;
    if (formValues.education) params.education = formValues.education;
    if (formValues.language) params.language_skills = formValues.language;
    if (formValues.seniority) params.seniority = formValues.seniority;

    if (formValues.keywords && formValues.keywords.length > 0) {
      params.keywords = formValues.keywords;
    }

    const expertiseAreas = [];
    if (formValues.sectors) {
      Object.values(formValues.sectors).forEach((subCategoryArray) => {
        if (subCategoryArray) {
          expertiseAreas.push(...subCategoryArray);
        }
      });
    }
    if (expertiseAreas.length > 0) {
      params.expertise_area = expertiseAreas;
    }

    const countries = [];
    if (formValues.geographical) {
      Object.values(formValues.geographical).forEach((countryArray) => {
        if (countryArray) {
          countries.push(...countryArray);
        }
      });
    }
    if (countries.length > 0) {
      params.countries_of_work_experience = countries;
    }

    if (formValues.fundingAgencies && formValues.fundingAgencies.length > 0) {
      params.funding_agencies = formValues.fundingAgencies;
    }
    if (datas.length > 0) {
      const queryParam = datas
        .map((skill) => `${skill.lang.toLowerCase()}-${skill.langLevel}`)
        .join(",");

      params.language_skills = queryParam;
    }

    // for Removing any null or undefined values before creating the query string
    for (const key in params) {
      if (
        params[key] === null ||
        params[key] === undefined ||
        params[key] === ""
      ) {
        delete params[key];
      }
    }

    console.log("Processed params for API:", params);

    const queryString = new URLSearchParams(params).toString();
    navigate(`/dashboard/search/results?${queryString}`);
  };

  return (
    <div>
      <PageHeader title="Search Experts" description="Find expert consultants by name, skill, or organization." />
      <AdvancedSearchForm
        datas={datas}
        setDatas={setDatas}
        onSearch={handleSearch}
      />
    </div>
  );
};

export default SearchPage;
