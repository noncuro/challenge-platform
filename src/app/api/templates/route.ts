import { NextResponse } from "next/server";
import { createRedisClient } from "../utils";

interface Template {
  id: string;
  name: string;
  content: string;
}

export async function GET() {
  const redisClient = createRedisClient();

  try {
    const templatesString = await redisClient.get("templates");
    const templates: Template[] = templatesString
      ? JSON.parse(templatesString)
      : [];

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}

export async function POST(request: Request) {
  const redisClient = createRedisClient();

  try {
    const newTemplate: Omit<Template, "id"> = await request.json();
    const templatesString = await redisClient.get("templates");
    const templates: Template[] = templatesString
      ? JSON.parse(templatesString)
      : [];

    const newTemplateWithId: Template = {
      ...newTemplate,
      id: Date.now().toString(),
    };

    templates.push(newTemplateWithId);

    await redisClient.set("templates", JSON.stringify(templates));

    return NextResponse.json(newTemplateWithId);
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 },
    );
  } finally {
    await redisClient.quit();
  }
}

export async function PUT(request: Request) {
  const redis = createRedisClient();
  try {
    const { id, name, content } = await request.json();
    if (!id || !name || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const templatesString = await redis.get("templates");
    const templates: Template[] = templatesString
      ? JSON.parse(templatesString)
      : [];

    const templateIndex = templates.findIndex((template) => template.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 },
      );
    }

    templates[templateIndex] = { id, name, content };

    await redis.set("templates", JSON.stringify(templates));

    return NextResponse.json(templates[templateIndex], { status: 200 });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await redis.quit();
  }
}
