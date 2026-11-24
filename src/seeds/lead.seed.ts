// import { AppDataSource } from "../config/database";
// import { Lead, LeadStatus } from "../entities/Lead";
// import { LeadAssignment } from "../entities/LeadAssignment";
// import { LeadAttempt } from "../entities/LeadAttempt";
// import { Stage } from "../entities/Stage";
// import { User } from "../entities/User";
// import { FollowUp } from "../entities/FollowUp";

// // Sample data arrays for generating realistic leads
// const firstNames = [
//   "John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Jessica",
//   "William", "Ashley", "James", "Amanda", "Richard", "Melissa", "Joseph", "Deborah",
//   "Thomas", "Stephanie", "Charles", "Rebecca", "Christopher", "Sharon", "Daniel", "Laura",
//   "Matthew", "Michelle", "Anthony", "Kimberly", "Mark", "Amy", "Donald", "Angela",
//   "Steven", "Brenda", "Paul", "Emma", "Andrew", "Olivia", "Joshua", "Cynthia",
//   "Kenneth", "Marie", "Kevin", "Janet", "Brian", "Catherine", "George", "Frances",
//   "Timothy", "Ann", "Ronald", "Samantha", "Jason", "Doris", "Edward", "Virginia",
//   "Jeffrey", "Rachel", "Ryan", "Carolyn", "Jacob", "Janet", "Gary", "Maria",
//   "Nicholas", "Heather", "Eric", "Diane", "Jonathan", "Julie", "Stephen", "Joyce",
//   "Larry", "Victoria", "Justin", "Kelly", "Scott", "Christina", "Brandon", "Joan",
//   "Benjamin", "Evelyn", "Samuel", "Judith", "Frank", "Megan", "Gregory", "Cheryl",
//   "Raymond", "Andrea", "Alexander", "Hannah", "Patrick", "Jacqueline", "Jack", "Martha"
// ];

// const lastNames = [
//   "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
//   "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor",
//   "Moore", "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Sanchez",
//   "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
//   "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams",
//   "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
//   "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards",
//   "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers",
//   "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey", "Reed", "Kelly",
//   "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson", "Watson", "Brooks",
//   "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes"
// ];

// const cities = [
//   "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio",
//   "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus",
//   "Charlotte", "San Francisco", "Indianapolis", "Seattle", "Denver", "Washington", "Boston",
//   "El Paso", "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas", "Memphis",
//   "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Sacramento",
//   "Kansas City", "Mesa", "Atlanta", "Omaha", "Colorado Springs", "Raleigh", "Virginia Beach",
//   "Miami", "Oakland", "Minneapolis", "Tulsa", "Cleveland", "Wichita", "Arlington"
// ];

// const positions = [
//   "Software Engineer", "Marketing Manager", "Sales Representative", "Project Manager",
//   "Business Analyst", "Accountant", "HR Manager", "Operations Manager", "Product Manager",
//   "Data Analyst", "Financial Advisor", "Consultant", "Designer", "Developer", "Architect",
//   "Engineer", "Director", "Coordinator", "Specialist", "Assistant", "Executive", "Supervisor",
//   "Administrator", "Technician", "Analyst", "Officer", "Associate", "Lead", "Senior Manager"
// ];

// const companies = [
//   "TechCorp", "Global Solutions", "Innovate Inc", "Digital Dynamics", "Future Systems",
//   "Smart Solutions", "NextGen Technologies", "Prime Services", "Elite Group", "Apex Corp",
//   "Summit Industries", "Pinnacle Solutions", "Vertex Enterprises", "Nexus Corporation",
//   "Catalyst Group", "Momentum Inc", "Velocity Systems", "Synergy Corp", "Horizon Tech",
//   "Stellar Solutions", "Quantum Industries", "Infinity Corp", "Zenith Systems", "Aurora Group"
// ];

// const adNames = [
//   "Google Ad Campaign 2024", "Facebook Lead Gen", "LinkedIn Professional", "Instagram Promo",
//   "Twitter Campaign", "YouTube Ad", "Bing Search Ad", "Display Network", "Retargeting Campaign",
//   "Email Marketing", "Newsletter Signup", "Landing Page Form", "Referral Program", "Partner Ad",
//   "Social Media Boost", "Content Marketing", "SEO Organic", "PPC Campaign", "Video Ad Campaign"
// ];

// const applyingFor = [
//   "Business Loan", "Personal Loan", "Mortgage", "Credit Card", "Investment Plan",
//   "Insurance Policy", "Savings Account", "Retirement Plan", "Education Fund", "Home Loan"
// ];

// const remarks = [
//   "Interested in learning more", "Requested callback", "Needs more information",
//   "Follow up required", "Very interested", "Considering options", "Price sensitive",
//   "Urgent requirement", "Looking for best deal", "Comparing offers", "Ready to proceed",
//   "Needs consultation", "Wants to schedule meeting", "Requested documentation",
//   "Follow up after review", "Interested in premium option", "Budget conscious",
//   "Quick decision maker", "Needs time to think", "Referred by friend", "Saw advertisement"
// ];

// function getRandomElement<T>(array: T[]): T {
//   return array[Math.floor(Math.random() * array.length)];
// }

// function getRandomElements<T>(array: T[], count: number): T[] {
//   const shuffled = [...array].sort(() => 0.5 - Math.random());
//   return shuffled.slice(0, count);
// }

