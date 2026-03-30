import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 400,
  placeholder = 'Commencez à rédiger votre document...',
}) => {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        .ql-container {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          min-height: ${height}px;
        }
        
        .ql-editor {
          min-height: ${height}px;
          line-height: 1.6;
          text-align: justify;
        }
        
        .ql-editor p { margin-bottom: 8pt; }
        .ql-editor h1 { font-size: 18pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; }
        .ql-editor h2 { font-size: 16pt; font-weight: bold; margin-top: 10pt; margin-bottom: 6pt; }
        .ql-editor h3 { font-size: 14pt; font-weight: bold; margin-top: 8pt; margin-bottom: 4pt; }
        
        .ql-snow .ql-picker.ql-font { width: 120px; }
        .ql-snow .ql-picker.ql-size { width: 80px; }
        
        .ql-editor ul, .ql-editor ol { margin-left: 40px; }
        
        .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: white;
        }
        
        .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          background: white;
        }
      `}} />
      
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;