# API Endpoints Documentation

This file lists all available API endpoints for your backend, grouped by resource. Each endpoint includes its HTTP method, path, required roles, and a brief description.

---

## Store Endpoints

- `POST   /partner-store`  
  **Roles:** admin, super_admin  
  **Description:** Create a new store

- `GET    /partner-store/`  
  **Roles:** admin, super_admin  
  **Description:** Get all stores

- `GET    /partner-store/:id`  
  **Roles:** admin, super_admin, partner  
  **Description:** Get store by store ID

- `GET    /partner-store/partner/:partnerId`  
  **Roles:** admin, super_admin, partner  
  **Description:** Get store by partner ID

- `PUT    /partner-store/:id`  
  **Roles:** admin, super_admin  
  **Description:** Update store by store ID

- `DELETE /partner-store/:id`  
  **Roles:** admin, super_admin  
  **Description:** Delete store by store ID

---

## Admin Endpoints

- `GET    /admin/list`  
  **Roles:** admin, super_admin  
  **Description:** Get all admins

- `GET    /admin/detail/:id`  
  **Roles:** admin, super_admin  
  **Description:** Get admin by ID

- `POST   /admin/create`  
  **Description:** Create a new admin

- `PUT    /admin/update/:id`  
  **Roles:** admin, super_admin  
  **Description:** Update admin by ID

- `DELETE /admin/remove/:id`  
  **Roles:** admin, super_admin  
  **Description:** Delete admin by ID

---

## Partner Endpoints

- `POST   /partner/register`  
  **Description:** Register a new partner

- `GET    /partner/getAllPartners`  
  **Roles:** admin, super_admin  
  **Description:** Get all partners

- `POST   /partner/approvePartner`  
  **Roles:** admin, super_admin  
  **Description:** Approve a partner

- `POST   /partner/rejectPartner`  
  **Roles:** admin, super_admin  
  **Description:** Reject a partner

---

## Auth Endpoints

- `POST   /auth/login`  
  **Description:** Login

---

## Usage
- All endpoints requiring roles use the `requireRole` middleware.
- Replace `:id` and `:partnerId` with actual IDs when making requests.

---

*This file is auto-generated for quick reference. Update as needed when new endpoints are added.*
