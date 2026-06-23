# API Contracts

## Overview

This document defines all API endpoints for the Dynamic Form Builder Engine.

Base URL:

```text
/api
```

All requests and responses use JSON.

---

# Forms

## Create Form

Creates a new draft form.

### Request

```http
POST /api/forms
```

### Request Body

```json
{
  "title": "Customer Registration",
  "description": "Collect customer information"
}
```

### Response

```json
{
  "id": "uuid",
  "title": "Customer Registration",
  "description": "Collect customer information",
  "status": "DRAFT",
  "currentVersion": null,
  "createdAt": "2026-01-01T12:00:00Z"
}
```

### Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 201  | Created          |
| 400  | Validation Error |

---

## Get Forms

Returns all forms.

### Request

```http
GET /api/forms
```

### Response

```json
[
  {
    "id": "uuid",
    "title": "Customer Registration",
    "status": "PUBLISHED",
    "currentVersion": 1
  }
]
```

### Status Codes

| Code | Meaning |
| ---- | ------- |
| 200  | Success |

---

## Get Form

Returns a single form with latest configuration.

### Request

```http
GET /api/forms/:formId
```

### Response

```json
{
  "id": "uuid",
  "title": "Customer Registration",
  "description": "Collect customer information",
  "status": "DRAFT",
  "currentVersion": 1,
  "schema": {
    "fields": []
  }
}
```

### Status Codes

| Code | Meaning   |
| ---- | --------- |
| 200  | Success   |
| 404  | Not Found |

---

## Update Draft Form

Updates a draft form configuration.

### Request

```http
PUT /api/forms/:formId
```

### Request Body

```json
{
  "title": "Customer Registration",
  "description": "Collect customer information",
  "schema": {
    "fields": [
      {
        "id": "fullName",
        "label": "Full Name",
        "type": "text",
        "required": true,
        "order": 1
      }
    ]
  }
}
```

### Response

```json
{
  "message": "Form updated successfully"
}
```

### Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 200  | Success          |
| 400  | Validation Error |
| 404  | Not Found        |

---

## Publish Form

Publishes a draft form and creates a new version.

### Request

```http
POST /api/forms/:formId/publish
```

### Response

```json
{
  "formId": "uuid",
  "version": 1,
  "status": "PUBLISHED",
  "publicUrl": "/public/forms/uuid"
}
```

### Status Codes

| Code | Meaning   |
| ---- | --------- |
| 200  | Success   |
| 404  | Not Found |

---

# Public Forms

## Get Published Form

Returns the latest published version of a form.

### Request

```http
GET /api/public/forms/:formId
```

### Response

```json
{
  "formId": "uuid",
  "version": 1,
  "title": "Customer Registration",
  "description": "Collect customer information",
  "schema": {
    "fields": [
      {
        "id": "fullName",
        "label": "Full Name",
        "type": "text",
        "required": true
      }
    ]
  }
}
```

### Status Codes

| Code | Meaning   |
| ---- | --------- |
| 200  | Success   |
| 404  | Not Found |

---

# Submissions

## Create Submission

Creates a submission for a published form.

### Request

```http
POST /api/forms/:formId/submissions
```

### Request Body

```json
{
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

### Success Response

```json
{
  "submissionId": "uuid",
  "message": "Submission created successfully"
}
```

### Validation Error Response

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Status Codes

| Code | Meaning          |
| ---- | ---------------- |
| 201  | Created          |
| 400  | Validation Error |
| 404  | Form Not Found   |

---

## List Submissions

Returns all submissions for a form.

### Request

```http
GET /api/forms/:formId/submissions
```

### Response

```json
[
  {
    "id": "uuid",
    "submittedAt": "2026-01-01T12:00:00Z",
    "version": 1
  }
]
```

### Status Codes

| Code | Meaning   |
| ---- | --------- |
| 200  | Success   |
| 404  | Not Found |

---

## Get Submission

Returns a specific submission.

### Request

```http
GET /api/submissions/:submissionId
```

### Response

```json
{
  "id": "uuid",
  "formId": "uuid",
  "version": 1,
  "submittedAt": "2026-01-01T12:00:00Z",
  "data": {
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

### Status Codes

| Code | Meaning   |
| ---- | --------- |
| 200  | Success   |
| 404  | Not Found |

---

# Error Contract

All API errors must follow a consistent structure.

## Validation Error

```json
{
  "error": "Validation failed",
  "errors": [
    {
      "field": "fullName",
      "message": "Minimum length is 3"
    }
  ]
}
```

---

## Not Found Error

```json
{
  "error": "Resource not found"
}
```

---

## Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

# Form Schema Contract

The backend stores form definitions in JSONB using the following structure.

```json
{
  "title": "Customer Registration",
  "fields": [
    {
      "id": "fullName",
      "label": "Full Name",
      "type": "text",
      "required": true,
      "minLength": 3,
      "maxLength": 50,
      "order": 1
    },
    {
      "id": "email",
      "label": "Email",
      "type": "email",
      "required": true,
      "order": 2
    }
  ]
}
```

Supported field types:

* text
* textarea
* number
* email
* date
* select
* checkbox
