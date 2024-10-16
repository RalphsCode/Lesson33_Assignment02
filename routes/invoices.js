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
        const invoice = result.rows[0];

        // Nest the company data within the invoice object
        const invoiceData = {
          id: invoice.id,
          amt: invoice.amt,
          paid: invoice.paid,
          add_date: invoice.add_date,
          paid_date: invoice.paid_date,
          company: {
            code: invoice.code,
            name: invoice.name,
            description: invoice.description
          }
        };
        
        return res.json({ invoice: invoiceData });
                
    } catch (err) { 
                return next(err); } });
   


// Add a new Invoice
router.post("/", async function (req, res, next) {
    try { 

        const postInvoice = await db.query( 'INSERT INTO invoices (comp_code, amt ) VALUES ($1, $2) RETURNING id', [req.body.comp_code, req.body.amt] ); 

        const newInvoiceId = postInvoice.rows[0].id;

        // Select the new invoice using the id
        const newInvoice = await db.query('SELECT * FROM invoices WHERE id = $1', [newInvoiceId]);

        console.log('newInvoice:', newInvoice.rows[0].id);
         
        return res.json({invoice: newInvoice.rows[0]} ); 
   } catch (err) { 
        return next(err); } });                



module.exports = router;