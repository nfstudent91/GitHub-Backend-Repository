import { AppDataSource } from "../config/database";
import { Role } from "../entities/Role";

export async function seedRoles() {
  const roleRepository = AppDataSource.getRepository(Role);

  const roles = [
    { name: "Admin", isActive: true, createdBy: "system" },
    { name: "Manager", isActive: true, createdBy: "system" },
    { name: "Advisor", isActive: true, createdBy: "system" },
    { name: "Telecaller", isActive: true, createdBy: "system" },
    { name: "Processing", isActive: true, createdBy: "system" },
  ];

  console.log("📝 Seeding Roles...");

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      const role = roleRepository.create(roleData);
      await roleRepository.save(role);
      console.log(`  ✓ Created role: ${roleData.name}`);
    } else {
      console.log(`  ⊘ Role already exists: ${roleData.name}`);
    }
  }

  console.log("✅ Roles seeding completed\n");
}

