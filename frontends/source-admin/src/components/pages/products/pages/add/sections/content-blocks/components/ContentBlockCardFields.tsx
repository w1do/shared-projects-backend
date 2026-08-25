"use client";

import * as React from "react";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { ContentBlockEditor } from "./ContentBlockEditor";

interface ContentBlockCardFieldsProps {
  index: number;
  title: string;
  displayType: string;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDisplayTypeChange: (newType: string) => void;
  displayTypeOptions: readonly { value: string; label: string }[];
}

export function ContentBlockCardFields({
  index,
  title,
  displayType,
  handleTitleChange,
  handleDisplayTypeChange,
  displayTypeOptions,
}: ContentBlockCardFieldsProps) {
  return (
    <div className="p-4 flex flex-col gap-4 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          value={title}
          onChange={handleTitleChange}
          label="Block Title"
          placeholder="e.g. Key Ingredients, How to Use, FAQ"
        />

        <Select
          label="Display Type"
          labelClassName="text-caption font-medium text-foreground/70"
          options={displayTypeOptions as unknown as { value: string; label: string }[]}
          value={displayType}
          onChange={(e) => handleDisplayTypeChange(e.target.value)}
        />
      </div>

      <div className="border-t border-border/20 pt-4">
        <ContentBlockEditor index={index} displayType={displayType} />
      </div>
    </div>
  );
}
