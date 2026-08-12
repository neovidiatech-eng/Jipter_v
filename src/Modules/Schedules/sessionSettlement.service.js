import { sessionStatus } from "../../Utils/Enums/sessions.js";
import { transactionStatus } from "../../Utils/Enums/transactions.js";

export const isPostponedSession = (session) => Boolean(session?.rescheduledFromId);

export const settleTeacherReview = async ({
  tx,
  session,
  scheduleId,
  teacherAttended,
  studentAttended,
  translate,
}) => {
  if (teacherAttended) {
    const shouldPayTeacher = !isPostponedSession(session);

    if (shouldPayTeacher) {
      const sessionDuration =
        (session.end_time - session.start_time) / (60 * 1000 * 60);
      const payoutAmount = sessionDuration * session.teacher.hour_price;
      const teacherWallet = await tx.findFirst({
        model: "Wallet",
        where: { userId: session.teacher.user_id },
      });

      if (teacherWallet) {
        await tx.updateOne({
          model: "Wallet",
          where: { id: teacherWallet.id },
          data: { balance: { increment: payoutAmount } },
        });

        await tx.create({
          model: "Transaction",
          data: {
            walletId: teacherWallet.id,
            type: "payout",
            amount: payoutAmount,
            reason: translate("PAYOUT_REASON", { title: session.title }),
            status: transactionStatus.COMPLETED,
          },
        });
      }
    }

    await tx.updateOne({
      model: "schedule",
      where: { id: scheduleId },
      data: { status: sessionStatus.COMPLETED },
    });

    if (studentAttended) {
      await tx.updateOne({
        model: "student",
        where: { id: session.studentId },
        data: { sessions_attended: { increment: 1 } },
      });
    }

    return;
  }

  await tx.updateOne({
    model: "student",
    where: { id: session.studentId },
    data: { sessions_remaining: { increment: 1 } },
  });

  await tx.updateOne({
    model: "schedule",
    where: { id: scheduleId },
    data: { status: sessionStatus.MISSED },
  });
};

