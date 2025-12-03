import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  let connection;

  try {
    console.log('🔄 Running database migration...');

    // First, connect to MySQL without specifying a database
    console.log('📡 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '3306'),
    });

    console.log('✓ Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'lottopro';
    console.log(`📝 Creating database '${dbName}' if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database '${dbName}' ready`);

    // Use the database
    await connection.query(`USE ${dbName}`);
    console.log(`✓ Using database '${dbName}'`);

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    // Remove comments and split by semicolon
    const statements = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`\n📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements
      if (!statement || statement.length < 5) continue;

      try {
        await connection.query(statement);

        // Log progress for important statements
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1];
          console.log(`✓ Created table: ${tableName}`);
        } else if (statement.toUpperCase().includes('CREATE VIEW')) {
          const viewName = statement.match(/CREATE VIEW (\w+)/i)?.[1];
          console.log(`✓ Created view: ${viewName}`);
        }
      } catch (error: any) {
        // Ignore "table already exists" errors
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.errno === 1050) {
          const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1];
          console.log(`⚠ Table already exists: ${tableName}`);
        } else {
          console.error(`\n✗ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }

    console.log('\n✅ Database migration completed successfully!');
    console.log('✅ All tables and views created');
    console.log(`\n📊 Database: ${dbName}`);
    console.log(`🔗 Connection: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);

    // Close the connection
    await connection.end();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure MySQL is running and the connection details are correct:');
      console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`);
      console.error(`   Port: ${process.env.DB_PORT || '3306'}`);
      console.error(`   User: ${process.env.DB_USER || 'root'}`);
    }

    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
};

runMigration();
