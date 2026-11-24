import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import bcrypt from "bcryptjs";

export async function seedUsers() {
  const userRepository = AppDataSource.getRepository(User);
  const roleRepository = AppDataSource.getRepository(Role);

  // Get the Admin role
  const adminRole = await roleRepository.findOne({ where: { name: "Admin" } });

  if (!adminRole) {
    console.log("❌ Admin role not found. Please run role seeder first.");
    return;
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);

  const users = [
    {
      fullname: "Administrator",
      username: "admin",
      password: hashedPassword,
      email: "admin@bakerandco.ae",
      phone: "1234567890",
      roleId: adminRole.id,
      isActive: true,
      createdBy: "system",
    },
  ];

  console.log("📝 Seeding Users...");

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { username: userData.username },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`  ✓ Created user: ${userData.username}`);
      console.log(`  🔐 Password hashed with bcrypt`);
    } else {
      console.log(`  ⊘ User already exists: ${userData.username}`);
    }
  }

  console.log("✅ Users seeding completed\n");
  console.log("⚠️  NOTE: Default password is 'admin123'. Please change it in production!");
}