import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { DatePicker } from "@/components/ui/inputs/date-picker";
import { Select } from "@/components/ui/inputs/select";
import type { PromotionFormValues } from "@/lib/admin/schemas/content/promotion-form-schema";
import { formStatusOptions, formTypeOptions } from "./utils";

interface FilterOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: "type" | "status";
  control: Control<PromotionFormValues>;
  options: FilterOption[];
  error?: string;
  ariaLabel: string;
}

function SelectField({ label, name, control, options, error, ariaLabel }: SelectFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          label={label}
          labelClassName="font-semibold text-muted-foreground uppercase tracking-wider"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          options={options}
          error={error}
          aria-label={ariaLabel}
          className="w-full"
        />
      )}
    />
  );
}

interface PromotionFormFieldsProps {
  register: UseFormRegister<PromotionFormValues>;
  control: Control<PromotionFormValues>;
  errors: FieldErrors<PromotionFormValues>;
}

export function PromotionFormFields({ register, control, errors }: PromotionFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Code" mono uppercase error={errors.code?.message} {...register("code")} />
        <SelectField
          label="Type"
          name="type"
          control={control}
          options={formTypeOptions}
          error={errors.type?.message}
          ariaLabel="Promotion type"
        />
      </div>

      <Input label="Title" error={errors.title?.message} {...register("title")} />

      <Textarea
        label="Description"
        rows={2}
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Reward value"
          type="number"
          error={errors.rewardValue?.message}
          {...register("rewardValue")}
        />
        <Input
          label="Min spend ($)"
          type="number"
          error={errors.minSpend?.message}
          {...register("minSpend")}
        />
        <Input
          label="Redemption cap"
          type="number"
          error={errors.limit?.message}
          {...register("limit")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Channel" error={errors.channel?.message} {...register("channel")} />
        <SelectField
          label="Status"
          name="status"
          control={control}
          options={formStatusOptions}
          error={errors.status?.message}
          ariaLabel="Promotion status"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startsAt"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Starts at"
              value={field.value}
              onChange={field.onChange}
              error={errors.startsAt?.message}
              ariaLabel="Start date"
            />
          )}
        />
        <Controller
          name="endsAt"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Ends at"
              value={field.value}
              onChange={field.onChange}
              error={errors.endsAt?.message}
              ariaLabel="End date"
            />
          )}
        />
      </div>
    </>
  );
}