// function generateEmail(firstName: string, lastName: string, index: number): string {
//   const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "company.com"];
//   const domain = getRandomElement(domains);
//   const randomNum = Math.floor(Math.random() * 10000);
//   const timestamp = Date.now().toString().slice(-6);
//   const variations = [
//     `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}${randomNum}`,
//     `${firstName.toLowerCase()}${lastName.toLowerCase()}${timestamp}`,
//     `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${index}`,
//     `${firstName.toLowerCase()}${randomNum}${index}`,
//   ];
//   return `${getRandomElement(variations)}@${domain}`;
// }

// function generatePhone(): string {
//   const areaCode = Math.floor(Math.random() * 900) + 100;
//   const exchange = Math.floor(Math.random() * 900) + 100;
//   const number = Math.floor(Math.random() * 10000);
//   return `${areaCode}${exchange}${number.toString().padStart(4, "0")}`;
// }

// function generateDate(daysAgo: number = 0): string {
//   const date = new Date();
//   date.setDate(date.getDate() - daysAgo);
//   return date.toISOString().split("T")[0];
// }

// export async function seedLeads() {
//   const leadRepository = AppDataSource.getRepository(Lead);
//   const assignmentRepository = AppDataSource.getRepository(LeadAssignment);
//   const attemptRepository = AppDataSource.getRepository(LeadAttempt);
//   const stageRepository = AppDataSource.getRepository(Stage);
//   const userRepository = AppDataSource.getRepository(User);
//   const followUpRepository = AppDataSource.getRepository(FollowUp);

//   // Get existing stages, users, and follow-ups
//   const stages = await stageRepository.find({ where: { isActive: true } });
//   const users = await userRepository.find({ where: { isActive: true } });
//   const followUps = await followUpRepository.find({ where: { isActive: true } });

//   if (stages.length === 0) {
//     console.log("❌ No stages found. Please run stage seeder first.");
//     return;
//   }

//   if (users.length === 0) {
//     console.log("❌ No users found. Please run user seeder first.");
//     return;
//   }

//   if (followUps.length === 0) {
//     console.log("❌ No follow-ups found. Please run followUp seeder first.");
//     return;
//   }

//   console.log("📝 Seeding Leads...");

//   const numLeads = 100;
//   const createdLeads: Lead[] = [];

//   // Generate and create leads
//   for (let i = 0; i < numLeads; i++) {
//     const firstName = getRandomElement(firstNames);
//     const lastName = getRandomElement(lastNames);
//     const fullname = `${firstName} ${lastName}`;
//     const email = generateEmail(firstName, lastName, i);
//     const phone = generatePhone();

//     const formData = {
//       fullname,
//       email,
//       phone,
//       applying_for: getRandomElement(applyingFor),
//       city: getRandomElement(cities),
//       currentPosition: getRandomElement(positions),
//       leadDate: generateDate(Math.floor(Math.random() * 90)), // Random date within last 90 days
//       adName: getRandomElement(adNames),
//       monthlyIncome: Math.floor(Math.random() * 10000) + 2000, // 2000-12000
//       bankBalance: Math.floor(Math.random() * 50000) + 5000, // 5000-55000
//       workPermit: Math.random() > 0.5,
//       companyName: getRandomElement(companies),
//       jobTitle: getRandomElement(positions),
//     };

//     const leadData = {
//       formData,
//       stageId: getRandomElement(stages).id,
//       status: getRandomElement([LeadStatus.HOT, LeadStatus.COLD, LeadStatus.DEAD]),
//       isActive: Math.random() > 0.1, // 90% active
//       createdBy: "seeder",
//     };

//     const lead = leadRepository.create(leadData);
//     const savedLead = await leadRepository.save(lead);
//     createdLeads.push(savedLead);

//     if ((i + 1) % 10 === 0) {
//       console.log(`  ✓ Created ${i + 1}/${numLeads} leads...`);
//     }
//   }

//   console.log(`✅ Created ${createdLeads.length} leads\n`);

//   // Create lead assignments
//   console.log("📝 Seeding Lead Assignments...");
//   let assignmentCount = 0;

//   for (const lead of createdLeads) {
//     // Each lead can have 1-3 assignments
//     const numAssignments = Math.floor(Math.random() * 3) + 1;

//     for (let j = 0; j < numAssignments; j++) {
//       const assignedTo = getRandomElement(users).id;
//       const assignedBy = getRandomElement(users).id;

//       const assignmentData = {
//         leadId: lead.id,
//         assignedTo,
//         assignedBy,
//         remarks: getRandomElement(remarks),
//         createdBy: "seeder",
//       };

//       const assignment = assignmentRepository.create(assignmentData);
//       await assignmentRepository.save(assignment);
//       assignmentCount++;
//     }
//   }

//   console.log(`✅ Created ${assignmentCount} lead assignments\n`);

//   // Create lead attempts
//   console.log("📝 Seeding Lead Attempts...");
//   let attemptCount = 0;

//   for (const lead of createdLeads) {
//     // Each lead can have 1-5 attempts
//     const numAttempts = Math.floor(Math.random() * 5) + 1;

//     for (let k = 0; k < numAttempts; k++) {
//       const followTypeId = getRandomElement(followUps).id;

//       const attemptData = {
//         leadId: lead.id,
//         followTypeId,
//         remarks: getRandomElement(remarks),
//         createdBy: "seeder",
//       };

//       const attempt = attemptRepository.create(attemptData);
//       await attemptRepository.save(attempt);
//       attemptCount++;
//     }
//   }

//   console.log(`✅ Created ${attemptCount} lead attempts\n`);
//   console.log("✅ Lead seeding completed successfully!\n");
// }

