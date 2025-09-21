import { NextRequest, NextResponse } from "next/server";

interface Material {
  id: number;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
}

// Mock data - should be shared with the main route or from database
// In a real application, this would be handled by a database
const materials: Material[] = [];

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid material ID" },
        { status: 400 },
      );
    }

    const materialIndex = materials.findIndex((material) => material.id === id);

    if (materialIndex === -1) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 },
      );
    }

    materials.splice(materialIndex, 1);

    return NextResponse.json(
      { message: "Material deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 },
    );
  }
}
