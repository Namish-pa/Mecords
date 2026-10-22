"use client";

import type React from "react";

import { useState, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  X,
  FileText,
  FileCode,
  Calendar,
  Hash,
  FileOutput,
  Target,
  ListOrdered,
  CheckCircle2,
  ImageIcon,
  BookOpen,
  ListChecks,
  ExternalLink,
  FileType,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { type ImageItem, type TestCase } from "@/template/left_page";

const PDFDownloadButton = dynamic(
  () =>
    import("@/components/custom-button").then((mod) => mod.PDFDownloadButton),
  {
    ssr: false,
    // loading: () => <Button disabled>Loading PDF...</Button>,
  }
);

const ExperimentPDFDownloadButton = dynamic(
  () =>
    import("@/components/custom-button").then(
      (mod) => mod.ExperimentPDFDownloadButton
    ),
  {
    ssr: false,
    // loading: () => <Button disabled>Loading PDF...</Button>,
  }
);

const IndexPDFDownloadButton = dynamic(
  () =>
    import("@/components/custom-button").then(
      (mod) => mod.IndexPDFDownloadButton
    ),
  {
    ssr: false,
  }
);

interface AlgorithmStep {
  id: string;
  text: string;
  hasCode: boolean;
  code: string;
  isHeading?: boolean;
}

interface IndexEntry {
  id: string;
  sno?: string;
  date?: string;
  topic?: string;
  pageNo?: string;
  sign?: string;
}

export default function Home() {
  const [templateType, setTemplateType] = useState<
    "simple" | "experiment" | "index" | "coverpage"
  >("experiment");

  const COVER_PAGE_DOC_URL =
    "https://www.dropbox.com/scl/fo/qquvekt18178myxhrtmdz/ADwXBUgmfLa6QiHLl7ZCde4/COVER%20PAGE%20(%20MEC%20LAB%20RECORD%20).docx?rlkey=bx9dl3nyf7kisnxgj87aqv1xr&st=1r32p60i&dl=0";

  // ── Test Data (Input and Output) (left page) state ──────────────────────────
  const [testCases, setTestCases] = useState<TestCase[]>(() => [
    {
      id: crypto.randomUUID(),
      inputText: "",
      inputImages: [],
      outputText: "",
      outputImages: [],
    },
  ]);

  // Stable map of hidden <input type="file"> elements.
  // Keyed by `${tcId}-input` or `${tcId}-output` so stable ids survive removals
  // without mixing up the refs of remaining cards.
  const imageInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // ── Aim, Algorithm & Result (right page) state ──────────────────────────
  const [experimentNumber, setExperimentNumber] = useState("");
  const [experimentDate, setExperimentDate] = useState("");
  const [experimentTitle, setExperimentTitle] = useState("");
  const [experimentAim, setExperimentAim] = useState("");
  const [algorithmSteps, setAlgorithmSteps] = useState<AlgorithmStep[]>(() => [
    { id: crypto.randomUUID(), text: "Start", hasCode: false, code: "", isHeading: false },
    { id: crypto.randomUUID(), text: "Stop", hasCode: false, code: "", isHeading: false },
  ]);
  const [experimentProgram, setExperimentProgram] = useState("");
  const [experimentResult, setExperimentResult] = useState(
    "Program has been executed successfully and obtained the output."
  );
  const [resultOnNewPage, setResultOnNewPage] = useState(false);

  const [indexEntries, setIndexEntries] = useState<IndexEntry[]>(() => [
    {
      id: crypto.randomUUID(),
      sno: "1",
      date: "",
      topic: "",
      pageNo: "",
      sign: "",
    },
  ]);
  const [indexRowCount, setIndexRowCount] = useState(20);

  const addAlgorithmStep = (index: number) => {
    setAlgorithmSteps((prev) => {
      const newSteps = [...prev];
      newSteps.splice(index + 1, 0, {
        id: crypto.randomUUID(),
        text: "",
        hasCode: false,
        code: "",
        isHeading: false,
      });
      return newSteps;
    });
  };

  const removeAlgorithmStep = (index: number) => {
    if (algorithmSteps.length <= 2) return;

    const newSteps = algorithmSteps
      .filter((_, i) => i !== index)
      .map((step) => ({
        id: step.id,
        text: step.text,
        hasCode: Boolean(step.hasCode),
        code: step.code,
        isHeading: Boolean(step.isHeading),
      }));

    setAlgorithmSteps(newSteps);
  };

  const updateAlgorithmStep = (
    index: number,
    field: keyof AlgorithmStep,
    value: string | boolean
  ) => {
    setAlgorithmSteps((prev) => {
      const newSteps = [...prev];
      newSteps[index] = { ...newSteps[index], [field]: value };
      return newSteps;
    });
  };

  const addIndexEntry = () => {
    setIndexEntries((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sno: (prev.length + 1).toString(),
        date: "",
        topic: "",
        pageNo: "",
        sign: "",
      },
    ]);
  };

  const removeIndexEntry = (id: string) => {
    setIndexEntries((prev) => {
      const newEntries = prev.filter((entry) => entry.id !== id);
      return newEntries.map((entry, index) => ({
        ...entry,
        sno: (index + 1).toString(),
      }));
    });
  };

  const updateIndexEntry = (
    id: string,
    field: keyof Omit<IndexEntry, "id" | "sign">,
    value: string
  ) => {
    setIndexEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleExperimentPDFDownload = () => {
    if (typeof window === "undefined") return null;

    try {
      let validatedSteps;
      try {
        validatedSteps = algorithmSteps.map((step) => ({
          text: String(step.text || ""),
          hasCode: Boolean(step.hasCode),
          code: String(step.code || ""),
          isHeading: Boolean(step.isHeading),
        }));
      } catch (e) {
        console.error("Step validation error:", e);
        validatedSteps = [{ text: "Error in steps", hasCode: false, code: "" }];
      }

      // Create a resetTrigger based on experiment data
      const resetTrigger = JSON.stringify({
        experimentNumber,
        experimentDate,
        experimentTitle,
        experimentAim,
        stepsLength: algorithmSteps.length,
        experimentProgram,
        experimentResult,
        resultOnNewPage,
      });

      return (
        <Suspense fallback={<Button disabled>Loading PDF...</Button>}>
          <ExperimentPDFDownloadButton
            key={`pdf-${algorithmSteps.length}-${Date.now()}`}
            experimentData={{
              experimentNumber: experimentNumber || "",
              experimentDate: experimentDate || "",
              experimentTitle: experimentTitle || "",
              experimentAim: experimentAim || "",
              algorithmSteps: validatedSteps,
              experimentProgram: experimentProgram || "",
              experimentResult: experimentResult || "",
              resultOnNewPage: resultOnNewPage,
            }}
            resetTrigger={resetTrigger}
          />
        </Suspense>
      );
    } catch (error) {
      console.error("PDF Generation Error:", error);
      return <Button variant="destructive">Failed to generate PDF</Button>;
    }
  };

  // ── Test-case CRUD ─────────────────────────────────────────────────────────

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        inputText: "",
        inputImages: [],
        outputText: "",
        outputImages: [],
      },
    ]);
  };

  const removeTestCase = (id: string) => {
    setTestCases((prev) => {
      if (prev.length <= 1) return prev;
      // Remove the hidden-input refs so they don't linger after the card unmounts
      imageInputRefs.current.delete(`${id}-input`);
      imageInputRefs.current.delete(`${id}-output`);
      return prev.filter((tc) => tc.id !== id);
    });
  };

  const updateTestCaseText = (
    id: string,
    field: "inputText" | "outputText",
    value: string
  ) => {
    setTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const handleImagesUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    tcId: string,
    side: "inputImages" | "outputImages"
  ) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        setTestCases((prev) =>
          prev.map((tc) =>
            tc.id === tcId
              ? {
                  ...tc,
                  [side]: [
                    ...(tc[side] ?? []),
                    { src: reader.result as string, caption: "" },
                  ],
                }
              : tc
          )
        );
      };
      reader.readAsDataURL(file);
    });
    // Reset the hidden file input via the stable ref map
    const refKey = side === "inputImages" ? `${tcId}-input` : `${tcId}-output`;
    const el = imageInputRefs.current.get(refKey);
    if (el) el.value = "";
  };

  const removeImage = (
    tcId: string,
    side: "inputImages" | "outputImages",
    imgIdx: number
  ) => {
    setTestCases((prev) =>
      prev.map((tc) =>
        tc.id === tcId
          ? { ...tc, [side]: (tc[side] ?? []).filter((_, i) => i !== imgIdx) }
          : tc
      )
    );
  };

  const updateImageCaption = (
    tcId: string,
    side: "inputImages" | "outputImages",
    imgIdx: number,
    caption: string
  ) => {
    setTestCases((prev) =>
      prev.map((tc) =>
        tc.id === tcId
          ? {
              ...tc,
              [side]: (tc[side] ?? []).map((img, i) =>
                i === imgIdx ? { ...img, caption } : img
              ),
            }
          : tc
      )
    );
  };

  const handleIndexPDFDownload = () => {
    if (typeof window === "undefined") return null;

    try {
      const formattedEntries = indexEntries.map((entry) => ({
        sno: entry.sno,
        date: entry.date,
        topic: entry.topic,
        pageNo: entry.pageNo,
        sign: "",
      }));

      // Create a resetTrigger based on index entries data
      const resetTrigger = JSON.stringify({
        entriesCount: indexEntries.length,
        rowCount: indexRowCount,
      });

      return (
        <Suspense fallback={<Button disabled>Loading PDF...</Button>}>
          <IndexPDFDownloadButton
            key={`pdf-index-${indexEntries.length}-${Date.now()}`}
            entries={formattedEntries}
            rowCount={indexRowCount}
            resetTrigger={resetTrigger}
          />
        </Suspense>
      );
    } catch (error) {
      console.error("PDF Generation Error:", error);
      return <Button variant="destructive">Failed to generate PDF</Button>;
    }
  };

  return (
    <div className="container mx-auto min-h-screen py-10 max-w-4xl px-4 sm:px-6">
      <Card className="mb-8 shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <Label
                htmlFor="template-select"
                className="text-sm font-medium mb-1.5"
              >
                Select Experiment Component
              </Label>
              <Select
                value={templateType}
                onValueChange={(value: "simple" | "experiment" | "index" | "coverpage") =>
                  setTemplateType(value)
                }
              >
                <SelectTrigger
                  id="template-select"
                  className="w-full mt-1 bg-slate-50"
                >
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Index Page</span>
                  </SelectItem>
                  <SelectItem
                    value="experiment"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Aim, Algorithm, Program, Result</span>
                  </SelectItem>
                  <SelectItem
                    value="simple"
                    className="flex items-center gap-2"
                  >
                    <FileCode className="h-4 w-4" />
                    <span>Test Data(Input and Output)</span>
                  </SelectItem>
                  <SelectItem
                    value="coverpage"
                    className="flex items-center gap-2"
                  >
                    <FileType className="h-4 w-4" />
                    <span>Cover page</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {templateType !== "coverpage" && (
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid grid-cols-2 w-[200px] mb-6">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6">
              {templateType === "simple" ? (
                <div className="grid gap-4">
                  {testCases.map((tc, tcIdx) => (
                    <Card
                      key={tc.id}
                      className="border border-slate-200 bg-slate-50 shadow-none"
                    >
                      <CardContent className="p-4">
                        {/* Card heading row */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-slate-800">
                            Test Case {tcIdx + 1}
                          </h3>
                          {testCases.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeTestCase(tc.id)}
                              title="Remove this test case"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-6">
                          {/* ── INPUT ───────────────────────────────────── */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FileOutput className="h-4 w-4 text-slate-500" />
                              <Label
                                htmlFor={`input-text-${tc.id}`}
                                className="font-medium"
                              >
                                Input
                              </Label>
                            </div>
                            <Textarea
                              id={`input-text-${tc.id}`}
                              placeholder="Enter input description or commands..."
                              className="min-h-[120px] font-mono bg-white"
                              value={tc.inputText ?? ""}
                              onChange={(e) =>
                                updateTestCaseText(tc.id, "inputText", e.target.value)
                              }
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="h-4 w-4 text-slate-500" />
                              <Label className="font-medium">
                                Input Images (optional)
                              </Label>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    imageInputRefs.current
                                      .get(`${tc.id}-input`)
                                      ?.click()
                                  }
                                  className="bg-white"
                                >
                                  Add Image(s)
                                </Button>
                                {/* Native <input> so the ref callback can store the
                                    HTMLInputElement directly into the stable Map. */}
                                <input
                                  ref={(el) => {
                                    if (el)
                                      imageInputRefs.current.set(
                                        `${tc.id}-input`,
                                        el
                                      );
                                    else
                                      imageInputRefs.current.delete(
                                        `${tc.id}-input`
                                      );
                                  }}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) =>
                                    handleImagesUpload(e, tc.id, "inputImages")
                                  }
                                  className="hidden"
                                />
                                <p className="text-sm text-muted-foreground">
                                  {(tc.inputImages ?? []).length === 0
                                    ? "No images added"
                                    : `${(tc.inputImages ?? []).length} image${
                                        (tc.inputImages ?? []).length > 1
                                          ? "s"
                                          : ""
                                      } added`}
                                </p>
                              </div>
                              {(tc.inputImages ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {(tc.inputImages ?? []).map((img, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="relative border rounded-md p-2 bg-white w-[150px] flex flex-col"
                                    >
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-5 w-5 bg-white/80 rounded-full hover:bg-red-50 hover:text-red-500 z-10"
                                        onClick={() =>
                                          removeImage(tc.id, "inputImages", imgIdx)
                                        }
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                      <div className="h-[80px] flex items-center justify-center overflow-hidden">
                                        <Image
                                          src={img.src}
                                          alt={`Input image ${imgIdx + 1}`}
                                          width={120}
                                          height={80}
                                          style={{
                                            objectFit: "contain",
                                            maxHeight: "80px",
                                          }}
                                        />
                                      </div>
                                      <div className="mt-2 flex flex-col gap-1">
                                        <Label
                                          htmlFor={`input-desc-${tc.id}-${imgIdx}`}
                                          className="text-xs text-muted-foreground font-medium"
                                        >
                                          Description
                                        </Label>
                                        <Input
                                          id={`input-desc-${tc.id}-${imgIdx}`}
                                          type="text"
                                          placeholder="Caption..."
                                          value={img.caption}
                                          onChange={(e) =>
                                            updateImageCaption(
                                              tc.id,
                                              "inputImages",
                                              imgIdx,
                                              e.target.value
                                            )
                                          }
                                          className="h-7 text-xs px-2 bg-white"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* ── OUTPUT ──────────────────────────────────── */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FileOutput className="h-4 w-4 text-slate-500" />
                              <Label
                                htmlFor={`output-text-${tc.id}`}
                                className="font-medium"
                              >
                                Output
                              </Label>
                            </div>
                            <Textarea
                              id={`output-text-${tc.id}`}
                              placeholder="Enter output description or commands..."
                              className="min-h-[120px] font-mono bg-white"
                              value={tc.outputText ?? ""}
                              onChange={(e) =>
                                updateTestCaseText(
                                  tc.id,
                                  "outputText",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ImageIcon className="h-4 w-4 text-slate-500" />
                              <Label className="font-medium">
                                Output Images (optional)
                              </Label>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    imageInputRefs.current
                                      .get(`${tc.id}-output`)
                                      ?.click()
                                  }
                                  className="bg-white"
                                >
                                  Add Image(s)
                                </Button>
                                <input
                                  ref={(el) => {
                                    if (el)
                                      imageInputRefs.current.set(
                                        `${tc.id}-output`,
                                        el
                                      );
                                    else
                                      imageInputRefs.current.delete(
                                        `${tc.id}-output`
                                      );
                                  }}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) =>
                                    handleImagesUpload(e, tc.id, "outputImages")
                                  }
                                  className="hidden"
                                />
                                <p className="text-sm text-muted-foreground">
                                  {(tc.outputImages ?? []).length === 0
                                    ? "No images added"
                                    : `${(tc.outputImages ?? []).length} image${
                                        (tc.outputImages ?? []).length > 1
                                          ? "s"
                                          : ""
                                      } added`}
                                </p>
                              </div>
                              {(tc.outputImages ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-3 mt-2">
                                  {(tc.outputImages ?? []).map((img, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="relative border rounded-md p-2 bg-white w-[150px] flex flex-col"
                                    >
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-1 right-1 h-5 w-5 bg-white/80 rounded-full hover:bg-red-50 hover:text-red-500 z-10"
                                        onClick={() =>
                                          removeImage(
                                            tc.id,
                                            "outputImages",
                                            imgIdx
                                          )
                                        }
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                      <div className="h-[80px] flex items-center justify-center overflow-hidden">
                                        <Image
                                          src={img.src}
                                          alt={`Output image ${imgIdx + 1}`}
                                          width={120}
                                          height={80}
                                          style={{
                                            objectFit: "contain",
                                            maxHeight: "80px",
                                          }}
                                        />
                                      </div>
                                      <div className="mt-2 flex flex-col gap-1">
                                        <Label
                                          htmlFor={`output-desc-${tc.id}-${imgIdx}`}
                                          className="text-xs text-muted-foreground font-medium"
                                        >
                                          Description
                                        </Label>
                                        <Input
                                          id={`output-desc-${tc.id}-${imgIdx}`}
                                          type="text"
                                          placeholder="Caption..."
                                          value={img.caption}
                                          onChange={(e) =>
                                            updateImageCaption(
                                              tc.id,
                                              "outputImages",
                                              imgIdx,
                                              e.target.value
                                            )
                                          }
                                          className="h-7 text-xs px-2 bg-white"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add Test Case button */}
                  <Button
                    variant="outline"
                    onClick={addTestCase}
                    className="flex items-center gap-2 w-full border-dashed"
                  >
                    <Plus className="h-4 w-4" />
                    Add Test Case
                  </Button>
                </div>
              ) : templateType === "experiment" ? (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-4 w-4 text-slate-500" />
                        <Label htmlFor="exp-number" className="font-medium">
                          Experiment Number
                        </Label>
                      </div>
                      <Input
                        id="exp-number"
                        placeholder="e.g., 1"
                        value={experimentNumber}
                        onChange={(e) => setExperimentNumber(e.target.value)}
                        className="bg-slate-50"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <Label htmlFor="exp-date" className="font-medium">
                          Date
                        </Label>
                      </div>
                      <Input
                        id="exp-date"
                        type="date"
                        value={experimentDate}
                        onChange={(e) => setExperimentDate(e.target.value)}
                        className="bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <Label htmlFor="exp-title" className="font-medium">
                        Title
                      </Label>
                    </div>
                    <Input
                      id="exp-title"
                      placeholder="e.g., Polynomial Addition"
                      value={experimentTitle}
                      onChange={(e) => setExperimentTitle(e.target.value)}
                      className="bg-slate-50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-slate-500" />
                      <Label htmlFor="exp-aim" className="font-medium">
                        Aim
                      </Label>
                    </div>
                    <Textarea
                      id="exp-aim"
                      placeholder="e.g., To read two polynomials and store them in an array. Calculate the sum of the two polynomials."
                      className="min-h-[100px] bg-slate-50"
                      value={experimentAim}
                      onChange={(e) => setExperimentAim(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ListOrdered className="h-4 w-4 text-slate-500" />
                      <Label className="font-medium">Algorithm</Label>
                    </div>
                    <Card className="border border-slate-200 bg-slate-50 shadow-none">
                      <CardContent className="p-4 space-y-4">
                        {algorithmSteps.map((step, index) => (
                          <div
                            key={index}
                            className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-medium text-sm">
                                {!step.isHeading ? (
                                  (() => {
                                    const precedingSteps = algorithmSteps.slice(0, index + 1).reverse();
                                    const lastHeadingIndexFromCurrent = precedingSteps.findIndex(s => s.isHeading);
                                    if (lastHeadingIndexFromCurrent === -1) {
                                      return algorithmSteps.slice(0, index + 1).filter(s => !s.isHeading).length;
                                    } else {
                                      const startIndex = index - lastHeadingIndexFromCurrent + 1;
                                      return algorithmSteps.slice(startIndex, index + 1).filter(s => !s.isHeading).length;
                                    }
                                  })()
                                ) : (
                                  <span className="text-[10px]">H</span>
                                )}
                              </div>
                              <Input
                                placeholder={step.isHeading ? "Heading title" : "Step description"}
                                value={step.text}
                                onChange={(e) =>
                                  updateAlgorithmStep(
                                    index,
                                    "text",
                                    e.target.value
                                  )
                                }
                                className={`flex-1 bg-white ${step.isHeading ? "font-medium" : ""}`}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => addAlgorithmStep(index)}
                                title="Add step after this"
                                className="h-8 w-8"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              {algorithmSteps.length > 2 && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => removeAlgorithmStep(index)}
                                  title="Remove this step"
                                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="flex items-center gap-6 ml-8">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`is-heading-${index}`}
                                  checked={step.isHeading}
                                  onCheckedChange={(checked) =>
                                    updateAlgorithmStep(
                                      index,
                                      "isHeading",
                                      checked
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`is-heading-${index}`}
                                  className="text-sm font-medium"
                                >
                                  Set as Sub-Heading
                                </Label>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Switch
                                  id={`has-code-${index}`}
                                  checked={step.hasCode}
                                  onCheckedChange={(checked) =>
                                    updateAlgorithmStep(
                                      index,
                                      "hasCode",
                                      checked
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`has-code-${index}`}
                                  className="text-sm"
                                >
                                  Include code block
                                </Label>
                              </div>
                            </div>

                            {step.hasCode && (
                              <div className="ml-8 relative">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 rounded-full"></div>
                                <Textarea
                                  placeholder="Enter code or pseudo-code here..."
                                  value={step.code}
                                  onChange={(e) =>
                                    updateAlgorithmStep(
                                      index,
                                      "code",
                                      e.target.value
                                    )
                                  }
                                  className="pl-4 font-mono min-h-[100px] bg-white"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileCode className="h-4 w-4 text-slate-500" />
                      <Label htmlFor="exp-program" className="font-medium">
                        Program
                      </Label>
                    </div>
                    <Textarea
                      id="exp-program"
                      placeholder="Paste your program code here..."
                      className="min-h-[200px] font-mono bg-slate-50"
                      value={experimentProgram}
                      onChange={(e) => setExperimentProgram(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-slate-500" />
                      <Label htmlFor="exp-result" className="font-medium">
                        Result
                      </Label>
                    </div>
                    <Textarea
                      id="exp-result"
                      placeholder="e.g., Program has been executed successfully and obtained the output."
                      className="min-h-[100px] bg-slate-50"
                      value={experimentResult}
                      onChange={(e) => setExperimentResult(e.target.value)}
                    />

                    <div className="flex items-center gap-4 mt-4">
                      <Label
                        htmlFor="result-new-page"
                        className="text-sm font-medium"
                      >
                        Start Result on a New Page
                      </Label>
                      <Switch
                        id="result-new-page"
                        checked={resultOnNewPage}
                        onCheckedChange={setResultOnNewPage}
                      />
                    </div>
                  </div>


                </div>
              ) : (
                <div className="grid gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ListChecks className="h-4 w-4 text-slate-500" />
                      <Label className="font-medium">Index Entries</Label>
                    </div>
                    <Card className="border border-slate-200 bg-slate-50 shadow-none">
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-12 gap-2 pb-2 border-b text-sm font-medium text-slate-500">
                          <div className="col-span-1">S.NO</div>
                          <div className="col-span-3">DATE</div>
                          <div className="col-span-5">TOPIC</div>
                          <div className="col-span-2">PAGE.NO</div>
                          <div className="col-span-1"></div>
                        </div>

                        {indexEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="grid grid-cols-12 gap-2 items-center"
                          >
                            <div className="col-span-1">
                              <Input
                                value={entry.sno || ""}
                                onChange={(e) =>
                                  updateIndexEntry(
                                    entry.id,
                                    "sno",
                                    e.target.value
                                  )
                                }
                                className="bg-white text-center p-2"
                              />
                            </div>
                            <div className="col-span-3">
                              <Input
                                value={entry.date || ""}
                                onChange={(e) =>
                                  updateIndexEntry(
                                    entry.id,
                                    "date",
                                    e.target.value
                                  )
                                }
                                className="bg-white p-2"
                              />
                            </div>
                            <div className="col-span-5">
                              <Input
                                value={entry.topic || ""}
                                onChange={(e) =>
                                  updateIndexEntry(
                                    entry.id,
                                    "topic",
                                    e.target.value
                                  )
                                }
                                className="bg-white p-2"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                value={entry.pageNo || ""}
                                onChange={(e) =>
                                  updateIndexEntry(
                                    entry.id,
                                    "pageNo",
                                    e.target.value
                                  )
                                }
                                className="bg-white text-center p-2"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeIndexEntry(entry.id)}
                                title="Remove this entry"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div className="pt-2">
                          <Button
                            variant="outline"
                            onClick={addIndexEntry}
                            className="flex items-center gap-2 w-full border-dashed"
                          >
                            <Plus className="h-4 w-4" /> Add Entry
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <div className="flex items-center gap-4">
                      <Label htmlFor="index-row-count" className="font-medium">
                        Total Rows in Index (Including Empty Rows) :
                      </Label>
                      <Input
                        id="index-row-count"
                        type="number"
                        min="5"
                        max="50"
                        value={indexRowCount}
                        onChange={(e) =>
                          setIndexRowCount(Number(e.target.value) || 20)
                        }
                        className="w-24 text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <div className="bg-white border border-slate-200 rounded-md p-8 shadow-sm max-w-[800px] mx-auto">
                {templateType === "simple" ? (
                  <div className="a4-preview simple-template">
                    {testCases.map((tc, tcIdx) => {
                      const hasInput = !!(
                        tc.inputText || (tc.inputImages ?? []).length > 0
                      );
                      const hasOutput = !!(
                        tc.outputText || (tc.outputImages ?? []).length > 0
                      );
                      return (
                        <div
                          key={tc.id}
                          className={
                            tcIdx > 0
                              ? "mt-8 pt-6 border-t border-slate-200"
                              : ""
                          }
                        >
                          <h3 className="text-lg font-semibold mb-3 underline">
                            Test Case {tcIdx + 1}
                          </h3>

                          {/* Input preview */}
                          {hasInput && (
                            <div className="mb-4">
                              <h4 className="text-base font-semibold mb-2 flex items-center gap-2 underline">
                                <FileOutput className="h-4 w-4 text-slate-500" />
                                Input
                              </h4>
                              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3">
                                {tc.inputText && (
                                  <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800">
                                    {tc.inputText}
                                  </pre>
                                )}
                                {(tc.inputImages ?? []).length > 0 && (
                                  <div className="grid grid-cols-2 gap-4">
                                    {(tc.inputImages ?? []).map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="flex flex-col items-center"
                                      >
                                        <Image
                                          src={img.src}
                                          alt={`Input image ${idx + 1}`}
                                          width={400}
                                          height={200}
                                          style={{
                                            objectFit: "contain",
                                            maxHeight: "200px",
                                          }}
                                        />
                                        {img.caption ? (
                                          <p className="text-xs text-slate-500 mt-1 text-center font-serif">
                                            {img.caption}
                                          </p>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Output preview */}
                          {hasOutput && (
                            <div className="mb-4">
                              <h4 className="text-base font-semibold mb-2 flex items-center gap-2 underline">
                                <FileOutput className="h-4 w-4 text-slate-500" />
                                Output
                              </h4>
                              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 space-y-3">
                                {tc.outputText && (
                                  <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800">
                                    {tc.outputText}
                                  </pre>
                                )}
                                {(tc.outputImages ?? []).length > 0 && (
                                  <div className="grid grid-cols-2 gap-4">
                                    {(tc.outputImages ?? []).map((img, idx) => (
                                      <div
                                        key={idx}
                                        className="flex flex-col items-center"
                                      >
                                        <Image
                                          src={img.src}
                                          alt={`Output image ${idx + 1}`}
                                          width={400}
                                          height={200}
                                          style={{
                                            objectFit: "contain",
                                            maxHeight: "200px",
                                          }}
                                        />
                                        {img.caption ? (
                                          <p className="text-xs text-slate-500 mt-1 text-center font-serif">
                                            {img.caption}
                                          </p>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Fallback for an empty test case */}
                          {!hasInput && !hasOutput && (
                            <p className="text-sm text-slate-400 italic">
                              Enter input or output above to see a preview.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : templateType === "experiment" ? (
                  <div className="a4-preview experiment-template">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {experimentTitle || "Experiment Title"}
                        </h2>
                      </div>
                      <div className="text-right text-sm flex gap-1 flex-col text-slate-600">
                        <p>
                          <span className="font-medium">Experiment No:</span>{" "}
                          {experimentNumber || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {experimentDate || "N/A"}
                        </p>
                      </div>
                    </div>

                    <Separator className="mb-6" />

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4.5 w-4.5 text-slate-500" />
                        Aim
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <p className="text-slate-800">
                          {experimentAim ||
                            "The aim of the experiment is not specified!..."}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <ListOrdered className="h-4.5 w-4.5 text-slate-500" />
                        Algorithm
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <div className="space-y-3">
                          {(() => {
                            let previewStepCounter = 0;
                            return algorithmSteps.map((step, index) => {
                              if (step.isHeading) {
                                previewStepCounter = 0;
                              } else {
                                previewStepCounter++;
                              }
                              return (
                                <div key={index} className="text-slate-800">
                                  <div className="flex gap-2">
                                    {!step.isHeading && (
                                      <span className="font-medium shrink-0">
                                        {previewStepCounter}.
                                      </span>
                                    )}
                                    <span
                                      className={
                                        step.isHeading
                                          ? "font-bold text-slate-900 mt-1 first:mt-0"
                                          : ""
                                      }
                                    >
                                      {step.text ||
                                        (step.isHeading
                                          ? "Sub-Heading"
                                          : `Step ${previewStepCounter}`)}
                                    </span>
                                  </div>
                                  {step.hasCode && (
                                    <div className="mt-2 ml-5 bg-white p-3 rounded border border-slate-200 font-mono text-sm">
                                      <pre className="whitespace-pre-wrap">
                                        {step.code ||
                                          "// Code will appear here"}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <FileCode className="h-4.5 w-4.5 text-slate-500" />
                        Program
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-slate-800">
                          {experimentProgram || "// program"}
                        </pre>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4.5 w-4.5 text-slate-500" />
                        Result
                      </h3>
                      <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                        <p className="text-slate-800">
                          {experimentResult ||
                            "The result of the experiment will appear here"}
                        </p>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="a4-preview index-template">
                    <div className="mb-8 text-center">
                      <h2 className="text-3xl font-semibold uppercase">
                        Index
                      </h2>
                    </div>

                    <table className="w-full border-collapse border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 p-2 text-center w-[8%] font-medium">
                            S.NO
                          </th>
                          <th className="border border-slate-300 p-2 text-center w-[15%] font-medium">
                            DATE
                          </th>
                          <th className="border border-slate-300 p-2 text-center w-[52%] font-medium">
                            TOPIC
                          </th>
                          <th className="border border-slate-300 p-2 text-center w-[14%] font-medium">
                            PAGE NO.
                          </th>
                          <th className="border border-slate-300 p-2 text-center w-[15%] font-medium">
                            SIGN
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {indexEntries.map((entry, idx) => (
                          <tr key={idx}>
                            <td className="border border-slate-300 p-2 text-center">
                              {entry.sno}
                            </td>
                            <td className="border border-slate-300 p-2 text-center">
                              {entry.date}
                            </td>
                            <td className="border border-slate-300 p-2 text-left">
                              {entry.topic}
                            </td>
                            <td className="border border-slate-300 p-2 text-center">
                              {entry.pageNo}
                            </td>
                            <td className="border border-slate-300 p-2 text-center">
                              {entry.sign}
                            </td>
                          </tr>
                        ))}
                        {Array.from({
                          length: Math.min(
                            3,
                            indexRowCount - indexEntries.length
                          ),
                        }).map((_, idx) => (
                          <tr key={`empty-${idx}`}>
                            <td className="border border-slate-300 p-2 text-center">
                              {indexEntries.length + idx + 1}
                            </td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                            <td className="border border-slate-300 p-2"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {indexRowCount - indexEntries.length > 3 && (
                      <p className="text-sm text-slate-500 mt-2 text-center">
                        + {indexRowCount - indexEntries.length - 3} more empty
                        rows will appear in the PDF
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      <div className="mt-8 flex justify-center">
        {templateType === "simple" ? (
          <Suspense fallback={<Button disabled>Loading PDF...</Button>}>
            <PDFDownloadButton
              key={`pdf-simple-${testCases.length}-${Date.now()}`}
              testCases={testCases}
              resetTrigger={JSON.stringify(testCases)}
            />
          </Suspense>
        ) : templateType === "experiment" ? (
          handleExperimentPDFDownload()
        ) : templateType === "coverpage" ? (
          <a
            href={COVER_PAGE_DOC_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Cover Page
            </Button>
          </a>
        ) : (
          handleIndexPDFDownload()
        )}
      </div>
    </div>
  );
}
