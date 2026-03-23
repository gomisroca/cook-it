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

interface User {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl?: string;
}

interface Recipe {
  id: string;
  title: string;
  coverImageUrl?: string;
  slug: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  cuisine?: string;
  mealType?: string;
  servings?: number;
  description?: string;
  prepTime?: number;
  cookingTime?: number;
  ingredients: Ingredients[];
  steps: Step[];
  tags: RecipeTag[];
  isPublic: boolean;
  author: User;
  createdAt: Date;
  likesCount: number;
  favoritesCount: number;
  commentsCount: number;
}

interface RecipeComment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  total: number;
}

interface CollectionData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  recipeCount: number;
  author: { username: string };
  coverImageUrl?: string;
  likesCount: number;
  isLiked: boolean;
}

interface SingleCollectionData extends CollectionData {
  author: User;
  recipes: Recipe[];
}
