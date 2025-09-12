// seeders/vegetarian-recipes.seeder.js
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import Media from "../models/Media.js";
import connectDB from "../config/database.js";
import mongoose from "mongoose";

const vegetarianRecipes = [
  {
    title: "Cà Tím Hấp Tương Tỏi",
    originalName: "CaTimHapTuongToi.jpg",
    summary: "Cà tím hấp với tương và tỏi thơm ngon, thanh đạm",
    content:
      "Món cà tím hấp tương tỏi là món ăn chay đơn giản nhưng rất ngon miệng. Cà tím được hấp chín tới, ăn kèm với nước tương và tỏi băm tạo nên hương vị đặc trưng.",
    ingredients: [
      { name: "Cà tím", amount: "500", unit: "g", notes: "Cà tím tím" },
      { name: "Tương", amount: "3", unit: "tbsp", notes: "Tương đậu nành" },
      { name: "Tỏi", amount: "3", unit: "tép", notes: "Tỏi tươi" },
      { name: "Dầu thực vật", amount: "2", unit: "tbsp", notes: "" },
    ],
    steps: [
      {
        order: 1,
        description: "Rửa sạch cà tím, cắt miếng vừa ăn",
        duration: 10,
      },
      { order: 2, description: "Hấp cà tím trong 15 phút", duration: 15 },
      { order: 3, description: "Trộn tương với tỏi băm và dầu", duration: 5 },
    ],
    tags: ["chay", "eggplant", "steamed", "healthy"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    status: "published",
  },
  {
    title: "Cà Tím Kho Tiêu Chay",
    originalName: "CaTimKhoTieuChay.jpg",
    summary: "Cà tím kho với tiêu và gia vị chay đậm đà",
    content:
      "Món cà tím kho tiêu chay với nước dùng chay đậm đà, cà tím mềm ngọt thấm gia vị.",
    ingredients: [
      { name: "Cà tím", amount: "600", unit: "g", notes: "Cà tím tím" },
      { name: "Nước dùng chay", amount: "400", unit: "ml", notes: "" },
      { name: "Tiêu đen", amount: "1", unit: "tsp", notes: "Tiêu xay" },
      { name: "Nước tương", amount: "2", unit: "tbsp", notes: "" },
    ],
    steps: [
      { order: 1, description: "Cắt cà tím miếng to, chiên qua", duration: 10 },
      {
        order: 2,
        description: "Kho cà tím với nước dùng và gia vị",
        duration: 20,
      },
      { order: 3, description: "Nêm nếm và rắc tiêu", duration: 5 },
    ],
    tags: ["chay", "eggplant", "braised", "spicy"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    status: "published",
  },
  {
    title: "Cà Tím Xào Chua Ngọt",
    originalName: "CaTimXaoChuaNgot.jpg",
    summary: "Cà tím xào với vị chua ngọt đậm đà hấp dẫn",
    content:
      "Món cà tím xào chua ngọt mang hương vị Việt Nam truyền thống, cà tím mềm ngọt hòa quyện với vị chua ngọt đặc trưng.",
    ingredients: [
      { name: "Cà tím", amount: "500", unit: "g", notes: "Cà tím tím" },
      { name: "Cà chua", amount: "2", unit: "quả", notes: "Cà chua chín" },
      { name: "Đường phèn", amount: "2", unit: "tbsp", notes: "" },
      { name: "Giấm", amount: "1", unit: "tbsp", notes: "Giấm gạo" },
    ],
    steps: [
      {
        order: 1,
        description: "Cắt cà tím múi cau, ngâm nước muối",
        duration: 10,
      },
      { order: 2, description: "Xào cà tím với cà chua", duration: 8 },
      { order: 3, description: "Nêm đường, giấm vừa ăn", duration: 2 },
    ],
    tags: ["chay", "eggplant", "sweet-sour", "vietnamese"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    status: "published",
  },
  {
    title: "Cà Tím Xào Lá Lốt Chay",
    originalName: "CaTimXaoLaLotChay.jpg",
    summary: "Cà tím xào với lá lốt thơm, món ăn chay độc đáo",
    content:
      "Sự kết hợp độc đáo giữa cà tím và lá lốt tạo nên món ăn chay có hương vị rất riêng, thơm ngon và bổ dưỡng.",
    ingredients: [
      { name: "Cà tím", amount: "400", unit: "g", notes: "Cà tím tím" },
      { name: "Lá lốt", amount: "100", unit: "g", notes: "Lá tươi" },
      { name: "Hành tím", amount: "3", unit: "củ", notes: "" },
      { name: "Dầu thực vật", amount: "3", unit: "tbsp", notes: "" },
    ],
    steps: [
      { order: 1, description: "Rửa sạch lá lốt, thái sợi", duration: 5 },
      {
        order: 2,
        description: "Xào hành tím thơm, cho cà tím vào",
        duration: 8,
      },
      { order: 3, description: "Cho lá lốt vào xào chín", duration: 3 },
    ],
    tags: ["chay", "eggplant", "la-lot", "aromatic"],
    category: "mon-chinh",
    prepTime: 10,
    cookTime: 11,
    servings: 4,
    status: "published",
  },
  {
    title: "Cà Tím Xào Tỏi Chay",
    originalName: "CaTimXaoToiChAY.jpg",
    summary: "Cà tím xào tỏi đơn giản nhưng thơm ngon",
    content:
      "Món cà tím xào tỏi là món ăn chay quen thuộc, đơn giản nhưng rất ngon, cà tím mềm ngọt thấm vị tỏi thơm.",
    ingredients: [
      { name: "Cà tím", amount: "500", unit: "g", notes: "Cà tím tím" },
      { name: "Tỏi", amount: "4", unit: "tép", notes: "Tỏi tươi" },
      { name: "Hành lá", amount: "2", unit: "cây", notes: "" },
      { name: "Dầu ăn", amount: "3", unit: "tbsp", notes: "" },
    ],
    steps: [
      {
        order: 1,
        description: "Cà tím cắt miếng, ngâm nước muối",
        duration: 10,
      },
      { order: 2, description: "Phi tỏi thơm, xào cà tím", duration: 8 },
      { order: 3, description: "Rắc hành lá thái nhỏ", duration: 2 },
    ],
    tags: ["chay", "eggplant", "garlic", "simple"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 10,
    servings: 4,
    status: "published",
  },
  {
    title: "Canh Bông Cải",
    originalName: "CanhBongCai.jpg",
    summary: "Canh bông cải thanh mát, bổ dưỡng",
    content:
      "Canh bông cải là món canh chay đơn giản, thanh mát và bổ dưỡng, phù hợp cho bữa cơm gia đình.",
    ingredients: [
      { name: "Bông cải trắng", amount: "300", unit: "g", notes: "" },
      { name: "Cà rót", amount: "1", unit: "quả", notes: "Cà rốt nhỏ" },
      { name: "Hành tím", amount: "2", unit: "củ", notes: "" },
      { name: "Nước dùng chay", amount: "600", unit: "ml", notes: "" },
    ],
    steps: [
      {
        order: 1,
        description: "Rửa sạch bông cải, cắt từng cụm nhỏ",
        duration: 8,
      },
      { order: 2, description: "Phi hành tím, cho nước dùng vào", duration: 5 },
      { order: 3, description: "Cho bông cải và cà rốt vào nấu", duration: 10 },
    ],
    tags: ["chay", "soup", "cauliflower", "healthy"],
    category: "canh-soup",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    status: "published",
  },
  {
    title: "Canh Chua Chay",
    originalName: "CanhChuaChay.jpg",
    summary: "Canh chua chay với rau củ và thơm",
    content:
      "Canh chua chay với rau củ tươi ngon, vị chua thanh mát rất phù hợp cho ngày hè.",
    ingredients: [
      { name: "Thơm", amount: "200", unit: "g", notes: "Thơm tươi" },
      { name: "Cà chua", amount: "2", unit: "quả", notes: "" },
      { name: "Giá đỗ", amount: "100", unit: "g", notes: "" },
      { name: "Me chua", amount: "2", unit: "tbsp", notes: "" },
    ],
    steps: [
      { order: 1, description: "Thơm gọt vỏ, cắt miếng", duration: 10 },
      { order: 2, description: "Nấu nước dùng với me chua", duration: 8 },
      { order: 3, description: "Cho thơm, cà chua vào nấu", duration: 12 },
    ],
    tags: ["chay", "soup", "sour", "pineapple"],
    category: "canh-soup",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    status: "published",
  },
  {
    title: "Canh Hẹ Đậu Hũ Non",
    originalName: "CanhHeDauHuNon.jpg",
    summary: "Canh hẹ với đậu hũ non mềm mịn",
    content:
      "Canh hẹ đậu hũ non là món canh chay thanh đạm, bổ dưỡng với hương vị đặc trưng của hẹ.",
    ingredients: [
      { name: "Hẹ", amount: "150", unit: "g", notes: "Hẹ tươi" },
      { name: "Đậu hũ non", amount: "200", unit: "g", notes: "" },
      { name: "Hành tím", amount: "2", unit: "củ", notes: "" },
      { name: "Nước dùng chay", amount: "500", unit: "ml", notes: "" },
    ],
    steps: [
      { order: 1, description: "Rửa sạch hẹ, cắt khúc 3cm", duration: 5 },
      { order: 2, description: "Phi hành tím, cho nước dùng vào", duration: 5 },
      { order: 3, description: "Cho đậu hũ và hẹ vào nấu", duration: 8 },
    ],
    tags: ["chay", "soup", "chinese-chives", "tofu"],
    category: "canh-soup",
    prepTime: 8,
    cookTime: 13,
    servings: 4,
    status: "published",
  },
  {
    title: "Canh Kim Chi Chay",
    originalName: "CanhKimChiChAY.jpg",
    summary: "Canh kim chi chay chua cay đậm đà",
    content:
      "Canh kim chi chay với vị chua cay đặc trưng, ăn kèm cơm trắng rất ngon.",
    ingredients: [
      { name: "Kim chi chay", amount: "200", unit: "g", notes: "" },
      { name: "Đậu hũ", amount: "150", unit: "g", notes: "Cắt miếng" },
      { name: "Hành tây", amount: "1", unit: "củ", notes: "Cắt múi cau" },
      { name: "Nước dùng chay", amount: "600", unit: "ml", notes: "" },
    ],
    steps: [
      { order: 1, description: "Xào kim chi với hành tây", duration: 5 },
      { order: 2, description: "Cho nước dùng vào đun sôi", duration: 8 },
      { order: 3, description: "Thêm đậu hũ vào nấu", duration: 5 },
    ],
    tags: ["chay", "soup", "kimchi", "korean"],
    category: "canh-soup",
    prepTime: 10,
    cookTime: 18,
    servings: 4,
    status: "published",
  },
  {
    title: "Canh Rong Biển",
    originalName: "CanhRongBien.jpg",
    summary: "Canh rong biển bổ dưỡng, giàu khoáng chất",
    content:
      "Canh rong biển tươi mát, bổ dưỡng với nhiều khoáng chất và vitamin tốt cho sức khỏe.",
    ingredients: [
      { name: "Rong biển khô", amount: "50", unit: "g", notes: "Ngâm nở" },
      { name: "Cà rốt", amount: "1", unit: "củ", notes: "Cắt hạt lựu" },
      { name: "Hành tím", amount: "2", unit: "củ", notes: "" },
      { name: "Nước dùng chay", amount: "600", unit: "ml", notes: "" },
    ],
    steps: [
      {
        order: 1,
        description: "Ngâm rong biển cho nở, rửa sạch",
        duration: 15,
      },
      { order: 2, description: "Phi hành tím, cho nước dùng vào", duration: 5 },
      {
        order: 3,
        description: "Cho rong biển và cà rốt vào nấu",
        duration: 10,
      },
    ],
    tags: ["chay", "soup", "seaweed", "nutritious"],
    category: "canh-soup",
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    status: "published",
  },
  {
    title: "Cháo Nấm Cà Rốt",
    originalName: "ChaoNamCarot.jpg",
    summary: "Cháo nấm cà rốt bổ dưỡng, dễ tiêu hóa",
    content:
      "Cháo nấm cà rốt là món ăn chay bổ dưỡng, dễ tiêu hóa, phù hợp cho mọi lứa tuổi.",
    ingredients: [
      { name: "Gạo tẻ", amount: "100", unit: "g", notes: "" },
      { name: "Nấm hương", amount: "100", unit: "g", notes: "Ngâm nở" },
      { name: "Cà rốt", amount: "1", unit: "củ", notes: "Cắt hạt lựu" },
      { name: "Nước dùng chay", amount: "800", unit: "ml", notes: "" },
    ],
    steps: [
      { order: 1, description: "Vo sạch gạo, ngâm 30 phút", duration: 30 },
      { order: 2, description: "Nấu cháo với nước dùng", duration: 40 },
      { order: 3, description: "Cho nấm và cà rốt vào nấu", duration: 15 },
    ],
    tags: ["chay", "porridge", "mushroom", "carrot"],
    category: "mon-chinh",
    prepTime: 35,
    cookTime: 55,
    servings: 4,
    status: "published",
  },
  {
    title: "Mì Xào Nấm Chay",
    originalName: "MyXaoNamChay.jpg",
    summary: "Mì xào nấm chay thơm ngon, đầy đủ dinh dưỡng",
    content:
      "Mì xào nấm chay với nhiều loại nấm tươi ngon, rau củ đầy màu sắc và hấp dẫn.",
    ingredients: [
      { name: "Mì tươi", amount: "300", unit: "g", notes: "Mì trứng" },
      { name: "Nấm hương", amount: "100", unit: "g", notes: "Cắt lát" },
      { name: "Nấm đùi gà", amount: "100", unit: "g", notes: "Cắt lát" },
      { name: "Rau cải", amount: "150", unit: "g", notes: "Cắt khúc" },
    ],
    steps: [
      { order: 1, description: "Luộc mì qua nước sôi", duration: 3 },
      { order: 2, description: "Xào nấm với rau củ", duration: 8 },
      { order: 3, description: "Trộn mì với nấm đã xào", duration: 5 },
    ],
    tags: ["chay", "noodles", "mushroom", "stir-fry"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 16,
    servings: 4,
    status: "published",
  },
  {
    title: "Nấm Đông Cô Kho",
    originalName: "NamDongCoKho.jpg",
    summary: "Nấm đông cô kho đậm đà với nước dùng chay",
    content:
      "Nấm đông cô kho là món ăn chay giàu đạm, nấm thấm gia vị đậm đà rất thơm ngon.",
    ingredients: [
      { name: "Nấm đông cô khô", amount: "200", unit: "g", notes: "Ngâm nở" },
      { name: "Nước dùng chay", amount: "300", unit: "ml", notes: "" },
      { name: "Nước tương", amount: "3", unit: "tbsp", notes: "" },
      { name: "Đường phèn", amount: "1", unit: "tbsp", notes: "" },
    ],
    steps: [
      { order: 1, description: "Ngâm nấm đông cô cho nở", duration: 30 },
      {
        order: 2,
        description: "Kho nấm với nước dùng và gia vị",
        duration: 25,
      },
      { order: 3, description: "Kho đến khi nước cạn sệt", duration: 10 },
    ],
    tags: ["chay", "mushroom", "braised", "shiitake"],
    category: "mon-chinh",
    prepTime: 35,
    cookTime: 35,
    servings: 4,
    status: "published",
  },
  {
    title: "Nấm Kho Tiêu",
    originalName: "NamKhoTieu.jpg",
    summary: "Nấm kho tiêu cay nồng, đậm đà",
    content:
      "Nấm kho tiêu với vị cay nồng đặc trưng của tiêu đen, món ăn chay hấp dẫn.",
    ingredients: [
      { name: "Nấm rơm", amount: "300", unit: "g", notes: "Cắt đôi" },
      { name: "Tiêu đen", amount: "1", unit: "tsp", notes: "Tiêu xay" },
      { name: "Nước dùng chay", amount: "250", unit: "ml", notes: "" },
      { name: "Nước tương", amount: "2", unit: "tbsp", notes: "" },
    ],
    steps: [
      { order: 1, description: "Rửa sạch nấm, cắt đôi", duration: 5 },
      { order: 2, description: "Kho nấm với nước dùng", duration: 20 },
      { order: 3, description: "Nêm tiêu và gia vị", duration: 5 },
    ],
    tags: ["chay", "mushroom", "pepper", "braised"],
    category: "mon-chinh",
    prepTime: 8,
    cookTime: 25,
    servings: 4,
    status: "published",
  },
  {
    title: "Nấm Kim Châm Xào Chay",
    originalName: "NamKimChamXaoChay.jpg",
    summary: "Nấm kim châm xào với rau củ thanh ngọt",
    content:
      "Nấm kim châm xào chay giòn ngon, thanh ngọt kết hợp với rau củ tươi mát.",
    ingredients: [
      { name: "Nấm kim châm", amount: "200", unit: "g", notes: "Cắt gốc" },
      { name: "Cà rốt", amount: "1", unit: "củ", notes: "Cắt sợi" },
      { name: "Đậu que", amount: "100", unit: "g", notes: "Cắt khúc" },
      { name: "Hành tím", amount: "2", unit: "củ", notes: "" },
    ],
    steps: [
      { order: 1, description: "Rửa sạch nấm, cắt bỏ gốc", duration: 5 },
      { order: 2, description: "Xào hành tím thơm", duration: 3 },
      { order: 3, description: "Cho nấm và rau củ vào xào", duration: 8 },
    ],
    tags: ["chay", "mushroom", "enoki", "stir-fry"],
    category: "mon-chinh",
    prepTime: 10,
    cookTime: 11,
    servings: 4,
    status: "published",
  },
  {
    title: "Nấm Rơm Chiên Giòn",
    originalName: "NamRomChienGion.jpg",
    summary: "Nấm rơm chiên giòn vàng ruộm, thơm ngon",
    content:
      "Nấm rơm chiên giòn với lớp bột chiên vàng ruộm, bên trong mềm ngọt, rất hấp dẫn.",
    ingredients: [
      { name: "Nấm rơm", amount: "300", unit: "g", notes: "Nấm tươi" },
      { name: "Bột năng", amount: "100", unit: "g", notes: "" },
      { name: "Bột mì", amount: "50", unit: "g", notes: "" },
      { name: "Dầu chiên", amount: "500", unit: "ml", notes: "" },
    ],
    steps: [
      { order: 1, description: "Rửa sạch nấm, để ráo nước", duration: 10 },
      { order: 2, description: "Trộn bột chiên với nước", duration: 5 },
      { order: 3, description: "Tẩm nấm bột rồi chiên vàng", duration: 15 },
    ],
    tags: ["chay", "mushroom", "fried", "crispy"],
    category: "mon-khai-vi",
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    status: "published",
  },
  {
    title: "Salad Đậu Hũ",
    originalName: "SaladTauHu.jpg",
    summary: "Salad đậu hũ tươi mát với rau thơm",
    content:
      "Salad đậu hũ với rau thơm tươi mát, ăn kèm nước mắm chay rất ngon và bổ dưỡng.",
    ingredients: [
      { name: "Đậu hũ", amount: "200", unit: "g", notes: "Cắt miếng" },
      { name: "Rau xà lách", amount: "100", unit: "g", notes: "Xé nhỏ" },
      { name: "Cà chua", amount: "2", unit: "quả", notes: "Cắt múi" },
      { name: "Dưa chuột", amount: "1", unit: "quả", notes: "Cắt lát" },
    ],
    steps: [
      { order: 1, description: "Chiên đậu hũ vàng giòn", duration: 8 },
      { order: 2, description: "Rửa sạch rau, để ráo", duration: 5 },
      { order: 3, description: "Trộn tất cả với nước mắm chay", duration: 5 },
    ],
    tags: ["chay", "salad", "tofu", "fresh"],
    category: "salad-goi",
    prepTime: 15,
    cookTime: 8,
    servings: 4,
    status: "published",
  },
  {
    title: "Đậu Hũ Chiên Xả Ớt",
    originalName: "TauHuChienXaOt.jpg",
    summary: "Đậu hũ chiên với xả ớt thơm cay",
    content:
      "Đậu hũ chiên vàng giòn, xào với xả ớt tạo nên món ăn chay thơm cay hấp dẫn.",
    ingredients: [
      { name: "Đậu hũ", amount: "300", unit: "g", notes: "Cắt miếng" },
      { name: "Sả", amount: "2", unit: "cây", notes: "Thái lát" },
      { name: "Ớt", amount: "2", unit: "quả", notes: "Ớt hiểm" },
      { name: "Dầu ăn", amount: "3", unit: "tbsp", notes: "" },
    ],
    steps: [
      { order: 1, description: "Chiên đậu hũ vàng giòn", duration: 10 },
      { order: 2, description: "Phi sả ớt thơm", duration: 3 },
      { order: 3, description: "Xào đậu hũ với sả ớt", duration: 5 },
    ],
    tags: ["chay", "tofu", "lemongrass", "spicy"],
    category: "mon-chinh",
    prepTime: 10,
    cookTime: 18,
    servings: 4,
    status: "published",
  },
  {
    title: "Đậu Hũ Kho Rau Củ",
    originalName: "TauHuKhoRauCu.jpg",
    summary: "Đậu hũ kho với rau củ đậm đà bổ dưỡng",
    content:
      "Đậu hũ kho cùng rau củ tạo nên món ăn chay giàu dinh dưỡng, đậm đà hương vị.",
    ingredients: [
      { name: "Đậu hũ", amount: "250", unit: "g", notes: "Cắt miếng" },
      { name: "Cà rốt", amount: "1", unit: "củ", notes: "Cắt miếng" },
      { name: "Khoai tây", amount: "2", unit: "củ", notes: "Cắt miếng" },
      { name: "Nước dùng chay", amount: "400", unit: "ml", notes: "" },
    ],
    steps: [
      { order: 1, description: "Chiên đậu hũ vàng", duration: 8 },
      { order: 2, description: "Xào rau củ sơ qua", duration: 5 },
      { order: 3, description: "Kho tất cả với nước dùng", duration: 20 },
    ],
    tags: ["chay", "tofu", "vegetables", "braised"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 33,
    servings: 4,
    status: "published",
  },
  {
    title: "Đậu Hũ Non Xốt Nấm Đông Cô",
    originalName: "TauHuNonXotNamDongCo.jpg",
    summary: "Đậu hũ non mềm mịn với xốt nấm đông cô thơm ngon",
    content:
      "Đậu hũ non mềm mịn được chế biến với xốt nấm đông cô đậm đà, món ăn chay tinh tế.",
    ingredients: [
      { name: "Đậu hũ non", amount: "300", unit: "g", notes: "Cắt miếng to" },
      { name: "Nấm đông cô", amount: "100", unit: "g", notes: "Ngâm nở" },
      { name: "Nước tương", amount: "2", unit: "tbsp", notes: "" },
      { name: "Tinh bột", amount: "1", unit: "tbsp", notes: "Pha nước" },
    ],
    steps: [
      { order: 1, description: "Hấp đậu hũ non trong 8 phút", duration: 8 },
      { order: 2, description: "Xào nấm đông cô thơm", duration: 5 },
      {
        order: 3,
        description: "Làm xốt với nước tương và tinh bột",
        duration: 5,
      },
    ],
    tags: ["chay", "soft-tofu", "shiitake", "sauce"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 18,
    servings: 4,
    status: "published",
  },
  {
    title: "Đậu Hũ Xào Rau Củ",
    originalName: "TauHuXaoRauCu.jpg",
    summary: "Đậu hũ xào với rau củ tươi ngon đầy màu sắc",
    content:
      "Đậu hũ xào rau củ với nhiều loại rau củ tươi ngon, đầy màu sắc và dinh dưỡng.",
    ingredients: [
      { name: "Đậu hũ", amount: "200", unit: "g", notes: "Cắt miếng" },
      { name: "Súp lơ", amount: "150", unit: "g", notes: "Cắt cụm" },
      { name: "Cà rốt", amount: "1", unit: "củ", notes: "Cắt lát" },
      { name: "Đậu que", amount: "100", unit: "g", notes: "Cắt khúc" },
    ],
    steps: [
      { order: 1, description: "Chiên đậu hũ vàng", duration: 8 },
      { order: 2, description: "Xào rau củ sơ qua", duration: 6 },
      { order: 3, description: "Trộn đậu hũ với rau củ", duration: 3 },
    ],
    tags: ["chay", "tofu", "mixed-vegetables", "colorful"],
    category: "mon-chinh",
    prepTime: 15,
    cookTime: 17,
    servings: 4,
    status: "published",
  },
  {
    title: "Tàu Mũ Muối Rau Răm",
    originalName: "TauMuMuoiRauRam.jpg",
    summary: "Tàu mũ muối với rau răm thơm mát",
    content:
      "Tàu mũ muối kết hợp với rau răm tạo nên món ăn chay thanh mát, thơm ngon và bổ dưỡng.",
    ingredients: [
      { name: "Tàu mũ", amount: "300", unit: "g", notes: "Tàu mũ tươi" },
      { name: "Rau răm", amount: "50", unit: "g", notes: "Rau tươi" },
      { name: "Muối", amount: "1", unit: "tsp", notes: "" },
      { name: "Dầu thực vật", amount: "2", unit: "tbsp", notes: "" },
    ],
    steps: [
      { order: 1, description: "Rửa sạch tàu mũ, để ráo", duration: 5 },
      { order: 2, description: "Xào tàu mũ với muối", duration: 8 },
      { order: 3, description: "Rắc rau răm thái nhỏ", duration: 2 },
    ],
    tags: ["chay", "bitter-melon", "vietnamese-mint", "fresh"],
    category: "side-dish",
    prepTime: 8,
    cookTime: 10,
    servings: 4,
    status: "published",
  },
];

async function seedVegetarianRecipes() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDB();

    console.log("🗑️ Clearing existing recipes...");
    await Recipe.deleteMany({});

    console.log("👤 Finding admin user...");
    const adminUser = await User.findOne({ email: "admin@example.com" });
    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    console.log("🖼️ Getting media files...");
    const mediaFiles = await Media.find({ type: "image" });
    const mediaMap = {};
    mediaFiles.forEach((media) => {
      mediaMap[media.originalName] = media._id;
    });

    console.log("📋 Creating recipes with matching images...");
    const recipesToCreate = vegetarianRecipes.map((recipe) => {
      const mediaId = mediaMap[recipe.originalName];
      return {
        ...recipe,
        slug: slugify(recipe.title),
        authorId: adminUser._id,
        images: mediaId ? [mediaId] : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const createdRecipes = await Recipe.insertMany(recipesToCreate);
    console.log(`✅ Created ${createdRecipes.length} vegetarian recipes`);

    console.log("📋 Recipe list:");
    createdRecipes.forEach((recipe, index) => {
      const hasImage = recipe.images && recipe.images.length > 0;
      console.log(
        `   ${index + 1}. ${recipe.title} (${recipe.status}) ${
          hasImage ? "🖼️" : "📷"
        }`
      );
    });

    console.log("\n🎯 Testing populated results...");
    const testRecipe = await Recipe.findOne({ images: { $ne: [] } }).populate(
      "images",
      "url originalName"
    );
    if (testRecipe) {
      console.log(`✅ Test recipe: ${testRecipe.title}`);
      console.log(
        `   Image: ${testRecipe.images[0]?.originalName} -> ${testRecipe.images[0]?.url}`
      );
    }
  } catch (error) {
    console.error("❌ Error seeding vegetarian recipes:", error);
  } finally {
    mongoose.connection.close();
  }
}

// Helper function to generate slug
function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 120);
}

// Run seeder
console.log("🌱 Starting vegetarian recipes seeder...");
seedVegetarianRecipes();
