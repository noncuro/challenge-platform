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
