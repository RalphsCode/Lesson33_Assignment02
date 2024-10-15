const express = require("express");    // require express just to get router
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")


// Return code & name for all companies
router.get("/", async function (req, res, next) {
    try { 
   const results = await db.query( `SELECT code, name FROM companies`); 
   return res.json({companies: results.rows}); 
   } catch (err) { 
   return next(err); } });


// Return a specific company
router.get("/:code", async function (req, res, next) {
    try { 
   const results = await db.query( 'SELECT * FROM companies WHERE code = $1', [req.params.code]); 
    // Custom error if code not found
   if (results.rows.length === 0) {
    return next(new ExpressError('Company not found', 404));
  }
    // Response
   return res.json({company: results.rows}); 
   } catch (err) { 
   return next(err); } });


// Update a company
router.put("/:code", async function (req, res, next) {
    try { 
        const updateCode = req.params.code;
        const existingData = await db.query( 'SELECT name, description FROM companies WHERE code = $1', [updateCode]);
        // If Company Code can't be located
        if (existingData.rows.length === 0) {
            return next(new ExpressError('Unable to Update; Company not found', 404));
          }
        // If the Company Name is updated
        if (req.body.name) {
            db.query( 'UPDATE companies SET name = $1  WHERE code = $2', [req.body.name, updateCode])
        };
        // If the Company Description is updated
        if (req.body.description) {
            db.query( 'UPDATE companies SET description = $1 WHERE code = $2', [req.body.description, updateCode])
        };
        // Get the updated company from the database
        const updatedCompany = await db.query(
            'SELECT * FROM companies WHERE code = $1',
            [updateCode]
          );
    // Return
   return res.json({company: updatedCompany.rows[0]}); 
   } catch (err) { 
   return next(err); } });


// Add a company
router.post("/", async function (req, res, next) {
    try { 

    const newCode = req.body.code;
    const newName = req.body.name;
    const newDesc = req.body.desc || 'none';

   const results = await db.query( 'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [newCode, newName, newDesc]); 
   return res.json({company: results.rows[0]}); 
   } catch (err) { 
   return next(err); } });

module.exports = router; 