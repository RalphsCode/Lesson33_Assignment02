const express = require("express");    // require express just to get router
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError");
const { name } = require("../app");


// Return industry & Companies
router.get("/", async function (req, res, next) {
    try { 
        // Get all industry codes
        const industryResults = await db.query( 'SELECT code from industries');
        // Create a list of industry codes
        const industryList = [];
        for (x of industryResults.rows) {
            industryList.push(x.code);
        }
        console.log(industryList);

        // // Get the companies in an industry
        const companyResults = []
        for (indCode of industryList) {
            const results = await db.query( 'SELECT c.name FROM industries AS i LEFT JOIN company_industry AS c_i ON i.code = c_i.industry_code LEFT JOIN companies AS c ON c.code = c_i.company_code WHERE i.code = $1', [indCode]);

            companyResults.push(results.rows);
        }  // END for loop...
        
        return res.json({industries: industryResults.rows, companies: companyResults}); 
   
   } catch (err) { 
   return next(err); } });


   module.exports = router; 

   /*

   ;

   */