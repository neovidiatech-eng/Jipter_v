# 🚀 Frontend Integration Guide: Lectures, Schedules & Free Trial Rules

This document outlines recent backend API updates, data model changes, and integration requirements for the frontend web/mobile applications.

---

## 📌 Summary of Key Updates

1. **Automatic & Sequential Lecture Unlocking (`locked` & `availableAt`)**:
   - **Passed Time Rule**: Any lecture whose scheduled session start time or date has already passed (`new Date() >= start_time` or `new Date() >= lecture.date`) is **automatically unlocked** (`locked: false`).
   - **Regular Students**: 
     - Lectures unlock sequentially. Any lecture whose scheduled time has arrived/passed or has no future time lock is **unlocked** (`status: "Pending"`, `locked: false`).
     - Completed lectures return `status: "Completed"`, `locked: false`.
     - Future lectures return `status: "Locked"`, `locked: true` until their start time arrives.
   - **Free Trial / 1-Session Plan Students**:
     - The single lecture linked to their booked session unlocks automatically once the scheduled session start time arrives (`new Date() >= start_time`).
     - All other lectures in the course return `status: "Locked"` and `locked: true`.
   - When a lecture is `locked: true`, media assets (`videoUrl`, `pdfUrl`, `slidesUrl`, `content`) are stripped (`null`) by the backend.

2. **Schedule Query Enhancements**:
   - Support for `day_type` filter (`today`, `previous`, `upcoming`) in `GET /schedules`.
   - Schedules include `reviewer` and `reviewee` details.

3. **Standardized Session & Lecture Statuses**:
   - Status values use shared enums (`Pending`, `Completed`, `Locked`).

---

## 1. Course & Lecture Access API

### 🔹 Fetching Course Lectures for a Student
**Endpoint:** `GET /materials/courses/:id/student-lectures` (or equivalent student course view)

#### Response Data Structure (Per Lecture Item):
```json
{
  "id": "lecture-uuid",
  "title": "Introduction to Algebra",
  "order": 1,
  "status": "Pending", // "Pending" | "Completed" | "Locked"
  "locked": false, // boolean (false when time has passed or lecture is unlocked)
  "availableAt": "2026-08-16T10:00:00.000Z", // ISO Date String or null
  "videoUrl": "https://...", // present when locked: false
  "pdfUrl": "https://...",   // present when locked: false
  "slidesUrl": "https://...",// present when locked: false
  "content": "Lecture description..."
}
```

#### Frontend UI Logic:
| `locked` | `status` | UI Behavior |
| :--- | :--- | :--- |
| `true` | `"Locked"` | Render **Padlock Icon** 🔒. Disable play/view buttons. Show available time countdown using `availableAt`. |
| `false` | `"Pending"` | Render **Play / Open Button** ▶️. Allow student to watch media and complete the lecture. |
| `false` | `"Completed"` | Render **Checkmark** ✅. Show lecture marked as completed. |

---

### 🔹 Fetching Single Lecture Details
**Endpoint:** `GET /materials/lectures/:id`

- If the lecture is **locked** (future start time not reached or blocked trial lecture):
  - **HTTP Status:** `403 Forbidden`
  - **Response Body:**
    ```json
    {
      "success": false,
      "message": "LECTURE_LOCKED"
    }
    ```

---

### 🔹 Marking a Lecture as Completed
**Endpoint:** `POST /materials/lectures/:id/complete`

- Works for any unlocked lecture whose scheduled start time has passed.
- Automatically marks the lecture as completed in `user_lectures`, unlocking the next sequential lecture for regular students.

---

## 2. Example Frontend Implementation (React / TypeScript)

```tsx
interface Lecture {
  id: string;
  title: string;
  order: number;
  status: "Pending" | "Completed" | "Locked";
  locked: boolean;
  availableAt: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  slidesUrl: string | null;
}

export const LectureCard: React.FC<{ lecture: Lecture; onSelect: (id: string) => void }> = ({
  lecture,
  onSelect,
}) => {
  const isLocked = lecture.locked || lecture.status === "Locked";

  return (
    <div className={`lecture-card ${isLocked ? "locked" : "unlocked"}`}>
      <h3>{lecture.title}</h3>
      
      {isLocked ? (
        <div className="lock-badge">
          🔒 Locked
          {lecture.availableAt && (
            <span className="available-time">
              Available: {new Date(lecture.availableAt).toLocaleString()}
            </span>
          )}
        </div>
      ) : (
        <button onClick={() => onSelect(lecture.id)}>
          {lecture.status === "Completed" ? "Re-watch Lecture" : "Start Lecture"}
        </button>
      )}
    </div>
  );
};
```