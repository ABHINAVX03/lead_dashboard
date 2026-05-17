import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Lead } from '../models/Lead';
import { User } from '../models/User';

dotenv.config();

const DEFAULT_SEED_EMAIL = 'admin@example.com';
const DEFAULT_SEED_PASSWORD = 'Admin123';

// Sample data pools
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Susan', 'Richard', 'Jessica', 'Joseph', 'Sarah',
  'Thomas', 'Karen', 'Charles', 'Nancy', 'Christopher', 'Lisa', 'Daniel', 'Betty',
  'Matthew', 'Margaret', 'Anthony', 'Sandra', 'Donald', 'Ashley', 'Mark', 'Emily'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'company.com', 'example.org'];

const statuses: Array<'New' | 'Contacted' | 'Qualified' | 'Lost'> = [
  'New', 'Contacted', 'Qualified', 'Lost'
];

const sources: Array<'Website' | 'Instagram' | 'Referral'> = [
  'Website', 'Instagram', 'Referral'
];

// Helper to get random item
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate random date within last 90 days
const randomDate = (): Date => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const date = new Date(now);
  date.setDate(now.getDate() - daysAgo);
  return date;
};

// Generate 50 leads
const generateLeads = (userId: string) => {
  const leads = [];
  for (let i = 0; i < 50; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@${randomItem(domains)}`;
    
    leads.push({
      name,
      email,
      status: randomItem(statuses),
      source: randomItem(sources),
      createdBy: userId,
      createdAt: randomDate(),
      updatedAt: new Date(),
    });
  }
  return leads;
};

const getSeedUserEmail = (): string => {
  const emailArg = process.argv.find((arg) => arg.startsWith('--email='));
  return emailArg?.split('=')[1] || process.env.SEED_USER_EMAIL || DEFAULT_SEED_EMAIL;
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const seedUserEmail = getSeedUserEmail().toLowerCase();
    let user = await User.findOne({ email: seedUserEmail });

    if (!user) {
      user = await User.create({
        name: 'Demo Admin',
        email: seedUserEmail,
        password: DEFAULT_SEED_PASSWORD,
        role: 'admin',
      });
      console.log(`Created seed user: ${seedUserEmail}`);
    }

    console.log(`Using user: ${user.name} (${user.email})`);

    await Lead.deleteMany({ createdBy: user._id });
    console.log('Cleared existing sample leads for seed user');

    // Generate and insert 50 leads
    const leads = generateLeads(user._id.toString());
    await Lead.insertMany(leads);
    console.log(`Inserted ${leads.length} sample leads`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
