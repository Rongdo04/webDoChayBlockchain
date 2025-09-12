// mock.js - mock data for vegetarian recipe UI
export const users = [
  {
    id: "u1",
    name: "An Nhiên",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&w=128&q=60",
    bio: "Yêu món chay & cân bằng dưỡng chất.",
  },
  {
    id: "u2",
    name: "Thiền Tâm",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&w=128&q=60",
    bio: "Khám phá hương vị xanh vùng miền.",
  },
];

export const recipes = [
  {
    id: "r1",
    title: "Đậu hũ sốt sa tế",
    slug: "dau-hu-sot-sa-te",
    description: "Đậm đà cay nhẹ, ăn kèm cơm nóng rất đưa vị.",
    ingredients: [
      "Đậu hũ non 300g",
      "Sa tế 2 muỗng",
      "Tỏi băm",
      "Hành boa rô",
      "Nước tương",
      "Đường thốt nốt",
    ],
    steps: [
      "Cắt đậu hũ khối vừa ăn",
      "Phi thơm tỏi & boa rô",
      "Thêm sa tế + nước tương + nước, nêm đường",
      "Cho đậu vào rim 5-7 phút",
      "Rắc boa rô cắt nhỏ",
    ],
    durationPrep: 10,
    durationCook: 15,
    servings: 2,
    difficulty: "Dễ",
    dietType: "Thuần chay",
    tasteTags: ["Đậm đà", "Cay nhẹ"],
    category: "Món chính",
    images: [
      "https://images.unsplash.com/photo-1604908176997-1251470b16f6?auto=format&w=800&q=60",
    ],
    videoUrl: "",
    ratingAvg: 4.7,
    ratingCount: 124,
    authorId: "u1",
    createdAt: "2025-08-20T10:00:00Z",
  },
  {
    id: "r2",
    title: "Gỏi nấm đùi gà",
    slug: "goi-nam-dui-ga",
    description: "Thanh mát giòn nhẹ với nước trộn chua ngọt.",
    ingredients: [
      "Nấm đùi gà",
      "Cà rốt",
      "Dưa leo",
      "Rau răm",
      "Chanh",
      "Đậu phộng",
    ],
    steps: [
      "Luộc sơ nấm & xé sợi",
      "Bào sợi cà rốt & dưa leo",
      "Pha nước trộn",
      "Trộn nhẹ tay với rau răm",
      "Rắc đậu phộng",
    ],
    durationPrep: 15,
    durationCook: 5,
    servings: 3,
    difficulty: "Trung bình",
    dietType: "Thuần chay",
    tasteTags: ["Thanh", "Chua dịu"],
    category: "Khai vị",
    images: [
      "https://images.unsplash.com/photo-1495195134817-aeb325a55b65?auto=format&w=800&q=60",
    ],
    videoUrl: "",
    ratingAvg: 4.5,
    ratingCount: 89,
    authorId: "u2",
    createdAt: "2025-08-22T08:00:00Z",
  },
  {
    id: "r3",
    title: "Bún Huế chay",
    slug: "bun-hue-chay",
    description: "Đậm đà thơm sả ớt & vị ngọt tự nhiên.",
    ingredients: [
      "Bún tươi",
      "Sả",
      "Đậu hũ chiên",
      "Nấm rơm",
      "Mộc nhĩ",
      "Nước lèo rau củ",
    ],
    steps: [
      "Hầm nước rau củ",
      "Phi sả ớt tạo màu",
      "Cho nấm + đậu hũ + mộc nhĩ",
      "Nêm vị & thêm sả đập",
      "Chan nước lèo vào bún",
    ],
    durationPrep: 20,
    durationCook: 40,
    servings: 4,
    difficulty: "Khó",
    dietType: "Thuần chay",
    tasteTags: ["Đậm đà", "Cay nhẹ"],
    category: "Món chính",
    images: [
      "https://images.unsplash.com/photo-1604908554164-058f5efdf49e?auto=format&w=800&q=60",
    ],
    videoUrl: "",
    ratingAvg: 4.9,
    ratingCount: 203,
    authorId: "u1",
    createdAt: "2025-08-25T12:00:00Z",
  },
];

export const comments = [
  {
    id: "c1",
    recipeId: "r1",
    userId: "u2",
    content: "Vị cay dịu cân bằng, rất ngon!",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "c2",
    recipeId: "r1",
    userId: "u1",
    content: "Thêm sả băm thơm hơn.",
    createdAt: Date.now() - 1000 * 60 * 10,
  },
];

// Homepage specific mock data
export const categories = [
  { id: "cat1", label: "Khai vị", icon: "🥗" },
  { id: "cat2", label: "Món chính", icon: "🍲" },
  { id: "cat3", label: "Tráng miệng", icon: "🍮" },
  { id: "cat4", label: "Thuần chay", icon: "🌿" },
  { id: "cat5", label: "Ovo-lacto", icon: "🥚" },
  { id: "cat6", label: "< 30 phút", icon: "⏱️" },
];

export const trendingRecipes = [
  ...recipes.slice(0, 3),
  // duplicate with slight modifications for demonstration
  {
    ...recipes[0],
    id: "r4",
    slug: "cuon-rau-nam",
    title: "Cuốn rau nấm thanh mát",
    tasteTags: ["Thanh", "Nhẹ"],
    images: [
      "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&w=800&q=60",
    ],
    ratingAvg: 4.6,
    ratingCount: 77,
    durationPrep: 12,
    durationCook: 8,
  },
  {
    ...recipes[1],
    id: "r5",
    slug: "sup-bi-do-hat-dieu",
    title: "Súp bí đỏ hạt điều béo nhẹ",
    tasteTags: ["Béo nhẹ", "Thanh"],
    images: [
      "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&w=800&q=60",
    ],
    ratingAvg: 4.4,
    ratingCount: 54,
    durationPrep: 10,
    durationCook: 20,
  },
  {
    ...recipes[2],
    id: "r6",
    slug: "salad-hat-quinoa",
    title: "Salad hạt quinoa rau củ",
    tasteTags: ["Thanh", "Giòn"],
    images: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&w=800&q=60",
    ],
    ratingAvg: 4.8,
    ratingCount: 132,
    durationPrep: 15,
    durationCook: 10,
  },
  {
    ...recipes[0],
    id: "r7",
    slug: "banh-flan-dua",
    title: "Bánh flan dừa chay",
    category: "Tráng miệng",
    tasteTags: ["Ngọt dịu"],
    images: [
      "https://images.unsplash.com/photo-1605475128023-8f14170a0b33?auto=format&w=800&q=60",
    ],
    ratingAvg: 4.3,
    ratingCount: 61,
    durationPrep: 5,
    durationCook: 25,
  },
];

export const featuredVideo = {
  id: "vid1",
  title: "7 Mẹo Nấu Đồ Chay Ngon Tại Nhà",
  description:
    "Những kỹ thuật cơ bản giúp món chay vẫn đậm đà và giàu dinh dưỡng mà không cần nhiều gia vị công nghiệp.",
  poster:
    "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&w=1200&q=60",
  duration: "05:32",
};

export const testimonials = [
  {
    id: "t1",
    name: "Lan Phương",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    quote: "Công thức rõ ràng, làm lần đầu đã ngon!",
  },
  {
    id: "t2",
    name: "Minh Tâm",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote: "Các món rất cân bằng dinh dưỡng và dễ chuẩn bị.",
  },
  {
    id: "t3",
    name: "Hoài An",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    quote: "Mình tìm được nhiều ý tưởng bữa tối nhanh.",
  },
];
