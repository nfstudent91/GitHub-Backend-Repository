# Lead Reminder Feature Documentation

## Overview
The Lead Reminder feature allows users to set reminders for specific leads to ensure timely follow-ups and prevent leads from falling through the cracks.

## Database Schema

### Table: `lead_reminder`
- **id** (INT, PRIMARY KEY, AUTO_INCREMENT)
- **lead_id** (INT, FOREIGN KEY → leads.id)
- **user_id** (INT, FOREIGN KEY → users.id) - User who will receive the reminder
- **title** (VARCHAR(200)) - Reminder title
- **description** (TEXT, NULLABLE) - Detailed description
- **reminder_date_time** (DATETIME) - When the reminder should trigger
- **status** (ENUM: 'pending', 'completed', 'dismissed') - Reminder status
- **type** (ENUM: 'email', 'notification', 'sms') - Reminder delivery method
- **createdBy** (VARCHAR(100), NULLABLE)
- **createdAt** (DATETIME)
- **updatedAt** (DATETIME)

## API Endpoints

### Base URL: `/api/lead-reminders`

#### 1. **GET** `/api/lead-reminders`
Get all reminders

**Response:**
```json
{
  "success": true,
  "message": "Reminders retrieved successfully",
  "data": [...],
  "count": 10
}
```

---

#### 2. **GET** `/api/lead-reminders/:id`
Get reminder by ID

**Parameters:**
- `id` - Reminder ID

**Response:**
```json
{
  "success": true,
  "message": "Reminder retrieved successfully",
  "data": {
    "id": 1,
    "leadId": 5,
    "userId": 2,
    "title": "Follow up with John Doe",
    "description": "Discuss loan application details",
    "reminderDateTime": "2024-12-10T10:00:00.000Z",
    "status": "pending",
    "type": "notification",
    "lead": {...},
    "user": {...}
  }
}
```

---

#### 3. **GET** `/api/lead-reminders/lead/:leadId`
Get all reminders for a specific lead

**Parameters:**
- `leadId` - Lead ID

---

#### 4. **GET** `/api/lead-reminders/user/:userId`
Get all reminders assigned to a specific user

**Parameters:**
- `userId` - User ID

---

#### 5. **GET** `/api/lead-reminders/status/:status`
Get reminders by status

**Parameters:**
- `status` - One of: `pending`, `completed`, `dismissed`

---

#### 6. **GET** `/api/lead-reminders/pending`
Get all pending reminders

---

#### 7. **GET** `/api/lead-reminders/upcoming`
Get upcoming reminders (pending reminders with future dates)

**Query Parameters:**
- `userId` (optional) - Filter by user ID

**Example:**
```
GET /api/lead-reminders/upcoming?userId=2
```

---

#### 8. **GET** `/api/lead-reminders/overdue`
Get overdue reminders (pending reminders with past dates)

**Query Parameters:**
- `userId` (optional) - Filter by user ID

**Example:**
```
GET /api/lead-reminders/overdue?userId=2
```

---

#### 9. **POST** `/api/lead-reminders`
Create a new reminder

**Request Body:**
```json
{
  "leadId": 5,
  "userId": 2,
  "title": "Follow up with customer",
  "description": "Discuss loan application details",
  "reminderDateTime": "2024-12-10T10:00:00.000Z",
  "status": "pending",
  "type": "notification"
}
```

**Validation:**
- `leadId` is required
- `userId` is required
- `title` is required
- `reminderDateTime` is required and must be in the future
- Both lead and user must exist

**Response:**
```json
{
  "success": true,
  "message": "Reminder created successfully",
  "data": {...}
}
```

---

#### 10. **PUT** `/api/lead-reminders/:id`
Update a reminder

**Parameters:**
- `id` - Reminder ID

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "reminderDateTime": "2024-12-11T14:00:00.000Z",
  "status": "pending"
}
```

---

#### 11. **PUT** `/api/lead-reminders/:id/complete`
Mark a reminder as completed

**Parameters:**
- `id` - Reminder ID

**Response:**
```json
{
  "success": true,
  "message": "Reminder marked as completed",
  "data": {...}
}
```

---

#### 12. **PUT** `/api/lead-reminders/:id/dismiss`
Mark a reminder as dismissed

**Parameters:**
- `id` - Reminder ID

---

#### 13. **DELETE** `/api/lead-reminders/:id`
Delete a reminder

**Parameters:**
- `id` - Reminder ID

---

#### 14. **GET** `/api/lead-reminders/count`
Get total reminder count

**Response:**
```json
{
  "success": true,
  "message": "Reminder count retrieved successfully",
  "count": 25
}
```

---

## Reminder Status Types

- **pending** - Reminder is active and waiting to be triggered
- **completed** - User has marked the reminder as completed
- **dismissed** - User has dismissed the reminder

## Reminder Types

- **email** - Send reminder via email
- **notification** - Send in-app notification
- **sms** - Send reminder via SMS

## Usage Examples

### Create a reminder for a lead
```bash
POST /api/lead-reminders
{
  "leadId": 10,
  "userId": 3,
  "title": "Call customer about loan approval",
  "description": "Customer requested callback at 10 AM",
  "reminderDateTime": "2024-12-10T10:00:00.000Z",
  "type": "notification"
}
```

### Get all overdue reminders for current user
```bash
GET /api/lead-reminders/overdue?userId=3
```

### Mark reminder as completed
```bash
PUT /api/lead-reminders/5/complete
```

## Migration

Run the migration to create the `lead_reminder` table:

```bash
npm run typeorm migration:run
```

To revert:
```bash
npm run typeorm migration:revert
```

## Files Created

1. **Entity**: `src/entities/LeadReminder.ts`
2. **Migration**: `src/migrations/1733485205000-CreateLeadReminderTable.ts`
3. **Repository**: `src/repositories/leadReminder.repository.ts`
4. **Service**: `src/services/leadReminder.service.ts`
5. **Controller**: `src/controllers/leadReminder.controller.ts`
6. **Routes**: `src/routes/leadReminder.routes.ts`

## Features

✅ **CRUD Operations** - Create, Read, Update, Delete reminders
✅ **Status Management** - Mark as completed/dismissed
✅ **Filtering** - By lead, user, status
✅ **Upcoming/Overdue** - Smart filtering for active reminders
✅ **Validation** - Ensures dates are in future, entities exist
✅ **Authentication** - All routes require authentication
✅ **Relations** - Full lead and user data included in responses

## Next Steps (Future Enhancements)

- Implement background job to send actual notifications
- Email integration for email-type reminders
- SMS integration for SMS-type reminders
- Push notifications for mobile apps
- Recurring reminders
- Reminder templates
