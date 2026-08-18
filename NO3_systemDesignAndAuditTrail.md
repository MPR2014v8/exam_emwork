# ข้อ 3: System Design & Audit Trail

## โจทย์

ออกแบบ REST API และ Database Schema สำหรับระบบแก้ไขเงินเดือนพนักงาน โดย:

- Audit Trail ต้องเก็บค่าเก่า ค่าใหม่ ใครแก้ และแก้เมื่อไหร่
- ป้องกันไม่ให้พนักงาน IT แอบแก้เงินเดือนตัวเองใน Database โดยไม่ผ่านระบบ

## REST API

```http
PATCH /api/employees/1001/salary
Authorization: Bearer <token>
Content-Type: application/json
```

Request:

```json
{
  "newSalary": 45000.00
}
```

Response:

```json
{
  "employeeId": 1001,
  "oldSalary": 40000.00,
  "newSalary": 45000.00,
  "changedBy": 25,
  "changedAt": "2026-03-20T10:30:00+07:00"
}
```


## Table Schema

```sql
CREATE TABLE salaries (
    employee_id BIGINT PRIMARY KEY,
    salary DECIMAL(12, 2) NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE salary_audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT NOT NULL,
    old_salary DECIMAL(12, 2) NOT NULL,
    new_salary DECIMAL(12, 2) NOT NULL,
    changed_by BIGINT NULL,
    database_user VARCHAR(128) NOT NULL,
    change_source ENUM('API', 'DIRECT_DB') NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

| Field | เก็บอะไร |
|---|---|
| `employee_id` | พนักงานเจ้าของเงินเดือน |
| `old_salary` | เงินเดือนเดิม |
| `new_salary` | เงินเดือนใหม่ |
| `changed_by` | ผู้ใช้ในระบบที่แก้ |
| `database_user` | Database account ที่รันคำสั่ง |
| `change_source` | แก้ผ่าน API หรือ Database โดยตรง |
| `changed_at` | วันที่และเวลาที่แก้ |

