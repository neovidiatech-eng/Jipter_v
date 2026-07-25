import { Router } from "express";
import authentication from "../../Middlewares/Authentication.js";
import { authorize } from "../../Middlewares/Authorize.js";
import * as chatController from "./chat.controller.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";
import {
  localMulterUpload,
  fileValidation,
} from "../../Utils/Multer/local.multer.js";

const router = Router();

router.use(authentication);

router.get(
  "/conversations",
  authorize(PERMISSIONS_V2.CHAT.READ),
  chatController.getConversations,
);

router.post(
  "/conversations",
  authorize(PERMISSIONS_V2.CHAT.CREATE),
  chatController.createConversation,
);

router.get(
  "/conversations/:id/messages",
  authorize(PERMISSIONS_V2.CHAT.READ),
  chatController.getMessages,
);

router.post(
  "/conversations/:id/messages",
  authorize(PERMISSIONS_V2.CHAT.CREATE),
  localMulterUpload({
    customPath: (req) => `chat/user/${req.user.id}`,
    validation: fileValidation.chat,
  }).any(),
  chatController.sendMessage,
);

export default router;
