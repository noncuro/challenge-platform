import { NextResponse } from "next/server";

// Remove the prisma import
// import { prisma } from "../prisma";

interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// In-memory storage for templates
const templates: Template[] = [];

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const template = templates.find((t) => t.id === params.id);

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const json: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">> =
      await request.json();
    const index = templates.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    templates[index] = {
      ...templates[index],
      ...json,
      updatedAt: new Date(),
    };

    return NextResponse.json(templates[index]);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const index = templates.findIndex((t) => t.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    templates.splice(index, 1);
    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 },
    );
  }
}
