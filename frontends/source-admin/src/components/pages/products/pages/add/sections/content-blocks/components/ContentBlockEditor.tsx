"use client";

import * as React from "react";
import { TextEditor } from "./content-block-editors/TextEditor";
import { RichTextEditor } from "./content-block-editors/RichTextEditor";
import { ListEditor } from "./content-block-editors/ListEditor";
import { TableEditor } from "./content-block-editors/TableEditor";
import { FaqEditor } from "./content-block-editors/FaqEditor";
import { CardsEditor } from "./content-block-editors/CardsEditor";
import { KeyValueEditor } from "./content-block-editors/KeyValueEditor";

interface ContentBlockEditorProps {
  index: number;
  displayType: string;
}

export function ContentBlockEditor({ index, displayType }: ContentBlockEditorProps) {
  switch (displayType) {
    case "text":
      return <TextEditor index={index} />;
    case "rich_text":
      return <RichTextEditor index={index} />;
    case "list":
      return <ListEditor index={index} />;
    case "table":
      return <TableEditor index={index} />;
    case "faq_accordion":
      return <FaqEditor index={index} />;
    case "cards":
      return <CardsEditor index={index} />;
    case "key_value":
      return <KeyValueEditor index={index} />;
    default:
      return <TextEditor index={index} />;
  }
}
