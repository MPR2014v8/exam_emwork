# ข้อ 2: The Midnight Shift SQL

## โจทย์

โรงงานมีพนักงาน 3 กะ:

| กะ | เวลา |
|---|---|
| Morning | 08:00–16:00 |
| Evening | 16:00–00:00 |
| Night | 00:00–08:00 ของวันถัดไป |

ค้นหาพนักงานกะ Night ของวันที่ **19 มีนาคม 2026** ที่มาสาย โดย Clock-In หลัง `00:05` ถือว่าสาย และรองรับการสแกนก่อนเที่ยงคืน เช่น `23:55` ของวันที่ 18 มีนาคม

> กำหนดให้ระบบรับการสแกนล่วงหน้าได้ 1 ชั่วโมงตามเงื่อนไขเพิ่มเติม

## โครงสร้างตารางที่ใช้

```text
employees(id, name, shift_name)
attendance(employee_id, clock_in)
```

## SQL

```sql
WITH shift_time AS (
    SELECT
        TIMESTAMP('2026-03-19 00:00:00') AS shift_start,
        TIMESTAMP('2026-03-19 08:00:00') AS shift_end
),
first_scan AS (
    SELECT
        a.employee_id,
        MIN(a.clock_in) AS clock_in
    FROM attendance a
    CROSS JOIN shift_time s
    WHERE a.clock_in >= s.shift_start - INTERVAL 1 HOUR
      AND a.clock_in <  s.shift_end
    GROUP BY a.employee_id
)
SELECT
    e.id,
    e.name,
    f.clock_in
FROM employees e
JOIN first_scan f
    ON f.employee_id = e.id
CROSS JOIN shift_time s
WHERE e.shift_name = 'Night'
  AND f.clock_in > s.shift_start + INTERVAL 5 MINUTE;
```

## การทำงาน

1. `shift_time` กำหนดกะ Night เป็น `00:00–08:00`
2. `shift_start - INTERVAL 1 HOUR` ทำให้รับการสแกนตั้งแต่ `23:00` ของวันก่อน
3. `MIN(clock_in)` เลือกการสแกนครั้งแรกของพนักงานแต่ละคน
4. `e.shift_name = 'Night'` กรองเฉพาะพนักงานกะ Night
5. `clock_in > shift_start + INTERVAL 5 MINUTE` เลือกเฉพาะผู้สแกนหลัง `00:05`

## ตัวอย่าง

| Clock-In ครั้งแรก | ผล |
|---|---|
| 23:55 | ไม่สาย |
| 00:01 | ไม่สาย |
| 00:05 | ไม่สาย |
| 00:06 | สาย |

ใช้ `< shift_end` เพื่อไม่รวม `08:00` ซึ่งเป็นเวลาเริ่มกะ Morning
