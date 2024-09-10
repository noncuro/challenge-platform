import Admin from '../admin';
import { TemplateManager } from './TemplateManager';

export default function TemplatesPage() {
    return (
        <Admin isTemplatesPage={true}>
            <TemplateManager />
        </Admin>
    );
}