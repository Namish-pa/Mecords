"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { preserveWhitespaceForPdf } from "@/lib/pdfUtils";

Font.register({
  family: "Latin Modern Roman",
  src: "https://cdn.jsdelivr.net/npm/@fontsource/eb-garamond@4.5.0/files/eb-garamond-latin-400-normal.woff",
});

interface AlgorithmStep {
  text: string;
  hasCode: boolean;
  code: string;
  isHeading?: boolean;
}

interface ExperimentPDFDocumentProps {
  experimentNumber: string;
  experimentDate: string;
  experimentTitle: string;
  experimentAim: string;
  algorithmSteps: AlgorithmStep[];
  experimentProgram: string;
  experimentResult: string;
  resultOnNewPage: boolean;
}

const styles = StyleSheet.create({
  page: {
    padding: "1cm",
    fontFamily: "Latin Modern Roman",
    fontSize: 12,
    lineHeight: 0.7,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: "1.5cm",
  },
  headerBlock: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  headerText: {
    fontSize: 13,
    marginBottom: 5,
  },
  title: {
    textAlign: "center",
    fontSize: 19,
    fontFamily: "Latin Modern Roman",
    marginBottom: "1.5cm",
    textTransform: "uppercase",
    lineHeight: 1.3,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: "Latin Modern Roman",
    textDecoration: "underline",
    marginTop: "1cm",
    marginBottom: "0.5cm",
  },
  content: {
    marginBottom: "-0.2cm",
    lineHeight: 0.8,
  },
  codeBlock: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    fontFamily: "Courier",
    fontSize: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  codeText: {
    fontFamily: "Courier",
    fontSize: 10,
    lineHeight: 1.4,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  listNumber: {
    width: 20,
  },
  listContent: {
    flex: 1,
  },
});

export const ExperimentPDFDocument = ({
  experimentNumber,
  experimentDate,
  experimentTitle,
  experimentAim,
  algorithmSteps,
  experimentProgram,
  experimentResult,
  resultOnNewPage,
}: ExperimentPDFDocumentProps) => (
  <Document>
    {/* ══════════════ RIGHT PAGE — Aim, Algorithm, Program, Result ══════════════ */}
    <Page size="A4" style={styles.page}>
      {/* Header: Exp No and Date stacked, aligned to top-right */}
      <View style={styles.headerRow}>
        <View style={styles.headerBlock}>
          <Text style={styles.headerText}>
            Experiment No.: {experimentNumber || "_____"}
          </Text>
          <Text style={styles.headerText}>
            Date: {experimentDate || "______"}
          </Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.title}>
        <Text>{experimentTitle || "EXPERIMENT TITLE"}</Text>
      </View>

      {/* AIM */}
      <View style={styles.sectionHeader}>
        <Text>Aim:</Text>
      </View>
      <View style={styles.content}>
        <Text>
          {experimentAim || "The aim of the experiment is not specified!..."}
        </Text>
      </View>

      {/* ALGORITHM */}
      <View style={styles.sectionHeader}>
        <Text>Algorithm:</Text>
      </View>
      <View style={styles.content}>
        {(() => {
          let stepCounter = 0;
          return algorithmSteps.map((step, index) => {
            if (step.isHeading) {
              stepCounter = 0;
            } else {
              stepCounter++;
            }
            return (
              <View key={index} style={styles.listItem}>
                {!step.isHeading && (
                  <View style={styles.listNumber}>
                    <Text>{stepCounter}.</Text>
                  </View>
                )}
                <View style={styles.listContent}>
                  <Text
                    style={{
                      fontWeight: step.isHeading ? "bold" : "normal",
                      fontSize: step.isHeading ? 13 : 12,
                      marginTop: step.isHeading && index !== 0 ? 5 : 0,
                    }}
                  >
                    {step.text ||
                      (step.isHeading
                        ? "Sub-Heading"
                        : `Step ${stepCounter}`)}
                  </Text>
                  {step.hasCode && (
                    <View style={styles.codeBlock}>
                      <Text style={styles.codeText}>
                        {preserveWhitespaceForPdf(
                          step.code || "% Enter the Pseudo Code here"
                        )}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          });
        })()}
      </View>

      {/* PROGRAM */}
      <View style={styles.sectionHeader}>
        <Text>Program:</Text>
      </View>
      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>
          {preserveWhitespaceForPdf(
            experimentProgram || "// Enter your program here"
          )}
        </Text>
      </View>

      {/* RESULT — same page */}
      {!resultOnNewPage && (
        <>
          <View style={styles.sectionHeader}>
            <Text>Result:</Text>
          </View>
          <View style={styles.content}>
            <Text>
              {experimentResult ||
                "Program has been executed successfully and obtained the output"}
            </Text>
          </View>
        </>
      )}
    </Page>

    {/* RESULT — new page if toggled */}
    {resultOnNewPage && (
      <Page size="A4" style={styles.page}>
        <View style={{ ...styles.sectionHeader, marginTop: "2cm" }}>
          <Text>Result:</Text>
        </View>
        <View style={styles.content}>
          <Text>
            {experimentResult ||
              "Program has been executed successfully and obtained the output"}
          </Text>
        </View>
      </Page>
    )}
  </Document>
);
