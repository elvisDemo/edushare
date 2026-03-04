const { initDatabase, getDatabase, getDb, closeDatabase } = require('./main/database/db');

console.log('Testing database connection...');

try {
  // Mock app.getPath for testing
  const { app } = require('electron');
  const originalGetPath = app.getPath;
  app.getPath = (name) => {
    if (name === 'userData') {
      return './test-user-data';
    }
    return originalGetPath ? originalGetPath(name) : './';
  };
  
  initDatabase();
  console.log('Database initialized successfully');
  
  const db1 = getDatabase();
  console.log('getDatabase() returned:', db1 ? 'Database object' : 'null');
  
  const db2 = getDb();
  console.log('getDb() returned:', db2 ? 'Database object' : 'null');
  
  console.log('db1 === db2:', db1 === db2);
  
  closeDatabase();
  console.log('Database closed successfully');
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}