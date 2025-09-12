// Admin mock data for UI-only scaffolding
// status: 'draft' | 'review' | 'published' | 'rejected'

const categories = [
  {
    id: "cat-healthy",
    name: "Healthy",
    slug: "healthy",
    description: "Nutritious and balanced meals",
    status: "published",
  },
  {
    id: "cat-fast",
    name: "Fast Food",
    slug: "fast-food",
    description: "Quick & tasty bites",
    status: "review",
  },
  {
    id: "cat-dessert",
    name: "Desserts",
    slug: "desserts",
    description: "Sweet treats & baking",
    status: "draft",
  },
];

const tags = [
  { id: "tag-vegan", name: "Vegan", slug: "vegan", status: "published" },
  {
    id: "tag-lowcarb",
    name: "Low Carb",
    slug: "low-carb",
    status: "published",
  },
  {
    id: "tag-highprotein",
    name: "High Protein",
    slug: "high-protein",
    status: "review",
  },
];

const users = [
  {
    id: "u-admin",
    name: "Admin Root",
    slug: "admin-root",
    role: "admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.png",
    status: "published",
  },
  {
    id: "u-alice",
    name: "Alice Nguyen",
    slug: "alice-nguyen",
    role: "editor",
    email: "alice@example.com",
    avatar: "/avatars/alice.png",
    status: "published",
  },
  {
    id: "u-bob",
    name: "Bob Tran",
    slug: "bob-tran",
    role: "user",
    email: "bob@example.com",
    avatar: "/avatars/bob.png",
    status: "review",
  },
];

const media = [
  {
    id: "m-hero1",
    slug: "hero-salad",
    filename: "hero-salad.jpg",
    type: "image",
    alt: "Fresh green salad",
    url: "/media/hero-salad.jpg",
    status: "published",
  },
  {
    id: "m-hero2",
    slug: "hero-burger",
    filename: "hero-burger.jpg",
    type: "image",
    alt: "Juicy burger",
    url: "/media/hero-burger.jpg",
    status: "review",
  },
  {
    id: "m-hero3",
    slug: "hero-cake",
    filename: "hero-cake.jpg",
    type: "image",
    alt: "Chocolate cake",
    url: "/media/hero-cake.jpg",
    status: "draft",
  },
];

const recipes = [
  {
    id: "r-green-bowl",
    slug: "green-power-bowl",
    title: "Green Power Bowl",
    authorId: "u-alice",
    categoryId: "cat-healthy",
    tagIds: ["tag-vegan", "tag-highprotein"],
    mediaId: "m-hero1",
    summary: "A nutrient packed bowl with quinoa, kale and avocado.",
    status: "published",
  },
  {
    id: "r-fast-noodles",
    slug: "5-minutes-noodles",
    title: "5 Minutes Garlic Noodles",
    authorId: "u-bob",
    categoryId: "cat-fast",
    tagIds: ["tag-lowcarb"],
    mediaId: "m-hero2",
    summary: "Super quick savory garlic noodles.",
    status: "review",
  },
  {
    id: "r-choco-cake",
    slug: "dark-choco-cake",
    title: "Dark Chocolate Cake",
    authorId: "u-alice",
    categoryId: "cat-dessert",
    tagIds: [],
    mediaId: "m-hero3",
    summary: "Rich and moist chocolate layer cake.",
    status: "draft",
  },
];

const comments = [
  {
    id: "c1",
    recipeId: "r-green-bowl",
    userId: "u-bob",
    content: "Loved this energy bowl!",
    status: "published",
  },
  {
    id: "c2",
    recipeId: "r-choco-cake",
    userId: "u-alice",
    content: "Needs more ganache maybe?",
    status: "review",
  },
  {
    id: "c3",
    recipeId: "r-fast-noodles",
    userId: "u-admin",
    content: "Approve after minor edits.",
    status: "draft",
  },
];

const activityLogs = [
  {
    id: "log1",
    actorId: "u-admin",
    action: "publish",
    entity: "recipe",
    entityId: "r-green-bowl",
    status: "published",
    timestamp: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "log2",
    actorId: "u-alice",
    action: "create",
    entity: "recipe",
    entityId: "r-choco-cake",
    status: "draft",
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "log3",
    actorId: "u-bob",
    action: "submit_review",
    entity: "recipe",
    entityId: "r-fast-noodles",
    status: "review",
    timestamp: Date.now() - 1000 * 60 * 10,
  },
];

export { recipes, media, categories, tags, users, comments, activityLogs };
