// Database option for testing
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("./app");
const db = require("./db");

afterAll(async function() {
    // close db connection
    await db.end();
  });

/** GET /invoices - returns `{invoices: [id, ...]}` */

describe("GET /invoices/1", function() {
    test("Gets first invoice", async function() {
      const response = await request(app).get(`/invoices/1`);

      expect(response.statusCode).toEqual(200);
      
      expect(response.body).toEqual({
        "invoice": {
            "id": 1,
            "amt": 100,
            "paid": false,
            "add_date": expect.any(String),
            "paid_date": null,
            "company": {
                "code": "apple",
                "name": "Apple Computer",
                "description": "Maker of OSX."
            }
        }
    });
    });  // END Test
  
  test("Responds with 404 if can't find invoice", async function() {
    const response = await request(app).get(`/invoices/0`);
    expect(response.statusCode).toEqual(404);
  });  // END Test

});  // END Describe



/** GET /companies - returns `company` */

describe("GET /companies/apple", function() {
    test("Gets Apple Company", async function() {
      const response = await request(app).get(`/companies/apple`);
      expect(response.statusCode).toEqual(200);

      expect(response.body).toHaveProperty('company'); }
      );  // END Test
  
  test("Responds with 404 if can't find company", async function() {
    const response = await request(app).get(`/companies/test`);

    expect(response.statusCode).toEqual(404);
  });  // END Test

});  // END Describe