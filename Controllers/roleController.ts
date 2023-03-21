import { Request, Response } from "express";
import connectionPool from "../db";
import getCurrentTimeStamp from "./timeStampHelper";

export const handleRoleGetAll = (req: Request, res: Response) => {
  // res.json({ path: "/role GET", Body: req.body, Params: req.query });
  let getAllQuery = `select r.id,name,u.username as createdBy,r.createdAt,k.username as updatedBy,r.updatedAt from role as r inner join user as u on r.createdBy = u.id inner join user as k on r.updatedBy = k.id where r.deletedBy IS NULL`;

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
      res.status(422);
      res.json("Error in getting roles : " + error.sqlMessage);
    } else if (results?.length > 0) {
      res.status(200);
      res.json(results);
    } else {
      res.status(404);
      res.json("No roles to fetch");
    }
  });
};

export const handleRoleGetById = (req: Request, res: Response) => {
  // res.json({ path: "/role/getById GET", Body: req.body, Params: req.query });
  if (req.params.id) {
    connectionPool.query(
      `select r.id,name,u.username as createdBy,r.createdAt,k.username as updatedBy,r.updatedAt from role as r inner join user as u on r.createdBy = u.id inner join user as k on r.updatedBy = k.id where r.id = ${req.params.id} AND r.deletedBy IS NULL;`,
      (error, results, fields) => {
        if (error) {
          console.log(error);
          res.status(422);
          res.json(
            "Error in getting role for id = " +
              req.params.id +
              " : " +
              error.sqlMessage
          );
        } else if (results?.length > 0) {
          res.status(200);
          res.json(results[0]);
        } else {
          res.status(404);
          res.json("No role for id : " + req.params.id);
        }
      }
    );
  } else {
    res.status(400);
    res.json("No id provided");
  }
};

export const handleRoleInsert = (req: Request, res: Response) => {
  // res.json({ path: "/role POST", Body: req.body, Params: req.query });
  if (
    req.body instanceof Array &&
    Object.keys(req.body[0]).toString() ==
      ["name", "createdBy", "updatedBy"].toString()
  ) {
    let timeStamp = '"' + getCurrentTimeStamp() + '"';

    let insertQuery = `insert into role (name, createdAt, createdBy, updatedAt, updatedBy) values `;

    insertQuery += `("${req.body[0].name}",${timeStamp},${req.body[0].createdBy},${timeStamp},${req.body[0].updatedBy})`;

    for (let i = 1; i < req.body.length; i++) {
      insertQuery += `,("${req.body[i].name}",${timeStamp},${req.body[i].createdBy},${timeStamp},${req.body[i].updatedBy})`;
    }

    insertQuery += ";";

    connectionPool.query(insertQuery, (error, results, fields) => {
      if (error) {
        res.status(422);
        res.json("Error in inserting : " + error.sqlMessage);
      } else {
        res.status(200);
        res.json("Roles successfully inserted");
      }
    });
  } else {
    res.status(400);
    res.json("Body format not correct");
  }
};

export const handleRoleReplace = (req: Request, res: Response) => {
  // res.json({ path: "/role PUT", Body: req.body, Params: req.query });
  if (req.params.id && req.params.id != "1") {
    if (
      Object.keys(req.body).toString() ==
      ["name", "createdBy", "updatedBy"].toString()
    ) {
      let timeStamp = '"' + getCurrentTimeStamp() + '"';

      let putQuery = `update role set `;

      for (const key in req.body) {
        if (isNaN(req.body[key])) putQuery += `${key} = "${req.body[key]}", `;
        else putQuery += `${key} = ${req.body[key]}, `;
      }

      putQuery += `updatedAt = ${timeStamp}, `;
      putQuery += `updatedBy = ${req.body["updatedBy"]} `;
      putQuery += `where id = ${req.params.id} AND deletedBy IS NULL;`;

      connectionPool.query(putQuery, (error, results, fields) => {
        if (error) {
          res.status(422);
          res.json("Error in updating : " + error.sqlMessage);
        } else {
          res.status(200);
          res.json("Role successfully updated");
        }
      });
    } else {
      res.status(400);
      res.json("Body format not correct");
    }
  } else {
    res.status(400);
    res.json("No id provided");
  }
};

export const handleRoleUpdate = (req: Request, res: Response) => {
  // res.json({ path: "/role PATCH", Body: req.body, Params: req.query });
  if (req.params.id && req.params.id != "1") {
    let timeStamp = '"' + getCurrentTimeStamp() + '"';

    let updateQuery = `update role set `;

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
        res.status(422);
        res.json("Error in updating : " + error.sqlMessage);
      } else {
        res.status(200);
        res.json("Record successfully updated");
      }
    });
  } else {
    res.status(400);
    res.json("No id provided");
  }
};

export const handleRoleDelete = (req: Request, res: Response) => {
  // res.json({ path: "/role/delete PATCH", Body: req.body, Params: req.query });
  if (req.params.id && req.params.id != "1") {
    let timeStamp = '"' + getCurrentTimeStamp() + '"';

    connectionPool.query(
      `update role set deletedAt = ${timeStamp},deletedBy = 1 where id = ${req.params.id}`,
      (error, results, fields) => {
        if (error) {
          console.log(error);
          res.status(422);
          res.json(
            "Error in deleting role for id = " +
              req.params.id +
              " : " +
              error.sqlMessage
          );
        } else if (results.affectedRows > 0) {
          res.status(200);
          res.json("Deleted role successfully");
        } else {
          res.status(404);
          res.json("No role for id : " + req.params.id);
        }
      }
    );
  } else {
    res.status(400);
    res.json("No id provided");
  }
};
