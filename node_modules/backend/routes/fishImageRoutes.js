const express = require('express');
const router = express.Router();
const { AthenaClient, StartQueryExecutionCommand, GetQueryExecutionCommand, GetQueryResultsCommand } = require("@aws-sdk/client-athena");

const athenaClient = new AthenaClient({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

router.get('/', async (req, res) => {
    const { species } = req.query;
    
    // Broad SQL query to ensure we get data even if WHERE clause is picky
    const sql = `SELECT * FROM fish_images_metadata LIMIT 100`;

    try {
        const startParams = {
            QueryString: sql,
            QueryExecutionContext: { Database: process.env.ATHENA_DATABASE || "fish_data_db" },
            ResultConfiguration: { OutputLocation: process.env.ATHENA_OUTPUT_S3 }
        };

        console.log(`Executing Athena Query: ${sql}`);
        const { QueryExecutionId } = await athenaClient.send(new StartQueryExecutionCommand(startParams));

        // Poll for completion
        let status = "QUEUED";
        while (status === "QUEUED" || status === "RUNNING") {
            const { QueryExecution } = await athenaClient.send(new GetQueryExecutionCommand({ QueryExecutionId }));
            status = QueryExecution.Status.State;
            if (status === "FAILED" || status === "CANCELLED") {
                throw new Error(`Athena query ${status}: ${QueryExecution.Status.StateChangeReason}`);
            }
            if (status !== "SUCCEEDED") await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Fetch results
        const results = await athenaClient.send(new GetQueryResultsCommand({ QueryExecutionId }));
        
        // Format results (case-insensitive column mapping + URL conversion)
        const columns = results.ResultSet.ResultSetMetadata.ColumnInfo.map(col => col.Name.toLowerCase());
        const rawData = results.ResultSet.Rows.slice(1).map(row => {
            const obj = {};
            row.Data.forEach((val, index) => {
                let value = val.VarCharValue;
                const colName = columns[index];
                
                // Fuzzy mapping for species
                if (colName.includes('species') || colName === 'col0') {
                    obj.species = value;
                }
                // Fuzzy mapping for image_url
                if (colName.includes('image') || colName === 'col1') {
                    // Convert s3://bucket/key to https://bucket.s3.region.amazonaws.com/key
                    if (value?.startsWith('s3://')) {
                        const parts = value.replace('s3://', '').split('/');
                        const bucket = parts.shift();
                        // Encode each part of the key to handle spaces correctly
                        const key = parts.map(p => encodeURIComponent(p)).join('/');
                        const region = process.env.AWS_REGION || 'eu-north-1';
                        value = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
                    }
                    obj.image_url = value;
                }
                
                // Keep original mapping too
                obj[colName] = value;
            });
            return obj;
        });

        console.log(`Fetched ${rawData.length} rows. Mapping complete. First row:`, rawData[0]);

        // Robust filtering in JavaScript to avoid Athena WHERE clause pickiness
        const filteredData = species 
            ? rawData.filter(item => item.species?.toLowerCase().includes(species.toLowerCase()))
            : rawData;

        console.log(`Fetched ${rawData.length} rows, returning ${filteredData.length} after filter.`);
        res.json(filteredData);
    } catch (error) {
        console.error("Fish Image Fetch Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
