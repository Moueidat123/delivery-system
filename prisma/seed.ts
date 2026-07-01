import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function serial(prefix = "DLV") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // Drivers (your delivery team)
  const omar = await prisma.driver.create({
    data: { name: "Omar Haddad", phone: "+961 70 111 222" },
  });
  const lina = await prisma.driver.create({
    data: { name: "Lina Aziz", phone: "+961 71 333 444" },
  });
  const driverless = null;

  const samples = [
    {
      productName: "Wireless Headphones",
      buyerName: "Karim Nassar",
      buyerPhone: "+961 76 555 010",
      city: "Beirut",
      address: "Hamra St, Building 12",
      price: 45,
      deliveryPrice: 5,
      driverGain: 3,
      status: "DELIVERED" as const,
      driverId: omar.id,
      deliveredAt: new Date(),
    },
    {
      productName: "Smart Watch",
      buyerName: "Rania Fares",
      buyerPhone: "+961 78 555 020",
      city: "Tripoli",
      address: "Mina Road, near the port",
      price: 80,
      deliveryPrice: 6,
      driverGain: 4,
      status: "PENDING" as const,
      driverId: lina.id,
    },
    {
      productName: "Bluetooth Speaker",
      buyerName: "Sami Khoury",
      buyerPhone: "+961 79 555 030",
      city: "Saida",
      address: "Old City entrance",
      price: 35,
      deliveryPrice: 5,
      driverGain: 3,
      status: "CANCELLED" as const,
      driverId: omar.id,
      deliveredAt: new Date(),
    },
    {
      productName: "Phone Charger",
      buyerName: "Nour Ammar",
      buyerPhone: "+961 70 555 040",
      city: "Beirut",
      address: "Achrafieh, Sassine Square",
      price: 12,
      deliveryPrice: 4,
      driverGain: 2,
      status: "PENDING" as const,
      driverId: driverless,
    },
  ];

  for (const s of samples) {
    await prisma.delivery.create({
      data: {
        serialNumber: serial(),
        totalPrice: s.price + s.deliveryPrice,
        ...s,
      },
    });
  }

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
