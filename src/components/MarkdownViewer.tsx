import React from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import 'react-markdown-editor-lite/lib/index.css';

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
  ssr: false
});

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <MdEditor
      value={content}
      renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
      view={{ menu: false, md: false, html: true }}
      canView={{ menu: false, md: false, html: true, fullScreen: false, hideMenu: false, both: false }}
      config={{
        view: {
          menu: false,
          md: false,
          html: true,
        },
        canView: {
          menu: false,
          md: false,
          html: true,
          fullScreen: false,
          hideMenu: false,
          both: false,
        },
      }}
      readOnly={true}
      style={{ border: 'none', boxShadow: 'none' }}
    />
  );
};