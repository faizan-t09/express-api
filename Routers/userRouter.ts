import * as express from "express";
import {
  handleUserGetAll,
  handleUserDelete,
  handleUserGetById,
  handleUserInsert,
  handleUserReplace,
  handleUserUpdate,
} from "../Controllers/userController";

const userRouter = express.Router();

userRouter
  .route("/")
  .get(handleUserGetAll)
  .post(handleUserInsert);

userRouter
  .route("/:id")
  .get(handleUserGetById)
  .put(handleUserReplace)
  .patch(handleUserUpdate);

userRouter.patch("/delete/:id", handleUserDelete);

export default userRouter;
