const express = require("express");    // require express just to get router
const router = new express.Router();
const db = require("../db")

router.get("/companies", async function (req, res, next) {
    try { 
   const results = await db.query( `SELECT * FROM companies`); 
   return res.json(results.rows); 
   } catch (err) { 
   return next(err); } });
   
module.exports = router; 