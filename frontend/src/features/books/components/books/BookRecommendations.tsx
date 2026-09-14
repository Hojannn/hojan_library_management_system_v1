import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useGetBookRecommendations } from "@/hooks/useBooks";
import BookCard from "./BookCard";

interface BookRecommendationsProps {
  bookId: string;
}

const BookRecommendations = ({ bookId }: BookRecommendationsProps) => {
  
  const { data: recommendations, isLoading } = useGetBookRecommendations(bookId);


  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="border-border/50 shadow-none">
        <CardContent className="p-6 text-center text-xs text-muted-foreground">
          No recommendations available for this title right now.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {recommendations.map((book) => (
        <BookCard book={book} />
      ))}
    </div>
  );
};

export default BookRecommendations;