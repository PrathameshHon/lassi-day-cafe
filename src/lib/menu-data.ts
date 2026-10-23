export interface MenuItem {
  name: string;
  desc?: string;
  price: number;
  img?: string;
  tag?: "Signature" | "Bestseller" | "New" | "Value";
}

export interface MenuCategory {
  id: string;
  label: string;
  emoji: string;
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  {
    id: "lassi",
    label: "Lassi",
    emoji: "🥛",
    items: [
      { name: "Sweet Lassi", desc: "Classic creamy curd-based lassi with malai", price: 70, img: "/images/lassi-sweet.jpg", tag: "Bestseller" },
      { name: "Mango Lassi", desc: "Thick lassi blended with alphonso pulp", price: 90, img: "/images/lassi-mango.jpg" },
      { name: "Strawberry Lassi", desc: "Creamy lassi with fresh strawberry", price: 90, img: "/images/lassi-strawberry.jpg" },
      { name: "Dry Fruit Lassi", desc: "Loaded with almonds, cashew & pista", price: 120, img: "/images/lassi-dryfruit.jpg" },
      { name: "Chocolate Lassi", desc: "Rich chocolate churned with creamy curd", price: 100, img: "/images/lassi-chocolate.jpg" },
      { name: "Royal Lassi", desc: "Saffron, dry fruits & rose — the king size", price: 140, img: "/images/lassi-royal.jpg", tag: "Signature" },
    ],
  },
  {
    id: "pizza",
    label: "Pizza",
    emoji: "🍕",
    items: [
      { name: "Margherita", desc: "Classic cheese & tomato, wood-fired style", price: 149, img: "/images/pizza.jpg", tag: "Value" },
      { name: "Veggie Loaded", desc: "Capsicum, onion, corn & herbs", price: 199, img: "/images/pizza.jpg" },
      { name: "Corn & Cheese", desc: "Golden sweet corn over molten cheese", price: 189, img: "/images/pizza.jpg" },
      { name: "Paneer Tikka Pizza", desc: "Smoky paneer tikka, mint drizzle", price: 249, img: "/images/pizza.jpg", tag: "Bestseller" },
    ],
  },
  {
    id: "burger",
    label: "Burger",
    emoji: "🍔",
    items: [
      { name: "Classic Veg Burger", desc: "Crispy patty, lettuce, secret sauce", price: 109, img: "/images/burger.jpg", tag: "Bestseller" },
      { name: "Cheese Blast Burger", desc: "Double molten cheese slice & patty", price: 139, img: "/images/burger.jpg" },
      { name: "Paneer Crunch Burger", desc: "Crunchy paneer patty with mint mayo", price: 159, img: "/images/burger.jpg" },
    ],
  },
  {
    id: "sandwich",
    label: "Sandwich",
    emoji: "🥪",
    items: [
      { name: "Veg Grilled Sandwich", desc: "Butter-grilled with garden veggies", price: 89, img: "/images/sandwich.jpg", tag: "Value" },
      { name: "Cheese Sandwich", desc: "Three-layer with molten cheese", price: 109, img: "/images/sandwich.jpg" },
      { name: "Chocolate Sandwich", desc: "Toasted bread, loaded chocolate", price: 99, img: "/images/sandwich.jpg" },
      { name: "Club Sandwich", desc: "The full stack — fries on the side", price: 129, img: "/images/sandwich.jpg" },
    ],
  },
  {
    id: "snacks",
    label: "Snacks",
    emoji: "🍟",
    items: [
      { name: "Salted Fries", desc: "Golden crispy, lightly salted", price: 79, img: "/images/fries.jpg", tag: "Value" },
      { name: "Peri Peri Fries", desc: "Fiery peri peri dusting", price: 99, img: "/images/fries.jpg", tag: "Bestseller" },
      { name: "Cheesy Fries", desc: "Loaded with warm cheese sauce", price: 119, img: "/images/fries.jpg" },
    ],
  },
  {
    id: "momos",
    label: "Momos",
    emoji: "🥟",
    items: [
      { name: "Steamed Veg Momos", desc: "8 pcs with fiery red chutney", price: 79, img: "/images/momos.jpg", tag: "Bestseller" },
      { name: "Fried Veg Momos", desc: "Crisp golden fried momos", price: 99, img: "/images/momos.jpg" },
      { name: "Cheese Momos", desc: "Molten cheese core, steamed", price: 119, img: "/images/momos.jpg" },
      { name: "Tandoori Momos", desc: "Char-grilled with smoky marinade", price: 139, img: "/images/momos.jpg", tag: "Signature" },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    emoji: "🍫",
    items: [
      { name: "Sizzling Brownie", desc: "Warm brownie, ice cream, hot chocolate pour", price: 149, img: "/images/brownie.jpg", tag: "Signature" },
      { name: "Choco Mud Bowl", desc: "Thick chocolate mud with crunch", price: 129, img: "/images/brownie.jpg" },
      { name: "Ice Cream Scoops", desc: "3 scoops, nuts & syrup", price: 79, img: "/images/icecream.jpg", tag: "Value" },
      { name: "Royal Sundae", desc: "Layered sundae with wafer & drizzle", price: 119, img: "/images/icecream.jpg" },
    ],
  },
  {
    id: "beverages",
    label: "Beverages",
    emoji: "🥤",
    items: [
      { name: "Iced Cold Coffee", desc: "Whipped cream & chocolate drizzle", price: 110, img: "/images/coldcoffee.jpg", tag: "Bestseller" },
      { name: "Virgin Mojito", desc: "Mint, lime & crushed ice", price: 90, img: "/images/mojito.jpg" },
      { name: "Chocolate Shake", desc: "Thick shake, chocolate loaded", price: 120, img: "/images/lassi-chocolate.jpg" },
      { name: "Rose Milk", desc: "Chilled rose-flavored milk", price: 60, img: "/images/lassi-strawberry.jpg", tag: "Value" },
    ],
  },
];

export const FEATURED = [
  {
    id: "royal-lassi",
    kicker: "The Crown Jewel",
    name: "Royal Lassi",
    desc: "Thick creamy lassi crowned with saffron, almonds, cashews and a gold drizzle. Kopargaon's favourite celebration in a glass.",
    price: 140,
    img: "/images/lassi-royal.jpg",
  },
  {
    id: "classic-burger",
    kicker: "Crowd Favourite",
    name: "Classic Burger",
    desc: "Crispy, juicy, flavourful — the perfect bite. A golden patty, molten cheese and our secret sauce in a toasted sesame bun.",
    price: 109,
    img: "/images/burger.jpg",
  },
  {
    id: "veggie-pizza",
    kicker: "Fresh From The Oven",
    name: "Veggie Loaded Pizza",
    desc: "Stretchy mozzarella over capsicum, onion and sweet corn — baked till the edges turn golden and the cheese bubbles.",
    price: 199,
    img: "/images/pizza.jpg",
  },
] as const;

export const SPECIALS = [
  {
    title: "Burger Pay Day",
    desc: "Any Classic Burger + Salted Fries combo at a steal price. Walk in, grab, repeat.",
    offer: "Combo @ ₹149",
    emoji: "🍔",
    accent: "from-brand-600 to-brand-500",
  },
  {
    title: "Lassi O'Clock",
    desc: "Buy any Royal Lassi and get a Sweet Lassi at half price. Between 12–4 PM, every day.",
    offer: "2nd Lassi 50% OFF",
    emoji: "🥤",
    accent: "from-brand-700 to-brand-600",
  },
  {
    title: "Momos Monday",
    desc: "Every Monday, steamed momos plates go 2 for 1. Bring your gang.",
    offer: "2 × 1",
    emoji: "🥟",
    accent: "from-plum-700 to-brand-700",
  },
] as const;
