import test from "node:test";
import assert from "node:assert/strict";
import {
  isPostponedSession,
  settleTeacherReview,
} from "../src/Modules/Schedules/sessionSettlement.service.js";

const createTx = ({ wallet = { id: "wallet-1" } } = {}) => {
  const calls = {
    findFirst: [],
    updateOne: [],
    create: [],
  };

  return {
    calls,
    findFirst: async (payload) => {
      calls.findFirst.push(payload);
      if (payload.model === "Wallet") return wallet;
      return null;
    },
    updateOne: async (payload) => {
      calls.updateOne.push(payload);
      return payload;
    },
    create: async (payload) => {
      calls.create.push(payload);
      return payload;
    },
  };
};

const createSession = (overrides = {}) => ({
  id: "schedule-1",
  studentId: "student-1",
  title: "English lesson",
  start_time: new Date("2026-06-08T10:00:00.000Z"),
  end_time: new Date("2026-06-08T11:00:00.000Z"),
  rescheduledFromId: null,
  teacher: {
    user_id: "teacher-user-1",
    hour_price: 50,
  },
  ...overrides,
});

const translate = (key, params) => `${key}:${params.title}`;

test("marks a postponed teacher-attended session completed without earnings payout", async () => {
  const tx = createTx();
  const session = createSession({ rescheduledFromId: "original-schedule-1" });

  assert.equal(isPostponedSession(session), true);

  await settleTeacherReview({
    tx,
    session,
    scheduleId: session.id,
    teacherAttended: true,
    studentAttended: true,
    translate,
  });

  assert.equal(
    tx.calls.findFirst.some((call) => call.model === "Wallet"),
    false,
  );
  assert.equal(
    tx.calls.create.some((call) => call.model === "Transaction"),
    false,
  );
  assert.deepEqual(tx.calls.updateOne, [
    {
      model: "schedule",
      where: { id: "schedule-1" },
      data: { status: "completed" },
    },
    {
      model: "student",
      where: { id: "student-1" },
      data: { sessions_attended: { increment: 1 } },
    },
  ]);
});

test("marks a normal teacher-attended session completed and pays earnings", async () => {
  const tx = createTx();
  const session = createSession();

  assert.equal(isPostponedSession(session), false);

  await settleTeacherReview({
    tx,
    session,
    scheduleId: session.id,
    teacherAttended: true,
    studentAttended: true,
    translate,
  });

  assert.deepEqual(tx.calls.findFirst, [
    {
      model: "Wallet",
      where: { userId: "teacher-user-1" },
    },
  ]);
  assert.deepEqual(tx.calls.updateOne, [
    {
      model: "Wallet",
      where: { id: "wallet-1" },
      data: { balance: { increment: 50 } },
    },
    {
      model: "schedule",
      where: { id: "schedule-1" },
      data: { status: "completed" },
    },
    {
      model: "student",
      where: { id: "student-1" },
      data: { sessions_attended: { increment: 1 } },
    },
  ]);
  assert.deepEqual(tx.calls.create, [
    {
      model: "Transaction",
      data: {
        walletId: "wallet-1",
        type: "payout",
        amount: 50,
        reason: "PAYOUT_REASON:English lesson",
        status: "completed",
      },
    },
  ]);
});
