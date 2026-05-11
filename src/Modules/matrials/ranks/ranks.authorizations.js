import { PERMISSIONS } from "../../../Utils/Permissions/permissions.js";

export const auth = {
  createRank: [PERMISSIONS.RANK_CREATE],
  updateRank: [PERMISSIONS.RANK_UPDATE],
  deleteRank: [PERMISSIONS.RANK_DELETE],
  getRank: [PERMISSIONS.RANK_READ],
};