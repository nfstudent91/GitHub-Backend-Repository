import PizZip from "pizzip";
import { S3Service } from "./s3.service";

/* ============================================================
   Shared Regex / Utilities
============================================================ */

const PLACEHOLDER_REGEX = /\{{2,}\s*([^{}]+?)\s*\}{2,}/g;
const SECTION_REGEX = /^_*section[_\s]+(.+?)_*$/i;
const SKIP_TAG_REGEX = /^[#/!%]/;

function stripXmlTags(xml: string): string {
  return xml.replace(/<[^>]+>/g, "");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeBraces(text: string): string {
  return text.replace(/\{{3,}/g, "{{").replace(/\}{3,}/g, "}}");
}

/* ============================================================
   Placeholder Types
============================================================ */

export interface PlaceholderInfo {
  name: string;
  section?: string;
}

/* ============================================================
   Placeholder Extraction
============================================================ */

function extractPlaceholdersWithSections(xml: string): PlaceholderInfo[] {
  const text = stripXmlTags(xml);
  const result: PlaceholderInfo[] = [];

  let currentSection: string | undefined;
  let match: RegExpExecArray | null;

  while ((match = PLACEHOLDER_REGEX.exec(text)) !== null) {
    const tag = match[1].trim();
    if (!tag) continue;

    const sectionMatch = SECTION_REGEX.exec(tag);
    if (sectionMatch) {
      currentSection = sectionMatch[1].replace(/_/g, " ").trim();
      continue;
    }

    if (SKIP_TAG_REGEX.test(tag)) continue;

    result.push({ name: tag, section: currentSection });
  }

  return result;
}

/* ============================================================
   XML Replacement Logic
============================================================ */

function replaceInXml(xml: string, data: Record<string, string>): string {
  const paragraphRegex = /(<w:p\b[^>]*>)([\s\S]*?)(<\/w:p>)/g;

  return xml.replace(
    paragraphRegex,
    (match, openTag: string, content: string, closeTag: string) => {
      const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      const texts: string[] = [];

      let m: RegExpExecArray | null;
      while ((m = textRegex.exec(content)) !== null) {
        texts.push(m[1]);
      }

      if (texts.length === 0) return match;

      let fullText = texts.join("");
      if (!fullText.includes("{")) return match;

      fullText = normalizeBraces(fullText);

      for (const [key, value] of Object.entries(data)) {
        const safeValue = escapeXml(value);
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const pattern = new RegExp(
          `\\{\\{\\s*${escapedKey}\\s*\\}\\}`,
          "g"
        );

        fullText = fullText.replace(pattern, safeValue);
      }

      let first = true;

      const updatedContent = content.replace(
        /<w:t([^>]*)>([^<]*)<\/w:t>/g,
        (_: string, attrs: string) => {
          if (first) {
            first = false;
            return `<w:t${attrs}>${fullText}</w:t>`;
          }
          return `<w:t${attrs}></w:t>`;
        }
      );

      return openTag + updatedContent + closeTag;
    }
  );
}

function processDocx(zip: PizZip, data: Record<string, string>): PizZip {
  const xmlFiles = zip.file(/\.xml$/);

  for (const entry of xmlFiles) {
    let xml = entry.asText();

    // Remove section markers
    xml = xml.replace(/\{{2,}\s*_*section[^}]*__?\}{2,}/gi, "");

    xml = replaceInXml(xml, data);

    zip.file(entry.name, xml);
  }

  return zip;
}

/* ============================================================
   Agreement Service
============================================================ */

export class AgreementService {
  private readonly s3Service = new S3Service();
  private readonly s3TemplateFolder = "AdviserTemplate";

  constructor() {
    // no local template directory needed; templates come from S3
  }

  private buildS3Key(templateName: string): string {
    return `${this.s3TemplateFolder}/${templateName}`;
  }

  async listTemplates(): Promise<
    { key: string; name: string; size: number; lastModified: Date }[]
  > {
    try {
      const templates = await this.s3Service.listFiles(
        this.s3TemplateFolder
      );

      return templates.filter((t) => t.name.endsWith(".docx"));
    } catch (error) {
      console.error("Error listing templates from S3:", error);
      throw new Error("Failed to list templates from S3");
    }
  }

  async getTemplatePlaceholders(
    templateName: string = "bakeragreement.docx"
  ): Promise<{
    success: boolean;
    placeholders: PlaceholderInfo[];
    templateName: string;
  }> {
    try {
      const content = await this.s3Service.getFile(
        this.buildS3Key(templateName)
      );

      const zip = new PizZip(content);
      const allPlaceholders = new Map<string, PlaceholderInfo>();

      for (const entry of zip.file(/\.xml$/)) {
        const rawXml = entry.asText();
        const found = extractPlaceholdersWithSections(rawXml);

        found.forEach((p) => {
          if (!allPlaceholders.has(p.name)) {
            allPlaceholders.set(p.name, p);
          }
        });
      }

      return {
        success: true,
        placeholders: Array.from(allPlaceholders.values()),
        templateName,
      };
    } catch (error) {
      console.error("Error getting template placeholders:", error);
      throw new Error(`Template file not found in S3: ${templateName}`);
    }
  }

  async generateFilledDocument(
    data: Record<string, string>,
    templateName: string = "bakeragreement.docx"
  ): Promise<Buffer> {
    try {
      const content = await this.s3Service.getFile(
        this.buildS3Key(templateName)
      );

      let zip = new PizZip(content);

      zip = processDocx(zip, data);

      return zip.generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      });
    } catch (error) {
      console.error("Error generating filled document:", error);
      throw new Error(`Template file not found in S3: ${templateName}`);
    }
  }
}