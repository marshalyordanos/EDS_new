import "../../styles/console.css";

/* A scaled-down CV that fills in as the form is completed. Sections with no
   data yet show placeholder bars rather than disappearing, so the operator
   can see what is still to come. */

const yearOf = (value) => {
  if (!value) return "";
  if (typeof value?.format === "function") return value.format("YYYY");
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
};

const Ghosts = ({ widths = ["85%", "70%", "50%"] }) => (
  <>
    {widths.map((w, i) => (
      <div className="ghost" key={i} style={{ width: w }} />
    ))}
  </>
);

const CvPaperPreview = (values = {}) => {
  const fullName =
    [values.firstName, values.lastName].filter(Boolean).join(" ") || "New expert";

  const education = (values.education || []).filter(
    (e) => e && (e.institution_name || e.field_of_study)
  );
  const work = (values.work_experience_list || []).filter(
    (e) => e && (e.position_title || e.company_name)
  );
  const expertise = Array.isArray(values.expertise_area) ? values.expertise_area : [];
  const contact = [values.email, values.country].filter(Boolean).join(" · ");

  return (
    <div className="con-paper">
      <h5>{fullName}</h5>
      {values.current_position && <div className="role">{values.current_position}</div>}
      {contact && <div className="contact">{contact}</div>}

      <hr />
      <div className="sec-t">Education</div>
      {education.length ? (
        education.map((edu, i) => (
          <div className="ent" key={i}>
            <b>
              {[edu.education_level, edu.field_of_study].filter(Boolean).join(", ") ||
                "Qualification"}
            </b>
            {edu.institution_name && <span>{edu.institution_name}</span>}
            {yearOf(edu.year_of_grad) && <em>{yearOf(edu.year_of_grad)}</em>}
          </div>
        ))
      ) : (
        <Ghosts widths={["80%", "60%"]} />
      )}

      <hr />
      <div className="sec-t">Experience</div>
      {work.length ? (
        work.map((exp, i) => (
          <div className="ent" key={i}>
            <b>{exp.position_title || "Position"}</b>
            {exp.company_name && <span>{exp.company_name}</span>}
            {(yearOf(exp.start_date) || yearOf(exp.end_date)) && (
              <em>
                {yearOf(exp.start_date)}
                {yearOf(exp.end_date) ? ` – ${yearOf(exp.end_date)}` : " – present"}
              </em>
            )}
          </div>
        ))
      ) : (
        <Ghosts />
      )}

      <hr />
      <div className="sec-t">Expertise</div>
      {expertise.length ? (
        <div className="chips">
          {expertise.slice(0, 8).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : (
        <Ghosts widths={["55%"]} />
      )}
    </div>
  );
};

export default CvPaperPreview;
