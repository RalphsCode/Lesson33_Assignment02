const express = require("express"); // Needed for Router
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Routes:

// Return All Invoices
router.get("/", async function (req, res, next) {
    try { 
        const results = await db.query( `SELECT * FROM invoices`); 
        return res.json({invoices : results.rows}); 
   } catch (err) { 
        return next(err); } });


// Return Specific Invoice
router.get("/:id", async function (req, res, next) {
    try { 
        const invoiceId = +req.params.id;
        const result = await db.query( 'SELECT inv.id, inv.amt, inv.paid, inv.add_date, inv.paid_date, co.code, co.name, co.description FROM invoices AS inv JOIN companies as co ON inv.comp_code = co.code WHERE inv.id = $1', [invoiceId]); 
        console.log('result', result);

        // If invoice id not found
        if (result.rows.length === 0) {
            return next(new ExpressError('Invoice not found', 404));
          }

        // Return
        return res.json({invoice : result.rows}); 
    } catch (err) { 
        return next(err); } });
   

module.exports = router;