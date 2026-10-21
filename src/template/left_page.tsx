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

interface PDFDocumentProps {
  inputText?: string;
  inputImages?: ImageItem[];
  outputText?: string;
  outputImages?: ImageItem[];
}

const styles = StyleSheet.create({
  page: {
    padding: "1cm",
    fontFamily: "Latin Modern Roman",
    fontSize: 12,
    lineHeight: 0.7,
  },
  // First section header — no top margin
  firstSectionHeader: {
    fontSize: 14,
    fontFamily: "Latin Modern Roman",
    textDecoration: "underline",
    marginTop: "0.2cm",
    marginBottom: "0.5cm",
  },
  // Subsequent section headers
  sectionHeader: {
    fontSize: 14,
    fontFamily: "Latin Modern Roman",
    textDecoration: "underline",
    marginTop: "1cm",
    marginBottom: "0.5cm",
  },
  content: {
    lineHeight: 0.8,
    marginBottom: "-0.2cm",
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
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

export const PDFDocument = ({
  inputText,
  inputImages = [],
  outputText,
  outputImages = [],
}: PDFDocumentProps) => {
  const hasInput = !!(inputText || inputImages.length > 0);
  const hasOutput = !!(outputText || outputImages.length > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* INPUT */}
        {hasInput && (
          <View>
            <View style={styles.firstSectionHeader}>
              <Text>Input</Text>
            </View>
            {inputText ? (
              <View style={styles.content}>
                <Text>{preserveWhitespaceForPdf(inputText)}</Text>
              </View>
            ) : null}
            {inputImages.length > 0 && (
              <View style={styles.imageRow}>
                {inputImages.map((img, i) => (
                  <View
                    key={i}
                    style={i % 2 === 0 ? styles.gridCellLeft : styles.gridCellRight}
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
            )}
          </View>
        )}

        {/* OUTPUT */}
        {hasOutput && (
          <View>
            <View style={hasInput ? styles.sectionHeader : styles.firstSectionHeader}>
              <Text>Output</Text>
            </View>
            {outputText ? (
              <View style={styles.content}>
                <Text>{preserveWhitespaceForPdf(outputText)}</Text>
              </View>
            ) : null}
            {outputImages.length > 0 && (
              <View style={styles.imageRow}>
                {outputImages.map((img, i) => (
                  <View
                    key={i}
                    style={i % 2 === 0 ? styles.gridCellLeft : styles.gridCellRight}
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
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};
