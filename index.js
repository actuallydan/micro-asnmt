// const express = require("express");
// Imports the Google Cloud client library
const BigQuery = require("@google-cloud/bigquery");
const axios = require("axios");

/* Get some configuration details */
const config = require("./config");

/* Creates a Google BigQuery client */
const bigquery = new BigQuery({
    projectId: config.projectId,
    keyFilename: "./keys.json"
});

/* 
    Immediately-invoked function expression (IIFE)
    Useful for running async functions without having to create extranneous wrapper functions
*/
(async function() {
    const { datasetName, tableName, schema } = config;

    /* make sure dataset exists */
    const dsExists = await bigquery.dataset(datasetName).exists();

    /* When using promises instead of callbacks, gcloud functions return the response value as the first index in an array */
    if (!dsExists[0]) {
        await bigquery.createDataset(datasetName);
    }
    /* Make sure table exists */
    const tbExists = await bigquery
        .dataset(datasetName)
        .table(tableName)
        .exists();
    if (!tbExists[0]) {
        bigquery.dataset(datasetName).createTable(tableName, { schema });
    }
    console.log("Done checking dataset and table");

    /*
     Periodically get parking availability from laguardia airport website (every 30-minutes).
     This should probably be more robust, using a cron package but this should be sufficient.
     */
    updateAvailability();

    setInterval(function() {
        updateAvailability();
    }, 10 * 1000);
})();

async function updateAvailability() {
    const { datasetName, tableName } = config;
    console.log("Starting run");

    try {
        /* scrape XHR data from website and parse into BigQuery readable object */
        const xhrData = await getAvailability();
        const row = parseXHR(xhrData);
        /* Get table */
        const dataset = bigquery.dataset(datasetName);
        const table = dataset.table(tableName);

        /* Insert the data into Google BigQuery */
        const res = await insertData(row, table);
        console.log("Ending run");
    } catch (err) {
        console.error(new Error(err));
    }
}

/* Programmatically invokes Google App Script to get the parking availability information from https://laguardiaairport.com/
    Returns an object */

function getAvailability() {
    return new Promise((resolve, reject) => {
        axios
            .get(
                "https://avi-prod-mpp-webapp-api.azurewebsites.net/api/v1/parking/LGA"
            )
            .then(response => {
                if (response.status !== 200) {
                    reject(err);
                }
                /* return the html from the page */
                resolve(response.data);
            });
    });
}

/*
 Process XHR API endpoint and get out required values 
 Accepts an Array of objects from laguardia's availability API that looks like 
 [{
    parkingLot: "...",
    percentageOccupied: "..."
 }]
 Returns an BigQuery insertable object

 The XHR response always returns the availabilities with in the following index order: 1,3,0 (corresponding to lots a, b, and c/d)
*/
function parseXHR(xhr) {
    const keys = ["terminalA", "terminalB", "terminalCD"];

    /* Initialize this row of parking data */
    const id = new Date().getTime();
    let parsedData = {
        insertId: id,
        json: {
            id,
            timestamp: new Date().toJSON(),
            terminalA: parseFloat(xhr[1].percentageOccupied) / 100,
            terminalB: parseFloat(xhr[3].percentageOccupied) / 100,
            terminalCD: parseFloat(xhr[0].percentageOccupied) / 100
        }
    };

    return parsedData;
}
/*
 Abstracted insert logic 
 Takes as parameters an Object or Array of Objects to be inserted into Google BigQuery, and the table it get inserted into.
 Returns a Promise.
 */
function insertData(row, table) {
    return new Promise(function(resolve, reject) {
        table.insert(row, { raw: true }, (err, response) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(response);
        });
    });
}
