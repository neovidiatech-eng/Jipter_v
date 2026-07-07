import * as ChatService from "./chat.service.js";
import {
  asyncHandler,
  successResponse,
  errorResponse,
} from "../../Utils/Response.js";

/**
 * Chat Controller
 * Handles HTTP requests for the chat system
 */

/**
 * Create or get a conversation
 * POST /api/chat/conversations
 */
export const createConversation = asyncHandler(async (req, res, next) => {
  const { teacherId, studentId } = req.body;
  const currentUser = req.user;

  // Validation: Student can only start with a teacher, Teacher can only start with a student
  if (currentUser.role.name === "student" && currentUser.student?.id !== studentId) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "CONVERSATION_CREATE_SELF_ONLY",
    });
  }
  if (currentUser.role.name === "teacher" && currentUser.teacher?.id !== teacherId) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "CONVERSATION_CREATE_SELF_ONLY",
    });
  }

  const conversation = await ChatService.createConversation(teacherId, studentId, currentUser);
  return successResponse({
    res,
    req,
    status: 201,
    message: "CONVERSATION_CREATED",
    data: conversation,
  });
});

/**
 * Get user's conversations
 * GET /api/chat/conversations
 */
export const getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const role = req.user.role.name;

  const conversations = await ChatService.getConversations(userId, role);
  return successResponse({
    res,
    req,
    status: 200,
    message: "CONVERSATIONS_FETCHED",
    data: conversations,
  });
});

/**
 * Get messages for a conversation
 * GET /api/chat/conversations/:id/messages
 */
export const getMessages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { page, limit } = req.query;
  const userId = req.user.id;
  const role = req.user.role.name;

  // Check participation
  const canAccess = await ChatService.isParticipant(id, userId, role);
  if (!canAccess) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "CONVERSATION_UNAUTHORIZED",
    });
  }

  const messages = await ChatService.getMessages(
    id,
    parseInt(page) || 1,
    parseInt(limit) || 50,
    userId,
  );

  return successResponse({
    res,
    req,
    status: 200,
    message: "MESSAGES_FETCHED",
    data: messages,
  });
});

/**
 * Send a message
 * POST /api/chat/conversations/:id/messages
 */
export const sendMessage = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  const role = req.user.role.name;

  // Check participation
  const canAccess = await ChatService.isParticipant(id, userId, role);
  if (!canAccess) {
    return errorResponse({
      req,
      next,
      status: 403,
      message: "CONVERSATION_UNAUTHORIZED",
    });
  }

  const message = await ChatService.saveMessage(id, userId, content);

  return successResponse({
    res,
    req,
    status: 201,
    message: "MESSAGE_SENT",
    data: message,
  });
});
