import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Co-opConnect database...');

  // Clear existing data
  const tables = [
    "Vote", "CooperativeProposal", "FraudAlert", "AuditLog", "SkillGapRecord", 
    "DemandForecast", "DemandHistory", "WelfareRecord", "InsuranceRecord", 
    "TrainingRecord", "WorkerEarning", "JobTeamMember", "JobTeam", "HelperRequest", 
    "JobReferral", "JobProof", "MaterialRequest", "InvoiceItem", "Invoice", 
    "Payment", "Warranty", "Complaint", "Rating", "TrustedWorker", 
    "BookingStatusHistory", "Booking", "ServiceRequest", "Message", "Notification", 
    "PortfolioItem", "WorkerCertification", "WorkerSkill", "WorkerAvailability", 
    "SharedWorkforceRequest", "MatchingWeights", "MaintenanceContract", 
    "SocietyServiceRequest", "InstitutionServiceRequest", "OrganizationLocation", 
    "InstitutionContract", "CooperativeAdmin", "FederationAdmin", "SocietyAdmin", 
    "InstitutionalCustomer", "Worker", "Customer", "HousingSociety", "Institution", 
    "Cooperative", "Federation", "PasswordResetToken", "User"
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}" WHERE id LIKE 'demo-%'`);
  }
  // Note: ServiceCategory, Skill, and Certification are preserved as core data.

  const passwordHash = await bcrypt.hash('[REDACTED]', 10);

  // ============================================================
  // FEDERATION
  // ============================================================
  const federation = await prisma.federation.create({
    data: {
      id: 'demo-fed-1',
      name: 'Gujarat Cooperative Services Federation',
      description: 'Federation of cooperative societies providing household and community services across Gujarat',
    },
  });

  // ============================================================
  // COOPERATIVES
  // ============================================================
  const cooperatives = await Promise.all([
    prisma.cooperative.create({
      data: {
        id: 'demo-coop-1',
        name: 'Ahmedabad Home Services Cooperative',
        registrationNo: 'GJ/AHM/COOP/2022/1001',
        address: 'Paldi, Ahmedabad',
        city: 'Ahmedabad',
        state: 'Gujarat',
        latitude: 23.0225,
        longitude: 72.5714,
        established: new Date('2022-01-15'),
        description: 'Premier cooperative for electricians, plumbers, and AC technicians in Ahmedabad',
        totalMembers: 15,
        federationId: federation.id,
      },
    }),
    prisma.cooperative.create({
      data: {
        id: 'demo-coop-2',
        name: 'Maninagar Skilled Workers Society',
        registrationNo: 'GJ/AHM/COOP/2022/1002',
        address: 'Maninagar, Ahmedabad',
        city: 'Ahmedabad',
        state: 'Gujarat',
        latitude: 23.0069,
        longitude: 72.6058,
        established: new Date('2022-03-20'),
        description: 'Cooperative for painters, carpenters, and general maintenance workers',
        totalMembers: 12,
        federationId: federation.id,
      },
    }),
    prisma.cooperative.create({
      data: {
        id: 'demo-coop-3',
        name: 'Satellite Care Workers Cooperative',
        registrationNo: 'GJ/AHM/COOP/2023/1003',
        address: 'Satellite, Ahmedabad',
        city: 'Ahmedabad',
        state: 'Gujarat',
        latitude: 23.0276,
        longitude: 72.5086,
        established: new Date('2023-06-01'),
        description: 'Cooperative specializing in caregiving, cleaning, and gardening services',
        totalMembers: 10,
        federationId: federation.id,
      },
    }),
    prisma.cooperative.create({
      data: {
        id: 'demo-coop-4',
        name: 'Navrangpura Technicians Guild',
        registrationNo: 'GJ/AHM/COOP/2023/1004',
        address: 'Navrangpura, Ahmedabad',
        city: 'Ahmedabad',
        state: 'Gujarat',
        latitude: 23.0396,
        longitude: 72.5608,
        established: new Date('2023-01-10'),
        description: 'Cooperative for appliance repair technicians and drivers',
        totalMembers: 8,
        federationId: federation.id,
      },
    }),
    prisma.cooperative.create({
      data: {
        id: 'demo-coop-5',
        name: 'Gandhinagar Multi-Service Cooperative',
        registrationNo: 'GJ/GNR/COOP/2023/1005',
        address: 'Sector 21, Gandhinagar',
        city: 'Gandhinagar',
        state: 'Gujarat',
        latitude: 23.2156,
        longitude: 72.6369,
        established: new Date('2023-09-15'),
        description: 'Multi-service cooperative serving Gandhinagar region',
        totalMembers: 5,
        federationId: federation.id,
      },
    }),
  ]);

  // ============================================================
  // SERVICE CATEGORIES
  // ============================================================
  const categories = await Promise.all([
    prisma.serviceCategory.upsert({ where: { id: 'cat-electrician' }, update: { name: 'Electrician', icon: 'Zap', description: 'Electrical wiring, repairs, installation', basePrice: 300, sortOrder: 1 }, create: { id: 'cat-electrician', name: 'Electrician', icon: 'Zap', description: 'Electrical wiring, repairs, installation', basePrice: 300, sortOrder: 1 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-plumber' }, update: { name: 'Plumber', icon: 'Droplets', description: 'Pipe repairs, tap installation, leakage fixing', basePrice: 250, sortOrder: 2 }, create: { id: 'cat-plumber', name: 'Plumber', icon: 'Droplets', description: 'Pipe repairs, tap installation, leakage fixing', basePrice: 250, sortOrder: 2 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-carpenter' }, update: { name: 'Carpenter', icon: 'Hammer', description: 'Furniture repair, wooden work, installation', basePrice: 350, sortOrder: 3 }, create: { id: 'cat-carpenter', name: 'Carpenter', icon: 'Hammer', description: 'Furniture repair, wooden work, installation', basePrice: 350, sortOrder: 3 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-painter' }, update: { name: 'Painter', icon: 'Paintbrush', description: 'Wall painting, whitewashing, texture work', basePrice: 400, sortOrder: 4 }, create: { id: 'cat-painter', name: 'Painter', icon: 'Paintbrush', description: 'Wall painting, whitewashing, texture work', basePrice: 400, sortOrder: 4 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-cleaner' }, update: { name: 'Cleaner', icon: 'Sparkles', description: 'Deep cleaning, home cleaning, office cleaning', basePrice: 200, sortOrder: 5 }, create: { id: 'cat-cleaner', name: 'Cleaner', icon: 'Sparkles', description: 'Deep cleaning, home cleaning, office cleaning', basePrice: 200, sortOrder: 5 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-caregiver' }, update: { name: 'Caregiver', icon: 'Heart', description: 'Elder care, patient care, child care', basePrice: 500, sortOrder: 6 }, create: { id: 'cat-caregiver', name: 'Caregiver', icon: 'Heart', description: 'Elder care, patient care, child care', basePrice: 500, sortOrder: 6 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-driver' }, update: { name: 'Driver', icon: 'Car', description: 'Personal driver, delivery, chauffeur service', basePrice: 300, sortOrder: 7 }, create: { id: 'cat-driver', name: 'Driver', icon: 'Car', description: 'Personal driver, delivery, chauffeur service', basePrice: 300, sortOrder: 7 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-technician' }, update: { name: 'Technician', icon: 'Wrench', description: 'General repair and maintenance', basePrice: 300, sortOrder: 8 }, create: { id: 'cat-technician', name: 'Technician', icon: 'Wrench', description: 'General repair and maintenance', basePrice: 300, sortOrder: 8 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-gardener' }, update: { name: 'Gardener', icon: 'Flower2', description: 'Garden maintenance, landscaping, plant care', basePrice: 250, sortOrder: 9 }, create: { id: 'cat-gardener', name: 'Gardener', icon: 'Flower2', description: 'Garden maintenance, landscaping, plant care', basePrice: 250, sortOrder: 9 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-ac' }, update: { name: 'AC Repair', icon: 'Snowflake', description: 'AC servicing, repair, gas refilling, installation', basePrice: 400, sortOrder: 10 }, create: { id: 'cat-ac', name: 'AC Repair', icon: 'Snowflake', description: 'AC servicing, repair, gas refilling, installation', basePrice: 400, sortOrder: 10 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-appliance' }, update: { name: 'Appliance Repair', icon: 'Tv', description: 'Washing machine, refrigerator, microwave repair', basePrice: 350, sortOrder: 11 }, create: { id: 'cat-appliance', name: 'Appliance Repair', icon: 'Tv', description: 'Washing machine, refrigerator, microwave repair', basePrice: 350, sortOrder: 11 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-emergency-electrical' }, update: { name: 'Electrical Emergency', icon: 'AlertTriangle', description: 'Emergency electrical repairs', basePrice: 500, isEmergency: true, sortOrder: 12 }, create: { id: 'cat-emergency-electrical', name: 'Electrical Emergency', icon: 'AlertTriangle', description: 'Emergency electrical repairs', basePrice: 500, isEmergency: true, sortOrder: 12 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-emergency-plumbing' }, update: { name: 'Plumbing Emergency', icon: 'AlertTriangle', description: 'Emergency plumbing - water leakage, pipe burst', basePrice: 450, isEmergency: true, sortOrder: 13 }, create: { id: 'cat-emergency-plumbing', name: 'Plumbing Emergency', icon: 'AlertTriangle', description: 'Emergency plumbing - water leakage, pipe burst', basePrice: 450, isEmergency: true, sortOrder: 13 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-emergency-water' }, update: { name: 'Water Leakage Emergency', icon: 'AlertTriangle', description: 'Emergency water leakage repair', basePrice: 400, isEmergency: true, sortOrder: 14 }, create: { id: 'cat-emergency-water', name: 'Water Leakage Emergency', icon: 'AlertTriangle', description: 'Emergency water leakage repair', basePrice: 400, isEmergency: true, sortOrder: 14 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-pest' }, update: { name: 'Pest Control', icon: 'Bug', description: 'Pest control and fumigation services', basePrice: 600, sortOrder: 15 }, create: { id: 'cat-pest', name: 'Pest Control', icon: 'Bug', description: 'Pest control and fumigation services', basePrice: 600, sortOrder: 15 } }),
    prisma.serviceCategory.upsert({ where: { id: 'cat-waterproofing' }, update: { name: 'Waterproofing', icon: 'Umbrella', description: 'Waterproofing and seepage treatment', basePrice: 800, sortOrder: 16 }, create: { id: 'cat-waterproofing', name: 'Waterproofing', icon: 'Umbrella', description: 'Waterproofing and seepage treatment', basePrice: 800, sortOrder: 16 } }),
  ]);

  // ============================================================
  // SKILLS
  // ============================================================
  const skills = await Promise.all([
    // Electrician skills
    prisma.skill.upsert({ where: { id: 'skill-wiring' }, update: { name: 'House Wiring', categoryId: 'cat-electrician' }, create: { id: 'skill-wiring', name: 'House Wiring', categoryId: 'cat-electrician' } }),
    prisma.skill.upsert({ where: { id: 'skill-switchboard' }, update: { name: 'Switchboard Installation', categoryId: 'cat-electrician' }, create: { id: 'skill-switchboard', name: 'Switchboard Installation', categoryId: 'cat-electrician' } }),
    prisma.skill.upsert({ where: { id: 'skill-fan' }, update: { name: 'Fan Installation & Repair', categoryId: 'cat-electrician' }, create: { id: 'skill-fan', name: 'Fan Installation & Repair', categoryId: 'cat-electrician' } }),
    prisma.skill.upsert({ where: { id: 'skill-lighting' }, update: { name: 'Lighting Installation', categoryId: 'cat-electrician' }, create: { id: 'skill-lighting', name: 'Lighting Installation', categoryId: 'cat-electrician' } }),
    // Plumber skills
    prisma.skill.upsert({ where: { id: 'skill-pipe' }, update: { name: 'Pipe Repair', categoryId: 'cat-plumber' }, create: { id: 'skill-pipe', name: 'Pipe Repair', categoryId: 'cat-plumber' } }),
    prisma.skill.upsert({ where: { id: 'skill-tap' }, update: { name: 'Tap Installation', categoryId: 'cat-plumber' }, create: { id: 'skill-tap', name: 'Tap Installation', categoryId: 'cat-plumber' } }),
    prisma.skill.upsert({ where: { id: 'skill-drainage' }, update: { name: 'Drainage Cleaning', categoryId: 'cat-plumber' }, create: { id: 'skill-drainage', name: 'Drainage Cleaning', categoryId: 'cat-plumber' } }),
    // Carpenter skills
    prisma.skill.upsert({ where: { id: 'skill-furniture' }, update: { name: 'Furniture Repair', categoryId: 'cat-carpenter' }, create: { id: 'skill-furniture', name: 'Furniture Repair', categoryId: 'cat-carpenter' } }),
    prisma.skill.upsert({ where: { id: 'skill-cabinet' }, update: { name: 'Cabinet Making', categoryId: 'cat-carpenter' }, create: { id: 'skill-cabinet', name: 'Cabinet Making', categoryId: 'cat-carpenter' } }),
    prisma.skill.upsert({ where: { id: 'skill-door' }, update: { name: 'Door & Window Repair', categoryId: 'cat-carpenter' }, create: { id: 'skill-door', name: 'Door & Window Repair', categoryId: 'cat-carpenter' } }),
    // Painter skills
    prisma.skill.upsert({ where: { id: 'skill-interior' }, update: { name: 'Interior Painting', categoryId: 'cat-painter' }, create: { id: 'skill-interior', name: 'Interior Painting', categoryId: 'cat-painter' } }),
    prisma.skill.upsert({ where: { id: 'skill-exterior' }, update: { name: 'Exterior Painting', categoryId: 'cat-painter' }, create: { id: 'skill-exterior', name: 'Exterior Painting', categoryId: 'cat-painter' } }),
    prisma.skill.upsert({ where: { id: 'skill-texture' }, update: { name: 'Texture Painting', categoryId: 'cat-painter' }, create: { id: 'skill-texture', name: 'Texture Painting', categoryId: 'cat-painter' } }),
    // AC skills
    prisma.skill.upsert({ where: { id: 'skill-ac-repair' }, update: { name: 'AC Repair', categoryId: 'cat-ac' }, create: { id: 'skill-ac-repair', name: 'AC Repair', categoryId: 'cat-ac' } }),
    prisma.skill.upsert({ where: { id: 'skill-ac-service' }, update: { name: 'AC Servicing', categoryId: 'cat-ac' }, create: { id: 'skill-ac-service', name: 'AC Servicing', categoryId: 'cat-ac' } }),
    prisma.skill.upsert({ where: { id: 'skill-ac-install' }, update: { name: 'AC Installation', categoryId: 'cat-ac' }, create: { id: 'skill-ac-install', name: 'AC Installation', categoryId: 'cat-ac' } }),
    prisma.skill.upsert({ where: { id: 'skill-ac-gas' }, update: { name: 'AC Gas Refilling', categoryId: 'cat-ac' }, create: { id: 'skill-ac-gas', name: 'AC Gas Refilling', categoryId: 'cat-ac' } }),
    // Cleaning skills
    prisma.skill.upsert({ where: { id: 'skill-deep-clean' }, update: { name: 'Deep Cleaning', categoryId: 'cat-cleaner' }, create: { id: 'skill-deep-clean', name: 'Deep Cleaning', categoryId: 'cat-cleaner' } }),
    prisma.skill.upsert({ where: { id: 'skill-bathroom-clean' }, update: { name: 'Bathroom Cleaning', categoryId: 'cat-cleaner' }, create: { id: 'skill-bathroom-clean', name: 'Bathroom Cleaning', categoryId: 'cat-cleaner' } }),
    prisma.skill.upsert({ where: { id: 'skill-kitchen-clean' }, update: { name: 'Kitchen Cleaning', categoryId: 'cat-cleaner' }, create: { id: 'skill-kitchen-clean', name: 'Kitchen Cleaning', categoryId: 'cat-cleaner' } }),
    // Appliance skills
    prisma.skill.upsert({ where: { id: 'skill-washing' }, update: { name: 'Washing Machine Repair', categoryId: 'cat-appliance' }, create: { id: 'skill-washing', name: 'Washing Machine Repair', categoryId: 'cat-appliance' } }),
    prisma.skill.upsert({ where: { id: 'skill-fridge' }, update: { name: 'Refrigerator Repair', categoryId: 'cat-appliance' }, create: { id: 'skill-fridge', name: 'Refrigerator Repair', categoryId: 'cat-appliance' } }),
    prisma.skill.upsert({ where: { id: 'skill-microwave' }, update: { name: 'Microwave Repair', categoryId: 'cat-appliance' }, create: { id: 'skill-microwave', name: 'Microwave Repair', categoryId: 'cat-appliance' } }),
    // Caregiving
    prisma.skill.upsert({ where: { id: 'skill-elder-care' }, update: { name: 'Elder Care', categoryId: 'cat-caregiver' }, create: { id: 'skill-elder-care', name: 'Elder Care', categoryId: 'cat-caregiver' } }),
    prisma.skill.upsert({ where: { id: 'skill-patient-care' }, update: { name: 'Patient Care', categoryId: 'cat-caregiver' }, create: { id: 'skill-patient-care', name: 'Patient Care', categoryId: 'cat-caregiver' } }),
    // Gardening
    prisma.skill.upsert({ where: { id: 'skill-lawn' }, update: { name: 'Lawn Maintenance', categoryId: 'cat-gardener' }, create: { id: 'skill-lawn', name: 'Lawn Maintenance', categoryId: 'cat-gardener' } }),
    prisma.skill.upsert({ where: { id: 'skill-plant-care' }, update: { name: 'Plant Care', categoryId: 'cat-gardener' }, create: { id: 'skill-plant-care', name: 'Plant Care', categoryId: 'cat-gardener' } }),
  ]);

  // ============================================================
  // CERTIFICATIONS
  // ============================================================
  const certs = await Promise.all([
    prisma.certification.upsert({ where: { id: 'cert-electrical-safety' }, update: { name: 'Electrical Safety Certificate', skillId: 'skill-wiring', issuingAuthority: 'Gujarat Skill Development Board', validityMonths: 24, isMandatory: true }, create: { id: 'cert-electrical-safety', name: 'Electrical Safety Certificate', skillId: 'skill-wiring', issuingAuthority: 'Gujarat Skill Development Board', validityMonths: 24, isMandatory: true } }),
    prisma.certification.upsert({ where: { id: 'cert-ac-technician' }, update: { name: 'HVAC Technician Certificate', skillId: 'skill-ac-repair', issuingAuthority: 'NSDC', validityMonths: 36, isMandatory: true }, create: { id: 'cert-ac-technician', name: 'HVAC Technician Certificate', skillId: 'skill-ac-repair', issuingAuthority: 'NSDC', validityMonths: 36, isMandatory: true } }),
    prisma.certification.upsert({ where: { id: 'cert-plumbing-basic' }, update: { name: 'Basic Plumbing Certification', skillId: 'skill-pipe', issuingAuthority: 'Gujarat ITI', validityMonths: 36 }, create: { id: 'cert-plumbing-basic', name: 'Basic Plumbing Certification', skillId: 'skill-pipe', issuingAuthority: 'Gujarat ITI', validityMonths: 36 } }),
    prisma.certification.upsert({ where: { id: 'cert-carpentry' }, update: { name: 'Carpentry Skills Certificate', skillId: 'skill-furniture', issuingAuthority: 'NSDC', validityMonths: 36 }, create: { id: 'cert-carpentry', name: 'Carpentry Skills Certificate', skillId: 'skill-furniture', issuingAuthority: 'NSDC', validityMonths: 36 } }),
    prisma.certification.upsert({ where: { id: 'cert-painting' }, update: { name: 'Professional Painting Certificate', skillId: 'skill-interior', issuingAuthority: 'Asian Paints Academy', validityMonths: 24 }, create: { id: 'cert-painting', name: 'Professional Painting Certificate', skillId: 'skill-interior', issuingAuthority: 'Asian Paints Academy', validityMonths: 24 } }),
    prisma.certification.upsert({ where: { id: 'cert-first-aid' }, update: { name: 'First Aid Certificate', skillId: 'skill-elder-care', issuingAuthority: 'Red Cross India', validityMonths: 12 }, create: { id: 'cert-first-aid', name: 'First Aid Certificate', skillId: 'skill-elder-care', issuingAuthority: 'Red Cross India', validityMonths: 12 } }),
  ]);

  // ============================================================
  // USERS & WORKERS (50 workers from Ahmedabad areas)
  // ============================================================
  const ahmedabadAreas = [
    { name: 'Paldi', lat: 23.0225, lng: 72.5714 },
    { name: 'Maninagar', lat: 23.0069, lng: 72.6058 },
    { name: 'Satellite', lat: 23.0276, lng: 72.5086 },
    { name: 'Navrangpura', lat: 23.0396, lng: 72.5608 },
    { name: 'Vastrapur', lat: 23.0360, lng: 72.5295 },
    { name: 'Bopal', lat: 23.0283, lng: 72.4699 },
    { name: 'Gota', lat: 23.1093, lng: 72.5472 },
    { name: 'Thaltej', lat: 23.0540, lng: 72.5014 },
    { name: 'SG Highway', lat: 23.0342, lng: 72.5047 },
    { name: 'Chandkheda', lat: 23.1150, lng: 72.5900 },
    { name: 'Naroda', lat: 23.0730, lng: 72.6530 },
    { name: 'Shahibag', lat: 23.0580, lng: 72.5890 },
    { name: 'Ellis Bridge', lat: 23.0300, lng: 72.5650 },
    { name: 'Ambawadi', lat: 23.0320, lng: 72.5560 },
    { name: 'Memnagar', lat: 23.0490, lng: 72.5440 },
  ];

  const gujaratiNames = [
    'Raj Patel', 'Arjun Sharma', 'Vikram Singh', 'Sanjay Mehta', 'Karan Desai',
    'Rohan Joshi', 'Anil Kumar', 'Suresh Yadav', 'Rakesh Pandey', 'Manoj Tiwari',
    'Deepak Verma', 'Nitin Gupta', 'Ramesh Chauhan', 'Pravin Shah', 'Jayesh Modi',
    'Bharat Prajapati', 'Mahesh Solanki', 'Dinesh Parmar', 'Gopal Rathod', 'Hitesh Vyas',
    'Jignesh Vaghela', 'Kamlesh Makwana', 'Lalit Chaudhary', 'Mukesh Jadav', 'Naresh Bhatt',
    'Paresh Raval', 'Ravi Thakur', 'Sandip Panchal', 'Tarun Nagar', 'Umesh Dave',
    'Vinod Prajapati', 'Yash Trivedi', 'Ashok Mistry', 'Chirag Barot', 'Dhruv Gajjar',
    'Firoz Sheikh', 'Gautam Kothari', 'Harish Charan', 'Ishwar Rabari', 'Jagdish Thakkar',
    'Kishore Doshi', 'Laxman Valand', 'Manish Pancholi', 'Narayan Rajput', 'Om Darji',
    'Pradeep Suthar', 'Rajendra Lohar', 'Satish Luhar', 'Tushar Soni', 'Vijay Kumbhar',
  ];

  const tradeAssignments = [
    { trade: 'Electrician', categoryId: 'cat-electrician', skills: ['skill-wiring', 'skill-switchboard', 'skill-fan', 'skill-lighting'] },
    { trade: 'Plumber', categoryId: 'cat-plumber', skills: ['skill-pipe', 'skill-tap', 'skill-drainage'] },
    { trade: 'Carpenter', categoryId: 'cat-carpenter', skills: ['skill-furniture', 'skill-cabinet', 'skill-door'] },
    { trade: 'Painter', categoryId: 'cat-painter', skills: ['skill-interior', 'skill-exterior', 'skill-texture'] },
    { trade: 'AC Technician', categoryId: 'cat-ac', skills: ['skill-ac-repair', 'skill-ac-service', 'skill-ac-install', 'skill-ac-gas'] },
    { trade: 'Cleaner', categoryId: 'cat-cleaner', skills: ['skill-deep-clean', 'skill-bathroom-clean', 'skill-kitchen-clean'] },
    { trade: 'Appliance Technician', categoryId: 'cat-appliance', skills: ['skill-washing', 'skill-fridge', 'skill-microwave'] },
    { trade: 'Caregiver', categoryId: 'cat-caregiver', skills: ['skill-elder-care', 'skill-patient-care'] },
    { trade: 'Gardener', categoryId: 'cat-gardener', skills: ['skill-lawn', 'skill-plant-care'] },
  ];

  // Create workers
  for (let i = 0; i < 50; i++) {
    const area = ahmedabadAreas[i % ahmedabadAreas.length];
    const trade = tradeAssignments[i % tradeAssignments.length];
    const coopIndex = i % 5;
    const isVerified = i < 40; // First 40 verified, last 10 in various statuses
    const verificationStatuses = ['PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'PENDING', 'UNDER_REVIEW',
                                   'PENDING', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'PENDING', 'REJECTED'];

    const user = await prisma.user.create({
      data: {
        id: `demo-user-worker-${i + 1}`,
        email: `worker${i + 1}@coopconnect.in`,
        phone: `+9198${String(70000000 + i).padStart(8, '0')}`,
        passwordHash,
        name: gujaratiNames[i],
        role: 'WORKER',
        language: i % 3 === 0 ? 'gu' : i % 3 === 1 ? 'hi' : 'en',
        avatar: null,
      },
    });

    const latJitter = (Math.random() - 0.5) * 0.02;
    const lngJitter = (Math.random() - 0.5) * 0.02;

    const worker = await prisma.worker.create({
      data: {
        id: `demo-worker-${i + 1}`,
        userId: user.id,
        cooperativeId: cooperatives[coopIndex].id,
        primaryTrade: trade.trade,
        experience: Math.floor(Math.random() * 15) + 1,
        bio: `Experienced ${trade.trade.toLowerCase()} based in ${area.name}, Ahmedabad. Cooperative member since ${2022 + Math.floor(Math.random() * 3)}.`,
        serviceRadius: 5 + Math.random() * 10,
        verificationStatus: isVerified ? 'VERIFIED' : verificationStatuses[i - 40],
        availabilityStatus: isVerified ? (Math.random() > 0.3 ? 'AVAILABLE' : 'BUSY') : 'OFFLINE',
        isEmergencyAvailable: Math.random() > 0.6,
        latitude: area.lat + latJitter,
        longitude: area.lng + lngJitter,
        address: `${Math.floor(Math.random() * 200) + 1}, ${area.name}`,
        city: 'Ahmedabad',
        state: 'Gujarat',
        identityVerified: isVerified,
        identityDocType: isVerified ? 'AADHAAR' : undefined,
        identityDocMasked: isVerified ? `XXXX-XXXX-${String(1000 + i).slice(-4)}` : undefined,
        totalJobs: isVerified ? Math.floor(Math.random() * 200) + 10 : 0,
        averageRating: isVerified ? (3.5 + Math.random() * 1.5) : 0,
        completionRate: isVerified ? (85 + Math.random() * 15) : 100,
        punctualityScore: isVerified ? (80 + Math.random() * 20) : 100,
        lastAssignedAt: isVerified ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      },
    });

    // Assign skills
    const numSkills = Math.min(trade.skills.length, 2 + Math.floor(Math.random() * 3));
    for (let s = 0; s < numSkills; s++) {
      await prisma.workerSkill.create({
        data: {
          workerId: worker.id,
          skillId: trade.skills[s],
          proficiencyLevel: s === 0 ? 'EXPERT' : s === 1 ? 'ADVANCED' : 'INTERMEDIATE',
          verified: isVerified,
        },
      });
    }

    // Add availability (weekdays)
    for (let day = 1; day <= 6; day++) {
      await prisma.workerAvailability.create({
        data: {
          workerId: worker.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '20:00',
          isEmergencyAvailable: day <= 5 && Math.random() > 0.5,
        },
      });
    }

    // Add certifications for some workers
    if (isVerified && i % 3 === 0) {
      const certId = trade.trade === 'Electrician' ? 'cert-electrical-safety' :
                     trade.trade === 'AC Technician' ? 'cert-ac-technician' :
                     trade.trade === 'Plumber' ? 'cert-plumbing-basic' :
                     trade.trade === 'Carpenter' ? 'cert-carpentry' :
                     trade.trade === 'Painter' ? 'cert-painting' : null;
      if (certId) {
        await prisma.workerCertification.create({
          data: {
            workerId: worker.id,
            certificationId: certId,
            certificateNo: `CERT-${String(1000 + i).slice(-4)}-${new Date().getFullYear()}`,
            issueDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            verified: true,
          },
        });
      }
    }

    // Portfolio items for verified workers
    if (isVerified && i % 4 === 0) {
      await prisma.portfolioItem.create({
        data: {
          workerId: worker.id,
          title: `${trade.trade} project in ${area.name}`,
          description: `Completed ${trade.trade.toLowerCase()} work for a residential client in ${area.name}.`,
          imageUrl: `/portfolio/work-${(i % 5) + 1}.jpg`,
          skillTag: trade.trade,
        },
      });
    }
  }

  // ============================================================
  // CUSTOMERS (20)
  // ============================================================
  const customerNames = [
    'Amit Patel', 'Priya Sharma', 'Neha Desai', 'Rahul Mehta', 'Anjali Singh',
    'Vikrant Joshi', 'Meera Bhatt', 'Kaushal Modi', 'Ritu Vyas', 'Ashish Pandya',
    'Sneha Shah', 'Darshan Prajapati', 'Kavita Solanki', 'Nilesh Trivedi', 'Pooja Raval',
    'Chirag Baxi', 'Dimple Parikh', 'Hemang Dave', 'Janvi Kothari', 'Kunal Thakkar',
  ];

  for (let i = 0; i < 20; i++) {
    const area = ahmedabadAreas[i % ahmedabadAreas.length];
    const user = await prisma.user.create({
      data: {
        id: `demo-user-customer-${i + 1}`,
        email: `customer${i + 1}@gmail.com`,
        phone: `+9199${String(80000000 + i).padStart(8, '0')}`,
        passwordHash,
        name: customerNames[i],
        role: 'CUSTOMER',
        language: i % 2 === 0 ? 'en' : 'hi',
        avatar: null,
      },
    });

    await prisma.customer.create({
      data: {
        id: `demo-customer-${i + 1}`,
        userId: user.id,
        address: `${Math.floor(Math.random() * 500) + 1}, ${area.name}, Ahmedabad`,
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: `38000${i % 10}`,
        latitude: area.lat + (Math.random() - 0.5) * 0.01,
        longitude: area.lng + (Math.random() - 0.5) * 0.01,
      },
    });
  }

  // ============================================================
  // ADMIN USERS
  // ============================================================

  // Cooperative admins
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        id: `demo-user-coopadmin-${i + 1}`,
        email: `admin${i + 1}@coopconnect.in`,
        phone: `+9196${String(10000000 + i).padStart(8, '0')}`,
        passwordHash,
        name: `Admin ${['Patel', 'Sharma', 'Desai', 'Modi', 'Joshi'][i]}`,
        role: 'COOPERATIVE_ADMIN',
      },
    });

    await prisma.cooperativeAdmin.create({
      data: {
        userId: user.id,
        cooperativeId: cooperatives[i].id,
      },
    });
  }

  // Federation admin
  const fedAdminUser = await prisma.user.create({
    data: {
      id: 'demo-user-fedadmin-1',
      email: 'federation@coopconnect.in',
      phone: '+919600000001',
      passwordHash,
      name: 'Rajesh Kothari',
      role: 'FEDERATION_ADMIN',
    },
  });

  await prisma.federationAdmin.create({
    data: {
      userId: fedAdminUser.id,
      federationId: federation.id,
    },
  });

  // ============================================================
  // HOUSING SOCIETIES
  // ============================================================
  const society1 = await prisma.housingSociety.create({
    data: {
      id: 'demo-society-1',
      name: 'Sunrise Residency',
      address: 'SG Highway, Ahmedabad',
      city: 'Ahmedabad',
      units: 120,
      contactPerson: 'Mihir Shah',
      contactPhone: '+919876543210',
      latitude: 23.0342,
      longitude: 72.5047,
    },
  });

  const society2 = await prisma.housingSociety.create({
    data: {
      id: 'demo-society-2',
      name: 'Green Valley Apartments',
      address: 'Bopal, Ahmedabad',
      city: 'Ahmedabad',
      units: 80,
      contactPerson: 'Nisha Patel',
      contactPhone: '+919876543211',
      latitude: 23.0283,
      longitude: 72.4699,
    },
  });

  // Society admins
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({
      data: {
        id: `demo-user-societyadmin-${i + 1}`,
        email: `society${i + 1}@coopconnect.in`,
        phone: `+9195${String(20000000 + i).padStart(8, '0')}`,
        passwordHash,
        name: i === 0 ? 'Mihir Shah' : 'Nisha Patel',
        role: 'SOCIETY_ADMIN',
      },
    });

    await prisma.societyAdmin.create({
      data: {
        userId: user.id,
        societyId: i === 0 ? society1.id : society2.id,
      },
    });
  }

  // ============================================================
  // INSTITUTIONS
  // ============================================================
  const inst1 = await prisma.institution.create({
    data: {
      id: 'demo-inst-1',
      name: 'Ahmedabad International School',
      type: 'SCHOOL',
      address: 'Vastrapur, Ahmedabad',
      city: 'Ahmedabad',
      contactPerson: 'Dr. Anand Patel',
      contactPhone: '+919876543220',
      latitude: 23.0360,
      longitude: 72.5295,
    },
  });

  const instUser = await prisma.user.create({
    data: {
      id: 'demo-user-inst-1',
      email: 'school@ahmedabad.edu',
      phone: '+919876543220',
      passwordHash,
      name: 'Dr. Anand Patel',
      role: 'INSTITUTIONAL_CUSTOMER',
    },
  });

  await prisma.institutionalCustomer.create({
    data: {
      userId: instUser.id,
      institutionId: inst1.id,
    },
  });

  // ============================================================
  // BOOKINGS (200+)
  // ============================================================
  const statuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED',
                    'COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'ACCEPTED', 'REQUESTED'];
  const descriptions = [
    'AC not cooling properly', 'Bathroom tap leaking', 'Need fan installation',
    'Wall painting for living room', 'Kitchen deep cleaning', 'Furniture repair',
    'Pipe repair in bathroom', 'Switchboard not working', 'Garden maintenance',
    'Washing machine not draining', 'AC making noise', 'Water leakage from ceiling',
    'Door lock repair', 'Full house painting', 'Electrical wiring issue',
    'Refrigerator not cooling', 'Plumbing for new kitchen', 'Texture painting',
    'Elder care needed', 'AC installation for new room',
  ];

  for (let i = 0; i < 220; i++) {
    const customerIndex = i % 20;
    const workerIndex = i % 40; // Only verified workers
    const catIndex = i % 11; // Non-emergency categories
    const status = statuses[i % statuses.length];
    const daysAgo = Math.floor(Math.random() * 180);
    const bookingDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const area = ahmedabadAreas[i % ahmedabadAreas.length];
    const basePrice = 200 + Math.floor(Math.random() * 800);

    const pin = String(1000 + Math.floor(Math.random() * 9000));

    const booking = await prisma.booking.create({
      data: {
        id: `demo-booking-${i * 10 + 1}`,
        customerId: `demo-customer-${customerIndex + 1}`,
        workerId: `demo-worker-${workerIndex + 1}`,
        categoryId: categories[catIndex].id,
        description: descriptions[i % descriptions.length],
        scheduledDate: bookingDate,
        scheduledTime: `${8 + Math.floor(Math.random() * 10)}:00`,
        estimatedPrice: basePrice,
        finalPrice: status === 'COMPLETED' ? basePrice + Math.floor(Math.random() * 200) : undefined,
        servicePin: pin,
        pinVerified: status !== 'REQUESTED',
        address: `${area.name}, Ahmedabad`,
        latitude: area.lat + (Math.random() - 0.5) * 0.01,
        longitude: area.lng + (Math.random() - 0.5) * 0.01,
        status,
        completedAt: status === 'COMPLETED' ? new Date(bookingDate.getTime() + 3 * 60 * 60 * 1000) : undefined,
        createdAt: bookingDate,
      },
    });

    // Status history
    const statusSequence = status === 'COMPLETED'
      ? ['REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED']
      : status === 'IN_PROGRESS'
      ? ['REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS']
      : status === 'ACCEPTED'
      ? ['REQUESTED', 'ACCEPTED']
      : ['REQUESTED'];

    for (let s = 0; s < statusSequence.length; s++) {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          status: statusSequence[s],
          createdAt: new Date(bookingDate.getTime() + s * 30 * 60 * 1000),
        },
      });
    }

    // Ratings for completed bookings
    if (status === 'COMPLETED' && i % 2 === 0) {
      const overallRating = 3 + Math.random() * 2;
      await prisma.rating.create({
        data: {
          bookingId: booking.id,
          customerId: `demo-customer-${customerIndex + 1}`,
          workerId: `demo-worker-${workerIndex + 1}`,
          technicalQuality: Math.round(3 + Math.random() * 2),
          punctuality: Math.round(3 + Math.random() * 2),
          communication: Math.round(3 + Math.random() * 2),
          professionalism: Math.round(3 + Math.random() * 2),
          priceTransparency: Math.round(3 + Math.random() * 2),
          overall: Math.round(overallRating * 10) / 10,
          review: i % 4 === 0 ? 'Great service, very professional and punctual.' : undefined,
          createdAt: new Date(bookingDate.getTime() + 4 * 60 * 60 * 1000),
        },
      });
    }

    // Payment for completed bookings
    if (status === 'COMPLETED') {
      const finalAmount = basePrice + Math.floor(Math.random() * 200);
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: finalAmount,
          method: ['UPI', 'CARD', 'NET_BANKING', 'CASH'][i % 4],
          status: 'COMPLETED',
          transactionId: `demo-TXN-${Date.now()}-${i}`,
          provider: 'SANDBOX',
          paidAt: new Date(bookingDate.getTime() + 3.5 * 60 * 60 * 1000),
        },
      });

      // Invoice
      const labourCharge = finalAmount * 0.65;
      const travelCharge = finalAmount * 0.10;
      const materialCharge = finalAmount * 0.15;
      const cooperativeContribution = finalAmount * 0.05;
      const welfareContribution = finalAmount * 0.02;

      await prisma.invoice.create({
        data: {
          bookingId: booking.id,
          invoiceNumber: `demo-INV-${String(10000 + i).slice(-5)}-${bookingDate.getFullYear()}`,
          labourCharge,
          travelCharge,
          materialCharge,
          cooperativeContribution,
          welfareContribution,
          subtotal: labourCharge + travelCharge + materialCharge,
          tax: finalAmount * 0.03,
          total: finalAmount,
          status: 'PAID',
          issuedAt: new Date(bookingDate.getTime() + 3 * 60 * 60 * 1000),
        },
      });

      // Worker earning
      await prisma.workerEarning.create({
        data: {
          workerId: `demo-worker-${workerIndex + 1}`,
          bookingId: booking.id,
          date: bookingDate,
          grossAmount: finalAmount,
          labourAmount: labourCharge,
          travelAmount: travelCharge,
          materialAmount: materialCharge,
          cooperativeDeduction: cooperativeContribution,
          welfareDeduction: welfareContribution,
          netAmount: finalAmount - cooperativeContribution - welfareContribution,
          description: descriptions[i % descriptions.length],
        },
      });
    }

    // Warranty for some completed bookings
    if (status === 'COMPLETED' && i % 5 === 0) {
      await prisma.warranty.create({
        data: {
          bookingId: booking.id,
          expiryDate: new Date(bookingDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          status: new Date() < new Date(bookingDate.getTime() + 14 * 24 * 60 * 60 * 1000) ? 'ACTIVE' : 'EXPIRED',
        },
      });
    }
  }

  // ============================================================
  // COMPLAINTS (sample)
  // ============================================================
  const complaintCategories = ['POOR_QUALITY', 'LATE_ARRIVAL', 'BILLING', 'INCOMPLETE_WORK'];
  for (let i = 0; i < 15; i++) {
    await prisma.complaint.create({
      data: {
        bookingId: `demo-booking-${i * 10 + 1}`,
        customerId: `demo-customer-${(i % 20) + 1}`,
        workerId: `demo-worker-${(i % 40) + 1}`,
        category: complaintCategories[i % complaintCategories.length],
        description: `Issue with the service provided - ${complaintCategories[i % complaintCategories.length].toLowerCase().replace('_', ' ')}`,
        status: i < 5 ? 'OPEN' : i < 10 ? 'UNDER_REVIEW' : 'RESOLVED',
        resolution: i >= 10 ? 'Issue resolved after worker revisited.' : undefined,
      },
    });
  }

  // ============================================================
  // MATCHING WEIGHTS
  // ============================================================
  for (const coop of cooperatives) {
    await prisma.matchingWeights.create({
      data: {
        cooperativeId: coop.id,
        skillWeight: 0.35,
        availabilityWeight: 0.20,
        distanceWeight: 0.15,
        reliabilityWeight: 0.10,
        certificationWeight: 0.10,
        fairnessWeight: 0.10,
      },
    });
  }

  // ============================================================
  // DEMAND HISTORY
  // ============================================================
  const demandAreas = ['Paldi', 'Maninagar', 'Satellite', 'Navrangpura', 'Vastrapur', 'Bopal', 'Gota', 'Thaltej'];
  for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
    for (const area of demandAreas) {
      for (let catIdx = 0; catIdx < 5; catIdx++) {
        const cat = categories[catIdx];
        const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000);
        const areaData = ahmedabadAreas.find(a => a.name === area);
        await prisma.demandHistory.create({
          data: {
            categoryId: cat.id,
            area,
            latitude: areaData?.lat,
            longitude: areaData?.lng,
            date,
            hour: 10,
            count: Math.floor(Math.random() * 15) + 2,
          },
        });
      }
    }
  }

  // ============================================================
  // DEMAND FORECASTS
  // ============================================================
  for (const area of demandAreas.slice(0, 4)) {
    for (let catIdx = 0; catIdx < 5; catIdx++) {
      const cat = categories[catIdx];
      for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
        const areaData = ahmedabadAreas.find(a => a.name === area);
        await prisma.demandForecast.create({
          data: {
            categoryId: cat.id,
            area,
            latitude: areaData?.lat,
            longitude: areaData?.lng,
            date: new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000),
            forecastedCount: Math.floor(Math.random() * 20) + 5,
            confidence: 0.7 + Math.random() * 0.25,
            trend: ['INCREASING', 'STABLE', 'DECREASING'][Math.floor(Math.random() * 3)],
          },
        });
      }
    }
  }

  // ============================================================
  // SKILL GAPS
  // ============================================================
  await prisma.skillGapRecord.create({
    data: {
      categoryId: 'cat-ac',
      area: 'Satellite',
      expectedDemand: 27,
      availableWorkers: 12,
      gap: 15,
      recommendation: 'Train 8 apprentice workers and recruit 7 experienced AC technicians.',
    },
  });

  await prisma.skillGapRecord.create({
    data: {
      categoryId: 'cat-plumber',
      area: 'Bopal',
      expectedDemand: 18,
      availableWorkers: 6,
      gap: 12,
      recommendation: 'Request shared workforce from neighboring cooperatives and initiate plumber training program.',
    },
  });

  await prisma.skillGapRecord.create({
    data: {
      categoryId: 'cat-electrician',
      area: 'Gota',
      expectedDemand: 22,
      availableWorkers: 14,
      gap: 8,
      recommendation: 'Activate emergency-available electricians from Chandkheda area.',
    },
  });

  // ============================================================
  // COOPERATIVE PROPOSALS
  // ============================================================
  const proposal1 = await prisma.cooperativeProposal.create({
    data: {
      cooperativeId: cooperatives[0].id,
      title: 'Increase welfare contribution from 2% to 3%',
      description: 'Proposal to increase the welfare fund contribution from 2% to 3% of each job earning to provide better insurance coverage and training opportunities for all cooperative members.',
      status: 'OPEN',
      createdById: 'user-coopadmin-1',
    },
  });

  const proposal2 = await prisma.cooperativeProposal.create({
    data: {
      cooperativeId: cooperatives[0].id,
      title: 'Adopt new safety equipment standards',
      description: 'Require all electricians and AC technicians to use standardized safety equipment. The cooperative will provide 50% subsidy on safety gear purchase.',
      status: 'OPEN',
      createdById: 'user-coopadmin-1',
    },
  });

  // Sample votes
  for (let i = 0; i < 10; i++) {
    await prisma.vote.create({
      data: {
        proposalId: proposal1.id,
        userId: `user-worker-${i + 1}`,
        vote: i < 7 ? 'YES' : i < 9 ? 'NO' : 'ABSTAIN',
      },
    });
  }

  // ============================================================
  // FRAUD ALERTS
  // ============================================================
  await prisma.fraudAlert.create({
    data: {
      type: 'REPEATED_CANCELLATIONS',
      entityType: 'CUSTOMER',
      entityId: 'customer-15',
      riskLevel: 'MEDIUM',
      reason: 'Customer has cancelled 8 out of last 10 bookings within 5 minutes of worker acceptance.',
      evidence: JSON.stringify({ cancellations: 8, total: 10, period: '30 days' }),
      status: 'OPEN',
    },
  });

  await prisma.fraudAlert.create({
    data: {
      type: 'UNUSUAL_REVIEWS',
      entityType: 'WORKER',
      entityId: 'worker-22',
      riskLevel: 'LOW',
      reason: 'Worker received 5 identical 5-star reviews from different customers within 24 hours.',
      evidence: JSON.stringify({ identicalReviews: 5, period: '24 hours' }),
      status: 'OPEN',
    },
  });

  // ============================================================
  // TRUSTED WORKERS
  // ============================================================
  for (let i = 0; i < 10; i++) {
    await prisma.trustedWorker.create({
      data: {
        customerId: `demo-customer-${(i % 20) + 1}`,
        workerId: `demo-worker-${(i * 3 % 40) + 1}`,
      },
    });
  }

  // ============================================================
  // NOTIFICATIONS (sample)
  // ============================================================
  for (let i = 0; i < 20; i++) {
    await prisma.notification.create({
      data: {
        userId: `user-customer-${(i % 20) + 1}`,
        type: ['BOOKING', 'PAYMENT', 'WORKER', 'WARRANTY'][i % 4],
        title: ['Booking Confirmed', 'Payment Received', 'Worker Assigned', 'Warranty Active'][i % 4],
        body: ['Your booking has been confirmed.', 'Payment of ₹650 received.', 'Worker Raj Patel has been assigned.', 'Your 14-day warranty is now active.'][i % 4],
        readAt: i % 3 === 0 ? new Date() : undefined,
      },
    });
  }

  // ============================================================
  // SOCIETY SERVICE REQUESTS
  // ============================================================
  await prisma.societyServiceRequest.create({
    data: {
      societyId: society1.id,
      title: 'Common area plumbing repair',
      description: 'Water leakage in the ground floor common area bathroom.',
      priority: 'HIGH',
      area: 'Common Area - Ground Floor',
      status: 'OPEN',
    },
  });

  await prisma.societyServiceRequest.create({
    data: {
      societyId: society1.id,
      title: 'Garden maintenance',
      description: 'Monthly garden and lawn maintenance for the society.',
      priority: 'NORMAL',
      area: 'Garden',
      status: 'SCHEDULED',
    },
  });

  // ============================================================
  // MAINTENANCE CONTRACTS
  // ============================================================
  await prisma.maintenanceContract.create({
    data: {
      societyId: society1.id,
      title: 'Monthly Elevator Maintenance',
      frequency: 'MONTHLY',
      nextService: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      lastService: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      cost: 5000,
      status: 'ACTIVE',
    },
  });

  await prisma.maintenanceContract.create({
    data: {
      societyId: society1.id,
      title: 'Quarterly AC Maintenance',
      frequency: 'QUARTERLY',
      categoryId: 'cat-ac',
      nextService: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      lastService: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      cost: 15000,
      status: 'ACTIVE',
    },
  });

  // ============================================================
  // INSTITUTION CONTRACTS
  // ============================================================
  await prisma.institutionContract.create({
    data: {
      institutionId: inst1.id,
      title: 'Annual Maintenance Contract',
      description: 'Comprehensive maintenance contract covering electrical, plumbing, and cleaning services.',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      totalValue: 240000,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('📊 Summary:');
  console.log(`   - Federation: 1`);
  console.log(`   - Cooperatives: 5`);
  console.log(`   - Workers: 50 (40 verified)`);
  console.log(`   - Customers: 20`);
  console.log(`   - Service Categories: ${categories.length}`);
  console.log(`   - Skills: ${skills.length}`);
  console.log(`   - Bookings: 220`);
  console.log(`   - Housing Societies: 2`);
  console.log(`   - Institutions: 1`);
  console.log(`   - Demand History: ${90 * demandAreas.length * 5} records`);
  console.log(`   - Fraud Alerts: 2`);
  console.log(`   - Proposals: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
