import { useQuery } from "@tanstack/react-query";

interface Template {
  id: string;
  name: string;
  content: string;
}

export const useTemplates = () => {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async (): Promise<Template[]> => {
      const response = await fetch("/api/admin/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      return await response.json();
    },
  });
};

export const useTemplate = ({ templateId }: { templateId: string }) => {
  return useQuery({
    enabled: !!templateId,
    queryKey: ["template", templateId],
    queryFn: async (): Promise<Template> => {
      const response = await fetch(`/api/admin/templates/${templateId}`);
      if (!response.ok) throw new Error("Failed to fetch template");
      return response.json();
    },
  });
};
