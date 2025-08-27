const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();
const User = require('./models/User');
const Lead = require('./models/Lead');
async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  await Lead.deleteMany({});
  const password = 'Test@1234';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await User.create({ name: 'Test User', email: 'testuser@example.com', passwordHash });
  const sources = ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'];
  const statuses = ['new', 'contacted', 'qualified', 'lost', 'won'];
  function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  const sampleCities = ['Bengaluru', 'Hyderabad', 'Chennai', 'Mumbai', 'Pune', 'Kolkata'];
  const sampleStates = ['Karnataka', 'Telangana', 'Tamil Nadu', 'Maharashtra', 'West Bengal'];
  const leads = [];
  for (let i = 1; i <= 120; i++) {
    const first = 'Lead' + i;
    const last = 'User' + i;
    const email = `lead${i}@example.com`;
    const phone = '9' + (100000000 + i);
    const company = 'Company' + randInt(1, 50);
    const city = sampleCities[randInt(0, sampleCities.length - 1)];
    const state = sampleStates[randInt(0, sampleStates.length - 1)];
    const source = sources[randInt(0, sources.length - 1)];
    const status = statuses[randInt(0, statuses.length - 1)];
    const score = randInt(0, 100);
    const lead_value = randInt(100, 10000);
    const last_activity_at = Math.random() > 0.5 ? new Date(Date.now() - randInt(0, 1000) * 3600 * 24) : null;
    const is_qualified = Math.random() > 0.8;
    leads.push({
      first_name: first,
      last_name: last,
      email,
      phone,
      company,
      city,
      state,
      source,
      status,
      score,
      lead_value,
      last_activity_at,
      is_qualified
    });
  }
  await Lead.insertMany(leads);
  console.log('Seeded: user testuser@example.com password Test@1234 and 120 leads');
  process.exit(0);
}
seed().catch(err => {
  console.error(err);
  process.exit(1);
});
