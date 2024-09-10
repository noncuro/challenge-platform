import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { TemplateModal } from './TemplateModal';

interface Template {
    id: string;
    name: string;
    content: string;
}

export function TemplateManager() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            } else {
                console.error('Failed to fetch templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTemplate(null);
        fetchTemplates();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Templates</CardTitle>
            </CardHeader>
            <CardContent>
                <TemplateModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    template={currentTemplate}
                />
            </CardContent>
        </Card>
    );
}