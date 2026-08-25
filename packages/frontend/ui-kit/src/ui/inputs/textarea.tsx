import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  labelClassName?: string;
  labelRight?: React.ReactNode;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, labelClassName, labelRight, error, ...props }, ref) => {
    const textareaStyle = cn(
      "flex min-h-[100px] w-full border-2 border-input/70 bg-card/80 text-foreground placeholder:text-muted-foreground-lighter rounded-(--radius-2xl) px-4 py-1 text-caption shadow-inner transition-all duration-300 ease-out hover:border-border-hover hover:bg-card hover:shadow-inner focus:border-foreground focus:bg-card focus:ring-4 focus:ring-ring/5 focus:outline-none disabled:cursor-not-allowed disabled:border-input/20 disabled:bg-input-disabled disabled:text-muted-foreground-lighter/60",
      !label && !error && className,
    );

    const renderTextarea = <textarea className={textareaStyle} ref={ref} {...props} />;

    if (!label && !error) {
      return renderTextarea;
    }

    return (
      <div className={cn("space-y-2 w-full", className)}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              className={cn("text-xs font-medium text-muted-foreground block", labelClassName)}
            >
              {label}
            </label>
          )}
          {labelRight && labelRight}
        </div>
        {renderTextarea}
        {error && <p className="ui-form-help-text font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
