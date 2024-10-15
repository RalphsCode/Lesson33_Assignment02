const express = require("express"); // Needed for Router
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Routes:
router.get("/", async function (req, res, next) {
    try { 
        const results = await db.query( `SELECT * FROM invoices`); 
        return res.json(results.rows); 
   } catch (err) { 
        return next(err); } });
   

module.exports = router;