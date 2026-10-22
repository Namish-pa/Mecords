"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { preserveWhitespaceForPdf } from "@/lib/pdfUtils";

Font.register({
  family: "Latin Modern Roman",
  src: "https://cdn.jsdelivr.net/npm/@fontsource/eb-garamond@4.5.0/files/eb-garamond-latin-400-normal.woff",
});

export interface ImageItem {
  src: string;
  caption: string;
}

export interface TestCase {
  id: string;
  inputText?: string;
  inputImages?: ImageItem[];
  outputText?: string;
  outputImages?: ImageItem[];
}

interface PDFDocumentProps {
  testCases: TestCase[];
}

const styles = StyleSheet.create({
  page: {
    padding: "1cm",
    fontFamily: "Latin Modern Roman",
    fontSize: 12,
    lineHeight: 0.7,
  },
  // "Test Case N" heading — first one (near top of page, small top margin)
  testCaseHeadingFirst: {
    fontSize: 14,
    fontFamily: "Latin Modern Roman",
    textDecoration: "underline",
    marginTop: "0.2cm",
    marginBottom: "0.4cm",
  },
  // "Test Case N" heading — subsequent ones (extra top margin for visual separation)
  testCaseHeading: {
    fontSize: 14,
    fontFamily: "Latin Modern Roman",
    textDecoration: "underline",
    marginTop: "1.5cm",
    marginBottom: "0.4cm",
  },
  // "Input" / "Output" label immediately after a test-case heading (no top margin;
  // spacing comes from the heading's marginBottom)
  sectionSubHeadingFirst: {
    fontSize: 14,
    fontFamily: "Latin Modern Roman",
    textDecoration: "underline",
    marginBottom: "0.5cm",
  },
  // "Output" label when preceded by input content (needs top margin to separate)
  sectionSubHeading: {
    fontSize: 14,
    fontFamily: "Latin Modern Roman",
    textDecoration: "underline",
    marginTop: "1cm",
    marginBottom: "0.5cm",
  },
  // Preserves the original code line-spacing fix
  content: {
    lineHeight: 0.8,
    marginBottom: "-0.2cm",
  },
  // Container for each row of 2 images — never broken across pages via wrap={false}
  imageRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  gridCellLeft: {
    width: "48%",
    marginBottom: 10,
    alignItems: "center",
    marginRight: "4%",
  },
  gridCellRight: {
    width: "48%",
    marginBottom: 10,
    alignItems: "center",
  },
  // Fixed-height image with objectFit: "contain" — preserves original sizing
  image: {
    width: "100%",
    height: 180,
    objectFit: "contain",
  },
  caption: {
    fontSize: 9,
    fontFamily: "Latin Modern Roman",
    textAlign: "center",
    marginTop: 4,
  },
});

/**
 * Groups images into rows of 2 and wraps each row in wrap={false} so a
 * pair of images (and their captions) is never split across pages.
 */
function ImageGrid({ images }: { images: ImageItem[] }) {
  const rows: ImageItem[][] = [];
  for (let i = 0; i < images.length; i += 2) {
    rows.push(images.slice(i, i + 2));
  }
  return (
    <View>
      {rows.map((row, rowIdx) => (
        // wrap={false} keeps both images + captions in this row on the same page
        <View key={rowIdx} style={styles.imageRow} wrap={false}>
          {row.map((img, colIdx) => (
            <View
              key={colIdx}
              style={colIdx === 0 ? styles.gridCellLeft : styles.gridCellRight}
            >
              <Image
                src={typeof img === "string" ? img : img.src}
                style={styles.image}
              />
              {typeof img !== "string" && img.caption && img.caption.trim() ? (
                <Text style={styles.caption}>{img.caption.trim()}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

export const PDFDocument = ({ testCases }: PDFDocumentProps) => {
  return (
    <Document>
      {/* wrap on Page allows content to flow onto subsequent pages */}
      <Page size="A4" style={styles.page} wrap>
        {testCases.map((tc, tcIdx) => {
          const hasInput = !!(
            tc.inputText || (tc.inputImages && tc.inputImages.length > 0)
          );
          const hasOutput = !!(
            tc.outputText || (tc.outputImages && tc.outputImages.length > 0)
          );
          const isFirst = tcIdx === 0;
          // Which sub-section label appears first under the test-case heading
          const firstSubLabel = hasInput
            ? "Input"
            : hasOutput
            ? "Output"
            : null;

          return (
            <View key={tc.id}>
              {/*
                Non-breaking anchor block:
                  "Test Case N" heading + the first sub-section label ("Input" or "Output")
                  are kept together in a single wrap={false} View.
                  If they don't fit on the current page they move together to the next,
                  so the heading is NEVER stranded alone at the bottom of a page.
              */}
              <View wrap={false}>
                <View
                  style={
                    isFirst
                      ? styles.testCaseHeadingFirst
                      : styles.testCaseHeading
                  }
                >
                  <Text>Test Case {tcIdx + 1}</Text>
                </View>
                {firstSubLabel && (
                  <View style={styles.sectionSubHeadingFirst}>
                    <Text>{firstSubLabel}</Text>
                  </View>
                )}
              </View>

              {/* INPUT content — text wraps freely across pages; image rows do not */}
              {hasInput && (
                <View>
                  {tc.inputText ? (
                    <View style={styles.content}>
                      <Text>{preserveWhitespaceForPdf(tc.inputText)}</Text>
                    </View>
                  ) : null}
                  {tc.inputImages && tc.inputImages.length > 0 && (
                    <ImageGrid images={tc.inputImages} />
                  )}
                </View>
              )}

              {/*
                OUTPUT heading — only rendered when there is also input content,
                because when there is no input the "Output" label was already
                included in the non-breaking anchor block above.
                wrap={false} moves it to the next page rather than leaving it stranded.
              */}
              {hasInput && hasOutput && (
                <View wrap={false} style={styles.sectionSubHeading}>
                  <Text>Output</Text>
                </View>
              )}

              {/* OUTPUT content — text wraps freely; image rows do not */}
              {hasOutput && (
                <View>
                  {tc.outputText ? (
                    <View style={styles.content}>
                      <Text>{preserveWhitespaceForPdf(tc.outputText)}</Text>
                    </View>
                  ) : null}
                  {tc.outputImages && tc.outputImages.length > 0 && (
                    <ImageGrid images={tc.outputImages} />
                  )}
                </View>
              )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};
