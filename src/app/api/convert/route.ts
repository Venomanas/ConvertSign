import { NextRequest, NextResponse } from "next/server";
import CloudConvert from "cloudconvert";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
export const runtime = "nodejs"; // use Node runtime, not edge

const cloudConvertApiKey = process.env.CLOUDCONVERT_API_KEY;
const cloudConvert = cloudConvertApiKey
  ? new CloudConvert(cloudConvertApiKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const targetFormat = formData.get("targetFormat") as string | null;

    if (!file || !targetFormat) {
      return NextResponse.json(
        { error: "File and target format are required" },
        { status: 400 }
      );
    }

    console.log("Conversion request:", {
      fileName: file.name,
      fileType: file.type,
      targetFormat,
      fileSize: file.size,
    });

    const supportedConversions = getSupportedConversions(file.type);
    if (!supportedConversions.includes(targetFormat)) {
      return NextResponse.json(
        {
          error: `Conversion from ${file.type} to ${targetFormat} is not supported`,
        },
        { status: 400 }
      );
    }

    // ✅ read uploaded file into a Node Buffer (your earlier code used arrayBuffer before it existed)
    const fileArrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileArrayBuffer);

    let convertedBuffer: Buffer;
    let outMime = "";

    // 🔹 1. Real DOC/DOCX → PDF using CloudConvert
    if (isWordMime(file.type) && targetFormat === "pdf") {
      if (!cloudConvert || !cloudConvertApiKey) {
        console.warn(
          "CloudConvert not configured, falling back to placeholder PDF"
        );
        convertedBuffer = await createSimplePdfPlaceholder(
          buffer,
          file.type,
          file.name
        );
        outMime = "application/pdf";
      } else {
        try {
          convertedBuffer = await convertWordToPdfWithCloudConvert(
            buffer,
            file.name
          );
          outMime = "application/pdf";
        } catch (err) {
          console.error(
            "CloudConvert failed, using placeholder PDF instead:",
            err
          );
          convertedBuffer = await createSimplePdfPlaceholder(
            buffer,
            file.type,
            file.name
          );
          outMime = "application/pdf";
        }
      }
    }
    // 🔹 2. Excel → CSV / TXT
    else if (
      isExcelMime(file.type) &&
      (targetFormat === "csv" || targetFormat === "txt")
    ) {
      const { outputBuffer, mime } = await convertExcelToCsvOrText(
        buffer,
        targetFormat as "csv" | "txt"
      );
      convertedBuffer = outputBuffer;
      outMime = mime;
    }

    // 🔹 2. Images (placeholder – still just echo for now)
    else if (file.type.startsWith("image/") && targetFormat !== "pdf") {
      convertedBuffer = await convertImage(buffer, file.type, targetFormat);
      outMime = getMimeTypeForFormat(targetFormat);
    }
    // 🔹 3. To plain text (placeholder)
    else if (targetFormat === "txt") {
      convertedBuffer = await convertToText(buffer, file.type);
      outMime = "text/plain; charset=utf-8";
    }
    // 🔹 4. Other → PDF (simple placeholder PDF)
    else if (targetFormat === "pdf") {
      convertedBuffer = await createSimplePdfPlaceholder(
        buffer,
        file.type,
        file.name
      );
      outMime = "application/pdf";
    }
    // 🔹 5. Fallback – just echo original file
    else {
      convertedBuffer = buffer;
      outMime = file.type || "application/octet-stream";
    }

    const newFileName = getConvertedFileName(file.name, targetFormat);

    console.log("Conversion successful:", newFileName);

    // ✅ Convert Node Buffer → ArrayBuffer for NextResponse
    const responseArrayBuffer = convertedBuffer.buffer.slice(
      convertedBuffer.byteOffset,
      convertedBuffer.byteOffset + convertedBuffer.byteLength
    );

    return new NextResponse(responseArrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": outMime,
        "Content-Disposition": `attachment; filename="${newFileName}"`,
      },
    });
  } catch (error) {
    console.error("Conversion error (top-level):", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Conversion failed. Please try again.",
      },
      { status: 500 }
    );
  }
}

/* ---------------- helpers ---------------- */

