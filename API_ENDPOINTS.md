# CRM API Endpoints Documentation

## Base URL
```
http://localhost:3000/api
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {},
  "count": 0  // Optional, for list responses
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

**Security Note:** Passwords are never returned in any API responses. All user-related endpoints automatically exclude password fields for security purposes.

---

## Public Endpoints (No Authentication Required)

### 1. Health Check
**GET** `/health`

**Response:**
```json
{
  "status": "ok",
  "message": "CRM API is running"
}
```

---

### 2. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "fullname": "John Doe",
  "username": "johndoe",
  "password": "password123",
  "email": "john@example.com",
  "phone": "1234567890",
  "roleId": 1,
  "createdBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "1234567890",
      "roleId": 1,
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400 Bad Request` - Username or email already exists, required fields missing, or invalid role ID

---

### 3. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "fullname": "System Administrator",
      "username": "admin",
      "email": "admin@example.com",
      "phone": "1234567890",
      "roleId": 1,
      "role": {
        "id": 1,
        "name": "Admin"
      },
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials or user account is inactive

---

### 3. Forgot Password
**POST** `/api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link will be sent",
  "data": null
}
```

**Error Responses:**
- `400 Bad Request` - Email is required

**Security Note:** The API always returns a success message even if the email doesn't exist to prevent email enumeration attacks.

---

## Protected Endpoints (Authentication Required)

### Dashboard API

#### Get Advisor Dashboard 
- **URL**: `/api/dashboard/advisor/:userId`
- **Method**: `GET`
- **Description**: Retrieves dashboard statistics and today's schedule for a specific advisor.
- **Success Response**:  
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "activeOpportunities": 24,
      "pendingAgreements": 7,
      "closeRate": "68.5%",
      "pipelineStages": [
        { "stageName": "Consultation", "count": 12, "color": "#FFC107" },
        { "stageName": "Proposal", "count": 8, "color": "#2196F3" }
      ],
      "todayAssignedLeads": [
        {
          "id": 101,
          "name": "Sarah Johnson",
          "phone": "1234567890",
          "email": "sarah.j@example.com",
          "status": "New",
          "stage": "Consultation",
          "assignedAt": "2024-03-15T09:00:00Z"
        }
      ],
      "interactionVolume": {
        "call": 15,
        "whatsapp": 8,
        "email": 12,
        "meetings": 3
      },
      "recentActivities": [
        {
          "type": "call",
          "title": "Follow-up call",
          "leadName": "James Anderson",
          "time": "2024-03-15T10:30:00Z",
          "timeAgo": "2 hours ago",
          "description": "Rescheduled to Friday"
        },
        {
          "type": "reminder",
          "title": "Meeting completed",
          "leadName": "Sarah Johnson",
          "time": "2024-03-15T09:00:00Z",
          "timeAgo": "4 hours ago",
          "description": "Initial requirements gathered"
        }
      ]
    }
    ```



#### Get Telecaller Dashboard
- **URL**: `/api/dashboard/telecaller/:userId`
- **Method**: `GET`
- **Description**: Retrieves dashboard statistics, priority queue, and recent logs for a telecaller.
- **Success Response**:  
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "callsMadeToday": 46,
      "connectedCalls": 20,
      "pendingFollowUps": 5,
      "connectRate": "43%",
      "todaysOutcomes": [
        { "label": "Connected", "value": 20 },
        { "label": "No Answer", "value": 13 }
      ],
      "priorityQueue": [
        { "id": 101, "name": "Iqbal Singh", "phone": "971547304047", "status": "New" }
      ],
      "recentLogs": [
        {
          "leadName": "Alex Thompson",
          "outcome": "Connected",
          "timeAgo": "10 min ago"
        }
      ],
      "weeklyPerformance": [
        { "date": "2024-03-11", "count": 45 },
        { "date": "2024-03-12", "count": 52 }
      ]
    }
    ```

#### Get Processing Dashboard
- **URL**: `/api/dashboard/processing/:userId`
- **Method**: `GET`
- **Description**: Retrieves dashboard statistics, expiry alerts, and recent files for processing.
- **Success Response**:  
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Processing dashboard data retrieved successfully",
      "data": {
        "totalLeads": 42,
        "pendingLeads": 15,
        "expiredLeads": 8,
        "uploadedDocuments": 12,
        "expiryAlerts": [
          {
            "leadName": "James Wilson",
            "documentType": "Passport Copy",
            "expiryDate": "2026-01-20",
            "daysLeft": 3
          }
        ]
      }
    }
    ```

#### Get Admin Dashboard
- **URL**: `/api/dashboard/admin`
- **Method**: `GET`
- **Description**: Retrieves high-level dashboard statistics for Admin and Manager roles.
- **Headers**:
  ```
  Authorization: Bearer <token>
  ```
- **Success Response**:  
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Admin dashboard data retrieved successfully",
      "data": {
        "summary": {
          "totalClients": {
            "value": 245,
            "growth": "+12.5%",
            "label": "Active client accounts"
          },
          "activity": {
            "value": 1240,
            "growth": "+8.2%",
            "label": "Interactions this week"
          },
          "meetings": {
            "value": 142,
            "growth": "+5.4%",
            "label": "Scheduled this week"
          },
          "conversion": {
            "value": "24.5%",
            "growth": "+2.1%",
            "label": "Lead to client rate"
          }
        },
        "performanceChart": [
          { "month": "Jan", "total": 120, "converted": 30 },
          { "month": "Feb", "total": 150, "converted": 45 }
        ],
        "pipelineChart": [
          { "label": "Cold", "count": 450, "color": "#94a3b8" },
          { "label": "Hot", "count": 120, "color": "#ef4444" }
        ]
      }
    }
    ```

### 4. Get Current User Profile
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "fullname": "System Administrator",
    "username": "admin",
    "email": "admin@example.com",
    "phone": "1234567890",
    "roleId": 1,
    "role": {
      "id": 1,
      "name": "Admin"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - User not found

---

### 5. Change Password
**POST** `/api/auth/change-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Old password and new password are required, new password must be at least 6 characters, or old password is incorrect
- `401 Unauthorized` - Invalid or missing token

---

### 5.5. Logout User
**POST** `/api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

#### 13. Update User Password by ID (Admin/Manager)
**PUT** `/api/auth/users/:id/password`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (path parameter) - User ID

**Request Body:**
```json
{
  "password": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Password required or too short
- `404 Not Found` - User not found
- `401 Unauthorized` - Token missing or invalid

---

### 6. Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Token and new password are required, password must be at least 6 characters, invalid or expired token
- `500 Internal Server Error` - Error resetting password

**Note:** The reset token expires after 1 hour. After successful password reset, the token is invalidated.

---

### 7. Upload File (S3)
**POST** `/api/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `file` (form-data, file) - File to upload (max 15MB)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "url": "https://your-bucket.s3.region.amazonaws.com/uploads/1712345678901-filename.jpg",
    "key": "uploads/1712345678901-filename.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request` - No file uploaded or file too large
- `500 Internal Server Error` - S3 upload failed

---

### 8. Search Documents
**GET** `/api/documents/search`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `searchText` (optional) - Search text matching document label or lead name

**Response:**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "Pending",
      "documentLabel": "Passport",
      "expiryDate": "2025-01-01",
      "url": "https://example.com/file.jpg",
      "leadId": 101,
      "uploadedBy": "system",
      "createdAt": "2024-03-15T10:00:00Z",
      "lead": {
        "id": 101,
        "fullname": "John Doe"
      }
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `500 Internal Server Error` - Error searching documents

## Admin Only Endpoints (Authentication + Admin Role Required)

### Roles API

#### 6. Get All Roles
**GET** `/api/roles`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Admin",
      "isActive": true,
      "createdBy": "system",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "users": []
    }
  ],
  "count": 1
}
```

---

#### 7. Get Role by ID
**GET** `/api/roles/:id`

**Parameters:**
- `id` (path parameter) - Role ID

**Response:**
```json
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "id": 1,
    "name": "Admin",
    "isActive": true,
    "createdBy": "system",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "users": []
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid role ID
- `404 Not Found` - Role not found

---

#### 8. Create Role
**POST** `/api/roles`

