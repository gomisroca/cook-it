interface Ingredients {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface Step {
  id: string;
  order: number;
  instruction: string;
  duration?: number;
  imageUrl?: string;
}

interface RecipeTag {
  id: string;
  name: string;
}

interface Author {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface Recipe {
  id: string;
  title: string;
  coverImageUrl?: string;
  slug: string;
  description?: string;
  ingredients: Ingredients[];
  steps: Step[];
  tags: RecipeTag[];
  isPublic: boolean;
  author: Author;
  createdAt: Date;
  likesCount: number;
  favoritesCount: number;
  commentsCount: number;
}

interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  total: number;
}
