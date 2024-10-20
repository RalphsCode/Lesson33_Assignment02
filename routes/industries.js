const express = require("express");    // require express just to get router
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError");
const { name } = require("../app");


// Return details for all industries and related companies
router.get("/", async function (req, res, next) {
    try { 
        // Get all industry codes
        const industryResults = await db.query( 'SELECT * from industries');

        // Object to store Industries
        const industries = {};

        // Loop over each industry and store its details
        for (ind of industryResults.rows) {
            // Define a key for the dictionary entry
            const key = ind.code;
            // Get the company code(s) for companies in the looped industry
            const comps = await db.query( 'SELECT c.code FROM company_industry AS c_i LEFT JOIN industries AS i ON i.code = c_i.industry_code LEFT JOIN companies AS c ON c.code = c_i.company_code WHERE i.code = $1', [ind.code]);
            // Add the found companies to an array
            let companyResults = [];
            if (comps.rows.length !== 0){                
                for (c in comps.rows) {
                    companyResults.push(comps.rows[c].code);
                }  // END for
            }  // END if

            // Add the industry info to the industries object
            industries[key] = {"code": ind.code, "name": ind.industry, "companies": companyResults};

        }  // END for loop

        // Return the Industries Object
        return res.json({industries}); 
   
    } catch (err) { 
    return next(err); } });
//  END Return all Industries Route


module.exports = router; 
