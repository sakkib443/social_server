import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

const PORT = config.port || 5000;

async function main() {
  try {
    // Try to connect to MongoDB (with timeout)
    console.log('⏳ Connecting to database...');
    
    await mongoose.connect(config.database_url as string, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.warn('⚠️ Database connection failed. Running without database.');
    console.warn('   Set DATABASE_URL in .env to connect to MongoDB');
  }

  // Start server regardless of database connection (for testing)
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${config.node_env}`);
  });
}

main();
