const cds = require('@sap/cds');
const axios = require('axios');
var Ext_Process = require('./libs/External_Call');
module.exports = cds.service.impl(async function () {
    const bp = await cds.connect.to('config_products');
    const ap = await cds.connect.to('alerts');
    const cp_anal = await cds.connect.to('config_products_anal');
    const planner =  await cds.connect.to('planner');

    this.on('READ', 'getForecastSnapshotLag', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getLocation', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getAssemblySnapshotLag', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getDMDAnalytical', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getIBPCalenderWeek', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getAssemblyCompQty', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getAssemblyRequirements', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getfactorylocdesc', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getPlannerAlerts', async req => {
        return ap.run(req.query);
    });
    this.on('READ', 'getVariantHeader', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getVariant', async req => {
        return bp.run(req.query);
    });
    this.on('READ', 'getDemandAndForecast', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return cp_anal.run(req.query);

    });
    this.on('READ', 'getDMDForecast', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return cp_anal.run(req.query);
    });
    this.on('READ', 'getAssemblyData', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return planner.run(req.query);
    });
    this.on('READ', 'getRTRData', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return planner.run(req.query);
    });
    this.on('READ', 'getOptPrtData', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return planner.run(req.query);
    });
    this.on('READ', 'getPrdDmdData', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return planner.run(req.query);
    });
    this.on('READ', 'getPlannerLocProd', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return planner.run(req.query);
    });
    this.on('READ', 'getAssemblyDesc', async req => {
        req.query.SELECT.limit.rows.val = 50000
        return planner.run(req.query);
    });
    this.on('getAssemblyLag', async req => {
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `getAssemblyLag`
            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    });

    this.on('getAlertToken', async req => {
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let dominurl = ("https://" + await Ext_Process.GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
            let create_transactions = await axios.get(dominurl + "getAlertToken", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            return create_transactions.data.d.getAlertToken
        } catch (error) {
            console.log(error)
        }
    })
    this.on('createVariantPlanner', async req => {
        let { Flag, USER, VARDATA } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/planner/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUrl = baseUrl + `createVariantPlanner(Flag='${Flag}',USER='${USER}',VARDATA='${VARDATA}')`

            let create_transactions = await axios.get(configUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data.value;

        } catch (error) {
            console.log(error)
        }
    })
    this.on('updateVariantPlanner', async req => {
        let { VARDATA } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/planner/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `updateVariantPlanner(VARDATA='${VARDATA}')`
            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    })
    this.on('getcharAnalysis', async req => {
        let { FROM_DATE, TO_DATE } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `getcharAnalysis(FROM_DATE=${FROM_DATE},TO_DATE=${TO_DATE})`
            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    })
    this.on('getAssemblyLagfun', async req => {
        const { FACTORY_LOCATION, LOCATION, PRODUCT, START_MONTH, END_MONTH } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/planner/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `getAssemblyLagfun(FACTORY_LOCATION='${FACTORY_LOCATION}',LOCATION='${LOCATION}',PRODUCT='${PRODUCT}',START_MONTH='${START_MONTH}',END_MONTH='${END_MONTH}')`

            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    })
        this.on('getOptPercentLagFun', async req => {
        const { FACTORY_LOCATION, LOCATION, PRODUCT, START_MONTH, END_MONTH } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/planner/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `getOptPercentLagFun(FACTORY_LOCATION='${FACTORY_LOCATION}',LOCATION='${LOCATION}',PRODUCT='${PRODUCT}',START_MONTH='${START_MONTH}',END_MONTH='${END_MONTH}')`

            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    })
        this.on('getRestrictionLagFun', async req => {
        const { FACTORY_LOCATION, LOCATION, START_MONTH,END_MONTH } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/planner/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `getRestrictionLagFun(FACTORY_LOCATION='${FACTORY_LOCATION}',LOCATION='${LOCATION}',START_MONTH='${START_MONTH}',END_MONTH='${END_MONTH}')`

            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    })
        this.on('getPrdDmdLagFun', async req => {
        const { FACTORY_LOCATION, LOCATION, PRODUCT, START_MONTH,END_MONTH } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/planner/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `getPrdDmdLagFun(FACTORY_LOCATION='${FACTORY_LOCATION}',LOCATION='${LOCATION}',PRODUCT='${PRODUCT}',START_MONTH='${START_MONTH}',END_MONTH='${END_MONTH}')`

            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    })
        this.on('getStatForecast', async req => {
        const { FACTORY_LOCATION, LOCATION, PRODUCT, START_MONTH, END_MONTH } = req.data;
        try {
            let token = await Ext_Process.generateBearerToken(req);
            let baseUrl = ("https://" + await Ext_Process.GenerateUrl() + `/planner/`).replace('cap-servs-mt', 'vcplanner-mt');
            let configUpdateUrl = baseUrl + `getStatForecast(FACTORY_LOCATION='${FACTORY_LOCATION}',LOCATION='${LOCATION}',PRODUCT='${PRODUCT}',START_MONTH='${START_MONTH}',END_MONTH='${END_MONTH}')`

            let create_transactions = await axios.get(configUpdateUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            return create_transactions.data;

        } catch (error) {
            console.log(error)
        }
    })
});