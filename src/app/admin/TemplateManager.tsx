'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Template {
  id: string;
  name: string;
  content: string;
}

const fetchTemplates = async (): Promise<Template[]> => {
  const response = await fetch('/api/templates');
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return response.json();
};

const deleteTemplate = async (id: string): Promise<void> => {
  const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete template');
  }
};

export function TemplateManager() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching templates</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <Link href="/admin/create-template">
          <Button>Add New Template</Button>
        </Link>
        {templates?.map(template => (
          <Card key={template.id} className="mt-4">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded">
                <ReactMarkdown>{template.content}</ReactMarkdown>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href={`/admin/edit-template?id=${template.id}`}>
                  <Button className="mr-2">Edit</Button>
                </Link>
                <Button 
                  onClick={() => deleteMutation.mutate(template.id)}
                  disabled={deleteMutation.isLoading}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}