import React, { useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension, textInputRule } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  RemoveFormatting,
  Upload,
  Palette,
  Type,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Smart rule to keep number ranges like 45-55 from splitting across lines by using non-breaking hyphen (U+2011)
const NonBreakingHyphen = Extension.create({
  name: 'nonBreakingHyphen',
  addInputRules() {
    return [
      textInputRule({
        find: /(\d+)-(\d+)$/,
        replace: '$1\u2011$2',
      }),
      textInputRule({
        find: /(\d+)\s*-\s*(\d+)$/,
        replace: '$1\u2011$2',
      }),
    ];
  },
});

// Custom FontSize Extension to change size of selected text only
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
        },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write content here...',
  height = '500px',
}: RichTextEditorProps) {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
      }),
      TextStyle,
      Color,
      FontSize,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#4a7454] underline',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-3',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type something here...',
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 border border-gray-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-100 p-2 font-bold text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      NonBreakingHyphen,
    ],
    content: value ? value.replace(/&nbsp;|\u00a0/g, ' ') : '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html.replace(/&nbsp;|\u00a0/g, ' '));
    },
    editorProps: {
      attributes: {
        class: 'rich-content prose max-w-none p-4 min-h-full focus:outline-none text-gray-800 leading-relaxed font-sans',
      },
    },
  });

  // Keep editor content in sync when value changes externally (e.g. edit mode modal loaded)
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    const normalizedValue = value ? value.replace(/&nbsp;|\u00a0/g, ' ') : '';
    if (normalizedValue !== currentHTML && (normalizedValue !== '' || currentHTML !== '<p></p>')) {
      editor.commands.setContent(normalizedValue);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    } catch (error) {
      console.error('Image upload failed', error);
      alert('Failed to upload image.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const insertImageByUrl = () => {
    if (!editor) return;
    const url = window.prompt('Enter Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  if (!editor) {
    return (
      <div
        className="bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400"
        style={{ height }}
      >
        Loading Editor...
      </div>
    );
  }

  const btnClass = (isActive: boolean = false, isDisabled: boolean = false) =>
    `p-1.5 rounded-md transition text-xs flex items-center justify-center ${
      isDisabled
        ? 'text-gray-300 cursor-not-allowed'
        : isActive
        ? 'bg-green-100 text-green-800 font-bold border border-green-300'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const divider = <div className="w-[1px] h-5 bg-gray-200 mx-1 self-center" />;

  const currentFontSize = editor.getAttributes('textStyle').fontSize || 'default';
  const currentColor = editor.getAttributes('textStyle').color || '#333333';

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-500/10 transition"
      style={{ height }}
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="color"
        ref={colorInputRef}
        value={currentColor}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="hidden"
      />

      {/* Editor Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 select-none">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={btnClass(false, !editor.can().undo())}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={btnClass(false, !editor.can().redo())}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>

        {divider}

        {/* Headings (Block Level) */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btnClass(editor.isActive('paragraph'))}
          title="Normal Paragraph"
        >
          <Pilcrow className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        {divider}

        {/* Inline Font Size Selector (Selected Text Only) */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-1.5 py-0.5" title="Font Size (Selected text only)">
          <Type className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={currentFontSize}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'default') {
                editor.chain().focus().unsetFontSize().run();
              } else {
                editor.chain().focus().setFontSize(val).run();
              }
            }}
            className="text-xs bg-transparent text-gray-700 outline-none cursor-pointer py-0.5"
          >
            <option value="default">Size: Auto</option>
            <option value="12px">12px (Small)</option>
            <option value="14px">14px (Compact)</option>
            <option value="16px">16px (Normal)</option>
            <option value="18px">18px (Medium)</option>
            <option value="20px">20px (Large)</option>
            <option value="24px">24px (XL)</option>
            <option value="28px">28px (2XL)</option>
            <option value="32px">32px (3XL)</option>
          </select>
        </div>

        {/* Inline Color Picker (Selected Text Only) */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-1.5 py-1" title="Text Color (Selected text only)">
          <Palette className="w-3.5 h-3.5 text-gray-500" />
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="w-4 h-4 rounded border border-gray-300 cursor-pointer shadow-inner"
            style={{ backgroundColor: currentColor }}
            title="Custom Color"
          />
          {/* Quick Color Presets */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#111827').run()}
            className="w-3 h-3 rounded-full bg-gray-900"
            title="Black"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#4a7454').run()}
            className="w-3 h-3 rounded-full bg-[#4a7454]"
            title="Brand Green"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#d97706').run()}
            className="w-3 h-3 rounded-full bg-amber-600"
            title="Gold / Yellow"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#dc2626').run()}
            className="w-3 h-3 rounded-full bg-red-600"
            title="Red"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#2563eb').run()}
            className="w-3 h-3 rounded-full bg-blue-600"
            title="Blue"
          />
        </div>

        {divider}

        {/* Inline Text Formats (Selected Text Only) */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title="Bold (Ctrl+B) - Selected text only"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title="Italic (Ctrl+I) - Selected text only"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
          title="Underline (Ctrl+U) - Selected text only"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive('strike'))}
          title="Strikethrough - Selected text only"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        {divider}

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btnClass(editor.isActive({ textAlign: 'left' }))}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btnClass(editor.isActive({ textAlign: 'center' }))}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btnClass(editor.isActive({ textAlign: 'right' }))}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={btnClass(editor.isActive({ textAlign: 'justify' }))}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        {divider}

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive('blockquote'))}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnClass(false)}
          title="Horizontal Divider"
        >
          <Minus className="w-4 h-4" />
        </button>

        {divider}

        {/* Links */}
        <button
          type="button"
          onClick={setLink}
          className={btnClass(editor.isActive('link'))}
          title="Add / Edit Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor.isActive('link') && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className={btnClass(false)}
            title="Remove Link"
          >
            <Unlink className="w-4 h-4" />
          </button>
        )}

        {/* Image Upload & URL */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={btnClass(false)}
          title="Upload Image"
        >
          <Upload className="w-4 h-4 mr-1 inline" />
          <span className="text-[11px] font-medium">Image</span>
        </button>
        <button
          type="button"
          onClick={insertImageByUrl}
          className={btnClass(false)}
          title="Insert Image by URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Table */}
        <button
          type="button"
          onClick={insertTable}
          className={btnClass(editor.isActive('table'))}
          title="Insert Table (3x3)"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        {divider}

        {/* Clear Format */}
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={btnClass(false)}
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>
      </div>

      {/* Table Action Sub-bar (shows only when cursor is inside a table) */}
      {editor.isActive('table') && (
        <div className="bg-green-50 border-b border-green-200 px-3 py-1.5 flex flex-wrap items-center gap-2 text-xs text-green-900 animate-fadeIn">
          <span className="font-semibold flex items-center gap-1">
            <TableIcon className="w-3.5 h-3.5" /> Table Controls:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-0.5 bg-white rounded border border-green-300 hover:bg-green-100 font-medium"
          >
            + Add Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-0.5 bg-white rounded border border-red-200 text-red-700 hover:bg-red-50"
          >
            - Del Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-0.5 bg-white rounded border border-green-300 hover:bg-green-100 font-medium"
          >
            + Add Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-0.5 bg-white rounded border border-red-200 text-red-700 hover:bg-red-50"
          >
            - Del Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 ml-auto font-medium"
          >
            Delete Table
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto bg-white cursor-text p-1">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
