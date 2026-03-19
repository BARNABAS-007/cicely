import { MenuCategory } from '../types';

export const menuData: MenuCategory[] = [
  {
    title: 'Soups',
    category: 'Soups',
    items: [
      { name: 'Tomato Soup', price: '₹159', description: 'Rich, creamy tomato reduction finished with a hint of roasted garlic and basil.', image: 'https://images.unsplash.com/photo-1547592166-23ac45744cd4?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cream of Broccoli', price: '₹189', description: 'A velvety blend of fresh broccoli florets, fresh cream, and sharp cheddar dust.', image: 'https://images.unsplash.com/photo-1620189507195-68309c04c4d0?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cream of Mushroom', price: '₹179', description: 'Earthy button mushrooms infused into a thick buttery broth bursting with flavour.', image: 'https://images.unsplash.com/photo-1548943487-a2e4142f4fd4?auto=format&fit=crop&q=80&w=400' },
      { name: 'Egg White Soup', price: '₹179', description: 'A light, high-protein broth laced with delicate egg white ribbons and soft herbs.', image: 'https://images.unsplash.com/photo-1614088929962-d2f6fb39f20f?auto=format&fit=crop&q=80&w=400' },
      { name: 'Roasted Pepper Chicken', price: '₹189 / ₹199 / ₹209', description: 'A fiery roasted bell pepper broth featuring tender pulled chicken chunks.', image: 'https://images.unsplash.com/photo-1603105037880-8ea2cbc4ce45?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cream of Chicken', price: '₹199', description: 'The ultimate comfort soup, marrying diced chicken breast with heavy seasoned cream.', image: 'https://images.unsplash.com/photo-1603105037880-8ea2cbc4ce45?auto=format&fit=crop&q=80&w=400' },
    ],
  },
  {
    title: 'Salads',
    category: 'Salads',
    items: [
      { name: 'Caesar Salad', price: '₹299 / ₹349', description: 'Crisp romaine lettuce, crunchy croutons, and parmesan shavings tossed in our signature sauce.', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=400' },
      { name: 'Lebanese Fattoush Salad', price: '₹329', description: 'A refreshing Levantine mixed greens salad topped with crispy fried khubz flatbread.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cajun Chicken Salad', price: '₹349', description: 'Spicy blackened Cajun chicken sliced over a vibrant bed of farm-fresh Mediterranean greens.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400' },
    ],
  },
  {
    title: 'Appetizers',
    category: 'Appetizers',
    items: [
      { name: 'Water Chestnut Roll', price: '₹229', description: 'Crispy fried golden rolls stuffed with crunchy water chestnuts and spring onions.', image: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&q=80&w=400' },
      { name: 'Jalapeno Poppers', price: '₹269', description: 'Crunchy battered jalapenos bursting with molten cheese and savory spices.', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=400' },
      { name: 'Italian Bruschetta', price: '₹249', description: 'Toasted artisan baguette slices topped with ripe tomatoes, fresh basil, and virgin olive oil.', image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&q=80&w=400' },
      { name: 'Tacos', price: '₹199 / ₹229', description: 'Hard shell tortillas packed with Mexican seasoning, sour cream, and fresh pico de gallo.', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=400' },
    ],
  },
  {
    title: 'Rice & Noodles',
    category: 'Rice & Noodles',
    items: [
      { name: 'Avakaya Fried Rice', price: '₹279 / ₹319', description: 'A local twist on classic wokh-tossed rice, infused with tangy and spicy Andhra mango pickle.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400' },
      { name: 'Bezawada Fried Rice', price: '₹279 / ₹319', description: 'Our signature spicy street-style fried rice bringing the true heat of Vijayawada.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400' },
      { name: 'Fried Rice', price: '₹249 / ₹289', description: 'Classic wok-tossed long-grain rice with crunchy farm vegetables and light soy.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400' },
      { name: 'Schezwan Fried Rice', price: '₹259 / ₹299', description: 'Spicy, fiery wok rice tossed in bold red Schezwan chili pepper paste.', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400' },
      { name: 'Butter Garlic Fried Rice', price: '₹259 / ₹299', description: 'Aromatic fried rice glazed in butter with prominent hits of roasted garlic.', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=400' },
      { name: 'Korean Gochujang Fried Rice', price: '₹289 / ₹309 / ₹329', description: 'Sweet, spicy, and savory rice tossed with fermented Korean chili paste and sesame oil.', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=400' },
      { name: 'Bezawada Noodles', price: '₹279 / ₹319', description: 'Spicy street-style hakka noodles charged with intense South-Indian chili heat.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400' },
      { name: 'Soft Noodles', price: '₹249 / ₹289', description: 'Lightly seasoned smooth ribbon noodles tossed with crisp mixed vegetables.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400' },
      { name: 'Butter Garlic Noodles', price: '₹259 / ₹299', description: 'Silky smooth ribbon noodles pan-tossed in a rich blanket of garlic-infused butter.', image: 'https://images.unsplash.com/photo-1626804475297-41609ea064eb?auto=format&fit=crop&q=80&w=400' },
      { name: 'Mie Goreng Noodles', price: '₹269 / ₹309', description: 'Indonesian style sweet & spicy fried noodles packed with explosive umami flavour.', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400' },
      { name: 'Schezwan Noodles', price: '₹259 / ₹299', description: 'Fiery chili noodles wok-tossed with our house-made spicy red pepper sauce.', image: 'https://images.unsplash.com/photo-1626804475297-41609ea064eb?auto=format&fit=crop&q=80&w=400' },
    ],
  },
  {
    title: 'Pizza',
    category: 'Pizza',
    items: [
      { name: 'Fantasia', price: '₹309 / ₹399 / ₹499', description: 'Our house-special signature pizza overloaded with premium toppings and exotic cheeses.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
      { name: 'Margherita', price: '₹299 / ₹379 / ₹469', description: 'The absolute classic. Hand-tossed dough, San Marzano tomatoes, and fresh mozzarella.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400' },
      { name: 'Spicy Jalapeno', price: '₹309 / ₹399 / ₹499', description: 'A fiery flatbread blanketed in melting cheese and aggressive green jalapeno slices.', image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cicelia Mushroom', price: '₹309 / ₹399 / ₹499', description: 'Gourmet earthy mushrooms layered thick over a rich white garlic sauce base.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
      { name: 'Peri Peri', price: '₹309 / ₹399 / ₹499', description: 'Tangy, spicy African birdseye chili sauce covering tender marinated toppings.', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=400' },
      { name: 'Makhani', price: '₹309 / ₹399 / ₹499', description: 'A beautiful Indian fusion featuring rich, creamy, buttery tomato makhani sauce.', image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=400' },
      { name: 'Keema', price: '₹309 / ₹399 / ₹499', description: 'Spiced minced meat scattered heavily across a thick mozzarella crust.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
      { name: 'BBQ', price: '₹309 / ₹399 / ₹499', description: 'Smoky, sweet barbecue reduction drizzled thickly over a wood-fired cheese base.', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400' },
      { name: 'Schezwan', price: '₹309 / ₹399 / ₹499', description: 'An Indo-Chinese fusion hitting heavy with spicy red Schezwan pepper sauce.', image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&q=80&w=400' },
      { name: 'Street Style', price: '₹309 / ₹399 / ₹499', description: 'An authentically spiced Indian flatbread bringing bold local street flavours.', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400' },
    ],
  },
  {
    title: 'Pastas',
    category: 'Pastas',
    items: [
      { name: 'Alfredo', price: '₹339 / ₹369', description: 'Fettuccine smothered in our deeply rich, garlic-parmesan cream sauce.', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&q=80&w=400' },
      { name: 'Arrabbiata', price: '₹339 / ₹369', description: 'Penne tossed in a seriously spicy, slow-simmered crushed tomato sauce.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400' },
      { name: 'Pink Pasta', price: '₹339 / ₹369', description: 'A perfect marriage of spicy tomato arrabbiata and rich, creamy parmesan alfredo.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cicely Pink Pasta', price: '₹379 / ₹399', description: 'Our signature house-specialty pink sauce folded gracefully with premium herbs.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400' },
      { name: 'Basil Pesto', price: '₹369 / ₹399', description: 'Draped in a bright, herbaceous sauce of crushed fresh basil, pine nuts, and pecorino.', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400' },
      { name: 'Aglio Olio', price: '₹369 / ₹399', description: 'Classic rustic spaghetti glossed with garlic-infused virgin olive oil and red chili flakes.', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=400' },
      { name: 'Mac & Cheese', price: '₹369 / ₹399', description: 'The ultimate golden, bubbling cast-iron baked macaroni coated in five distinct cheeses.', image: 'https://images.unsplash.com/photo-1612871689353-cccf581d667b?auto=format&fit=crop&q=80&w=400' },
    ],
  },
  {
    title: 'Burgers',
    category: 'Burgers',
    items: [
      { name: 'Veg Cheese Burger', price: '₹229', description: 'A massive crispy vegetable patty layered with melted cheese and crisp lettuce.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400' },
      { name: 'Paneer Chilli Burger', price: '₹229', description: 'Spicy wok-tossed Paneer chunks enclosed in a soft toasted sesame bun.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=400' },
      { name: 'Grilled Chicken Burger', price: '₹249', description: 'Juicy flame-grilled chicken breast stacked with fresh tomatoes and house mayo.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
      { name: 'Crispy Crunchy Burger', price: '₹269 / ₹299', description: 'A towering double-fried panko-crusted patty delivering ultimate texture and crunch.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400' },
      { name: 'Korean Chicken Burger', price: '₹269', description: 'Crispy fried chicken thigh dipped in sweet and sticky spicy Korean soy glaze.', image: 'https://images.unsplash.com/photo-1615719417533-3d9061cdeab8?auto=format&fit=crop&q=80&w=400' },
    ],
  },
  {
    title: 'Special Dishes',
    category: 'Special Dishes',
    items: [
      { name: 'Veg Lasagna', price: '₹399', description: 'Towering sheets of artisanal pasta layered with vegetables and bubbling mozzarella.', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=400' },
      { name: 'Chicken Lasagna', price: '₹449', description: 'Towering layers of artisanal pasta sheets, spiced minced chicken, and bubbling mozzarella.', image: 'https://images.unsplash.com/photo-1619881589316-56c7f9e61db1?auto=format&fit=crop&q=80&w=400' },
      { name: 'Mixed Veg Risotto', price: '₹379', description: 'Creamy slow-cooked Arborio rice folded with fresh seasonal garden vegetables.', image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b3?auto=format&fit=crop&q=80&w=400' },
      { name: 'Sambar Risotto', price: '₹349 / ₹399', description: 'A brilliant South-Indian fusion merging creamy Italian rice techniques with spicy lentil broth.', image: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?auto=format&fit=crop&q=80&w=400' },
      { name: 'Cicely Special Risotto', price: '₹379 / ₹429', description: 'Our decadent signature house-risotto topped with exotic imported herbs and cheese.', image: 'https://images.unsplash.com/photo-1633504581786-316c8002b1b3?auto=format&fit=crop&q=80&w=400' },
    ],
  },
];
