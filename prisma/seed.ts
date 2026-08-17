import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Online Food Ordering System database...');

  // 1. Clean existing records
  await prisma.notification.deleteMany({});
  await prisma.complaint.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.delivery.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.restaurant.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Core Users for each role
  const customer = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'customer@example.com',
      passwordHash,
      role: 'CUSTOMER',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Sector 4, Metropolis',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  const restaurantStaff = await prisma.user.create({
    data: {
      name: 'Chef Marco Rossi',
      email: 'staff@bellaitalia.com',
      passwordHash,
      role: 'RESTAURANT_STAFF',
      phone: '+1 (555) 876-5432',
      address: '12 Little Italy Lane, Metropolis',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
    },
  });

  const deliveryPartner = await prisma.user.create({
    data: {
      name: 'David Miller',
      email: 'driver@example.com',
      passwordHash,
      role: 'DELIVERY_PARTNER',
      phone: '+1 (555) 345-6789',
      address: '88 Speed Way, Hub 2, Metropolis',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Admin)',
      email: 'admin@fooddelivery.com',
      passwordHash,
      role: 'ADMIN',
      phone: '+1 (555) 999-0000',
      address: 'Platform HQ, Metropolis Tech Park',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  console.log('Created Demo Users (password: password123):');
  console.log('- Customer: customer@example.com');
  console.log('- Restaurant Staff: staff@bellaitalia.com');
  console.log('- Delivery Partner: driver@example.com');
  console.log('- Administrator: admin@fooddelivery.com');

  // 3. Create Restaurants
  const rest1 = await prisma.restaurant.create({
    data: {
      name: 'Bella Italia Trattoria',
      description: 'Authentic stone-baked woodfired pizzas, handmade pasta, and classic Italian desserts made fresh daily.',
      address: '14 Piazza Romano, Downtown Metropolis',
      city: 'Metropolis',
      cuisineType: 'Italian',
      rating: 4.8,
      ratingCount: 342,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
      bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200',
      isOpen: true,
      deliveryFee: 3.99,
      minOrder: 15.0,
      deliveryTime: '25-35 mins',
      lat: 28.6139,
      lng: 77.2090,
      ownerId: restaurantStaff.id,
    },
  });

  const rest2 = await prisma.restaurant.create({
    data: {
      name: 'Spice Symphony',
      description: 'Rich aromatic royal biryanis, creamy butter chicken, freshly baked garlic naan, and spiced curries.',
      address: '88 Curry Crescent, East Metropolis',
      city: 'Metropolis',
      cuisineType: 'Indian',
      rating: 4.7,
      ratingCount: 512,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600',
      bannerImage: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?w=1200',
      isOpen: true,
      deliveryFee: 2.99,
      minOrder: 18.0,
      deliveryTime: '30-40 mins',
      lat: 28.6250,
      lng: 77.2180,
    },
  });

  const rest3 = await prisma.restaurant.create({
    data: {
      name: 'Tokyo Ramen & Sushi Bar',
      description: 'Slow-simmered rich tonkotsu broth, handcrafted noodles, premium salmon sashimi, and crispy gyoza.',
      address: '204 Shibuya Way, Midtown Metropolis',
      city: 'Metropolis',
      cuisineType: 'Japanese',
      rating: 4.9,
      ratingCount: 620,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
      bannerImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200',
      isOpen: true,
      deliveryFee: 4.50,
      minOrder: 20.0,
      deliveryTime: '20-30 mins',
      lat: 28.6080,
      lng: 77.1950,
    },
  });

  const rest4 = await prisma.restaurant.create({
    data: {
      name: 'The Burger Forge',
      description: 'Smash Angus beef patties, melted cheddar, brioche buns, loaded seasoned truffle fries, and thick shakes.',
      address: '55 Grill Avenue, Metropolis West',
      city: 'Metropolis',
      cuisineType: 'Burgers',
      rating: 4.6,
      ratingCount: 428,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      bannerImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200',
      isOpen: true,
      deliveryFee: 3.49,
      minOrder: 12.0,
      deliveryTime: '15-25 mins',
      lat: 28.6300,
      lng: 77.2250,
    },
  });

  const rest5 = await prisma.restaurant.create({
    data: {
      name: 'Green Garden Harvest',
      description: 'Superfood grain bowls, organic crisp farm salads, cold-pressed smoothies, and plant-based nourishment.',
      address: '9 Organic Boulevard, Uptown Metropolis',
      city: 'Metropolis',
      cuisineType: 'Healthy & Vegan',
      rating: 4.8,
      ratingCount: 290,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
      bannerImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200',
      isOpen: true,
      deliveryFee: 2.99,
      minOrder: 15.0,
      deliveryTime: '20-30 mins',
      lat: 28.6010,
      lng: 77.2100,
    },
  });

  const rest6 = await prisma.restaurant.create({
    data: {
      name: 'Taco Fiesta Cantina',
      description: 'Street-style corn tacos, slow-braised carnitas, sizzling fajitas, guacamole with fresh tortilla chips.',
      address: '77 Sonora Street, Metropolis South',
      city: 'Metropolis',
      cuisineType: 'Mexican',
      rating: 4.5,
      ratingCount: 310,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
      bannerImage: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200',
      isOpen: true,
      deliveryFee: 3.99,
      minOrder: 14.0,
      deliveryTime: '25-35 mins',
      lat: 28.5950,
      lng: 77.2020,
    },
  });

  // 4. Create Menu Items
  // Bella Italia
  const m1 = await prisma.menuItem.create({
    data: {
      restaurantId: rest1.id,
      name: 'Margherita Burrata Pizza',
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, extra virgin olive oil on hand-stretched sourdough crust.',
      price: 14.99,
      category: 'Pizzas',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
      isVeg: true,
      calories: 780,
      prepTime: '20 mins',
    },
  });

  const m2 = await prisma.menuItem.create({
    data: {
      restaurantId: rest1.id,
      name: 'Truffle Mushroom Fettuccine',
      description: 'Fresh egg pasta tossed with wild forest mushrooms, black truffle butter, and aged Parmigiano Reggiano.',
      price: 16.50,
      category: 'Pastas',
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=500',
      isVeg: true,
      calories: 650,
      prepTime: '15 mins',
    },
  });

  const m3 = await prisma.menuItem.create({
    data: {
      restaurantId: rest1.id,
      name: 'Diavola Spicy Salami Pizza',
      description: 'Spicy Calabrian salami, smoked provolone, chili-infused honey, and oregano on crispy crust.',
      price: 16.99,
      category: 'Pizzas',
      imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500',
      isVeg: false,
      calories: 860,
      prepTime: '20 mins',
    },
  });

  const m4 = await prisma.menuItem.create({
    data: {
      restaurantId: rest1.id,
      name: 'Classic Espresso Tiramisu',
      description: 'Savoiardi ladyfingers soaked in dark roast espresso and Marsala, layered with whipped mascarpone cream.',
      price: 7.99,
      category: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
      isVeg: true,
      calories: 420,
      prepTime: '5 mins',
    },
  });

  // Spice Symphony
  const m5 = await prisma.menuItem.create({
    data: {
      restaurantId: rest2.id,
      name: 'Hyderabadi Dum Chicken Biryani',
      description: 'Fragrant long-grain basmati rice cooked on slow dum with spiced marinated chicken, saffron, and fried onions. Served with raita.',
      price: 15.99,
      category: 'Biryani',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
      isVeg: false,
      calories: 890,
      prepTime: '25 mins',
    },
  });

  const m6 = await prisma.menuItem.create({
    data: {
      restaurantId: rest2.id,
      name: 'Paneer Butter Masala & Garlic Naan',
      description: 'Cottage cheese cubes simmered in a velvety tomato, butter, and cashew gravy. Served with 2 pieces of tandoori garlic naan.',
      price: 13.99,
      category: 'Mains',
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
      isVeg: true,
      calories: 720,
      prepTime: '20 mins',
    },
  });

  // Tokyo Ramen
  const m7 = await prisma.menuItem.create({
    data: {
      restaurantId: rest3.id,
      name: 'Tonkotsu Chashu Ramen',
      description: 'Rich 16-hour pork bone broth, tender braised chashu pork belly, ajitsuke tamago egg, nori, bamboo shoots, and scallions.',
      price: 15.50,
      category: 'Ramen',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
      isVeg: false,
      calories: 740,
      prepTime: '15 mins',
    },
  });

  const m8 = await prisma.menuItem.create({
    data: {
      restaurantId: rest3.id,
      name: 'Salmon & Avocado Dragon Roll',
      description: '8 pieces of tempura roll topped with fresh Atlantic salmon, sliced avocado, spicy mayo, unagi sauce, and tobiko.',
      price: 14.25,
      category: 'Sushi',
      imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500',
      isVeg: false,
      calories: 520,
      prepTime: '15 mins',
    },
  });

  // Burger Forge
  const m9 = await prisma.menuItem.create({
    data: {
      restaurantId: rest4.id,
      name: 'Double Smash Bacon Cheeseburger',
      description: 'Two crispy-edged Angus smash patties, smoked bacon, double American cheese, caramelized onions, and secret forge sauce.',
      price: 12.99,
      category: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      isVeg: false,
      calories: 910,
      prepTime: '15 mins',
    },
  });

  const m10 = await prisma.menuItem.create({
    data: {
      restaurantId: rest4.id,
      name: 'Parmesan Truffle Fries',
      description: 'Golden crispy skin-on fries tossed in white truffle oil, shaved aged parmesan, and fresh rosemary with garlic aioli.',
      price: 5.99,
      category: 'Sides',
      imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
      isVeg: true,
      calories: 450,
      prepTime: '10 mins',
    },
  });

  // Green Garden
  const m11 = await prisma.menuItem.create({
    data: {
      restaurantId: rest5.id,
      name: 'Mediterranean Quinoa Power Bowl',
      description: 'Organic tricolor quinoa, roasted chickpeas, kalamata olives, cucumber, cherry tomatoes, avocado, and tahini lemon dressing.',
      price: 11.99,
      category: 'Bowls',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500',
      isVeg: true,
      calories: 480,
      prepTime: '10 mins',
    },
  });

  // Taco Fiesta
  const m12 = await prisma.menuItem.create({
    data: {
      restaurantId: rest6.id,
      name: 'Birria Beef Tacos (Trio)',
      description: 'Three crispy griddled corn tortillas filled with slow-stewed spiced beef and melted Oaxaca cheese, served with rich consommé broth.',
      price: 13.50,
      category: 'Tacos',
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
      isVeg: false,
      calories: 690,
      prepTime: '15 mins',
    },
  });

  // 5. Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'FEAST20',
        description: '20% discount on all orders above $25 (Max $10 off)',
        discountPercent: 20,
        maxDiscount: 10.0,
        minOrderValue: 25.0,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageCount: 45,
      },
      {
        code: 'WELCOME50',
        description: '50% mega discount on your first order above $20 (Max $15 off)',
        discountPercent: 50,
        maxDiscount: 15.0,
        minOrderValue: 20.0,
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageCount: 128,
      },
      {
        code: 'FREESHIP',
        description: 'Free delivery on orders above $15',
        discountPercent: 100,
        maxDiscount: 5.0,
        minOrderValue: 15.0,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true,
        usageCount: 89,
      },
    ],
  });

  // 6. Create Demo Order & Payment & Delivery
  const demoOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-98421',
      customerId: customer.id,
      restaurantId: rest1.id,
      deliveryPartnerId: deliveryPartner.id,
      status: 'OUT_FOR_DELIVERY',
      subtotal: 31.49,
      tax: 1.57,
      deliveryFee: 3.99,
      discount: 6.30,
      totalAmount: 30.75,
      deliveryAddress: '742 Evergreen Terrace, Sector 4, Metropolis',
      customerPhone: '+1 (555) 234-5678',
      specialInstructions: 'Please leave at the door and ring the doorbell once.',
      orderItems: {
        create: [
          {
            menuItemId: m1.id,
            name: m1.name,
            price: m1.price,
            quantity: 1,
          },
          {
            menuItemId: m2.id,
            name: m2.name,
            price: m2.price,
            quantity: 1,
          },
        ],
      },
      payment: {
        create: {
          method: 'UPI',
          status: 'COMPLETED',
          transactionId: 'TXN_DEMO_UPI_889912',
          amount: 30.75,
          gatewayResponse: JSON.stringify({ status: 'SUCCESS', method: 'UPI' }),
        },
      },
      delivery: {
        create: {
          deliveryPartnerId: deliveryPartner.id,
          deliveryStatus: 'OUT_FOR_DELIVERY',
          pickupTime: new Date(Date.now() - 10 * 60 * 1000),
          estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000),
          restaurantLat: rest1.lat,
          restaurantLng: rest1.lng,
          customerLat: 28.6180,
          customerLng: 77.2150,
          currentLat: 28.6155,
          currentLng: 77.2115,
          deliveryNotes: 'Driver picked up food and is on way via Main Expressway.',
        },
      },
    },
  });

  // 7. Create Demo Reviews
  await prisma.review.createMany({
    data: [
      {
        userId: customer.id,
        restaurantId: rest1.id,
        orderId: demoOrder.id,
        rating: 5,
        comment: 'Absolutely spectacular pizza! Arrived hot and crust was perfectly crispy.',
      },
      {
        userId: customer.id,
        restaurantId: rest3.id,
        rating: 5,
        comment: 'Best ramen broth in the entire city. The chashu melts in your mouth!',
      },
    ],
  });

  // 8. Create Demo Notification & Complaint
  await prisma.notification.createMany({
    data: [
      {
        userId: customer.id,
        title: 'Order Out for Delivery! 🛵',
        message: 'David is on the way with your delicious meal from Bella Italia Trattoria.',
        type: 'DELIVERY',
        link: `/orders/${demoOrder.id}`,
      },
      {
        userId: restaurantStaff.id,
        title: 'New Order Received! 🔔',
        message: 'Order #ORD-98421 received for 2 items ($30.75).',
        type: 'ORDER',
        link: '/restaurant/dashboard',
      },
    ],
  });

  await prisma.complaint.create({
    data: {
      customerId: customer.id,
      orderId: demoOrder.id,
      subject: 'Cutlery was not included',
      description: 'We requested extra wooden cutlery in special instructions but did not receive any.',
      status: 'OPEN',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
