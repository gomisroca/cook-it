import {
  Cuisine,
  Difficulty,
  MealType,
  PrismaClient,
} from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import slugify from 'slugify';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // --- TAGS ---
  const tagNames = [
    'italian',
    'vegetarian',
    'quick',
    'comfort food',
    'asian',
    'healthy',
    'dessert',
    'breakfast',
    'vegan',
    'gluten-free',
  ];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  const tagMap = Object.fromEntries(tags.map((t) => [t.name, t.id]));

  // --- USERS ---
  const password = await bcrypt.hash('password123', 10);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      password,
      bio: 'Home cook and pasta enthusiast. I love experimenting with Italian recipes.',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      password,
      bio: 'Weekend chef. Big fan of Asian cuisine and quick weeknight meals.',
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: {
      email: 'carol@example.com',
      username: 'carol',
      password,
      bio: 'Vegan baker and healthy eating advocate.',
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: 'dave@example.com' },
    update: {},
    create: {
      email: 'dave@example.com',
      username: 'dave',
      password,
      bio: 'Just here to eat well.',
    },
  });

  console.log('Users created');

  // --- FOLLOWS ---
  const follows = [
    { followerId: bob.id, followingId: alice.id },
    { followerId: carol.id, followingId: alice.id },
    { followerId: dave.id, followingId: alice.id },
    { followerId: alice.id, followingId: bob.id },
    { followerId: carol.id, followingId: bob.id },
    { followerId: dave.id, followingId: carol.id },
  ];

  for (const follow of follows) {
    await prisma.follow.upsert({
      where: {
        followerId_followingId: follow,
      },
      update: {},
      create: follow,
    });
  }

  console.log('Follows created');

  // --- RECIPES ---
  function createSlug(title: string) {
    return slugify(title, { lower: true, strict: true, trim: true });
  }

  // Recipe 1 — Alice, public, Italian
  const carbonara = await prisma.recipe.upsert({
    where: { slug: createSlug('Spaghetti Carbonara') },
    update: {},
    create: {
      title: 'Spaghetti Carbonara',
      slug: createSlug('Spaghetti Carbonara'),
      description:
        'A classic Roman pasta dish made with eggs, cheese, pancetta, and pepper. Creamy without any cream.',
      prepTime: 10,
      cookingTime: 20,
      difficulty: Difficulty.MEDIUM,
      cuisine: Cuisine.ITALIAN,
      mealType: MealType.DINNER,
      servings: 4,
      isPublic: true,
      authorId: alice.id,
      ingredients: {
        create: [
          { name: 'spaghetti', quantity: 400, unit: 'g' },
          { name: 'pancetta', quantity: 200, unit: 'g' },
          { name: 'egg yolks', quantity: 4, unit: '' },
          { name: 'pecorino romano', quantity: 100, unit: 'g' },
          { name: 'black pepper', quantity: 2, unit: 'tsp' },
          { name: 'salt', quantity: 1, unit: 'tbsp' },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            instruction:
              'Bring a large pot of salted water to boil and cook spaghetti until al dente.',
            duration: 10,
          },
          {
            order: 2,
            instruction:
              'Fry pancetta in a pan over medium heat until crispy. Remove from heat.',
            duration: 5,
          },
          {
            order: 3,
            instruction:
              'Whisk egg yolks with grated pecorino and a generous amount of black pepper.',
            duration: 3,
          },
          {
            order: 4,
            instruction:
              'Reserve 1 cup of pasta water. Drain pasta and add to the pancetta pan off the heat.',
            duration: 2,
          },
          {
            order: 5,
            instruction:
              'Add egg mixture and toss quickly, adding pasta water little by little until creamy.',
            duration: 3,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap['italian'] },
          { tagId: tagMap['comfort food'] },
        ],
      },
    },
  });

  // Recipe 2 — Alice, public, Asian
  const friedRice = await prisma.recipe.upsert({
    where: { slug: createSlug('Egg Fried Rice') },
    update: {},
    create: {
      title: 'Egg Fried Rice',
      slug: createSlug('Egg Fried Rice'),
      description:
        'A quick and satisfying fried rice dish that comes together in minutes. Perfect for using up leftover rice.',
      prepTime: 5,
      cookingTime: 10,
      difficulty: Difficulty.EASY,
      cuisine: Cuisine.ASIAN,
      mealType: MealType.DINNER,
      servings: 2,
      isPublic: true,
      authorId: alice.id,
      ingredients: {
        create: [
          { name: 'cooked rice', quantity: 2, unit: 'cups' },
          { name: 'eggs', quantity: 3, unit: '' },
          { name: 'soy sauce', quantity: 2, unit: 'tbsp' },
          { name: 'sesame oil', quantity: 1, unit: 'tbsp' },
          { name: 'spring onions', quantity: 3, unit: '' },
          { name: 'garlic', quantity: 2, unit: 'cloves' },
          { name: 'vegetable oil', quantity: 2, unit: 'tbsp' },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            instruction:
              'Heat oil in a wok or large pan over high heat until smoking.',
            duration: 2,
          },
          {
            order: 2,
            instruction:
              'Add garlic and stir fry for 30 seconds until fragrant.',
            duration: 1,
          },
          {
            order: 3,
            instruction:
              'Push garlic to the side, crack in eggs and scramble until just set.',
            duration: 2,
          },
          {
            order: 4,
            instruction:
              'Add cold rice and break up any clumps. Stir fry for 3-4 minutes.',
            duration: 4,
          },
          {
            order: 5,
            instruction:
              'Add soy sauce and sesame oil, toss well. Top with spring onions.',
            duration: 1,
          },
        ],
      },
      tags: {
        create: [{ tagId: tagMap['asian'] }, { tagId: tagMap['quick'] }],
      },
    },
  });

  // Recipe 3 — Bob, public, healthy
  const smoothieBowl = await prisma.recipe.upsert({
    where: { slug: createSlug('Acai Smoothie Bowl') },
    update: {},
    create: {
      title: 'Acai Smoothie Bowl',
      slug: createSlug('Acai Smoothie Bowl'),
      description:
        'A thick, vibrant acai bowl topped with fresh fruit and granola. A healthy and beautiful breakfast.',
      prepTime: 10,
      cookingTime: 0,
      difficulty: Difficulty.EASY,
      cuisine: Cuisine.OTHER,
      mealType: MealType.BREAKFAST,
      servings: 1,
      isPublic: true,
      authorId: bob.id,
      ingredients: {
        create: [
          { name: 'frozen acai', quantity: 100, unit: 'g' },
          { name: 'frozen banana', quantity: 1, unit: '' },
          { name: 'almond milk', quantity: 100, unit: 'ml' },
          { name: 'granola', quantity: 50, unit: 'g' },
          { name: 'fresh berries', quantity: 100, unit: 'g' },
          { name: 'honey', quantity: 1, unit: 'tbsp' },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            instruction:
              'Blend frozen acai, banana and almond milk until thick and smooth.',
            duration: 3,
          },
          {
            order: 2,
            instruction:
              'Pour into a bowl and top with granola, berries and a drizzle of honey.',
            duration: 2,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap['healthy'] },
          { tagId: tagMap['breakfast'] },
          { tagId: tagMap['vegan'] },
        ],
      },
    },
  });

  // Recipe 4 — Bob, public, comfort food
  const grilledCheese = await prisma.recipe.upsert({
    where: { slug: createSlug('Ultimate Grilled Cheese') },
    update: {},
    create: {
      title: 'Ultimate Grilled Cheese',
      slug: createSlug('Ultimate Grilled Cheese'),
      description:
        'The perfect grilled cheese sandwich with a golden crust and gooey melted cheese inside.',
      prepTime: 5,
      cookingTime: 8,
      difficulty: Difficulty.EASY,
      cuisine: Cuisine.AMERICAN,
      mealType: MealType.LUNCH,
      servings: 1,
      isPublic: true,
      authorId: bob.id,
      ingredients: {
        create: [
          { name: 'sourdough bread', quantity: 2, unit: 'slices' },
          { name: 'cheddar cheese', quantity: 80, unit: 'g' },
          { name: 'gruyere cheese', quantity: 40, unit: 'g' },
          { name: 'butter', quantity: 2, unit: 'tbsp' },
          { name: 'dijon mustard', quantity: 1, unit: 'tsp' },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            instruction: 'Butter one side of each bread slice generously.',
            duration: 1,
          },
          {
            order: 2,
            instruction:
              'Spread dijon mustard on the unbuttered sides. Layer both cheeses on one slice.',
            duration: 1,
          },
          {
            order: 3,
            instruction:
              'Cook butter-side down in a pan over medium-low heat for 3-4 minutes until golden.',
            duration: 4,
          },
          {
            order: 4,
            instruction:
              'Flip and cook the other side until golden and cheese is fully melted.',
            duration: 3,
          },
        ],
      },
      tags: {
        create: [{ tagId: tagMap['comfort food'] }, { tagId: tagMap['quick'] }],
      },
    },
  });

  // Recipe 5 — Carol, public, vegan dessert
  const chocolateMousse = await prisma.recipe.upsert({
    where: { slug: createSlug('Vegan Chocolate Mousse') },
    update: {},
    create: {
      title: 'Vegan Chocolate Mousse',
      slug: createSlug('Vegan Chocolate Mousse'),
      description:
        "A rich and indulgent chocolate mousse made entirely from aquafaba. Nobody will believe it's vegan.",
      prepTime: 20,
      cookingTime: 0,
      difficulty: Difficulty.MEDIUM,
      cuisine: Cuisine.FRENCH,
      mealType: MealType.DESSERT,
      servings: 4,
      isPublic: true,
      authorId: carol.id,
      ingredients: {
        create: [
          { name: 'aquafaba', quantity: 150, unit: 'ml' },
          { name: 'dark chocolate', quantity: 200, unit: 'g' },
          { name: 'sugar', quantity: 2, unit: 'tbsp' },
          { name: 'vanilla extract', quantity: 1, unit: 'tsp' },
          { name: 'salt', quantity: 1, unit: 'pinch' },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            instruction:
              'Melt dark chocolate in a bowl over simmering water. Let cool slightly.',
            duration: 5,
          },
          {
            order: 2,
            instruction:
              'Whip aquafaba with sugar and a pinch of salt until stiff peaks form, about 10 minutes.',
            duration: 10,
          },
          {
            order: 3,
            instruction:
              'Fold melted chocolate gently into the aquafaba in three additions.',
            duration: 3,
          },
          {
            order: 4,
            instruction:
              'Divide into glasses and refrigerate for at least 2 hours before serving.',
            duration: 120,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap['vegan'] },
          { tagId: tagMap['dessert'] },
          { tagId: tagMap['gluten-free'] },
        ],
      },
    },
  });

  // Recipe 6 — Carol, PRIVATE
  await prisma.recipe.upsert({
    where: { slug: createSlug('Secret Family Tomato Soup') },
    update: {},
    create: {
      title: 'Secret Family Tomato Soup',
      slug: createSlug('Secret Family Tomato Soup'),
      description:
        "My grandmother's secret tomato soup recipe. Not sharing this one publicly.",
      prepTime: 15,
      cookingTime: 40,
      difficulty: Difficulty.EASY,
      servings: 6,
      isPublic: false,
      authorId: carol.id,
      ingredients: {
        create: [
          { name: 'tomatoes', quantity: 1, unit: 'kg' },
          { name: 'onion', quantity: 1, unit: '' },
          { name: 'garlic', quantity: 4, unit: 'cloves' },
          { name: 'vegetable stock', quantity: 500, unit: 'ml' },
          { name: 'secret spice blend', quantity: 2, unit: 'tbsp' },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            instruction:
              'Roast tomatoes, onion and garlic at 200°C for 30 minutes.',
            duration: 30,
          },
          {
            order: 2,
            instruction:
              'Blend with stock until smooth. Add secret spice blend.',
            duration: 5,
          },
          {
            order: 3,
            instruction: 'Simmer for 10 minutes and adjust seasoning.',
            duration: 10,
          },
        ],
      },
      tags: {
        create: [{ tagId: tagMap['vegan'] }, { tagId: tagMap['comfort food'] }],
      },
    },
  });

  // Recipe 7 — Dave, public
  const pancakes = await prisma.recipe.upsert({
    where: { slug: createSlug('Fluffy American Pancakes') },
    update: {},
    create: {
      title: 'Fluffy American Pancakes',
      slug: createSlug('Fluffy American Pancakes'),
      description:
        'Thick, fluffy pancakes that are crispy on the outside and soft on the inside. Weekend breakfast perfection.',
      prepTime: 10,
      cookingTime: 20,
      difficulty: Difficulty.EASY,
      cuisine: Cuisine.AMERICAN,
      mealType: MealType.BREAKFAST,
      servings: 4,
      isPublic: true,
      authorId: dave.id,
      ingredients: {
        create: [
          { name: 'flour', quantity: 200, unit: 'g' },
          { name: 'baking powder', quantity: 2, unit: 'tsp' },
          { name: 'sugar', quantity: 2, unit: 'tbsp' },
          { name: 'salt', quantity: 0.5, unit: 'tsp' },
          { name: 'milk', quantity: 180, unit: 'ml' },
          { name: 'egg', quantity: 1, unit: '' },
          { name: 'butter', quantity: 30, unit: 'g' },
          { name: 'vanilla extract', quantity: 1, unit: 'tsp' },
        ],
      },
      steps: {
        create: [
          {
            order: 1,
            instruction:
              'Mix dry ingredients in a bowl. Whisk wet ingredients separately.',
            duration: 3,
          },
          {
            order: 2,
            instruction:
              "Combine wet and dry ingredients until just mixed — lumps are fine, don't overmix.",
            duration: 2,
          },
          {
            order: 3,
            instruction:
              'Heat a buttered pan over medium heat. Pour ¼ cup batter per pancake.',
            duration: 2,
          },
          {
            order: 4,
            instruction:
              'Cook until bubbles form on top, then flip and cook 1-2 more minutes.',
            duration: 4,
          },
        ],
      },
      tags: {
        create: [
          { tagId: tagMap['breakfast'] },
          { tagId: tagMap['comfort food'] },
          { tagId: tagMap['quick'] },
        ],
      },
    },
  });

  console.log('Recipes created');

  // --- LIKES ---
  const likePairs = [
    { userId: bob.id, recipeId: carbonara.id },
    { userId: carol.id, recipeId: carbonara.id },
    { userId: dave.id, recipeId: carbonara.id },
    { userId: alice.id, recipeId: friedRice.id },
    { userId: carol.id, recipeId: friedRice.id },
    { userId: alice.id, recipeId: smoothieBowl.id },
    { userId: dave.id, recipeId: smoothieBowl.id },
    { userId: alice.id, recipeId: chocolateMousse.id },
    { userId: bob.id, recipeId: chocolateMousse.id },
    { userId: dave.id, recipeId: chocolateMousse.id },
    { userId: alice.id, recipeId: pancakes.id },
    { userId: bob.id, recipeId: pancakes.id },
    { userId: carol.id, recipeId: grilledCheese.id },
    { userId: dave.id, recipeId: grilledCheese.id },
  ];

  for (const like of likePairs) {
    await prisma.like.upsert({
      where: { userId_recipeId: like },
      update: {},
      create: like,
    });
  }

  console.log('Likes created');

  // --- FAVORITES ---
  const favoritePairs = [
    { userId: bob.id, recipeId: carbonara.id },
    { userId: carol.id, recipeId: carbonara.id },
    { userId: alice.id, recipeId: smoothieBowl.id },
    { userId: dave.id, recipeId: chocolateMousse.id },
    { userId: alice.id, recipeId: pancakes.id },
    { userId: carol.id, recipeId: grilledCheese.id },
  ];

  for (const fav of favoritePairs) {
    await prisma.favorite.upsert({
      where: { userId_recipeId: fav },
      update: {},
      create: fav,
    });
  }

  console.log('Favorites created');

  // --- COMMENTS ---
  const comments = [
    {
      userId: bob.id,
      recipeId: carbonara.id,
      content:
        'Made this last night and it was incredible! The key really is using cold pasta water.',
    },
    {
      userId: carol.id,
      recipeId: carbonara.id,
      content:
        'Finally a carbonara recipe without cream. This is the real deal!',
    },
    {
      userId: dave.id,
      recipeId: carbonara.id,
      content:
        'My first time making carbonara and it turned out perfectly. Great instructions!',
    },
    {
      userId: alice.id,
      recipeId: friedRice.id,
      content: 'I add a little chili oil to mine — highly recommend!',
    },
    {
      userId: dave.id,
      recipeId: friedRice.id,
      content: 'So quick and easy. This is my go-to weeknight dinner now.',
    },
    {
      userId: alice.id,
      recipeId: smoothieBowl.id,
      content:
        "The thickness is key here. I add less milk than suggested and it's perfect.",
    },
    {
      userId: carol.id,
      recipeId: smoothieBowl.id,
      content: 'Love starting my mornings with this. So energizing!',
    },
    {
      userId: alice.id,
      recipeId: chocolateMousse.id,
      content:
        'I was skeptical about aquafaba but this genuinely fooled my non-vegan friends.',
    },
    {
      userId: bob.id,
      recipeId: chocolateMousse.id,
      content: 'Took me a few tries to get the folding right but so worth it.',
    },
    {
      userId: dave.id,
      recipeId: chocolateMousse.id,
      content: "Best vegan dessert I've ever had. Period.",
    },
    {
      userId: carol.id,
      recipeId: grilledCheese.id,
      content:
        'The dijon mustard is a game changer. Never going back to plain grilled cheese.',
    },
    {
      userId: alice.id,
      recipeId: pancakes.id,
      content: 'Made these for the whole family. Gone in minutes!',
    },
    {
      userId: bob.id,
      recipeId: pancakes.id,
      content: 'The not overmixing tip is crucial. Fluffy every time.',
    },
  ];

  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
  }

  console.log('Comments created');
  console.log('Seeding complete!');
  console.log(
    'Test credentials: alice@example.com / bob@example.com / carol@example.com / dave@example.com',
  );
  console.log('Password for all: password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
