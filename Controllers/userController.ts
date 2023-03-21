import { Request, Response } from "express";
import connectionPool from "../db";
import getCurrentTimeStamp from "./timeStampHelper";

export const handleUserGetAll = (req: Request, res: Response) => {
  // res.json({ path: "/user GET", Body: req.body, Params: req.query });
  let getAllQuery = `select u.id ,u.username,r.name as role,u1.username as createdBy,u.createdAt,u2.username as updatedBy,u.updatedAt from user as u inner join  role as r on u.roleid = r.id inner join user as u1 on u.createdBy =u1.id inner join user as u2 on u.updatedBy = u2.id where u.deletedBy IS NULL`;

  if (req.query.sort) {
    getAllQuery += ` order by u.${req.query.sort}`;
    if (req.query.isDescending === "true") {
      getAllQuery += ` DESC`;
    }
  }

  if (req.query.limit) {
    getAllQuery += ` limit ${req.query.limit}`;
    if (req.query.page) {
      getAllQuery += ` offset ${
        Number(req.query.limit) * Number(req.query.page)
      } `;
    }
  }

  getAllQuery += `;`;

  connectionPool.query(getAllQuery, (error, results, fields) => {
    if (error) {
      res.status(422).json("Error in getting users : " + error.sqlMessage);
    } else if (results?.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(404).json("No users to fetch");
    }
  });
};

export const handleUserGetById = (req: Request, res: Response) => {
  // res.json({ path: "/user/getById GET", Body: req.body, Params: req.query });
  if (req.params.id) {
    connectionPool.query(
      `select u.id ,u.username,r.name as role,u1.username as createdBy,u.createdAt,u2.username as updatedBy,u.updatedAt from user as u inner join  role as r on u.roleid = r.id inner join user as u1 on u.createdBy =u1.id inner join user as u2 on u.updatedBy = u2.id where u.id = ${req.params.id} AND u.deletedBy IS NULL;`,
      (error, results, fields) => {
        if (error) {
          console.log(error);
          res.status(422).json(
            "Error in getting user for id = " +
              req.params.id +
              " : " +
              error.sqlMessage
          );
        } else if (results?.length > 0) {
          res.status(200).json(results[0]);
        } else {
          res.status(404).json("No user for id : " + req.params.id);
        }
      }
    );
  } else {
    res.status(400).json("No id provided");
  }
};

export const handleUserInsert = (req: Request, res: Response) => {
  // res.json({ path: "/user POST", Body: req.body, Params: req.query });
  if (
    req.body instanceof Array &&
    Object.keys(req.body[0]).toString() ==
      ["username", "password", "roleId", "createdBy", "updatedBy"].toString()
  ) {
    let timeStamp = '"' + getCurrentTimeStamp() + '"';

    let insertQuery = `insert into user (username, password, roleId, createdAt, createdBy, updatedAt, updatedBy) values `;

    insertQuery += `("${req.body[0].username}","${req.body[0].password}",${req.body[0].roleId},${timeStamp},${req.body[0].createdBy},${timeStamp},${req.body[0].updatedBy})`;

    for (let i = 1; i < req.body.length; i++) {
      insertQuery += `,("${req.body[i].username}","${req.body[i].password}",${req.body[i].roleId},${timeStamp},${req.body[i].createdBy},${timeStamp},${req.body[i].updatedBy})`;
    }

    insertQuery += ";";

    connectionPool.query(insertQuery, (error, results, fields) => {
      if (error) {
        res.status(422).json("Error in inserting : " + error.sqlMessage);
      } else {
        res.status(200).json("Users successfully inserted");
      }
    });
  } else {
    res.status(400).json({
      "Body format not correct it must be": {
        username: "string",
        password: "string",
        roleId: "Number",
        createdBy: "Number",
        updatedBy: "Number",
      },
    });
  }
};

export const handleUserReplace = (req: Request, res: Response) => {
  // res.json({ path: "/user PUT", Body: req.body, Params: req.query });
  if (req.params.id && req.params.id != "1") {
    if (
      Object.keys(req.body).toString() ==
      ["username", "password", "roleId", "createdBy", "updatedBy"].toString()
    ) {
      let timeStamp = '"' + getCurrentTimeStamp() + '"';

      let putQuery = `update user set `;

      for (const key in req.body) {
        if (isNaN(req.body[key])) putQuery += `${key} = "${req.body[key]}", `;
        else putQuery += `${key} = ${req.body[key]}, `;
      }

      putQuery += `updatedAt = ${timeStamp}, `;
      putQuery += `updatedBy = ${req.body["updatedBy"]} `;
      putQuery += `where id = ${req.params.id} AND deletedBy IS NULL;`;

      connectionPool.query(putQuery, (error, results, fields) => {
        if (error) {
          res.status(422).json("Error in updating : " + error.sqlMessage);
        } else {
          res.status(200).json("User successfully updated");
        }
      });
    } else {
      res.status(400).json("Body format not correct");
    }
  } else {
    res.status(400).json("No id provided");
  }
};

export const handleUserUpdate = (req: Request, res: Response) => {
  // res.json({ path: "/user PATCH", Body: req.body, Params: req.query });
  if (req.params.id && req.params.id != "1") {
    let timeStamp = '"' + getCurrentTimeStamp() + '"';

    let updateQuery = `update user set `;

    for (const key in req.body.updates) {
      if (isNaN(req.body.updates[key]))
        updateQuery += `${key} = "${req.body.updates[key]}", `;
      else updateQuery += `${key} = ${req.body.updates[key]}, `;
    }

    updateQuery += `updatedAt = ${timeStamp}, `;
    updateQuery += `updatedBy = 1 `;
    updateQuery += `where id = ${req.params.id} AND deletedBy IS NULL;`;

    connectionPool.query(updateQuery, (error, results, fields) => {
      if (error) {
        res.status(422).json("Error in updating : " + error.sqlMessage);
      } else {
        res.status(200).json("Record successfully updated");
      }
    });
  } else {
    res.status(400).json("No id provided");
  }
};

export const handleUserDelete = (req: Request, res: Response) => {
  // res.json({ path: "/user/delete PATCH", Body: req.body, Params: req.query });
  if (req.params.id && req.params.id != "1") {
    let timeStamp = '"' + getCurrentTimeStamp() + '"';

    connectionPool.query(
      `update user set deletedAt = ${timeStamp},deletedBy = 1 where id = ${req.params.id}`,
      (error, results, fields) => {
        if (error) {
          console.log(error);
          res.status(422).json(
            "Error in deleting user for id = " +
              req.params.id +
              " : " +
              error.sqlMessage
          );
        } else if (results.affectedRows > 0) {
          res.status(200).json("Deleted user successfully");
        } else {
          res.status(404);
          res.json("No user for id : " + req.params.id);
        }
      }
    );
  } else {
    res.status(400).json("No id provided");
  }
};
