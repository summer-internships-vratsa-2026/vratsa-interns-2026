"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ImageIcon,
  Italic,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState, type ReactNode } from "react";

import { uploadTaskDescriptionImageAction } from "@/actions/task-description-images";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TaskDescriptionEditorProps = {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
};

export function TaskDescriptionEditor({
  name = "description",
  defaultValue = "",
  placeholder,
  required = false,
}: TaskDescriptionEditorProps) {
  const t = useTranslations("Tasks.editor");
  const [html, setHtml] = useState(defaultValue);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        underline: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
      }),
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? t("placeholder"),
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] px-3 py-2 text-sm outline-none [&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      setHtml(currentEditor.getHTML());
    },
  });

  const insertImage = useCallback(() => {
    if (!editor || isUploadingImage) {
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/gif,image/webp";

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) {
        return;
      }

      setImageError(null);
      setIsUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadTaskDescriptionImageAction(formData);

        if (result.url) {
          editor.chain().focus().setImage({ src: result.url }).run();
          return;
        }

        setImageError(result.error ?? "upload_failed");
      } finally {
        setIsUploadingImage(false);
      }
    };

    input.click();
  }, [editor, isUploadingImage]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
        <div className="flex flex-wrap gap-1 border-b border-input bg-brand-dark/30 p-1 /50">
          <ToolbarButton
            type="button"
            title={t("bold")}
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            title={t("italic")}
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            title={t("underline")}
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            title={t("insertImage")}
            active={false}
            disabled={isUploadingImage}
            onClick={insertImage}
          >
            <ImageIcon />
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>

      <input type="hidden" name={name} value={html} required={required} />

      {isUploadingImage ? (
        <p className="text-xs text-muted-foreground">{t("uploadingImage")}</p>
      ) : null}
      {imageError ? (
        <p className="text-xs text-red-600">{t(`errors.${imageError}`)}</p>
      ) : null}
    </div>
  );
}

type ToolbarButtonProps = {
  active: boolean;
  children: ReactNode;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  type: "button";
};

function ToolbarButton({
  active,
  children,
  disabled,
  title,
  onClick,
  type,
}: ToolbarButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="icon-sm"
      title={title}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
      onClick={onClick}
      className={cn(active && "bg-brand-medium/50")}
    >
      {children}
    </Button>
  );
}
