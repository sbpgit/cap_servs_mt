const cds = require("@sap/cds");
const xsenv = require('@sap/xsenv');
const axios = require('axios');
const vcap_app = process.env.VCAP_APPLICATION;
const bodyParser = require('body-parser')
const cov2ap = require("@sap/cds-odata-v2-adapter-proxy");
const registerUpsert  = require('../srv/libs/upsert')
cds.on("bootstrap", (app) => {
    app.use(cov2ap());

    app.use(async (req, res, next) => {
        try {
            if (req.url == '/') {
                next()
            }
            const authHeader = req.headers?.authorization;
            if (authHeader?.startsWith("Basic ")) {
                const base64Credentials = authHeader.split(" ")[1];
                const decodedCredentials = Buffer.from(base64Credentials, "base64").toString("utf8");
                const [username, password] = decodedCredentials.split(":");

                if (username == 'vcpsteelcase' && password == 'sbpcorp') {
                    await authenticate(req, next)
                } else {
                    let obj = {
                        status: 401,
                        Error: "Unauthorized: Please Check the Username and Password"
                    }

                    res.status(401).send(obj);
                }
            }
            else {
                next()
            }

        } catch (error) {
            console.log(error)
            next()
        }
    })
    app.use(bodyParser.json({ limit: '10mb' }))
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
});
cds.on('served', async () => {
  // Catches UPSERTs called directly against the DB layer
  if (cds.db) {
    registerUpsert(cds.db)
  }
})

async function authenticate(req, next) {

    const xsuaaService = xsenv.getServices({
        uaa: {
            name: 'cap_servs_mt-auth' // Replace with the exact name of the desired service instance
        }
    });
    const clientId = xsuaaService.uaa.clientid;
    const clientSecret = xsuaaService.uaa.clientsecret;
    const tokenUrl = xsuaaService.uaa.url + '/oauth/token';

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    await axios.post(tokenUrl, params)
        .then(response => {
            const accessToken = response.data.access_token;

            req.headers.authorization = "Bearer " +
                accessToken;
            next();
        }).catch(error => {
            console.log("Error obtaining access token:", error);
            next();
        });

}
// Start CDS server
module.exports = cds.server;