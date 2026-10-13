import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCategories } from "@/hooks/useCategories";

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) =>  void;
  error?: string;
}

const CategorySelect = ({ value, onChange, error }: CategorySelectProps) => {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-xs text-muted-foreground">
        <LoadingSpinner label="Loading categories" size={14} />
        Loading categories...
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={(value) => {
      if (value !== null){
        onChange(value);
      }
    }}>
      <SelectTrigger className={error ? "border-destructive" : ""}>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent>
        { categories.length === 0 ? (
          <div className="p-2 text-center text-xs text-muted-foreground">
            No categories found. Please add one first.
          </div>
        ) : (
          categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>

  )
}

export default CategorySelect
