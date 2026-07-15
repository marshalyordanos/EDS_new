// src/Components/ReactPdf.tsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import dayjs from "dayjs";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#f5f5f5",
  },
  section: {
    borderWidth: 1,
    // paddingHorizontal: 15,
    borderColor: "#a3a3a3",
    borderRadius: 10,
    backgroundColor: "white",
    marginTop: 15,
  },
  heading: {
    fontSize: 15,
    backgroundColor: "#ae272d",
    marginBottom: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    color: "white",
  },
  label: {
    // fontWeight: "bold",
    color: "#525252",
  },
  item: {
    marginBottom: 10,
    color: "#262626",
  },
  timelineItem: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#ae272d",
  },
});

export const MyDocument = ({ expert: expertData }) => {
  console.log("MyDocument", expertData);
  return (
    <Document>
      <Page style={styles.page}>
        <View style={{}}>
          {/* <View
            style={{
              borderWidth: 1,
              // padding: 15,
              borderColor: "#a3a3a3",
              borderRadius: 10,
              backgroundColor: "white",
            }}
          >
            <Text style={[styles.item, { fontSize: 19, color: "#262626" }]}>
              {expertData?.fullName || "N/A"}
            </Text>
            <Text style={[styles.item, { fontSize: 14, color: "#525252" }]}>
              {expertData?.expertiseArea || "N/A"}
            </Text>
          </View> */}

          <View
            style={{
              borderWidth: 1,
              // padding: 15,

              borderColor: "#a3a3a3",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              backgroundColor: "white",
              marginTop: 15,
            }}
          >
            <Text style={styles.heading}>Personal Information</Text>

            <View style={{ flexDirection: "row", marginVertical: 15 }}>
              <View
                style={{
                  borderRightWidth: 1,
                  borderColor: "lightgray",
                  width: 120,
                  alignItems: "flex-end",
                  marginRight: 15,
                  paddingRight: 10,
                }}
              >
                <Text style={styles.item}>Full Name: </Text>
                <Text style={styles.item}>Gender: </Text>
                <Text style={styles.item}>Nationality: </Text>
                <Text style={styles.item}>Email: </Text>
                <Text style={styles.item}>Phone Number: </Text>
                <Text style={styles.item}>Current Position: </Text>
                <Text style={styles.item}>CV Language: </Text>
                <Text style={styles.item}>Date of Birth: </Text>
                <Text style={styles.item}>Registered On: </Text>
              </View>

              <View>
                <Text style={styles.item}>{expertData?.fullName || "N/A"}</Text>
                <Text style={styles.item}>
                  {expertData?.personal?.gender || "N/A"}
                </Text>
                <Text style={styles.item}>
                  {expertData?.nationality || "N/A"}
                </Text>
                <Text style={styles.item}>{expertData?.email || "N/A"}</Text>
                <Text style={styles.item}>
                  {expertData?.personal?.phone_number || "N/A"}
                </Text>
                <Text style={styles.item}>
                  {expertData?.personal?.current_position || "N/A"}
                </Text>
                <Text style={styles.item}>
                  {expertData?.cv_language || "N/A"}
                </Text>
                <Text style={styles.item}>
                  {expertData?.personal?.date_of_birth
                    ? dayjs(expertData.personal.date_of_birth).format(
                        "DD/MM/YYYY"
                      )
                    : "N/A"}
                </Text>
                <Text style={styles.item}>
                  {expertData?.registeredOn || "N/A"}
                </Text>
              </View>
            </View>
          </View>
          {/* <Text style={styles.item}>
            <Text style={styles.label}>Language Skills: </Text>
            {expertData?.personal?.language_skills || "N/A"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Publications: </Text>
            {expertData?.personal?.publications || "N/A"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Journals: </Text>
            {expertData?.personal?.journals || "N/A"}
          </Text>
          <Text style={styles.item}>
            <Text style={styles.label}>Books: </Text>
            {expertData?.personal?.books || "N/A"}
          </Text> */}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Specialization & Skills</Text>

          <View style={{ flexDirection: "row", marginVertical: 15 }}>
            <View
              style={{
                borderRightWidth: 1,
                borderColor: "lightgray",
                width: 120,
                alignItems: "flex-end",
                marginRight: 15,
                paddingRight: 10,
              }}
            >
              <Text style={styles.item}>Specialization: </Text>
              <Text style={styles.item}>Skills: </Text>
            </View>
            <View>
              <Text style={styles.item}>
                {expertData?.specialization || "Not Specified"}
              </Text>
              <Text style={styles.item}>
                {expertData?.skills && expertData.skills.length > 0
                  ? expertData.skills.join(", ")
                  : "No skills listed."}
              </Text>
            </View>
          </View>
        </View>

        {expertData?.work_experience &&
          expertData.work_experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.heading}>Work Experience</Text>
              {expertData.work_experience.map((exp, index) => (
                <View key={exp.id || index} style={styles.timelineItem}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#171717",
                      marginTop: 10,
                    }}
                  >
                    {exp.position_title} at {exp.organization_name}
                  </Text>
                  <Text style={{ color: "#525252", marginVertical: 4 }}>
                    {exp.start_date
                      ? dayjs(exp.start_date).format("MMM YYYY")
                      : "N/A"}{" "}
                    -{" "}
                    {exp.end_date
                      ? dayjs(exp.end_date).format("MMM YYYY")
                      : "Present"}
                  </Text>
                  {exp.responsibilities && (
                    <Text style={{ color: "#525252", marginVertical: 4 }}>
                      {exp.responsibilities}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

        {expertData?.certifications && expertData.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Certifications</Text>
            {expertData.certifications.map((cert, index) => (
              <View key={cert.id || index} style={styles.timelineItem}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#171717",
                    marginTop: 10,
                  }}
                >
                  {cert.position_title}
                </Text>
                <Text>From: {cert.organization_name || "N/A"}</Text>
                <Text style={{ color: "#525252", marginVertical: 4 }}>
                  Issued:{" "}
                  {cert.start_date
                    ? dayjs(cert.start_date).format("MMM YYYY")
                    : "N/A"}
                </Text>
                {cert.responsibilities && (
                  <Text style={{ color: "#525252", marginVertical: 4 }}>
                    {cert.responsibilities}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {expertData?.education && expertData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Educational Background</Text>
            {expertData.education.map((edu, index) => (
              <View key={edu.id || index} style={styles.timelineItem}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#171717",
                    marginTop: 10,
                  }}
                >
                  {edu.education_level} in {edu.field_of_study}
                </Text>
                <Text style={{ color: "#525252", marginVertical: 4 }}>
                  {edu.institution_name}
                </Text>
                <Text style={{ color: "#525252", marginVertical: 4 }}>
                  Graduated:{" "}
                  {edu.year_of_grad
                    ? dayjs(edu.year_of_grad).format("YYYY")
                    : "N/A"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {expertData?.research && expertData.research.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Research Experience</Text>
            {expertData.research.map((res, index) => (
              <View key={res.id || index} style={styles.timelineItem}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#171717",
                    marginTop: 10,
                  }}
                >
                  {res.position} at {res.client}
                </Text>
                <Text style={{ color: "#525252", marginVertical: 4 }}>
                  {res.start_date
                    ? dayjs(res.start_date).format("MMM YYYY")
                    : "N/A"}{" "}
                  -{" "}
                  {res.end_date
                    ? dayjs(res.end_date).format("MMM YYYY")
                    : "Ongoing"}
                </Text>
                {res.description && (
                  <Text style={{ color: "#525252", marginVertical: 4 }}>
                    {res.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {expertData?.journals && (
          <View style={styles.section}>
            <Text style={styles.heading}>Journals</Text>
            <Text
              style={{ color: "#525252", marginVertical: 4, lineHeight: 1 }}
            >
              {expertData.journals}
            </Text>
          </View>
        )}

        {expertData?.publications && (
          <View style={styles.section}>
            <Text style={styles.heading}>Publications</Text>
            <Text
              style={{ color: "#525252", marginVertical: 4, lineHeight: 1 }}
            >
              {expertData.publications}
            </Text>
          </View>
        )}

        {expertData?.books && (
          <View style={styles.section}>
            <Text style={styles.heading}>Books</Text>
            <Text
              style={{ color: "#525252", marginVertical: 4, lineHeight: 1 }}
            >
              {expertData.books}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
};
