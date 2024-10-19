const express = require("express");    // require express just to get router
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError");
const slugify = require('slugify');


// Return code & name for all companies
router.get("/", async function (req, res, next) {
    try { 
   const results = await db.query( 'SELECT code, name FROM companies'); 
   return res.json({companies: results.rows}); 
   } catch (err) { 
   return next(err); } });


// Return a specific company
router.get("/:code", async function (req, res, next) {
    try { 
        // Request the company info from the db
        const companyResult = await db.query( 'SELECT * FROM companies WHERE code = $1', [req.params.code]); 

        // If company code not found
        if (companyResult.rows.length === 0) {
            return next(new ExpressError('Company not found', 404));
            }

        // Request the invoice info from the db
        const invoiceResults = await db.query( 'SELECT * FROM invoices WHERE comp_code = $1', [req.params.code]); 

        // Request the industry info from the db
        const industryResults = await db.query(
            'SELECT industries.industry FROM companies JOIN company_industry ON companies.code = company_industry.company_code JOIN industries ON company_industry.industry_code = industries.code WHERE companies.code = $1', [req.params.code])
        
        // Put the company & invoice details in objects
        const company = companyResult.rows[0];
        const foundInvoices = invoiceResults.rows;
        const foundIndustries = industryResults.rows;

        // Nest the invoice data within an company object
        const companyData = {
        code: company.code,
        name: company.name,
        description: company.description,
        invoices: {foundInvoices},
        industries: {foundIndustries}
        }
          
        // Response
        return res.json({company: companyData}); 

    // Handle error gracefully
   } catch (err) { 
   return next(err); } 
});  // END get specific company route



// Add a company
router.post("/", async function (req, res, next) {
    try { 

    const newName = req.body.name;
    const newCode = slugify(newName, {remove: /[*+~.()'"!:@]/g, lower: true, strict: true});
    const newDesc = req.body.desc || 'none';

   const results = await db.query( 'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [newCode, newName, newDesc]); 
   return res.json({company: results.rows[0]}); 
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



// Delete a Company
router.delete("/:code", async function (req, res, next) {
    try { 
        const companyCode = req.params.code;
        const result = await db.query( 'DELETE FROM companies WHERE code = $1', [companyCode]);
        // If Company Code can't be located
        if (result.rowCount === 0){
            return next(new ExpressError('Unable to Delete; Company not found', 404));
          }
       
   // Return
   return res.json({status: "deleted"}); 
   } catch (err) { 
   return next(err); } });

module.exports = router; 