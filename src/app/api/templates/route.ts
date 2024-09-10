import { NextResponse } from "next/server";
import { prisma } from "../prisma";

// Define the Template interface
interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET() {
  try {
    const templates: Template[] = await prisma.template.findMany();
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const json: Omit<Template, "id" | "createdAt" | "updatedAt"> =
      await request.json();
    const template: Template = await prisma.template.create({
      data: json,
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  }
}
