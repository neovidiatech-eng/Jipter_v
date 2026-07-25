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
  const { content, isVoice, duration } = req.body;
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

  let mediaUrl = null;
  let mediaType = null;
  let attachments = null;

  // Handle uploaded file (single file uploaded via local multer)
  const uploadedFile = req.file || (req.files && req.files[0]);
  if (uploadedFile) {
    mediaUrl = uploadedFile.finalPath || uploadedFile.path;

    const mime = uploadedFile.mimetype || "";
    const isVoiceFlag = String(isVoice) === "true" || req.body.mediaType === "voice";

    if (isVoiceFlag || mime.startsWith("audio/")) {
      mediaType = isVoiceFlag ? "voice" : "audio";
    } else if (mime.startsWith("image/")) {
      mediaType = "image";
    } else if (mime.startsWith("video/")) {
      mediaType = "video";
    } else if (mime === "application/pdf") {
      mediaType = "pdf";
    } else {
      mediaType = "document";
    }

    attachments = {
      path: uploadedFile.finalPath || uploadedFile.path,
      originalname: uploadedFile.originalname,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      duration: duration ? Number(duration) : undefined,
    };
  } else if (req.body.mediaUrl) {
    mediaUrl = req.body.mediaUrl;
    mediaType = req.body.mediaType || "document";
    attachments = req.body.attachments || (duration ? { duration: Number(duration) } : null);
  }

  const message = await ChatService.saveMessage(
    id,
    userId,
    content,
    mediaUrl,
    mediaType,
    attachments,
  );

  // Broadcast real-time message via socket if socket server is present
  const io = req.app.get("io");
  if (io) {
    io.to(`conv_${id}`).emit("message:new", message);
  }

  return successResponse({
    res,
    req,
    status: 201,
    message: "MESSAGE_SENT",
    data: message,
  });
});
