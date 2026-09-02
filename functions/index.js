const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Egyszerű példa a Monday.com integrációra
exports.testMondayAPI = functions.https.onRequest(async (req, res) => {
    // A valós rendszerben itt környezeti változóból (env) fogjuk olvasni a tokent
    // pl. const token = process.env.MONDAY_API_TOKEN;
    const token = 'MONDAY_API_TOKEN_HELYE'; 
    
    // Alapértelmezett GraphQL lekérdezés a táblák listázására
    const query = `query { boards (limit: 5) { id name } }`;

    try {
        const response = await fetch("https://api.monday.com/v2", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ query: query })
        });
        
        const data = await response.json();
        res.status(200).json({
            message: "Sikeres csatlakozás a Monday.com-hoz!",
            data: data
        });
    } catch (error) {
        console.error("Monday.com API Hiba:", error);
        res.status(500).json({ error: "Sikertelen kapcsolódás" });
    }
});