function getSupportedConversions(fileType: string): string[] {
  if (fileType.startsWith("image/")) {
    return ["jpg", "png", "webp", "gif", "bmp", "pdf"];
  } else if (fileType === "application/pdf") {
    return ["jpg", "png", "txt"];
  } else if (isWordMime(fileType)) {
    // Word → pdf / txt
    return ["pdf", "txt"];
  } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
    return ["pdf", "csv", "txt"];
  } else if (
    fileType.includes("powerpoint") ||
    fileType.includes("presentation")
  ) {
    return ["pdf", "jpg"];
  } else if (fileType === "text/plain") {
    return ["pdf"];
  }

  return [];
}

function isWordMime(mime: string): boolean {
  return (
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function isExcelMime(mime: string): boolean {
  return (
    mime === "application/vnd.ms-excel" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime.includes("spreadsheet")
  );
}

function getMimeTypeForFormat(format: string): string {
  switch (format) {
    case "jpg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "pdf":
      return "application/pdf";
    case "txt":
      return "text/plain; charset=utf-8";
    case "csv":
      return "text/csv; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

interface CloudConvertJob {
  id: string;
  status: string;
  tasks?: Array<{
    id: string;
    name: string;
    operation: string;
    status: string;
    message?: string;
    code?: string;
    result?: {
      files?: Array<{
        url: string;
        filename: string;
        size: number;
      }>;
    };
  }>;
  message?: string;
}

/**
 * 🔹 Excel (XLS / XLSX) → CSV or clean text
 */
async function convertExcelToCsvOrText(
  buffer: Buffer,
  target: "csv" | "txt"
): Promise<{ outputBuffer: Buffer; mime: string }> {
  // Dynamic import so it plays nice with ESM / Next
  const xlsxModule = await import("xlsx");
  const XLSX = (xlsxModule as any).default || xlsxModule;

  // Read workbook from buffer
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetNames: string[] = workbook.SheetNames;

  if (!sheetNames.length) {
    throw new Error("No sheets found in Excel file.");
  }

  const firstSheetName = sheetNames[0];
  const firstSheet = workbook.Sheets[firstSheetName];

  if (!firstSheet) {
    throw new Error("First sheet is empty or invalid.");
  }

  if (target === "csv") {
    const csv = XLSX.utils.sheet_to_csv(firstSheet);
    return {
      outputBuffer: Buffer.from(csv, "utf8"),
      mime: "text/csv; charset=utf-8",
    };
  } else {
    // target === "txt": create a clean, tab-separated text representation
    const rows: any[][] = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1, // "array-of-arrays" mode
      raw: false,
    }) as any;

    const lines = rows.map(row =>
      row.map(cell => (cell == null ? "" : String(cell))).join("\t")
    );

    const text = `Converted from Excel sheet: ${firstSheetName}\n\n${lines.join(
      "\n"
    )}`;

    return {
      outputBuffer: Buffer.from(text, "utf8"),
      mime: "text/plain; charset=utf-8",
    };
  }
}

/**
 * 🔹 Real DOC/DOCX → PDF using CloudConvert
 */
async function convertWordToPdfWithCloudConvert(
  buffer: Buffer,
  originalName: string
): Promise<Buffer> {
  if (!cloudConvert || !cloudConvertApiKey) {
    throw new Error("CloudConvert is not configured.");
  }

  const extMatch = originalName.match(/\.([^.]+)$/);
  const inputFormat = extMatch ? extMatch[1].toLowerCase() : "docx";

  try {
    // 1️⃣ Create job with upload + convert + export/url
    const job = await cloudConvert.jobs.create({
      tasks: {
        "upload-my-file": {
          operation: "import/upload",
        },
        "convert-my-file": {
          operation: "convert",
          input: "upload-my-file",
          input_format: inputFormat,
          output_format: "pdf",
          engine: "office",
        },
        "export-my-file": {
          operation: "export/url",
          input: "convert-my-file",
        },
      },
    });

    // 2️⃣ Find the upload task
    const uploadTask = job.tasks?.find(
      (t: any) => t.name === "upload-my-file"
    ) as any;

    if (!uploadTask) {
      throw new Error("CloudConvert upload task not found.");
    }

    // 3️⃣ Upload using the SDK's upload method
    await cloudConvert.tasks.upload(uploadTask, buffer, originalName);

    // 4️⃣ Wait for the job to complete
    const finishedJob = await cloudConvert.jobs.wait(job.id);

    // 5️⃣ Check for errors
    const jobData = finishedJob as CloudConvertJob;
    if (jobData.status === "error") {
      const errorTasks = jobData.tasks?.filter(t => t.status === "error");
      if (errorTasks && errorTasks.length > 0) {
        const errorMessages = errorTasks
          .map(t => `${t.operation}: ${t.message || t.code || "Unknown error"}`)
          .join("; ");
        throw new Error(`Conversion failed: ${errorMessages}`);
      }
      throw new Error(
        `Conversion job failed: ${jobData.message || "Unknown error"}`
      );
    }

    // 6️⃣ Find the export task
    const exportTask = jobData.tasks?.find(t => t.name === "export-my-file");

    if (!exportTask) {
      console.error("All tasks:", jobData.tasks);
      throw new Error("CloudConvert export task not found.");
    }

    // 7️⃣ Get export task result
    const exportTaskResult = await cloudConvert.tasks.wait(exportTask.id);

    if (!exportTaskResult.result?.files?.length) {
      console.error("CloudConvert export task result:", exportTaskResult);
      throw new Error("CloudConvert export failed (no files in result).");
    }

    const fileUrl = exportTaskResult.result.files[0].url;
    if (!fileUrl) {
      console.error("CloudConvert: export file URL missing", exportTaskResult);
      throw new Error("CloudConvert did not return a download URL.");
    }

    // 8️⃣ Download the converted file
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(fileUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to download converted file: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("CloudConvert conversion error:", error);
    throw new Error(
      `CloudConvert failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Image conversion placeholder – plug Sharp here later if you want.
 */
// async function convertImage(
//   buffer: Buffer,
//   originalType: string,
//   targetFormat: string
// ): Promise<Buffer> {
//   console.log(`Image conversion: ${originalType} -> ${targetFormat}`);
//   // TODO: integrate sharp() for real image conversion if needed
//   return buffer;
// }

/**
 * 🔥 Real image conversion using Sharp
 *  - image -> image (jpg/png/webp/gif/bmp)
 *  - image -> pdf (single-page PDF with the image embedded)
 */

async function convertImage(
  buffer: Buffer,
  originalType: string,
  targetFormat: string
): Promise<Buffer> {
  console.log(`Image conversion: ${originalType} -> ${targetFormat}`);

  const img = sharp(buffer, { failOnError: false });

  // 🖼️ Image → PDF
  if (targetFormat === "pdf") {
    try {
      // Convert everything to PNG first for consistent embedding
      const pngBuffer =
        originalType === "image/png" ? buffer : await img.png().toBuffer();

      const pdfDoc = await PDFDocument.create();
      const embedded = await pdfDoc.embedPng(pngBuffer);

      const page = pdfDoc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, {
        x: 0,
        y: 0,
        width: embedded.width,
        height: embedded.height,
      });

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (err) {
      console.error("Image → PDF via pdf-lib failed, returning original:", err);
      return buffer;
    }
  }

  // 🖼️ Image → Image (format change)
  try {
    // Sharp uses "jpeg" instead of "jpg"
    const sharpFormat =
      targetFormat === "jpg"
        ? "jpeg"
        : (targetFormat as keyof sharp.FormatEnum);

    const out = await img.toFormat(sharpFormat).toBuffer();
    return out;
  } catch (err) {
    console.error("Sharp image conversion failed, returning original:", err);
    return buffer;
  }
}

/**
 * Simple PDF placeholder for non-Word → PDF
 */
async function createSimplePdfPlaceholder(
  _buffer: Buffer,
  originalType: string,
  originalName: string
): Promise<Buffer> {
  const text = `Converted from: ${originalName}\\nType: ${originalType}\\nDate: ${new Date().toISOString()}`;

  const pdf = `
%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R /Resources << >>
>>
endobj
4 0 obj
<< /Length ${text.length + 33} >>
stream
BT
/F1 12 Tf
50 750 Td
(${text}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000277 00000 n 
trailer
<< /Root 1 0 R /Size 5 >>
startxref
${277 + text.length}
%%EOF
`;

  return Buffer.from(pdf);
}

async function convertToText(
  buffer: Buffer,
  originalType: string
): Promise<Buffer> {
  let textContent = `Converted from: ${originalType}\\n\\n`;

  if (originalType.startsWith("text/")) {
    textContent += buffer.toString("utf8");
  } else {
    textContent +=
      "This is a placeholder text extraction. Use a proper text extraction library for real content.";
  }

  return Buffer.from(textContent, "utf8");
}

function getConvertedFileName(
  originalName: string,
  targetFormat: string
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, "");
  return `${baseName}.${targetFormat}`;
}
