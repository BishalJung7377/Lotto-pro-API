# Lottery Pro Backend API

A comprehensive REST API for managing lottery store inventory, ticket scanning, and sales reporting.

## Features

- User authentication with JWT
- Multi-store management
- 50 different lottery types inventory tracking
- Barcode ticket scanning
- Real-time inventory updates
- Sales analytics and reporting
- Scan history tracking

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **API Style**: RESTful

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd lottery_pro_backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=lottery_pro
JWT_SECRET=your_secret_key
```

4. Create the PostgreSQL database:
```bash
createdb lottery_pro
```

5. Run database migrations:
```bash
npm run migrate
```

This will create all tables and insert the 50 lottery types.

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` by default.

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "1234567890"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "1234567890"
  },
  "token": "jwt_token_here",
  "message": "User registered successfully"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

### Store Management

#### Get All Stores
```http
GET /stores
Authorization: Bearer {token}
```

Response:
```json
{
  "stores": [
    {
      "id": 1,
      "name": "Downtown Store",
      "address": "123 Main St",
      "lottery_count": 50,
      "total_active_tickets": 2500
    }
  ]
}
```

#### Create Store
```http
POST /stores
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Store",
  "address": "456 Oak Ave",
  "phone": "5551234567"
}
```

#### Update Store
```http
PUT /stores/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Store Name",
  "active": true
}
```

#### Delete Store
```http
DELETE /stores/:id
Authorization: Bearer {token}
```

### Lottery Inventory

#### Get All Lottery Types
```http
GET /lottery/types
Authorization: Bearer {token}
```

Response:
```json
{
  "lotteryTypes": [
    {
      "id": 1,
      "name": "Lucky 7s",
      "price": 1.00,
      "image_emoji": "🎰",
      "description": "Classic 7s scratch-off game"
    }
  ]
}
```

#### Get Store Inventory
```http
GET /lottery/store/:storeId/inventory
Authorization: Bearer {token}
```

Response:
```json
{
  "inventory": [
    {
      "id": 1,
      "lottery_type_id": 1,
      "name": "Lucky 7s",
      "price": 1.00,
      "total_count": 100,
      "current_count": 75,
      "image_emoji": "🎰"
    }
  ]
}
```

#### Get Lottery Detail
```http
GET /lottery/store/:storeId/lottery/:lotteryTypeId
Authorization: Bearer {token}
```

#### Update Inventory
```http
PUT /lottery/store/:storeId/lottery/:lotteryTypeId
Authorization: Bearer {token}
Content-Type: application/json

{
  "total_count": 150,
  "current_count": 120
}
```

### Ticket Scanning

#### Scan Ticket
```http
POST /scan/ticket
Authorization: Bearer {token}
Content-Type: application/json

{
  "barcode_data": "LT-1-42",
  "store_id": 1
}
```

Barcode format: `LT-{lottery_type_id}-{ticket_number}`

Response:
```json
{
  "message": "Ticket marked as sold",
  "ticket": {
    "id": 1,
    "ticket_number": 42,
    "sold": true,
    "sold_date": "2025-12-02T10:30:00Z"
  },
  "decoded": {
    "lottery_type_id": 1,
    "ticket_number": 42,
    "isValid": true
  },
  "lottery": {
    "name": "Lucky 7s",
    "price": 1.00
  },
  "inventory": {
    "current_count": 74
  }
}
```

#### Get Scan History
```http
GET /scan/history/:storeId?limit=50
Authorization: Bearer {token}
```

### Reporting

#### Get Store Report
```http
GET /reports/store/:storeId
Authorization: Bearer {token}
```

Response includes:
- Inventory summary
- Revenue by lottery type
- Recent scans
- Sales by date (last 30 days)

#### Get Lottery Report
```http
GET /reports/store/:storeId/lottery/:lotteryTypeId
Authorization: Bearer {token}
```

Response includes:
- Lottery details
- Sold tickets list
- Available tickets
- Statistics (sell-through rate, revenue)

#### Get Sales Analytics
```http
GET /reports/store/:storeId/analytics?days=30
Authorization: Bearer {token}
```

Response includes:
- Sales by lottery type
- Sales by hour of day
- Sales by day of week

## Database Schema

### Tables

1. **users** - Store owners/managers
2. **stores** - Lottery stores
3. **lottery_types** - 50 different scratch-off lottery games
4. **store_lottery_inventory** - Inventory per store
5. **tickets** - Individual ticket tracking
6. **scanned_tickets** - Scan history log

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

Error response format:
```json
{
  "error": "Error message here"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes require valid JWT token
- SQL injection prevention with parameterized queries

## Development

### Project Structure
```
src/
├── config/          # Database configuration
├── controllers/     # Request handlers
├── database/        # Schema and migrations
├── middleware/      # Auth middleware
├── models/          # TypeScript types
├── routes/          # API routes
├── utils/           # Helper functions
└── server.ts        # Main application
```

### Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations

## License

ISC
