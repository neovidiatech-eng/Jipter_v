import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";
import * as db from "../../database/dbService.js";
import { ensureExists } from "../../database/genericService.js";
import { convertAmount } from "../../Utils/Helpers.js";

export const getExpenses = asyncHandler(async (req, res, next) => {
  const { search, status, type, page = 1, limit = 10 } = req.query;
  let where = {};
  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }
  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  const { items: expenses, pagination } =
    await db.findManyWithPaginationAndCount({
      model: "expenses",
      where,
      page,
      limit,
      include: { currency: true },
    });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    status: 200,
    data: { expenses, pagination },
  });
});

export const getExpenseById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const expense = await ensureExists({
    model: "expenses",
    where: { id },
    include: { currency: true },
    message: "EXPENSE_NOT_FOUND",
  });

  return successResponse({
    res,
    req,
    message: "FETCH_SUCCESS",
    status: 200,
    data: expense,
  });
});

export const createExpense = asyncHandler(async (req, res, next) => {
  const { title, currencyId, amount, payment_type, type, status, date } =
    req.body;


  // 1. Fetch required configuration outside transaction
  const [sourceCurrency, defaultCurrency, systemWallet] = await Promise.all([
    db.findOne({ model: "currency", where: { id: currencyId } }),
    db.findFirst({ model: "currency", where: { default: true } }),
    db.findFirst({ model: "Wallet", where: { type: "system" }, include: { currency: true } }),
  ]);

  if (!sourceCurrency) {
    return errorResponse({ req, next, message: "CURRENCY_NOT_FOUND", status: 404 });
  }
  if (!defaultCurrency || !systemWallet) {
    return errorResponse({ req, next, message: "SYSTEM_CONFIGURATION_ERROR", status: 500 });
  }

  const rawAmount = parseFloat(amount);
  
  // 2. Convert amount to system default currency (Wallet Currency)
  // Logic: All system wallet movements must be in the default currency.
  const convertedAmount = convertAmount(rawAmount, sourceCurrency.exchangeRate, defaultCurrency.exchangeRate);

  let expense;
  try {
    await db.transaction(async (tx) => {
      // 3. Re-verify balance inside transaction for absolute safety
      const currentWallet = await tx.findOne({
        model: "Wallet",
        where: { id: systemWallet.id },
      });

      if (currentWallet.balance < convertedAmount) {
        const error = new Error("INSUFFICIENT_BALANCE");
        error.isMessageKey = true;
        error.status = 400;
        throw error;
      }

      // 4. Create expense record
      expense = await tx.create({
        model: "expenses",
        data: {
          title,
          currencyId,
          amount: rawAmount, // Original amount for record
          payment_type,
          type,
          status,
          date: new Date(date),
        },
      });

      // 5. Create Transaction record (Ledger Entry)
      await tx.create({
        model: "Transaction",
        data: {
          walletId: systemWallet.id,
          type: "expense",
          amount: convertedAmount, // Amount in system currency
          status: "completed",
          reason: title,
          expenseId: expense.id,
        },
      });

      // 6. Deduct from system wallet balance (Atomic)
      await tx.updateOne({
        model: "Wallet",
        where: { id: systemWallet.id },
        data: { balance: { decrement: convertedAmount } },
      });
    });
  } catch (error) {
    return errorResponse({
      next,
      req,
      message: error.message || "TRANSACTION_FAILED",
      status: error.status || 500,
    });
  }

  // 7. Re-fetch with relations for response
  const expenseWithCurrency = await db.findOne({
    model: "expenses",
    where: { id: expense.id },
    include: { currency: true },
  });

  return successResponse({
    res,
    req,
    message: "CREATE_SUCCESS",
    status: 201,
    data: expenseWithCurrency,
  });
});


export const updateExpense = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, currencyId, amount, payment_type, type, status, date } =
    req.body;

  await ensureExists({
    model: "expenses",
    where: { id },
    message: "EXPENSE_NOT_FOUND",
  });

  if (currencyId) {
    const currencyExists = await db.findOne({
      model: "currency",
      where: { id: currencyId },
    });
    if (!currencyExists) {
      return errorResponse({
        req,
        next,
        message: "CURRENCY_NOT_FOUND",
        status: 404,
      });
    }
  }

  const updateData = {
    ...(title && { title }),
    ...(currencyId && { currencyId }),
    ...(amount !== undefined && { amount: parseFloat(amount) }),
    ...(payment_type && { payment_type }),
    ...(type && { type }),
    ...(status && { status }),
    ...(date && { date: new Date(date) }),
  };

  const expense = await db.updateOne({
    model: "expenses",
    where: { id },
    data: updateData,
    include: { currency: true },
  });

  return successResponse({
    res,
    req,
    message: "UPDATE_SUCCESS",
    status: 200,
    data: expense,
  });
});

export const deleteExpense = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  await ensureExists({
    model: "expenses",
    where: { id },
    message: "EXPENSE_NOT_FOUND",
  });

  await db.deleteOne({
    model: "expenses",
    where: { id },
  });

  return successResponse({
    res,
    req,
    message: "DELETE_SUCCESS",
    status: 200,
  });
});