**Request Body:**
```json
{
  "name": "Sales Manager",
  "isActive": true,
  "createdBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": 5,
    "name": "Sales Manager",
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Name is required or already exists

---

#### 9. Update Role
**PUT** `/api/roles/:id`

**Parameters:**
- `id` (path parameter) - Role ID

**Request Body:**
```json
{
  "name": "Senior Sales Manager",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": 5,
    "name": "Senior Sales Manager",
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or name already exists
- `404 Not Found` - Role not found

---

#### 10. Delete Role
**DELETE** `/api/roles/:id`

**Parameters:**
- `id` (path parameter) - Role ID

**Response:**
```json
{
  "success": true,
  "message": "Role deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or role has active users
- `404 Not Found` - Role not found

---

#### 11. Get Role Count
**GET** `/api/roles/count`

**Response:**
```json
{
  "success": true,
  "message": "Role count retrieved successfully",
  "count": 4
}
```

---

### Stages API

#### 12. Get All Stages
**GET** `/api/stages`

**Response:**
```json
{
  "success": true,
  "message": "Stages retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "New",
      "isActive": true,
      "createdBy": "system",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "leads": []
    }
  ],
  "count": 8
}
```

---

#### 13. Get Stage by ID
**GET** `/api/stages/:id`

**Parameters:**
- `id` (path parameter) - Stage ID

**Response:**
```json
{
  "success": true,
  "message": "Stage retrieved successfully",
  "data": {
    "id": 1,
    "name": "Cold",
    "isActive": true,
    "createdBy": "system",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "leads": []
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid stage ID
- `404 Not Found` - Stage not found

---

#### 14. Create Stage
**POST** `/api/stages`

**Request Body:**
```json
{
  "name": "Qualified",
  "isActive": true,
  "createdBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage created successfully",
  "data": {
    "id": 9,
    "name": "Qualified",
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Name is required or already exists

---

#### 15. Update Stage
**PUT** `/api/stages/:id`

**Parameters:**
- `id` (path parameter) - Stage ID

**Request Body:**
```json
{
  "name": "Pre-Qualified",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stage updated successfully",
  "data": {
    "id": 9,
    "name": "Pre-Qualified",
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or name already exists
- `404 Not Found` - Stage not found

---

#### 16. Delete Stage
**DELETE** `/api/stages/:id`

**Parameters:**
- `id` (path parameter) - Stage ID

**Response:**
```json
{
  "success": true,
  "message": "Stage deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or stage has active leads
- `404 Not Found` - Stage not found

---

#### 17. Get Stage Count
**GET** `/api/stages/count`

**Response:**
```json
{
  "success": true,
  "message": "Stage count retrieved successfully",
  "count": 8
}
```

---

### Follow-Up Types API

#### 18. Get All Follow-Up Types
**GET** `/api/followups`

**Response:**
```json
{
  "success": true,
  "message": "Follow-up types retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Call",
      "isActive": true,
      "createdBy": "system",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "leadAttempts": []
    }
  ],
  "count": 3
}
```

---

#### 19. Get Follow-Up Type by ID
**GET** `/api/followups/:id`

**Parameters:**
- `id` (path parameter) - Follow-up type ID

**Response:**
```json
{
  "success": true,
  "message": "Follow-up type retrieved successfully",
  "data": {
    "id": 1,
    "name": "Call",
    "isActive": true,
    "createdBy": "system",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "leadAttempts": []
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid follow-up type ID
- `404 Not Found` - Follow-up type not found

---

#### 20. Create Follow-Up Type
**POST** `/api/followups`

**Request Body:**
```json
{
  "name": "SMS",
  "isActive": true,
  "createdBy": "admin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow-up type created successfully",
  "data": {
    "id": 4,
    "name": "SMS",
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Name is required or already exists

---

#### 21. Update Follow-Up Type
**PUT** `/api/followups/:id`

**Parameters:**
- `id` (path parameter) - Follow-up type ID

**Request Body:**
```json
{
  "name": "Text Message",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow-up type updated successfully",
  "data": {
    "id": 4,
    "name": "Text Message",
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or name already exists
- `404 Not Found` - Follow-up type not found

---

#### 22. Delete Follow-Up Type
**DELETE** `/api/followups/:id`

**Parameters:**
- `id` (path parameter) - Follow-up type ID

**Response:**
```json
{
  "success": true,
  "message": "Follow-up type deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or follow-up type has lead attempts
- `404 Not Found` - Follow-up type not found

---

#### 23. Get Follow-Up Type Count
**GET** `/api/followups/count`

**Response:**
```json
{
  "success": true,
  "message": "Follow-up type count retrieved successfully",
  "count": 3
}
```

---

### Users API (Admin Only)

#### 24. Get All Users
**GET** `/api/admin/users`

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 2,
      "fullname": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "phone": "1234567890",
      "roleId": 2,
      "role": {
        "id": 2,
        "name": "Sales Manager"
      },
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Note:** Admin users are excluded from the response.

---

#### 24.5. Get Assignable Users (Excluding Admin and Processing Roles)
**GET** `/api/admin/users/assignable`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 2,
      "fullname": "John Manager",
      "email": "john@example.com",
      "role": {
        "id": 2,
        "name": "Manager"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 3,
      "fullname": "Jane Sales Agent",
      "email": "jane@example.com",
      "role": {
        "id": 3,
        "name": "Sales Agent"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 2
}
```

**Note:** This endpoint returns all users except those with "Admin" or "Processing" roles. Useful for lead assignment dropdowns and user selection.

**Error Responses:**
- `500 Internal Server Error` - Error retrieving users

---

#### 25. Get User by ID
**GET** `/api/admin/users/:id`

**Parameters:**
- `id` (path parameter) - User ID

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 2,
    "fullname": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "1234567890",
    "roleId": 2,
    "role": {
      "id": 2,
      "name": "Sales Manager"
    },
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isPasswordChanged": false
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID
- `404 Not Found` - User not found

---

#### 26. Create User
**POST** `/api/admin/users`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "Sales Manager",
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Username or email already exists, required fields missing, or role not found

---

#### 27. Update User
**PUT** `/api/admin/users/:id`

**Parameters:**
- `id` (path parameter) - User ID

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "password": "newpassword123",
  "role": "Sales Manager",
  "phone": "9876543210",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "fullname": "Jane Smith Updated",
    "username": "janesmith",
    "email": "jane.updated@example.com",
    "phone": "9876543210",
    "roleId": 2,
    "role": {
      "id": 2,
      "name": "Sales Manager"
    },
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID, email already exists, or role not found
- `404 Not Found` - User not found

---

#### 28. Update User Password
**PUT** `/api/admin/users/:id/password`

**Parameters:**
- `id` (path parameter) - User ID

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or password is required
- `404 Not Found` - User not found

---

#### 29. Delete User
**DELETE** `/api/admin/users/:id`

**Parameters:**
- `id` (path parameter) - User ID

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID
- `404 Not Found` - User not found

---

#### 29.5. Get Assignable Users
**GET** `/api/admin/users/assignable`

**Description:**
Returns all active users except those with the "Admin" role. This is useful for populating user assignment dropdowns.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 2,
      "fullname": "Jane Smith",
      "username": "janesmith",
      "email": "jane@example.com",
      "phone": "9876543210",
      "roleId": 2,
      "role": {
        "id": 2,
        "name": "Manager"
      },
      "isActive": true
    }
  ]
}
```

---

#### 30. Get User Count
**GET** `/api/admin/users/count`

**Response:**
```json
{
  "success": true,
  "message": "User count retrieved successfully",
  "count": 10
}
```

---

## Authenticated Endpoints (All Authenticated Users)

### Leads API

#### 30. Get All Leads (Paginated)
**GET** `/api/leads`

**Query Parameters:**
- `page` (optional) - Page number (default: 1, minimum: 1)
- `limit` (optional) - Number of items per page (default: 10, minimum: 1, maximum: 100)
- `stageId` (optional) - Filter by stage ID
- `status` (optional) - Filter by status (hot, cold, dead)
- `search` (optional) - Search through name, email, and phone
- `visaCategory` (optional) - Filter by visa category
- `country` (optional) - Filter by country
- `assignedTo` (optional) - Filter by assigned user ID
- `date` (optional) - Filter by specific date (YYYY-MM-DD)
- `fromDate` (optional) - Filter by start date (YYYY-MM-DD)
- `toDate` (optional) - Filter by end date (YYYY-MM-DD)

**Example Request:**
```
GET /api/leads?page=1&limit=10
GET /api/leads?page=1&limit=10&stageId=1
GET /api/leads?page=1&limit=10&status=hot
GET /api/leads?page=1&limit=10&search=john
GET /api/leads?page=1&limit=10&visaCategory=Skilled%20Worker
GET /api/leads?page=1&limit=10&country=India
GET /api/leads?assignedTo=1
GET /api/leads?date=2024-01-01
GET /api/leads?fromDate=2024-01-01&toDate=2024-01-31
GET /api/leads?page=1&limit=10&stageId=1&status=cold&search=john@example.com
```

**Response:**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "whatsapp": "1234567890",
      "leadDate": "2024-01-01",
      "leadSource": "Facebook Ad",
      "leadSubsource": "Social Media",
      "monthlyIncome": 5000,
      "jobTitle": "Manager",
      "visaCategory": "Skilled Worker",
      "country": "India",
      "targetCountry": "Canada",
      "formData": {
        "extra_info": "any other data"
      },
      "stageId": 1,
      "stage": {
        "id": 1,
        "name": "New"
      },
      "status": "cold",
      "leadOwner": "Jane Smith",
      "assignedTo": "Jane Smith",
      "assignedBy": "Admin",
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Pagination Response Fields:**
- `page` - Current page number
- `limit` - Number of items per page
- `total` - Total number of leads
- `totalPages` - Total number of pages

**Example Requests:**
- `GET /api/leads` - Get first page with default limit (10 items)
- `GET /api/leads?page=2` - Get second page with default limit (10 items)
- `GET /api/leads?page=1&limit=20` - Get first page with 20 items per page
- `GET /api/leads?limit=50` - Get first page with 50 items per page
- `GET /api/leads?status=hot` - Get all hot leads (first page, default limit)
- `GET /api/leads?status=cold` - Get all cold leads (first page, default limit)
- `GET /api/leads?status=dead` - Get all dead leads (first page, default limit)
- `GET /api/leads?stageId=1` - Get leads filtered by stage ID 1
- `GET /api/leads?stageId=2&status=hot` - Get hot leads in stage 2
- `GET /api/leads?search=john` - Search for leads with "john" in name, email, or phone
- `GET /api/leads?page=1&limit=20&stageId=1&status=hot&search=john@example.com` - Combined filters: page 1, 20 items, stage 1, hot status, search "john@example.com"

---

---

#### 30. Get Leads by User ID
**GET** `/api/leads/user/:userId`

**Parameters:**
- `userId` (path parameter) - The ID of the user assigned to the leads.

**Query Parameters:**
- `page` (optional) - Page number (default: 1, minimum: 1)
- `limit` (optional) - Number of items per page (default: 10, minimum: 1, maximum: 100)
- `stageId` (optional) - Filter by stage ID
- `status` (optional) - Filter by status (hot, cold, dead)
- `search` (optional) - Search through name, email, and phone
- `visaCategory` (optional) - Filter by visa category
- `country` (optional) - Filter by country

**Example Request:**
```
GET /api/leads/user/1?page=1&limit=10
GET /api/leads/user/1?page=2&limit=20
GET /api/leads/user/1?stageId=1
GET /api/leads/user/1?status=hot
GET /api/leads/user/1?search=john
GET /api/leads/user/1?visaCategory=Skilled%20Worker
GET /api/leads/user/1?country=India
GET /api/leads/user/1?date=2024-01-01
GET /api/leads/user/1?fromDate=2024-01-01&toDate=2024-01-31
GET /api/leads/user/1?stageId=1&status=cold&search=john@example.com
```

**Response:**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "whatsapp": "1234567890",
      "formData": {},
      "stageId": 1,
      "stage": {
        "id": 1,
        "name": "New"
      },
      "assignments": [
        {
          "id": 1,
          "leadId": 1,
          "assignedTo": 1,
          "assignedBy": 1
        }
      ],
      "isActive": true,
      "createdBy": "system",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "attemptCount": 2
    }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  },
  "count": 1,
  "totalHotLeads": 5,
  "totalAttempts": 10,
  "pendingReminders": 3
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID
- `500 Internal Server Error` - Error retrieving leads

---

#### 31. Get Lead by ID
**GET** `/api/leads/:id`

**Parameters:**
- `id` (path parameter) - Lead ID

**Response:**
```json
{
  "success": true,
  "message": "Lead retrieved successfully",
  "data": {
    "id": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "whatsapp": "1234567890",
    "leadDate": "2024-01-01",
    "leadSource": "Facebook Ad",
    "leadSubsource": "Social Media",
    "monthlyIncome": 5000,
    "jobTitle": "Software Engineer",
    "visaCategory": "Skilled Worker",
    "country": "India",
    "targetCountry": "Canada",
    "formData": {
      "extra_info": "some value"
    },
    "stageId": 1,
    "stage": {
      "id": 1,
      "name": "New"
    },
    "status": "cold",
    "calls": [
      {
        "id": 1,
        "remarks": "Scheduled call",
        "outcome": "Connected",
        "callTime": "2024-01-02T10:00:00.000Z",
        "duration": 120,
        "scheduledTime": "2024-01-02T10:00:00.000Z",
        "createdBy": "admin",
        "createdAt": "2024-01-02T10:00:00.000Z",
        "updatedAt": "2024-01-02T10:00:00.000Z",
        "followType": {
          "id": 1,
          "name": "Call"
        }
      }
    ],
    "whatsApp": [
      {
        "id": 2,
        "remarks": "Sent introductory message",
        "outcome": "Sent",
        "createdBy": "admin",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z",
        "followType": {
          "id": 2,
          "name": "WhatsApp"
        }
      }
    ],
    "email": [
      {
        "id": 3,
        "remarks": "Sent brochure",
        "outcome": "Sent",
        "createdBy": "admin",
        "createdAt": "2024-01-01T11:00:00.000Z",
        "updatedAt": "2024-01-01T11:00:00.000Z",
        "followType": {
          "id": 3,
          "name": "Email"
        }
      }
    ],
    "assignments": [
        {
          "id": 10,
          "assignedTo": 2,
          "assignedToUser": {
            "id": 2,
            "fullname": "Jane Smith",
            "username": "janesmith"
          },
          "assignedBy": 1,
          "assignedByUser": {
             "id": 1,
             "fullname": "Admin",
             "username": "admin"
          },
          "remarks": "Initial assignment",
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    ],
    "histories": [
      {
        "id": 1,
        "assignedTo": 2,
        "assignedToUser": {
          "id": 2,
          "fullname": "Jane Smith",
          "username": "janesmith"
        },
        "assignedBy": 1,
        "assignedByUser": {
          "id": 1,
          "fullname": "Admin",
          "username": "admin"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "attempts": [
      {
        "id": 1,
        "remarks": "Scheduled call",
        "outcome": "Connected",
        "callTime": "2024-01-02T10:00:00.000Z",
        "duration": 120,
        "scheduledTime": "2024-01-02T10:00:00.000Z",
        "createdBy": "admin",
        "createdAt": "2024-01-02T10:00:00.000Z",
        "updatedAt": "2024-01-02T10:00:00.000Z",
        "followTypeId": 1,
        "followType": {
          "id": 1,
          "name": "Call"
        }
      },
      {
        "id": 2,
        "remarks": "Sent introductory message",
        "outcome": "Sent",
        "createdBy": "admin",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z",
        "followTypeId": 2,
        "followType": {
          "id": 2,
          "name": "WhatsApp"
        }
      },
      {
        "id": 3,
        "remarks": "Sent brochure",
        "outcome": "Sent",
        "createdBy": "admin",
        "createdAt": "2024-01-01T11:00:00.000Z",
        "updatedAt": "2024-01-01T11:00:00.000Z",
        "followTypeId": 3,
        "followType": {
          "id": 3,
          "name": "Email"
        }
      }
    ],
    "reminders": [
      {
        "id": 1,
        "title": "Follow up call",
        "description": "Discuss visa requirements",
        "reminderDateTime": "2024-01-05T10:00:00.000Z",
        "status": "pending",
        "type": "notification",
        "createdBy": "admin",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "notes": [
      {
        "id": 1,
        "leadId": 1,
        "text": "Customer is very interested in express entry program",
        "createdBy": "admin",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      },
      {
        "id": 2,
        "leadId": 1,
        "text": "Documents have been submitted for review",
        "createdBy": "john_doe",
        "createdAt": "2024-01-16T14:30:00.000Z",
        "updatedAt": "2024-01-16T14:30:00.000Z"
      }
    ],
    "documents": [
      {
        "id": 1,
        "documentLabel": "Passport",
        "expiryDate": "2030-01-01",
        "url": "https://example.com/passport.pdf",
        "uploadedBy": "admin",
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z"
      }
    ],
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - Lead not found

**Note:** If the current user has `canAccessPreviousLogs` set to `false` in their assignment for this lead, they will **only** see the `attempts`, `calls`, `whatsApp`, `emails`, and `notes` that they created themselves, and they will only see `histories` where they are the assigned user. Users who are not administrators or managers will receive a `403 Forbidden` error if they try to access a lead they are not assigned to.

---

#### 32. Get Leads by Stage
**GET** `/api/leads/stage/:stageId`

**Parameters:**
- `stageId` (path parameter) - Stage ID

**Response:**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "whatsapp": "1234567890",
      "formData": {},
      "stageId": 1,
      "stage": {
        "id": 1,
        "name": "New"
      },
      "status": "cold",
      "assignments": [
        {
          "id": 10,
          "assignedTo": 2,
          "assignedToUser": {
            "id": 2,
            "fullname": "Jane Smith"
          },
          "assignedBy": 1,
          "assignedByUser": {
            "id": 1,
            "fullname": "Admin"
          },
          "remarks": "Initial assignment",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "histories": [
        {
          "id": 5,
          "assignedTo": 2,
          "assignedToUser": {
            "id": 2,
            "fullname": "Jane Smith"
          },
          "assignedBy": 1,
          "assignedByUser": {
            "id": 1,
            "fullname": "Admin"
          },
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "attempts": [
        {
          "id": 3,
          "remarks": "Called but no answer",
          "followType": {
            "id": 1,
            "name": "Call"
          },
          "createdAt": "2024-01-02T10:00:00.000Z"
        }
      ],
      "isActive": true
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid stage ID
- `404 Not Found` - Stage not found

---

#### 33. Create Lead
**POST** `/api/leads`

**Request Body:**
```json
{
  "fullname": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "whatsapp": "9876543210",
  "leadDate": "2024-01-15",
  "leadOwner": "Admin",
  "leadSource": "Google Ad",
  "leadSubsource": "Search",
  "monthlyIncome": 6000,
  "jobTitle": "Senior Developer",
  "visaCategory": "Skilled Worker",
  "country": "India",
  "targetCountry": "Canada",
  "stageId": 1,
  "status": "hot",
  "formData": {
    "extra_field": "some extra info"
  },
  "notes": [
    {
      "text": "Customer found us via Google",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "createdBy": "admin"
    },
    {
      "text": "Interested in express entry",
      "createdAt": "2024-01-15T10:05:00.000Z",
      "createdBy": "admin"
    }
  ]
}
```

**Note:** The `Lead` entity now supports specific top-level fields for better searchability. The `formData` object is now optional and can still be used to store any additional custom fields as JSON.

**Response:**
```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "id": 2,
    "fullname": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "whatsapp": "9876543210",
    "leadDate": "2024-01-15",
    "leadSource": "Google Ad",
    "leadSubsource": "Search",
    "monthlyIncome": 6000,
    "jobTitle": "Senior Developer",
    "stageId": 1,
    "stage": {
      "id": 1,
      "name": "New"
    },
    "status": "hot",
    "isActive": true,
    "createdBy": "admin",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z",
    "notes": [
      {
        "text": "Customer found us via Google",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "createdBy": "admin"
      },
      {
        "text": "Interested in express entry",
        "createdAt": "2024-01-15T10:05:00.000Z",
        "createdBy": "admin"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid stage ID

---

#### 33.5. Bulk Import Leads from Excel/CSV
**POST** `/api/leads/bulk-import`

> **Note:** Leads with email addresses that already exist in the database will be skipped.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `file` (form-data, file) - Excel (.xlsx, .xls) or CSV file containing lead data

**File Format:**
- **Supported formats:** CSV, Excel (.xlsx, .xls)
- **File size limit:** 15MB
- **Column flexibility:** All columns from your CSV/Excel file will be stored in the `formData` JSON field
- **No required columns:** You can include any columns you want - they will all be stored automatically
- **Optional database fields:** `stageId`, `status` (hot/cold/dead)

**How It Works:**
All columns from your CSV/Excel file are automatically stored in the `formData` field as JSON. For example:
- If your file has columns: `full_name`, `email`, `phone`, `city`, `company`
- The data will be stored as: `formData: {"full_name": "John Doe", "email": "john@example.com", "phone": "1234567890", "city": "NYC", "company": "ABC Corp"}`

**Example CSV File:**
```csv
full_name,email,phone,city,company,position,stageId
John Doe,john@example.com,1234567890,New York,ABC Corp,Manager,1
Jane Smith,jane@example.com,9876543210,Los Angeles,XYZ Inc,Developer,2
```

**Example Excel Headers:**
Any column names are accepted - they will be stored as-is in the formData JSON field.

**Response:**
```json
{
  "success": true,
  "message": "Bulk import completed. 10 leads imported successfully, 0 failed.",
  "data": {
    "total": 10,
    "success": 10,
    "newRecords": 10,
    "duplicates": 0,
    "failed": 0,
    "errors": []
  }
}
```

**Error Response Example:**
```json
{
  "success": true,
  "message": "Bulk import completed. 8 leads imported successfully, 2 failed.",
  "data": {
    "total": 10,
    "success": 8,
    "newRecords": 8,
    "duplicates": 0,
    "failed": 2,
    "errors": [
      "Row 3: Invalid stage ID '999'",
      "Row 7: Invalid stage ID '100'"
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request` - No file uploaded or unsupported file format
- `500 Internal Server Error` - Error during bulk import

**Validation:**
- ✅ Stage ID validation (if stageId column is provided)
- ✅ Status validation (if status column is provided - accepts: New, Not Answered, Busy, Answered, Follow Up, Meeting Scheduled, Meeting Done, Agreement Pending, Agreement Done, Payment Pending, Payment Done, Completed, Documentation, Not Interested)
- ✅ Automatic file cleanup after processing
- ✅ All other columns stored in formData without validation

**Note:** Unlike the previous version, this endpoint no longer validates email/phone uniqueness or requires specific columns. All data from your file is stored in the `formData` JSON field, giving you complete flexibility in what fields you include.

---

#### 34. Update Lead
**PUT** `/api/leads/:id`

**Parameters:**
- `id` (path parameter) - Lead ID

**Request Body:**
```json
{
  "fullname": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  "phone": "9876543210",
  "whatsapp": "9876543211",
  "stageId": 2,
  "status": "hot",
  "notes": [
    {
      "text": "Follow up scheduled",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "createdBy": "admin"
    },
    {
      "text": "Documents pending",
      "createdAt": "2024-01-15T12:10:00.000Z",
      "createdBy": "admin"
    }
  ]
}
```

**Auto-Stage Mapping:**
When the `status` is updated, the `stageId` is automatically updated based on the following mapping:

| Status | Auto Stage |
|--------|------------|
| `New`, `Not Answered`, `Busy` | **Cold** |
| `Answered`, `Follow Up`, `Meeting Scheduled`, `Meeting Done`, `Agreement Pending`, `Agreement Done`, `Payment Pending`, `Payment Done`, `Documentation`, `Completed` | **Hot** |
| `Not Interested` | **Dead** |

**Note:** You can update individual top-level fields or the entire `formData` object.

**Response:**
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "id": 2,
    "formData": {
      "fullname": "Jane Smith Updated",
      "email": "jane.updated@example.com",
      "phone": "9876543210"
    },
    "stageId": 2,
    "stage": {
      "id": 2,
      "name": "Qualified"
    },
    "status": "hot",
    "updatedAt": "2024-01-15T12:00:00.000Z",
    "notes": [
      {
        "text": "Follow up scheduled",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "createdBy": "admin"
      },
      {
        "text": "Documents pending",
        "createdAt": "2024-01-15T12:10:00.000Z",
        "createdBy": "admin"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or invalid stage ID
- `404 Not Found` - Lead not found

---

#### 35.5. Get Unique Countries
**GET** `/api/leads/countries`

**Response:**
```json
{
  "success": true,
  "message": "Countries retrieved successfully",
  "data": [
    "Canada",
    "Germany",
    "India",
    "UK",
    "USA"
  ],
  "count": 5
}
```

---

#### 35.6. Get Unique Visa Categories
**GET** `/api/leads/visa-categories`

**Response:**
```json
{
  "success": true,
  "message": "Visa categories retrieved successfully",
  "data": [
    "Business Visa",
    "Skilled Worker",
    "Student Visa",
    "Tourist Visa"
  ],
  "count": 4
}
```

---

#### 36. Delete Lead
**DELETE** `/api/leads/:id`

**Parameters:**
- `id` (path parameter) - Lead ID

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - Lead not found

---

#### 36. Get Lead Count
**GET** `/api/leads/count`

**Response:**
```json
{
  "success": true,
  "message": "Lead count retrieved successfully",
  "count": 50
}
```

---

#### 37. Get Lead Count by Stage
**GET** `/api/leads/stage/:stageId/count`

**Parameters:**
- `stageId` (path parameter) - Stage ID

**Response:**
```json
{
  "success": true,
  "message": "Lead count retrieved successfully",
  "count": 10
}
```

**Error Responses:**
- `400 Bad Request` - Invalid stage ID

---

#### 37.1. Get Leads with 'PaymentReceived' Stage (Paginated)
**GET** `/api/leads/payment-received`

**Description:**
Returns leads whose stage is `PaymentReceived` and are assigned to the currently authenticated user.

**Query Parameters:**
- `page` (optional) - Page number (default: 1, minimum: 1)
- `limit` (optional) - Number of items per page (default: 10, minimum: 1, maximum: 100)

**Response:**
```json
{
  "success": true,
  "message": "PaymentReceived leads retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "whatsapp": "1234567890",
      "leadDate": "2024-01-01",
      "leadSource": "Direct",
      "leadSubsource": "Website",
      "monthlyIncome": 5000,
      "jobTitle": "Manager",
      "formData": {},
      "stageId": 7,
      "stage": {
        "id": 7,
        "name": "cold"
      },
      "status": "Payment Done",
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "reminders": [
        {
          "id": 1,
          "title": "Payment Followup",
          "description": "Call client for payment confirmation",
          "reminderDateTime": "2024-01-02T10:00:00.000Z",
          "status": "pending"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Error Responses:**
- `500 Internal Server Error` - Error retrieving leads

---

#### 37.5. Search Leads with Cursor-Based Pagination
**GET** `/api/leads/search`

**Query Parameters:**
- `leadId` (optional) - Lead ID to start search from (cursor). Returns 100 records starting from this ID (inclusive)

**Description:**
This endpoint implements cursor-based pagination for efficient searching through large datasets. By default, it returns the top 100 records. When a `leadId` is provided, it returns the next 100 records starting from (and including) that lead ID.

**Example Requests:**
```
GET /api/leads/search
GET /api/leads/search?leadId=50
```

**Response (without leadId - returns first 100 records):**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "whatsapp": "1234567890",
      "formData": {
        "city": "New York"
      },
      "stageId": 1,
      "stage": {
        "id": 1,
        "name": "New"
      },
      "status": "cold",
      "assignments": [
        {
          "id": 10,
          "assignedTo": 2,
          "assignedToUser": {
            "id": 2,
            "fullname": "Jane Smith",
            "username": "janesmith"
          },
          "assignedBy": 1,
          "assignedByUser": {
            "id": 1,
            "fullname": "Admin",
            "username": "admin"
          },
          "remarks": "Initial assignment",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    // ... up to 100 records
  ],
  "count": 100,
  "cursor": 100
}
```

**Response (with leadId=50 - returns next 100 records starting from ID 50):**
```json
{
  "success": true,
  "message": "Leads retrieved successfully",
  "data": [
    {
      "id": 50,
      "formData": {
        "fullname": "Lead Fifty",
        "email": "lead50@example.com"
      },
      "stageId": 2,
      "stage": {
        "id": 2,
        "name": "Contacted"
      },
      "status": "hot",
      "assignments": [],
      "isActive": true,
      "createdBy": "admin",
      "createdAt": "2024-01-10T00:00:00.000Z",
      "updatedAt": "2024-01-10T00:00:00.000Z"
    }
    // ... up to 100 records (IDs 50-149)
  ],
  "count": 100,
  "cursor": 149
}
```

**Response Fields:**
- `success` - Boolean indicating operation success
- `message` - Status message
- `data` - Array of lead objects (maximum 100 records)
- `count` - Number of leads returned in this response
- `cursor` - The last lead ID in the current result set (use this as `leadId` parameter for the next page)

**Pagination Flow:**
1. **First request:** `GET /api/leads/search` - Returns records with IDs 1-100, cursor = 100
2. **Second request:** `GET /api/leads/search?leadId=101` - Returns records with IDs 101-200, cursor = 200
3. **Third request:** `GET /api/leads/search?leadId=201` - Returns records with IDs 201-300, cursor = 300
4. Continue until `count` < 100 (indicates last page)

**Note:** To get the next page, use `cursor + 1` from the previous response as the `leadId` parameter. For example, if cursor is 100, use `leadId=101` for the next page.

**Error Responses:**
- `400 Bad Request` - Invalid leadId (must be a positive number)
- `500 Internal Server Error` - Error searching leads

**Use Cases:**
- Efficiently paginating through large datasets (1000+ records)
- Loading leads in batches for data processing
- Implementing infinite scroll in frontend applications
- Exporting lead data in chunks

---

#### 38. Get All Lead Attempts
**GET** `/api/lead-attempts`

**Description:**
Returns a list of all lead attempts with follow-up type details.

**Response:**
```json
{
  "success": true,
  "message": "Attempts retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "followTypeId": 1,
      "remarks": "Called and discussed",
      "outcome": "Interested",
      "duration": 5,
      "callTime": "2024-01-02T10:00:00.000Z",
      "scheduledTime": "2024-01-05T10:00:00.000Z",
      "followType": {
        "id": 1,
        "name": "Call"
      },
      "createdAt": "2024-01-02T10:05:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### 39. Get Lead Attempt Dashboard
**GET** `/api/lead-attempts/dashboard`

**Description:**
Returns summary statistics and categorized calls (prior, upcoming, recent) for the dashboard.

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "stats": {
      "totalCalls": 100,
      "answered": 60,
      "notAnswered": 30,
      "pending": 10
    },
    "priorCalls": [],
    "upcomingCalls": [],
    "recentLogs": []
  }
}
```

---

#### 40. Get Attempts by Lead ID
**GET** `/api/lead-attempts/lead/:leadId`

**Response:**
```json
{
  "success": true,
  "message": "Attempts retrieved successfully",
  "data": []
}
```

---

#### 41. Get Attempts by Follow-Up Type
**GET** `/api/lead-attempts/follow-type/:followTypeId`

**Response:**
```json
{
  "success": true,
  "message": "Attempts retrieved successfully",
  "data": []
}
```

---

### Lead Assignments API

#### 42. Get All Lead Assignments
**GET** `/api/lead-assignments`

**Response:**
```json
{
  "success": true,
  "message": "Lead assignments retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "lead": {
        "id": 1,
        "fullname": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": 2,
      "assignedToUser": {
        "id": 2,
        "fullname": "Jane Smith",
        "username": "janesmith"
      },
      "assignedBy": 1,
      "assignedByUser": {
        "id": 1,
        "fullname": "Admin",
        "username": "admin"
      },
      "remarks": "Initial assignment",
      "canAccessPreviousLogs": true,
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### 39. Get Lead Assignment by ID
**GET** `/api/lead-assignments/:id`

**Parameters:**
- `id` (path parameter) - Assignment ID

**Response:**
```json
{
  "success": true,
  "message": "Lead assignment retrieved successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "assignedTo": 2,
    "assignedToUser": {
      "id": 2,
      "fullname": "Jane Smith"
    },
    "assignedBy": 1,
    "assignedByUser": {
      "id": 1,
      "fullname": "Admin"
    },
    "remarks": "Initial assignment",
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid assignment ID
- `404 Not Found` - Lead assignment not found

---

#### 40. Get Assignments by Lead ID
**GET** `/api/lead-assignments/lead/:leadId`

**Parameters:**
- `leadId` (path parameter) - Lead ID

**Response:**
```json
{
  "success": true,
  "message": "Lead assignments retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "assignedTo": 2,
      "assignedToUser": {
        "id": 2,
        "fullname": "Jane Smith"
      },
      "assignedBy": 1,
      "remarks": "Initial assignment",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - Lead not found

---

#### 41. Get Assignments by Assigned To User ID
**GET** `/api/lead-assignments/user/:userId`

**Parameters:**
- `userId` (path parameter) - User ID

**Response:**
```json
{
  "success": true,
  "message": "Lead assignments retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "lead": {
        "id": 1,
        "fullname": "John Doe"
      },
      "assignedTo": 2,
      "assignedBy": 1,
      "remarks": "Initial assignment",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID
- `404 Not Found` - User not found

---

#### 42. Get Current Assignment for Lead
**GET** `/api/lead-assignments/lead/:leadId/current`

**Parameters:**
- `leadId` (path parameter) - Lead ID

**Response:**
```json
{
  "success": true,
  "message": "Current assignment retrieved successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "assignedTo": 2,
    "assignedToUser": {
      "id": 2,
      "fullname": "Jane Smith"
    },
    "assignedBy": 1,
    "remarks": "Current assignment",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - No assignment found for this lead

---

#### 43. Create Lead Assignment
**POST** `/api/lead-assignments`

**Request Body:**
```json
{
  "leadId": 1,
  "assignedTo": 2,
  "assignedBy": 1,
  "remarks": "Assigning to sales team",
  "canAccessPreviousLogs": false
}
```

**Fields:**
- `leadId` (required) - ID of the lead to assign
- `assignedTo` (required) - ID of the user to assign the lead to
- `assignedBy` (required) - ID of the user who is making the assignment (auto-filled if not provided)
- `remarks` (optional) - Any notes about the assignment
- `canAccessPreviousLogs` (optional, default: `true`) - If `false`, the assigned user will not be able to see lead attempts, histories, or notes created before their assignment date.

**Response:**
```json
{
  "success": true,
  "message": "Lead assignment created successfully",
  "data": {
    "id": 2,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "assignedTo": 2,
    "assignedToUser": {
      "id": 2,
      "fullname": "Jane Smith"
    },
    "assignedBy": 1,
    "assignedByUser": {
      "id": 1,
      "fullname": "Admin"
    },
    "remarks": "Assigning to sales team",
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Required fields missing, lead not found, or user not found

---

#### 43.5. Upsert Lead Assignment (Create or Update)
**POST** `/api/lead-assignments/upsert`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "leadId": 1,
  "assignedTo": 2,
  "assignedBy": 1,
  "remarks": "Assigning to sales team",
  "canAccessPreviousLogs": true
}
```

**Description:**
This endpoint creates a new assignment if no assignment exists for the given `leadId`, or updates the existing assignment if one is found. A history record is always created for both insert and update operations.

**Response (Create - 201):**
```json
{
  "success": true,
  "message": "Lead assignment created successfully",
  "data": {
    "id": 2,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "assignedTo": 2,
    "assignedToUser": {
      "id": 2,
      "fullname": "Jane Smith"
    },
    "assignedBy": 1,
    "assignedByUser": {
      "id": 1,
      "fullname": "Admin"
    },
    "remarks": "Assigning to sales team",
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Update - 200):**
```json
{
  "success": true,
  "message": "Lead assignment updated successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "assignedTo": 3,
    "assignedToUser": {
      "id": 3,
      "fullname": "Bob Johnson"
    },
    "assignedBy": 1,
    "assignedByUser": {
      "id": 1,
      "fullname": "Admin"
    },
    "remarks": "Reassigned to different user",
    "canAccessPreviousLogs": true,
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Lead ID is required, required fields missing, lead not found, user not found, or failed to update assignment
- `500 Internal Server Error` - Error upserting lead assignment

**Notes:**
- The endpoint automatically detects if an assignment exists for the given `leadId`
- If `assignedBy` is not provided, it will be set from the authenticated user's ID
- If `createdBy` is not provided, it will be set from the authenticated user's username or fullname
- A history record is always created for both insert and update operations
- Returns status code 201 for creates and 200 for updates

---

#### 44. Update Lead Assignment (Single or Bulk)
**PUT** `/api/lead-assignments/:id`

**Parameters:**
- `id` (path parameter) - Assignment ID or `bulk` for multiple updates.

**Request Body (Single Object):**
```json
{
  "assignedTo": 3,
  "remarks": "Reassigned to different user",
  "canAccessPreviousLogs": false
}
```

**Request Body (Bulk Array):**
```json
[
  {
    "id": 1,
    "leadId": 10,
    "assignedTo": 3,
    "remarks": "Reassigned via bulk"
  },
  {
    "id": 2,
    "leadId": 10,
    "assignedTo": 4,
    "remarks": "Upserted via bulk"
  }
]
```

**Description:**
Updates one or more lead assignments. 
- If `id` is a number, it updates that specific assignment.
- If `id` is `bulk`, it expects an array (or single object) and uses the `id` or `leadId` inside each object to determine what to update/upsert.
- If the body is an array, it will process each item regardless of whether `id` is `bulk` or a number (though using `bulk` is recommended for clarity).

**Response:**
```json
{
  "success": true,
  "message": "Lead assignment updated successfully",
  "data": {
    "id": 2,
    "leadId": 1,
    "assignedTo": 3,
    "assignedToUser": {
      "id": 3,
      "fullname": "Bob Johnson"
    },
    "remarks": "Reassigned to different user",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or user not found
- `404 Not Found` - Lead assignment not found

---

#### 45. Delete Lead Assignment
**DELETE** `/api/lead-assignments/:id`

**Parameters:**
- `id` (path parameter) - Assignment ID

**Response:**
```json
{
  "success": true,
  "message": "Lead assignment deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid assignment ID
- `404 Not Found` - Lead assignment not found

---

#### 46. Get Lead Assignment Count
**GET** `/api/lead-assignments/count`

**Response:**
```json
{
  "success": true,
  "message": "Assignment count retrieved successfully",
  "count": 25
}
```

---

### Lead Attempts API

#### 47. Get All Lead Attempts
**GET** `/api/lead-attempts`

**Response:**
```json
{
  "success": true,
  "message": "Lead attempts retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "lead": {
        "id": 1,
        "fullname": "John Doe",
        "email": "john@example.com"
      },
      "followTypeId": 1,
      "followType": {
        "id": 1,
        "name": "Call"
      },
      "remarks": "Called but no answer",
      "createdBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### 48. Get Lead Attempt by ID
**GET** `/api/lead-attempts/:id`

**Parameters:**
- `id` (path parameter) - Attempt ID

**Response:**
```json
{
  "success": true,
  "message": "Lead attempt retrieved successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "followTypeId": 1,
    "followType": {
      "id": 1,
      "name": "Call"
    },
    "remarks": "Called but no answer",
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid attempt ID
- `404 Not Found` - Lead attempt not found

---

#### 49. Get Attempts by Lead ID
**GET** `/api/lead-attempts/lead/:leadId`

**Parameters:**
- `leadId` (path parameter) - Lead ID

**Response:**
```json
{
  "success": true,
  "message": "Lead attempts retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "followTypeId": 1,
      "followType": {
        "id": 1,
        "name": "Call"
      },
      "remarks": "Called but no answer",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - Lead not found

---

#### 50. Get Attempts by Follow-Up Type ID
**GET** `/api/lead-attempts/follow-type/:followTypeId`

**Parameters:**
- `followTypeId` (path parameter) - Follow-up type ID

**Response:**
```json
{
  "success": true,
  "message": "Lead attempts retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "lead": {
        "id": 1,
        "fullname": "John Doe"
      },
      "followTypeId": 1,
      "followType": {
        "id": 1,
        "name": "Call"
      },
      "remarks": "Called but no answer",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid follow-up type ID
- `404 Not Found` - Follow-up type not found

---

#### 51. Create Lead Attempt
**POST** `/api/lead-attempts`

**Request Body:**
```json
{
  "leadId": 1,
  "followTypeId": 1,
  "remarks": "Made initial call, left voicemail"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead attempt created successfully",
  "data": {
    "id": 2,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "followTypeId": 1,
    "followType": {
      "id": 1,
      "name": "Call"
    },
    "remarks": "Made initial call, left voicemail",
    "createdBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Required fields missing, lead not found, or follow-up type not found

---

#### 52. Update Lead Attempt
**PUT** `/api/lead-attempts/:id`

**Parameters:**
- `id` (path parameter) - Attempt ID

**Request Body:**
```json
{
  "followTypeId": 2,
  "remarks": "Updated: Sent email instead"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead attempt updated successfully",
  "data": {
    "id": 2,
    "leadId": 1,
    "followTypeId": 2,
    "followType": {
      "id": 2,
      "name": "Email"
    },
    "remarks": "Updated: Sent email instead",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or follow-up type not found
- `404 Not Found` - Lead attempt not found

---

#### 53. Delete Lead Attempt
**DELETE** `/api/lead-attempts/:id`

**Parameters:**
- `id` (path parameter) - Attempt ID

**Response:**
```json
{
  "success": true,
  "message": "Lead attempt deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid attempt ID
- `404 Not Found` - Lead attempt not found

---

#### 54. Get Lead Attempt Count
**GET** `/api/lead-attempts/count`

**Response:**
```json
{
  "success": true,
  "message": "Attempt count retrieved successfully",
  "count": 100
}
```

---

### Lead History API

#### 55. Get All Lead Histories
**GET** `/api/lead-histories`

**Response:**
```json
{
  "success": true,
  "message": "Lead histories retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "lead": {
        "id": 1,
        "fullname": "John Doe",
        "email": "john@example.com"
      },
      "assignedTo": 2,
      "assignedToUser": {
        "id": 2,
        "fullname": "Jane Smith",
        "username": "janesmith"
      },
      "assignedBy": 1,
      "assignedByUser": {
        "id": 1,
        "fullname": "Admin",
        "username": "admin"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### 56. Get Lead History by ID
**GET** `/api/lead-histories/:id`

**Parameters:**
- `id` (path parameter) - History ID

**Response:**
```json
{
  "success": true,
  "message": "Lead history retrieved successfully",
  "data": {
    "id": 1,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "assignedTo": 2,
    "assignedToUser": {
      "id": 2,
      "fullname": "Jane Smith"
    },
    "assignedBy": 1,
    "assignedByUser": {
      "id": 1,
      "fullname": "Admin"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid history ID
- `404 Not Found` - Lead history not found

---

#### 57. Get Histories by Lead ID
**GET** `/api/lead-histories/lead/:leadId`

**Parameters:**
- `leadId` (path parameter) - Lead ID

**Response:**
```json
{
  "success": true,
  "message": "Lead histories retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "assignedTo": 2,
      "assignedToUser": {
        "id": 2,
        "fullname": "Jane Smith"
      },
      "assignedBy": 1,
      "assignedByUser": {
        "id": 1,
        "fullname": "Admin"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - Lead not found

---

#### 58. Get Histories by Assigned To User ID
**GET** `/api/lead-histories/user/:userId/assigned-to`

**Parameters:**
- `userId` (path parameter) - User ID

**Response:**
```json
{
  "success": true,
  "message": "Lead histories retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "lead": {
        "id": 1,
        "fullname": "John Doe"
      },
      "assignedTo": 2,
      "assignedBy": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID
- `404 Not Found` - User not found

---

#### 59. Get Histories by Assigned By User ID
**GET** `/api/lead-histories/user/:userId/assigned-by`

**Parameters:**
- `userId` (path parameter) - User ID

**Response:**
```json
{
  "success": true,
  "message": "Lead histories retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1,
      "lead": {
        "id": 1,
        "fullname": "John Doe"
      },
      "assignedTo": 2,
      "assignedBy": 1,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid user ID
- `404 Not Found` - User not found

---

#### 60. Create Lead History
**POST** `/api/lead-histories`

**Request Body:**
```json
{
  "leadId": 1,
  "assignedTo": 2,
  "assignedBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead history created successfully",
  "data": {
    "id": 2,
    "leadId": 1,
    "lead": {
      "id": 1,
      "fullname": "John Doe"
    },
    "assignedTo": 2,
    "assignedToUser": {
      "id": 2,
      "fullname": "Jane Smith"
    },
    "assignedBy": 1,
    "assignedByUser": {
      "id": 1,
      "fullname": "Admin"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Required fields missing, lead not found, or user not found

---

#### 61. Update Lead History
**PUT** `/api/lead-histories/:id`

**Parameters:**
- `id` (path parameter) - History ID

**Request Body:**
```json
{
  "assignedTo": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead history updated successfully",
  "data": {
    "id": 2,
    "leadId": 1,
    "assignedTo": 3,
    "assignedToUser": {
      "id": 3,
      "fullname": "Bob Johnson"
    },
    "assignedBy": 1,
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or user not found
- `404 Not Found` - Lead history not found

---

#### 62. Delete Lead History
**DELETE** `/api/lead-histories/:id`

**Parameters:**
- `id` (path parameter) - History ID

**Response:**
```json
{
  "success": true,
  "message": "Lead history deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid history ID
- `404 Not Found` - Lead history not found

---

#### 63. Get Lead History Count
**GET** `/api/lead-histories/count`

**Response:**
```json
{
  "success": true,
  "message": "History count retrieved successfully",
  "count": 75
}
```

---

### Dynamic Forms API

#### 64. Get All Forms
**GET** `/api/forms`

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `search` (optional) - Search by name or description
- `isActive` (optional) - Filter by active status (default: true)

**Response:**
```json
{
  "success": true,
  "message": "Forms retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Contact Form",
      "description": "General contact form",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

#### 65. Get Form by ID
**GET** `/api/forms/:id`

**Parameters:**
- `id` (path parameter) - Form ID

**Response:**
```json
{
  "success": true,
  "message": "Form retrieved successfully",
  "data": {
    "id": 1,
    "name": "Contact Form",
    "description": "General contact form",
    "isActive": true,
    "fields": [
      {
        "id": 1,
        "fieldName": "email",
        "fieldLabel": "Email Address",
        "fieldType": "email",
        "isRequired": true,
        "options": []
      }
    ]
  }
}
```

---

#### 66. Create Form
**POST** `/api/forms`

**Request Body:**
```json
{
  "name": "Feedback Form",
  "description": "Customer feedback",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form created successfully",
  "data": {
    "id": 2,
    "name": "Feedback Form",
    "description": "Customer feedback",
    "isActive": true
  }
}
```

---

#### 67. Update Form
**PUT** `/api/forms/:id`

**Parameters:**
- `id` (path parameter) - Form ID

**Request Body:**
```json
{
  "name": "Updated Feedback Form",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form updated successfully",
  "data": {
    "id": 2,
    "name": "Updated Feedback Form",
    "description": "Updated description",
    "isActive": true
  }
}
```

---

#### 68. Delete Form
**DELETE** `/api/forms/:id`

**Parameters:**
- `id` (path parameter) - Form ID

**Response:**
```json
{
  "success": true,
  "message": "Form deleted successfully"
}
```

---

#### 69. Get Fields by Form
**GET** `/api/form-fields/form/:formId`

**Parameters:**
- `formId` (path parameter) - Form ID

**Response:**
```json
{
  "success": true,
  "message": "Form fields retrieved successfully",
  "data": [
    {
      "id": 1,
      "formId": 1,
      "fieldName": "email",
      "fieldLabel": "Email Address",
      "fieldType": "email",
      "isRequired": true,
      "options": []
    }
  ]
}
```

---

#### 70. Create Form Field
**POST** `/api/form-fields`

**Request Body:**
```json
{
  "formId": 1,
  "fieldName": "rating",
  "fieldLabel": "Rating",
  "fieldType": "select",
  "isRequired": true,
  "orderIndex": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form field created successfully",
  "data": {
    "id": 2,
    "formId": 1,
    "fieldName": "rating",
    "fieldLabel": "Rating",
    "fieldType": "select",
    "isRequired": true,
    "orderIndex": 1
  }
}
```

---

#### 71. Update Form Field
**PUT** `/api/form-fields/:id`

**Parameters:**
- `id` (path parameter) - Field ID

**Request Body:**
```json
{
  "fieldLabel": "Your Rating",
  "isRequired": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form field updated successfully",
  "data": {
    "id": 2,
    "fieldLabel": "Your Rating",
    "isRequired": false
  }
}
```

---

#### 72. Delete Form Field
**DELETE** `/api/form-fields/:id`

**Parameters:**
- `id` (path parameter) - Field ID

**Response:**
```json
{
  "success": true,
  "message": "Form field deleted successfully"
}
```

---

#### 73. Get Options by Field
**GET** `/api/field-options/field/:fieldId`

**Parameters:**
- `fieldId` (path parameter) - Field ID

**Response:**
```json
{
  "success": true,
  "message": "Field options retrieved successfully",
  "data": [
    {
      "id": 1,
      "fieldId": 2,
      "label": "Excellent",
      "value": "5",
      "orderIndex": 1
    }
  ]
}
```

---

#### 74. Create Field Option
**POST** `/api/field-options`

**Request Body:**
```json
{
  "fieldId": 2,
  "label": "Good",
  "value": "4",
  "orderIndex": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Field option created successfully",
  "data": {
    "id": 2,
    "fieldId": 2,
    "label": "Good",
    "value": "4",
    "orderIndex": 2
  }
}
```

---

#### 75. Update Field Option
**PUT** `/api/field-options/:id`

**Parameters:**
- `id` (path parameter) - Option ID

**Request Body:**
```json
{
  "label": "Very Good",
  "value": "4"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Field option updated successfully",
  "data": {
    "id": 2,
    "label": "Very Good",
    "value": "4"
  }
}
```

---

#### 76. Delete Field Option
**DELETE** `/api/field-options/:id`

**Parameters:**
- `id` (path parameter) - Option ID

**Response:**
```json
{
  "success": true,
  "message": "Field option deleted successfully"
}
```

---

### Lead Attempts API

#### 77. Get All Lead Attempts
**GET** `/api/lead-attempts`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lead attempts retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 1021,
      "followTypeId": 1,
      "remarks": "Initial contact",
      "outcome": "answered",
      "callTime": "2024-01-15T10:20:00.000Z",
      "duration": 5,
      "scheduledTime": "2024-01-15T10:30:00.000Z",
      "createdBy": "admin",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "lead": {
        "id": 1021,
        "formData": {
          "fullname": "John Doe",
          "email": "john@example.com"
        }
      },
      "followType": {
        "id": 1,
        "name": "Call"
      }
    }
  ],
  "count": 1
}
```

---

#### 78. Get Lead Attempt by ID
**GET** `/api/lead-attempts/:id`

**Parameters:**
- `id` (path parameter) - Attempt ID

**Response:**
```json
{
  "success": true,
  "message": "Lead attempt retrieved successfully",
  "data": {
    "id": 1,
    "leadId": 1021,
    "followTypeId": 1,
    "remarks": "Initial contact",
    "outcome": "answered",
    "callTime": "2024-01-15T10:20:00.000Z",
    "duration": 5,
    "scheduledTime": "2024-01-15T10:30:00.000Z",
    "createdBy": "admin",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid attempt ID
- `404 Not Found` - Lead attempt not found

---

#### 79. Get Lead Attempts by Lead ID
**GET** `/api/lead-attempts/lead/:leadId`

**Description:**
Retrieves all lead attempts for a specific lead, with attempt details and all follow-up types in a single response.

**Parameters:**
- `leadId` (path parameter) - Lead ID

**Response:**
```json
{
  "success": true,
  "message": "Lead attempts retrieved successfully",
  "data": [
    {
      "id": 992,
      "formData": {
        "email": "rafi143@hotmail.com",
        "full_name": "Mohammad Rafi",
        "phone_number": "923087050700"
      },
      "stageId": null,
      "status": "cold",
      "remarks": "Initial contact",
      "outcome": "answered",
      "callTime": "2025-12-06T14:11:00.000Z",
      "duration": 5,
      "scheduledTime": null,
      "followUpTypes": [
        { "id": 1, "name": "Call" },
        { "id": 2, "name": "WhatsApp" }
      ]
    }
  ],
  "count": 2,
  "callStatistics": {
    "total": 2,
    "answered": 2,
    "notAnswered": 0
  }
}
```

**Response Structure:**
- `data`: Array containing the lead object with attempt details
- `data[].remarks/outcome/callTime/duration/scheduledTime`: Details from the first attempt
- `data[].followUpTypes`: Array of all follow-up types used (id and name only)
- `count`: Total number of attempts
- `callStatistics`: Statistics for this lead's calls

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - Lead not found

---


#### 80. Create Lead Attempt(s)
**POST** `/api/lead-attempts`

**Description:**
Creates one or more lead attempts. Supports multiple follow-up types in a single request. If `scheduledTime` is provided, automatically creates a lead reminder.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "leadId": "1021",
  "followTypeId": ["1", "2"],
  "outcome": "answered",
  "callTime": "2025-12-06T09:20:00.000Z",
  "duration": 5,
  "notes": "Customer interested in product demo",
  "scheduledTime": "2025-12-06T16:50:00.000Z"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `leadId` | string/number | Yes | Lead ID |
| `followTypeId` | string/number or array | Yes | Follow-up type ID(s). Can be single value or array for multiple attempts |
| `outcome` | string | No | Call outcome (e.g., "answered", "not answered") |
| `callTime` | datetime | No | When the call was made |
| `duration` | number | No | Call duration in minutes |
| `notes` | string | No | Notes/remarks about the call (maps to `remarks` field). Optional if `remarks` is provided. |
| `remarks` | string | No | Remarks about the call. |
| `scheduledTime` | datetime | No | Scheduled time for follow-up. **If provided, creates a lead reminder automatically** |

**Response (Single followTypeId):**
```json
{
  "success": true,
  "message": "Lead attempt(s) created successfully",
  "data": {
    "id": 25,
    "leadId": 1021,
    "followTypeId": 1,
    "remarks": "Customer interested in product demo",
    "outcome": "answered",
    "callTime": "2025-12-06T09:20:00.000Z",
    "duration": 5,
    "scheduledTime": "2025-12-06T16:50:00.000Z",
    "createdBy": "admin",
    "createdAt": "2025-12-06T09:25:00.000Z",
    "updatedAt": "2025-12-06T09:25:00.000Z"
  },
  "count": 1
}
```

**Response (Multiple followTypeIds):**
```json
{
  "success": true,
  "message": "Lead attempt(s) created successfully",
  "data": [
    {
      "id": 25,
      "leadId": 1021,
      "followTypeId": 1,
      "remarks": "Customer interested in product demo",
      "outcome": "answered",
      "callTime": "2025-12-06T09:20:00.000Z",
      "duration": 5,
      "scheduledTime": "2025-12-06T16:50:00.000Z",
      "createdBy": "admin"
    },
    {
      "id": 26,
      "leadId": 1021,
      "followTypeId": 2,
      "remarks": "Customer interested in product demo",
      "outcome": "answered",
      "callTime": "2025-12-06T09:20:00.000Z",
      "duration": 5,
      "scheduledTime": "2025-12-06T16:50:00.000Z",
      "createdBy": "admin"
    }
  ],
  "count": 2
}
```

**Side Effects:**
- If `scheduledTime` is provided, a **lead reminder** is automatically created in the `lead_reminder` table with:
  - `reminderDateTime`: Set to the `scheduledTime` value
  - `title`: "Scheduled Call - {followType name}"
  - `status`: "pending"
  - `type`: "notification"

**Error Responses:**
- `400 Bad Request` - Lead ID or Follow-up type ID is required, Lead not found, Follow-up type not found

---

#### 81. Update Lead Attempt
**PUT** `/api/lead-attempts/:id`

**Parameters:**
- `id` (path parameter) - Attempt ID

**Request Body:**
```json
{
  "outcome": "answered",
  "duration": 10,
  "remarks": "Updated remarks"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead attempt updated successfully",
  "data": {
    "id": 25,
    "leadId": 1021,
    "followTypeId": 1,
    "remarks": "Updated remarks",
    "outcome": "answered",
    "duration": 10
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID
- `404 Not Found` - Lead attempt not found

---

#### 82. Delete Lead Attempt
**DELETE** `/api/lead-attempts/:id`

**Parameters:**
- `id` (path parameter) - Attempt ID

**Response:**
```json
{
  "success": true,
  "message": "Lead attempt deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid attempt ID
- `404 Not Found` - Lead attempt not found

---

### Lead Attempt Dashboard API

#### 83. Get Dashboard Statistics
**GET** `/api/lead-attempts/dashboard`

**Description:**
Retrieves comprehensive call management statistics including total calls, answered/unanswered counts, priority calls, upcoming calls, and recent call logs.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "callStatistics": {
      "total": 45,
      "answered": 20,
      "notAnswered": 15,
      "pending": 10
    },
    "priorityCalls": [
      {
        "id": 15,
        "leadId": 5,
        "followTypeId": 2,
        "remarks": "Follow up required",
        "outcome": "answered",
        "callTime": "2024-01-15T10:25:00.000Z",
        "duration": 5,
        "scheduledTime": "2024-01-15T10:30:00.000Z",
        "createdBy": "admin",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "lead": {
          "id": 5,
          "formData": {
            "fullname": "Sarah Johnson",
            "email": "sarah@example.com",
            "phone": "+1 234 567 8900"
          },
          "stageId": 2,
          "status": "hot"
        },
        "followType": {
          "id": 2,
          "name": "Callback"
        }
      }
    ],
    "upcomingCalls": [
      {
        "id": 18,
        "leadId": 8,
        "followTypeId": 3,
        "remarks": "Scheduled for tomorrow",
        "outcome": null,
        "callTime": null,
        "duration": null,
        "scheduledTime": "2024-01-17T10:00:00.000Z",
        "createdBy": "admin",
        "createdAt": "2024-01-16T09:00:00.000Z",
        "updatedAt": "2024-01-16T09:00:00.000Z",
        "lead": {
          "id": 8,
          "formData": {
            "fullname": "John Smith",
            "email": "john@example.com",
            "phone": "+1 234 567 8901"
          },
          "stageId": 1,
          "status": "cold"
        },
        "followType": {
          "id": 3,
          "name": "Scheduled"
        }
      }
    ],
    "recentCallLogs": [
      {
        "id": 20,
        "leadId": 12,
        "followTypeId": 1,
        "remarks": "Connected successfully",
        "outcome": "answered",
        "callTime": "2024-01-17T14:20:00.000Z",
        "duration": 8,
        "scheduledTime": "2024-01-17T14:00:00.000Z",
        "createdBy": "admin",
        "createdAt": "2024-01-17T14:25:00.000Z",
        "updatedAt": "2024-01-17T14:25:00.000Z",
        "lead": {
          "id": 12,
          "formData": {
            "fullname": "Sandy Adamson",
            "email": "sandy@example.com",
            "phone": "+1 234 567 8902"
          },
          "stageId": 3,
          "status": "hot"
        },
        "followType": {
          "id": 1,
          "name": "Answered"
        }
      }
    ]
  }
}
```

**Call Statistics Categories:**
- **Total**: All lead attempts
- **Answered**: `followType.name` is "Answered", "Connected", or "Successful"
- **Not Answered**: `followType.name` is "No Answer", "Busy", "Not Available", "Declined", or "Voicemail"
- **Pending**: `followType.name` is "Callback", "Follow-up", "Pending", "Scheduled", or "Reschedule"

**Priority Calls**: Shows up to 10 calls requiring follow-up (Callback, Follow-up, Reschedule, Pending), sorted by most recent

**Upcoming Calls**: Shows up to 10 scheduled/pending calls sorted by earliest

**Recent Call Logs**: Shows up to 20 most recent call attempts with full details

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Error retrieving dashboard statistics

---

### Lead Reminders API

#### 84. Get All Reminders
**GET** `/api/lead-reminders`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Reminders retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 5,
      "userId": 2,
      "title": "Follow up with client",
      "description": "Call regarding demo request",
      "reminderDateTime": "2024-01-20T10:00:00.000Z",
      "status": "pending",
      "type": "notification",
      "createdBy": "admin",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

#### 85. Get Reminder by ID
**GET** `/api/lead-reminders/:id`

**Response:**
```json
{
  "success": true,
  "message": "Reminder retrieved successfully",
  "data": { "id": 1, ... }
}
```

---

#### 86. Get Filtered Reminders
**GET** `/api/lead-reminders/pending`
**GET** `/api/lead-reminders/upcoming`
**GET** `/api/lead-reminders/overdue`

**Query Parameters (Optional):**
- `userId` (optional) - Filter by user ID (for upcoming/overdue)

**Response:**
```json
{
  "success": true,
  "message": "Reminders retrieved successfully",
  "data": [...],
  "count": 1
}
```

---

#### 87. Get Reminders by Lead, User, or Status
**GET** `/api/lead-reminders/lead/:leadId`
**GET** `/api/lead-reminders/user/:userId`
**GET** `/api/lead-reminders/status/:status`

**Description:**
Retrieves a list of reminders filtered by lead ID, user ID, or status.

**Parameters:**
- `leadId` (path parameter) - The ID of the lead.
- `userId` (path parameter) - The ID of the user.
- `status` (path parameter) - The status of the reminder (`pending`, `completed`, `dismissed`).

**Response:**
```json
{
  "success": true,
  "message": "Reminders retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 5,
      "userId": 2,
      "title": "Follow up with client",
      "description": "Call regarding demo request",
      "reminderDateTime": "2024-01-20T10:00:00.000Z",
      "status": "pending",
      "type": "notification",
      "createdBy": "admin",
      "createdAt": "2024-01-15T09:00:00.000Z",
      "updatedAt": "2024-01-15T09:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `400 Bad Request` - Invalid ID or status
- `404 Not Found` - Lead or User not found (for lead/user endpoints)
- `500 Internal Server Error` - Error retrieving reminders

---

#### 88. Create/Update/Delete Reminder
**POST** `/api/lead-reminders`
**PUT** `/api/lead-reminders/:id`
**DELETE** `/api/lead-reminders/:id`

**Request Body (Create/Update):**
```json
{
  "leadId": 5,
  "userId": 2,
  "title": "Follow up",
  "reminderDateTime": "2024-01-20T10:00:00.000Z",
  "description": "Optional notes",
  "status": "pending",
  "type": "notification"
}
```

---

#### 89. Update Reminder Status
**PUT** `/api/lead-reminders/:id/complete`
**PUT** `/api/lead-reminders/:id/dismiss`

---

#### 90. Get Reminder Count
**GET** `/api/lead-reminders/count`

---

---

### Dynamic Forms API

#### 91. Get All Forms
**GET** `/api/forms`

**Response:**
```json
{
  "success": true,
  "message": "Forms retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Lead Intake Form",
      "description": "Form for initial lead capture",
      "isActive": true
    }
  ]
}
```

---

#### 92. Get Form by ID (with Fields)
**GET** `/api/forms/:id`

**Response:**
```json
{
  "success": true,
  "message": "Form retrieved successfully",
  "data": {
    "id": 1,
    "name": "Lead Intake Form",
    "fields": [
      {
        "id": 1,
        "label": "First Name",
        "type": "text",
        "options": []
      }
    ]
  }
}
```

---

#### 93. Create/Update/Delete Form
**POST** `/api/forms`
**PUT** `/api/forms/:id`
**DELETE** `/api/forms/:id`

---

### Form Fields API

#### 94. Get Fields by Form
**GET** `/api/form-fields/form/:formId`

**Response:**
```json
{
  "success": true,
  "message": "Fields retrieved successfully",
  "data": [...]
}
```

---

#### 95. Create/Update/Delete Form Field
**POST** `/api/form-fields`
**PUT** `/api/form-fields/:id`
**DELETE** `/api/form-fields/:id`

---

### Field Options API

#### 96. Get Options by Field
**GET** `/api/field-options/field/:fieldId`

---

#### 97. Create/Update/Delete Field Option
**POST** `/api/field-options`
**PUT** `/api/field-options/:id`
**DELETE** `/api/field-options/:id`

---


### Document Management API

#### 98. Upload Document
**POST** `/api/documents/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: File object (Max 15MB)
- `leadId`: Integer (Required)
- `documentLabel`: String (Optional)
- `expiryDate`: String (Optional)

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": 1,
    "url": "https://bucket.s3.region.amazonaws.com/key",
    "documentLabel": "ID Proof",
    "expiryDate": "2025-12-31",
    "leadId": 123,
    "uploadedBy": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### 99. Get Documents by Lead
**GET** `/api/documents/lead/:leadId`

**Response:**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "url": "...",
      "documentLabel": "ID Proof",
      "expiryDate": "2025-12-31",
      "leadId": 123,
      "uploadedBy": "admin",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "count": 1
}
```

---

#### 100. Update Document
**PUT** `/api/documents/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `documentLabel`: String (Optional)
- `expiryDate`: String (Optional)
- `file`: File object (Optional)

**Response:**
```json
{
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "id": 1,
    "url": "https://bucket.s3.region.amazonaws.com/new-key",
    "documentLabel": "Updated Label",
    "expiryDate": "2026-01-01",
    "leadId": 123,
    "uploadedBy": "admin",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

#### 101. Get Expiring Documents
**GET** `/api/documents/expiring`

**Description:**
Retrieves a list of documents that are set to expire within the next 7 days.

**Response:**
```json
{
  "success": true,
  "message": "Expiring documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "url": "...",
      "documentLabel": "ID Proof",
      "expiryDate": "2026-01-10",
      "leadId": 123,
      "uploadedBy": "admin",
      "createdAt": "...",
      "updatedAt": "...",
      "lead": {
        "id": 123,
        "fullname": "John Doe"
      }
    }
  ],
  "count": 1
}
```

---

#### 102. Delete Document
**DELETE** `/api/documents/:id`

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

#### 103. Search Documents
**GET** `/api/documents/search`

**Query Parameters:**
- `leadName` (optional) - Partial name of the lead
- `documentLabel` (optional) - Partial label of the document

**Response:**
```json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "url": "...",
      "documentLabel": "Passport",
      "expiryDate": "2025-12-31",
      "leadId": 123,
      "uploadedBy": "admin",
      "createdAt": "...",
      "updatedAt": "...",
      "lead": {
        "id": 123,
        "fullname": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "count": 1
}
```

---

### Notes API

The Notes API provides endpoints to manage notes associated with leads. Each note belongs to a specific lead and contains text content, author information, and timestamps.

#### 97. Get All Notes
**GET** `/api/notes`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notes retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 5,
      "text": "Customer is very interested in express entry program",
      "createdBy": "admin",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z",
      "lead": {
        "id": 5,
        "fullname": "Jane Smith",
        "email": "jane@example.com"
      }
    },
    {
      "id": 2,
      "leadId": 7,
      "text": "Documents have been submitted for review",
      "createdBy": "john_doe",
      "createdAt": "2024-01-16T14:30:00.000Z",
      "updatedAt": "2024-01-16T14:30:00.000Z",
      "lead": {
        "id": 7,
        "fullname": "Bob Johnson",
        "email": "bob@example.com"
      }
    }
  ],
  "count": 2
}
```

---

#### 98. Get Note by ID
**GET** `/api/notes/:id`

**Parameters:**
- `id` (path parameter) - Note ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Note retrieved successfully",
  "data": {
    "id": 1,
    "leadId": 5,
    "text": "Customer is very interested in express entry program",
    "createdBy": "admin",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "lead": {
      "id": 5,
      "fullname": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid note ID
- `404 Not Found` - Note not found

---

#### 99. Get Notes by Lead ID
**GET** `/api/notes/lead/:leadId`

**Parameters:**
- `leadId` (path parameter) - Lead ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notes retrieved successfully",
  "data": [
    {
      "id": 1,
      "leadId": 5,
      "text": "First follow-up call completed",
      "createdBy": "admin",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "leadId": 5,
      "text": "Documents submitted",
      "createdBy": "admin",
      "createdAt": "2024-01-16T14:30:00.000Z",
      "updatedAt": "2024-01-16T14:30:00.000Z"
    }
  ],
  "count": 2
}
```

**Error Responses:**
- `400 Bad Request` - Invalid lead ID
- `404 Not Found` - Lead not found

**Note:** Notes are returned in descending order by creation date (newest first).

---

#### 100. Create Note
**POST** `/api/notes`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "leadId": 5,
  "text": "Customer is interested in express entry program",
  "createdBy": "john_doe"
}
```

**Fields:**
- `leadId` (required) - ID of the lead this note belongs to
- `text` (required) - Note content
- `createdBy` (optional) - User who created the note (auto-filled from auth token if not provided)

**Response:**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": 1,
    "leadId": 5,
    "text": "Customer is interested in express entry program",
    "createdBy": "john_doe",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Lead ID is required, Note text is required, or Lead not found
- `500 Internal Server Error` - Error creating note

---

#### 101. Update Note
**PUT** `/api/notes/:id`

**Parameters:**
- `id` (path parameter) - Note ID

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "text": "Updated note content - customer confirmed interest"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note updated successfully",
  "data": {
    "id": 1,
    "leadId": 5,
    "text": "Updated note content - customer confirmed interest",
    "createdBy": "john_doe",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid note ID, Note text cannot be empty, or Cannot change lead ID of a note
- `404 Not Found` - Note not found
- `500 Internal Server Error` - Error updating note

**Note:** You cannot change the `leadId` of an existing note. Only the `text` field can be updated.

---

#### 102. Delete Note
**DELETE** `/api/notes/:id`

**Parameters:**
- `id` (path parameter) - Note ID

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid note ID
- `404 Not Found` - Note not found
- `500 Internal Server Error` - Error deleting note

**Note:** This is a hard delete (permanent removal from database).

---

#### 103. Get Expiring Documents
**GET** `/api/documents/expiring`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `searchText` (optional) - Search text matching document label or lead name

**Response:**
```json
{
  "success": true,
  "message": "Expiring documents retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "Pending",
      "documentLabel": "Passport",
      "expiryDate": "2025-01-20",
      "url": "https://example.com/file.jpg",
      "leadId": 101,
      "uploadedBy": "system",
      "createdAt": "2024-03-15T10:00:00Z",
      "lead": {
        "id": 101,
        "fullname": "John Doe"
      }
    }
  ],
  "count": 1
}
```

---

#### 104. Get Note Count
**GET** `/api/notes/count`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Note count retrieved successfully",
  "count": 42
}
```

---

## Error Codes


| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required or invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Notes

- All delete operations are soft deletes (set `isActive = false`)
- All timestamps are in ISO 8601 format
- IDs are auto-incrementing integers
- Relations are loaded by default (users for roles, leads for stages, etc.)
- For protected endpoints, include the JWT token in the Authorization header: `Authorization: Bearer <token>`
- Admin-only endpoints require both authentication and Admin role
- Password must be at least 6 characters long
- Usernames and emails must be unique
- **Security:** Passwords are never returned in API responses. All user-related endpoints exclude password fields from responses for security purposes.


