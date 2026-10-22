"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { PDFDocument, type ImageItem, type TestCase } from "@/template/left_page";
import { ExperimentPDFDocument } from "@/template/right_page";
import { IndexPDFDocument } from "@/template/index_page";
import { Download, FileDown } from "lucide-react";

interface AlgorithmStep {
  text: string;
  hasCode: boolean;
  code: string;
  isHeading?: boolean;
}

// ── Left-page (Test Data(Input and Output)) button ──────────────────────────

interface SimplePDFProps {
  testCases: TestCase[];
  resetTrigger?: string | number | Record<string, unknown>;
}

export function PDFDownloadButton({ testCases, resetTrigger }: SimplePDFProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (resetTrigger) {
      setIsActive(false);
    }
  }, [resetTrigger]);

  // Sanitise images in every test case before handing them to react-pdf
  const safeTestCases: TestCase[] = testCases.map((tc) => ({
    ...tc,
    inputImages: (tc.inputImages ?? [])
      .map((img) => (typeof img === "string" ? { src: img, caption: "" } : img))
      .filter(
        (img): img is ImageItem =>
          typeof img?.src === "string" &&
          (img.src.startsWith("data:image/") || img.src.startsWith("http"))
      ),
    outputImages: (tc.outputImages ?? [])
      .map((img) => (typeof img === "string" ? { src: img, caption: "" } : img))
      .filter(
        (img): img is ImageItem =>
          typeof img?.src === "string" &&
          (img.src.startsWith("data:image/") || img.src.startsWith("http"))
      ),
  }));

  if (!isActive) {
    return (
      <Button
        onClick={() => setIsActive(true)}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Download size={16} />
        Generate PDF
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="inline-block">
        <PDFDownloadLink
          document={<PDFDocument testCases={safeTestCases} />}
          fileName="left_page.pdf"
          className="inline-block"
        >
          {({ loading, error }) => {
            if (error) {
              console.error("PDF generation error:", error);
              return (
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => setIsActive(false)}
                >
                  <Download size={16} />
                  Error - Try Again
                </Button>
              );
            }
            return (
              <Button
                disabled={loading}
                className="flex items-center gap-2"
                variant={loading ? "secondary" : "default"}
              >
                <FileDown size={16} />
                {loading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </div>
    </div>
  );
}

// ── Right-page (Aim, Algorithm & Result) button ──────────────────────────────

interface ExperimentPDFProps {
  experimentData: {
    experimentNumber: string;
    experimentDate: string;
    experimentTitle: string;
    experimentAim: string;
    algorithmSteps: AlgorithmStep[];
    experimentProgram: string;
    experimentResult: string;
    resultOnNewPage: boolean;
  };
  resetTrigger?: string | number | Record<string, unknown>;
}

export function ExperimentPDFDownloadButton({
  experimentData,
  resetTrigger,
}: ExperimentPDFProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (resetTrigger) {
      setIsActive(false);
    }
  }, [resetTrigger]);

  const safeData = {
    experimentNumber: experimentData.experimentNumber || "",
    experimentDate: experimentData.experimentDate || "",
    experimentTitle: experimentData.experimentTitle || "",
    experimentAim: experimentData.experimentAim || "",
    algorithmSteps: (experimentData.algorithmSteps || []).map((step) => ({
      text: String(step.text || ""),
      hasCode: Boolean(step.hasCode),
      code: String(step.code || ""),
      isHeading: Boolean(step.isHeading),
    })),
    experimentProgram: experimentData.experimentProgram || "",
    experimentResult: experimentData.experimentResult || "",
    resultOnNewPage: Boolean(experimentData.resultOnNewPage),
  };

  if (!isActive) {
    return (
      <Button
        onClick={() => setIsActive(true)}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Download size={16} />
        Generate PDF
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="inline-block">
        <PDFDownloadLink
          document={
            <ExperimentPDFDocument
              experimentNumber={safeData.experimentNumber}
              experimentDate={safeData.experimentDate}
              experimentTitle={safeData.experimentTitle}
              experimentAim={safeData.experimentAim}
              algorithmSteps={safeData.algorithmSteps}
              experimentProgram={safeData.experimentProgram}
              experimentResult={safeData.experimentResult}
              resultOnNewPage={safeData.resultOnNewPage}
            />
          }
          fileName="right_page.pdf"
          className="inline-block"
        >
          {({ loading, error }) => {
            if (error) {
              console.error("PDF generation error:", error);
              return (
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => setIsActive(false)}
                >
                  <Download size={16} />
                  Error - Try Again
                </Button>
              );
            }
            return (
              <Button
                disabled={loading}
                className="flex items-center gap-2"
                variant={loading ? "secondary" : "default"}
              >
                <FileDown size={16} />
                {loading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </div>
    </div>
  );
}

// ── Index button (unchanged) ─────────────────────────────────────────────────

interface IndexPDFProps {
  entries: Array<{
    sno?: string;
    date?: string;
    topic?: string;
    pageNo?: string;
    sign?: string;
  }>;
  rowCount?: number;
  resetTrigger?: string | number | Record<string, unknown>;
}

export function IndexPDFDownloadButton({
  entries,
  rowCount,
  resetTrigger,
}: IndexPDFProps) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (resetTrigger) {
      setIsActive(false);
    }
  }, [resetTrigger]);

  if (!isActive) {
    return (
      <Button
        onClick={() => setIsActive(true)}
        className="flex items-center gap-2"
        variant="outline"
      >
        <Download size={16} />
        Generate PDF
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="inline-block">
        <PDFDownloadLink
          document={<IndexPDFDocument entries={entries} rowCount={rowCount} />}
          fileName="index.pdf"
          className="inline-block"
        >
          {({ loading, error }) => {
            if (error) {
              console.error("PDF generation error:", error);
              return (
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => setIsActive(false)}
                >
                  <Download size={16} />
                  Error - Try Again
                </Button>
              );
            }
            return (
              <Button
                disabled={loading}
                className="flex items-center gap-2"
                variant={loading ? "secondary" : "default"}
              >
                <FileDown size={16} />
                {loading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            );
          }}
        </PDFDownloadLink>
      </div>
    </div>
  );
}
