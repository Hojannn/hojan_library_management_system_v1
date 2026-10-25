import { Select } from "@base-ui/react/select";

export default function BorrowSelect({ label, value, options, onChange }: {
  label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void;
}) {
  return <Select.Root value={value} onValueChange={next => { if (next !== null) onChange(next); }}>
    <Select.Trigger aria-label={label} className="borrows-select"><span>{options.find(option => option.value === value)?.label}</span><Select.Icon aria-hidden="true">⌄</Select.Icon></Select.Trigger>
    <Select.Portal><Select.Positioner sideOffset={8} alignItemWithTrigger={false} className="borrows-select-positioner">
      <Select.Popup className="borrows-select-popup"><Select.List>
        {options.map(option => <Select.Item key={option.value} value={option.value} className="borrows-select-option"><Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator>✓</Select.ItemIndicator></Select.Item>)}
      </Select.List></Select.Popup>
    </Select.Positioner></Select.Portal>
  </Select.Root>;
}
