"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/inputs/icon-button";
import "./rich-text-editor.css";

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  labelRight?: React.ReactNode;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <IconButton
      type="button"
      variant="ghost"
      colors="surface"
      size="sm"
      shape="rounded"
      title={title}
      onClick={onClick}
      isActive={active}
      className={cn(
        "h-8 w-8",
        active
          ? "bg-primary/10 text-foreground hover:bg-primary/10"
          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
      )}
    >
      {children}
    </IconButton>
  );
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  error,
  label,
  labelRight,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-info underline" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[160px] px-4 py-1 focus:outline-none",
      },
    },
  });

  const addLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn("space-y-2 w-full", className)}>
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-xs font-medium text-muted-foreground block">{label}</label>
          )}
          {labelRight && labelRight}
        </div>
      )}

      <div
        className={cn(
          "w-full border-2 border-border/70 bg-background/80 rounded-(--radius-2xl) shadow-inner transition-all duration-300 ease-out hover:border-muted-foreground-lighter hover:bg-background focus-within:border-primary focus-within:bg-background focus-within:ring-4 focus-within:ring-ring/5",
          error && "border-destructive",
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-1 py-2 border-b border-border/50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic"
          >
            <Italic size={16} />
          </ToolbarButton>

          <div className="w-(--nudge-hairline) h-4 bg-muted/70 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>

          <div className="w-(--nudge-hairline) h-4 bg-muted/70 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet List"
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </ToolbarButton>

          <div className="w-(--nudge-hairline) h-4 bg-muted/70 mx-1" />

          <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Link">
            <LinkIcon size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Blockquote"
          >
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code Block"
          >
            <Code size={16} />
          </ToolbarButton>

          <div className="w-(--nudge-hairline) h-4 bg-muted/70 mx-1" />

          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo size={16} />
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>

      {error && <p className="ui-form-help-text font-medium text-destructive">{error}</p>}
    </div>
  );
}
