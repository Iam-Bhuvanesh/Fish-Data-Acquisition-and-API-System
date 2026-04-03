const express = require('express');
const router = express.Router();
const { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } = require("@aws-sdk/client-athena");

const athenaClient = new AthenaClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const convertNLtoSQL = (nlQuery) => {
    const q = nlQuery.toLowerCase();
    const table = "environment";

    if (q.includes("nitrate")) {
        return `SELECT station, date, "nitrate(ppm)" as nitrate FROM ${table} ORDER BY date DESC LIMIT 20`;
    }
    if (q.includes("temp") || q.includes("temperature")) {
        return `SELECT station, date, temp FROM ${table} WHERE temp > 25 ORDER BY temp DESC LIMIT 15`;
    }
    if (q.includes("turbid") || q.includes("turbidity")) {
        return `SELECT station, date, turbidity FROM ${table} ORDER BY turbidity DESC LIMIT 10`;
    }
    if (q.includes("highest manganese")) {
        return `SELECT station, date, "manganese(mg/l)" as manganese FROM ${table} ORDER BY manganese DESC LIMIT 5`;
    }

    return `SELECT * FROM ${table} LIMIT 10`;
};

router.post('/', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // Pre-flight check for placeholder .env values
    if (!process.env.ATHENA_DATABASE || process.env.ATHENA_DATABASE.includes("your_database")) {
        return res.status(400).json({ 
            error: "Athena Configuration Incomplete", 
            message: "Please update your .env file with a valid ATHENA_DATABASE and ATHENA_OUTPUT_S3 bucket link." 
        });
    }

    const sql = convertNLtoSQL(query);

    try {
        const startParams = {
            QueryString: sql,
            QueryExecutionContext: { Database: process.env.ATHENA_DATABASE },
            ResultConfiguration: { OutputLocation: process.env.ATHENA_OUTPUT_S3 }
        };

        const { QueryExecutionId } = await athenaClient.send(new StartQueryExecutionCommand(startParams));

        // Polling logic
        let status = "QUEUED";
        while (status === "QUEUED" || status === "RUNNING") {
            const { QueryExecution } = await athenaClient.send(new GetQueryExecutionCommand({ QueryExecutionId }));
            status = QueryExecution.Status.State;
            if (status === "FAILED" || status === "CANCELLED") {
                throw new Error(`Athena query ${status}: ${QueryExecution.Status.StateChangeReason}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const results = await athenaClient.send(new GetQueryResultsCommand({ QueryExecutionId }));
        
        // Format Athena results (first row is header)
        const columns = results.ResultSet.ResultSetMetadata.ColumnInfo.map(col => col.Name);
        const data = results.ResultSet.Rows.slice(1).map(row => {
            const obj = {};
            row.Data.forEach((val, index) => {
                obj[columns[index]] = val.VarCharValue;
            });
            return obj;
        });

        res.json({ sql, data });
    } catch (error) {
        console.error("Athena Query Error:", error);
        res.status(500).json({ error: error.message, sql });
    }
});

module.exports = router;
