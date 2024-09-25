import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@/components/ui';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkdownViewer } from '@/components/MarkdownViewer';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface Template {
  id: string;
  name: string;
  content: string;
}

const fetchTemplates = async (): Promise<Template[]> => {
  const response = await fetch('/api/admin/templates');
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  return await response.json();
};

const updateTemplate = async (template: Template): Promise<Template> => {
  const response = await fetch('/api/admin/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  if (!response.ok) {
    throw new Error('Failed to update template');
  }
  return response.json();
};

const createTemplate = async (newTemplate: Template): Promise<Template> => {
  const response = await fetch('/api/admin/templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTemplate),
  });
  if (!response.ok) {
    throw new Error('Failed to create template');
  }
  return response.json();
};

export function TemplateManager() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const { data: templates = [], isLoading, error } = useTemplates()
  
  const updateTemplateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsEditing(false);
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setIsAddModalOpen(false);
      setNewTemplateName('');
      setNewTemplateContent('');
    },
  });

  const handleSave = () => {
    if (!selectedTemplate) return;
    updateTemplateMutation.mutate(selectedTemplate);
  };

  const handleEditorChange = ({ text }: { text: string }) => {
    if (selectedTemplate) {
      setSelectedTemplate({ ...selectedTemplate, content: text });
    }
  };

  const handleAddTemplate = () => {
    const newTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      content: newTemplateContent,
    };
    createTemplateMutation.mutate(newTemplate);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 space-y-4">
              {templates.map(template => (
                <Button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsEditing(false);
                  }}
                  variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                  className="w-full justify-start text-left"
                >
                  {template.name}
                </Button>
              ))}
              <Button onClick={() => setIsAddModalOpen(true)} className="w-full">
                Add New Template
              </Button>
            </div>
            <div className="col-span-2">
              {selectedTemplate && (
                <>
                  <h2 className="text-xl font-bold mb-4">{selectedTemplate.name}</h2>
                  {isEditing ? (
                    <MdEditor
                      value={selectedTemplate.content}
                      onChange={handleEditorChange}
                      style={{ height: '400px' }}
                      renderHTML={(text) => <MarkdownViewer content={text} />}
                    />
                  ) : (
                    <MarkdownViewer content={selectedTemplate.content} />
                  )}
                  <div className="mt-4 space-x-2">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave}>Save</Button>
                        <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>Edit</Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <Card className="w-1/2">
            <CardHeader>
              <CardTitle>Add New Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Template Name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="mb-4"
              />
              <MdEditor
                value={newTemplateContent}
                onChange={({ text }) => setNewTemplateContent(text)}
                style={{ height: '300px' }}
                renderHTML={text => <MarkdownViewer content={text} />}
              />
              <div className="mt-4 space-x-2">
                <Button onClick={handleAddTemplate}>Add Template</Button>
                <Button onClick={() => setIsAddModalOpen(false)} variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default TemplateManager;