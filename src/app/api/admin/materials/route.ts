import { NextRequest, NextResponse } from "next/server";

interface Material {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

// Mock data - replace with actual database operations
const materials: Material[] = [];
let nextId = 1;

export async function GET() {
  try {
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create new material entry
    const newMaterial: Material = {
      id: nextId++,
      title,
      description,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
    };

    materials.push(newMaterial);

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    console.error("Error uploading material:", error);
    return NextResponse.json(
      { error: "Failed to upload material" },
      { status: 500 },
    );
  }
}
