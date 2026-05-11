import { Router } from "express";
import * as chatController from "./chat.controller.js";
import authentication from "../../Middlewares/Authentication.js";
import { authorization } from "../../Middlewares/Authorization.js";

const chatRouter = Router();

// All chat routes require authentication and actor role
chatRouter.use(authentication);
chatRouter.use(authorization({ roles: ["student", "teacher"] }));

/**
 * POST /api/chat/conversations
 * Create or get a conversation between student and teacher
 */
chatRouter.post("/conversations", chatController.createConversation);

/**
 * GET /api/chat/conversations
 * List user's conversations
 */
chatRouter.get("/conversations", chatController.getConversations);

/**
 * GET /api/chat/conversations/:id/messages
 * Get paginated messages for a conversation
 */
chatRouter.get("/conversations/:id/messages", chatController.getMessages);

export default chatRouter;
