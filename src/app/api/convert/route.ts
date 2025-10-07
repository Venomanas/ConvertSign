/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const targetFormat = formData.get("targetFormat") as string;

    console.log("Conversion request:", {
      fileName: file?.name,
      fileType: file?.type,
      targetFormat,
      fileSize: file?.size,
    });

    if (!file || !targetFormat) {
      return NextResponse.json(
        { error: "File and target format are required" },
        { status: 400 }
      );
    }

    // Validate if conversion is supported
    const supportedConversions = getSupportedConversions(file.type);
    if (!supportedConversions.includes(targetFormat as any)) {
      return NextResponse.json(
        {
          error: `Conversion from ${file.type} to ${targetFormat} is not supported`,
        },
        { status: 400 }
      );
    }

    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Perform conversion
    let convertedBuffer: Buffer;

    if (file.type.startsWith("image/") && targetFormat !== "pdf") {
      convertedBuffer = await convertImage(buffer, file.type, targetFormat);
    } else if (targetFormat === "pdf") {
      convertedBuffer = await convertToPdf(buffer, file.type, file.name);
    } else if (targetFormat === "txt") {
      convertedBuffer = await convertToText(buffer, file.type);
    } else {
      // For unsupported conversions, return original file for testing
      convertedBuffer = buffer;
    }

    const base64 = convertedBuffer.toString("base64");
    const newFileName = getConvertedFileName(file.name, targetFormat);

    console.log("Conversion successful:", newFileName);

    return NextResponse.json({
      convertedFile: base64,
      fileName: newFileName,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Conversion failed",
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getSupportedConversions(fileType: string): string[] {
  if (fileType.startsWith("image/")) {
    return ["jpg", "png", "webp", "gif", "bmp", "pdf"];
  } else if (fileType === "application/pdf") {
    return ["jpg", "png", "txt"];
  } else if (fileType.includes("word") || fileType.includes("document")) {
    return ["pdf", "txt"];
  } else if (fileType.includes("excel") || fileType.includes("spreadsheet")) {
    return ["pdf", "csv"];
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

async function convertImage(
  buffer: Buffer,
  originalType: string,
  targetFormat: string
): Promise<Buffer> {
  // For now, return original buffer as placeholder
  // In production, install and use Sharp:
  // import sharp from 'sharp';
  // const image = sharp(buffer);
  // return await image.toFormat(targetFormat).toBuffer();

  console.log(`Image conversion: ${originalType} -> ${targetFormat}`);
  return buffer;
}

async function convertToPdf(
  buffer: Buffer,
  originalType: string,
  originalName: string
): Promise<Buffer> {
  // Simple PDF creation for testing
  const pdfContent = `
    PDF Conversion
    -------------
    Original file: ${originalName}
    Original type: ${originalType}
    Converted on: ${new Date().toISOString()}
    
    This is a placeholder PDF content.
    In production, use proper PDF generation libraries.
  `;

  return Buffer.from(pdfContent);
}

async function convertToText(
  buffer: Buffer,
  originalType: string
): Promise<Buffer> {
  // Simple text extraction
  let textContent = `Converted from: ${originalType}\n\n`;

  if (originalType.startsWith("text/")) {
    // If it's already text, return it
    textContent += buffer.toString("utf8");
  } else {
    textContent += "This file has been converted to text format.\n";
    textContent += "In production, use proper text extraction libraries.";
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
