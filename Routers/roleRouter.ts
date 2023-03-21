import * as express from "express";
import {
  handleRoleGetAll,
  handleRoleDelete,
  handleRoleGetById,
  handleRoleInsert,
  handleRoleReplace,
  handleRoleUpdate,
} from "../Controllers/roleController";

const roleRouter = express.Router();

roleRouter
  .route("/")
  .get(handleRoleGetAll)
  .post(handleRoleInsert);

roleRouter
  .route("/:id")
  .get(handleRoleGetById)
  .put(handleRoleReplace)
  .patch(handleRoleUpdate);

roleRouter.patch("/delete/:id", handleRoleDelete);

export default roleRouter;
