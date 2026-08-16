# 🚀 Frontend Integration Guide: Lectures, Schedules & Free Trial Rules

This document outlines recent backend API updates, data model changes, and integration requirements for the frontend web/mobile applications.

---

## 📌 Summary of Key Updates

1. **Sequential & Dynamic Lecture Unlocking (`locked` & `availableAt`)**:
   - **Regular Students**: 
     - Lectures unlock sequentially. The **1st lecture** (or the next uncompleted lecture) is **unlocked** (`status: "Pending"`, `locked: false`).
     - Completed lectures return `status: "Completed"`, `locked: false`.
     - Future lectures return `status: "Locked"`, `locked: true`.
     - If a scheduled live session is attached to a lecture, it is locked until the session start time (`new Date() < start_time`).
   - **Free Trial / 1-Session Plan Students**:
     - Only the **single lecture** linked to their booked schedule (or lecture #1) is unlocked once the scheduled session start time arrives.
     - All other lectures return `status: "Locked"` and `locked: true`.
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
  "locked": false, // boolean
  "availableAt": null, // ISO Date String or null
  "videoUrl": "https://...", // present when locked: false
  "pdfUrl": "https://...",   // present when locked: false
  "slidesUrl": "https://...",// present when locked: false
  "content": "Lecture description..."
}
```

#### Frontend UI Logic:
| `locked` | `status` | UI Behavior |
| :--- | :--- | :--- |
| `true` | `"Locked"` | Render **Padlock Icon** 🔒. Disable play/view buttons. Show available time countdown using `availableAt` if present. |
| `false` | `"Pending"` | Render **Play / Open Button** ▶️. Allow student to watch media and complete the lecture. |
| `false` | `"Completed"` | Render **Checkmark** ✅. Show lecture marked as completed. |

---

### 🔹 Fetching Single Lecture Details
**Endpoint:** `GET /materials/lectures/:id`

- If the lecture is **locked** (time locked by schedule or blocked trial lecture):
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

- For **Regular Students**: Marks the lecture as completed in `user_lectures`, automatically unlocking the next sequential lecture in the course.
- For **Free Trial Students**: Requires the booked trial session to be in `completed` status (`sessionStatus.COMPLETED`).

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