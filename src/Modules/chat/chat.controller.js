import * as ChatService from "./chat.service.js";
import { successResponse, errorResponse } from "../../Utils/Response.js";

/**
 * Chat Controller
 * Handles HTTP requests for the chat system
 */

/**
 * Create or get a conversation
 * POST /api/chat/conversations
 */
export const createConversation = async (req, res, next) => {
  try {
    const { teacherId, studentId } = req.body;
    const currentUser = req.user;

    // Validation: Student can only start with a teacher, Teacher can only start with a student
    if (currentUser.role.name === "student" && currentUser.student?.id !== studentId) {
      return errorResponse({
        req,
        next,
        status: 403,
        message: "You can only create conversations for yourself",
      });
    }
    if (currentUser.role.name === "teacher" && currentUser.teacher?.id !== teacherId) {
      return errorResponse({
        req,
        next,
        status: 403,
        message: "You can only create conversations for yourself",
      });
    }

    const conversation = await ChatService.createConversation(teacherId, studentId, currentUser);
    return successResponse({
      res,
      req,
      status: 201,
      message: "Conversation created successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("ChatController (createConversation) Error:", error.message);
    return errorResponse({
      req,
      next,
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};

/**
 * Get user's conversations
 * GET /api/chat/conversations
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role.name;

    const conversations = await ChatService.getConversations(userId, role);
    return successResponse({
      res,
      req,
      status: 200,
      message: "Conversations fetched successfully",
      data: conversations,
    });
  } catch (error) {
    console.error("ChatController (getConversations) Error:", error.message);
    return errorResponse({
      req,
      next,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Get messages for a conversation
 * GET /api/chat/conversations/:id/messages
 */
export const getMessages = async (req, res, next) => {
  try {
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
        message: "Unauthorized access to this conversation",
      });
    }

    const messages = await ChatService.getMessages(
      id,
      parseInt(page) || 1,
      parseInt(limit) || 50,
      userId
    );

    return successResponse({
      res,
      req,
      status: 200,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error("ChatController (getMessages) Error:", error.message);
    return errorResponse({
      req,
      next,
      status: 500,
      message: "Internal Server Error",
    });
  }
};

/**
 * Send a message
 * POST /api/chat/conversations/:id/messages
 */
export const sendMessage = async (req, res, next) => {
  try {
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
        message: "Unauthorized to send messages in this conversation",
      });
    }

    const message = await ChatService.saveMessage(id, userId, content);

    return successResponse({
      res,
      req,
      status: 201,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("ChatController (sendMessage) Error:", error.message);
    return errorResponse({
      req,
      next,
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
};
