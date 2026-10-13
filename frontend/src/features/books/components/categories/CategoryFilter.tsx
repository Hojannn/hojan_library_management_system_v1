import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCategories } from "@/hooks/useCategories";

interface CategoryFilterProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

const CategoryFilter = ({ selectedCategoryId, onSelectCategory }: CategoryFilterProps) => {
  const { data: categories = [], isLoading } = useCategories();
  

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <LoadingSpinner label="Loading categories" size={14} /> Loading categories...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <Button
        variant={selectedCategoryId === null ? "default" : "outline"}
        size="sm"
        className="h-7 text-xs rounded-full px-3"
        onClick={() => onSelectCategory(null)}
      >
        All Books
      </Button>

      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selectedCategoryId === cat.id ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs rounded-full px-3"
          onClick={() => onSelectCategory(cat.id)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}

export default CategoryFilter
