const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'mongodb+srv://socialvillage:socialvillage@cluster0.b5kfivm.mongodb.net/socialvillage?appName=Cluster0';

const users = [
  { firstName: 'Sakib', lastName: 'Ahmed', email: 'sakib@test.com', password: 'Test1234' },
  { firstName: 'Rahim', lastName: 'Khan', email: 'rahim@test.com', password: 'Test1234' },
  { firstName: 'Karim', lastName: 'Hasan', email: 'karim@test.com', password: 'Test1234' },
];

async function seedUsers() {
  const client = new MongoClient(DATABASE_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('socialvillage');
    const usersCollection = db.collection('users');
    
    for (const user of users) {
      // Check if user exists
      const existing = await usersCollection.findOne({ email: user.email });
      if (existing) {
        console.log(`User ${user.email} already exists, skipping...`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      // Insert user
      const now = new Date();
      await usersCollection.insertOne({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        avatar: null,
        createdAt: now,
        updatedAt: now,
      });
      
      console.log(`Created user: ${user.email}`);
    }
    
    console.log('\n=== Test Users Created ===');
    console.log('Email: sakib@test.com | Password: Test1234');
    console.log('Email: rahim@test.com | Password: Test1234');
    console.log('Email: karim@test.com | Password: Test1234');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

seedUsers();
