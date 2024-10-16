const express = require("express"); // Needed for Router
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

// Routes:

// Return All Invoices
router.get("/", async function (req, res, next) {
    try { 
        // Obtain all invoices from the database
        const results = await db.query( `SELECT * FROM invoices`); 
        // Return all the invoices
        return res.json({invoices : results.rows}); 

   // Handle errors gracefully     
   } catch (err) { 
        return next(err); } 
});  // END get route


// Return a Specific Invoice
router.get("/:id", async function (req, res, next) {
    try { 
        // Get the invoice id
        const invoiceId = +req.params.id;
        // Pull the invoice details from the db
        const result = await db.query( 'SELECT inv.id, inv.amt, inv.paid, inv.add_date, inv.paid_date, co.code, co.name, co.description FROM invoices AS inv JOIN companies as co ON inv.comp_code = co.code WHERE inv.id = $1', [invoiceId]); 

        // If invoice id not found
        if (result.rows.length === 0) {
            return next(new ExpressError('Invoice not found', 404));
          }

        // Collect the invoice details
        const invoice = result.rows[0];

        // Nest the company data within an invoice object
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
        
        // Return the formatted invoice data
        return res.json({ invoice: invoiceData });
    
    // Handle errors gracefully  
    } catch (err) { 
                return next(err); } 
});  // END get specific invoice route
   


// Add a new Invoice
router.post("/", async function (req, res, next) {
    try { 
        // Insert an Invoice using only comp_code and invoice amt
        const postInvoice = await db.query( 'INSERT INTO invoices (comp_code, amt ) VALUES ($1, $2) RETURNING id', [req.body.comp_code, req.body.amt] ); 
        // Get the id of the new invoice
        const newInvoiceId = postInvoice.rows[0].id;

        // Select the new invoice from the db
        const newInvoice = await db.query('SELECT * FROM invoices WHERE id = $1', [newInvoiceId]);
         
        // Return the new invoice
        return res.json({invoice: newInvoice.rows[0]} ); 

    // Handle errors gracefully
   } catch (err) { 
        return next(err); } 
}); // END post route



// Update An Invoice - Should really be a PATCH not a PUT route
router.put("/", async function (req, res, next) {
    try { 
        // Select the new invoice using the id
        const findInvoice = await db.query('SELECT * FROM invoices WHERE amt = $1', [req.body.amt]);

        // If invoice amt not found
        if (findInvoice.rows.length === 0) {
            return next(new ExpressError('Invoice Amount not found', 404));
          }
        
        // Assign the invoice ID for the invoice to update
        const updateInvoiceID = findInvoice.rows[0].id ; 
        
        // Define the values for the updated invoice
        const updatedCompCode = req.body.comp_code || findInvoice.rows[0].comp_code;
        const updatedPaid = req.body.paid || findInvoice.rows[0].paid;
        const updatedAddDate = req.body.add_date || findInvoice.rows[0].add_date;
        const updatedPaidDate = req.body.paid_date || findInvoice.rows[0].paid_date;

        // Update the invoice in the db
        const updatedInvoice = await db.query('UPDATE invoices SET comp_code = $1, paid = $2, add_date = $3, paid_date = $4 WHERE id = $5', [updatedCompCode, updatedPaid, updatedAddDate, updatedPaidDate, updateInvoiceID]);
         
        // Select the updated invoice
        const newInvoice = await db.query('SELECT * FROM invoices WHERE id = $1', [updateInvoiceID]);
    
        // Return the updated invoice
        return res.json({invoice: newInvoice.rows[0]} ); 

   // Gracefully handle any errors     
   } catch (err) { 
        return next(err); } 
    });  // END put route
        
        
// Delete a Specific Invoice
router.delete("/:id", async function (req, res, next) {
    try { 
        // Get the invoice id
        const invoiceId = +req.params.id;
        // Select the updated invoice
        const delInvoice = await db.query('SELECT * FROM invoices WHERE id = $1', [invoiceId]);

        // If invoice id not found
        if (delInvoice.rows.length === 0) {
            return next(new ExpressError('Invoice id not found', 404));
          }

        // Delete the invoice from the db
        const deleteInvoice = await db.query('DELETE FROM invoices WHERE id = $1', [delInvoice.rows[0].id]);

        // Return deleted msg
        return res.json({status: "deleted"});

    // Handle error gracefully    
    } catch (err) {
        return next(err); }
});  // END delete route


module.exports = router;