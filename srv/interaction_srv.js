var cds = require('@sap/cds');
const axios = require('axios');
const vcap_app = process.env.VCAP_APPLICATION;
const { v4: uuidv4 } = require('uuid'); // Import UUID module
var Ext_Process = require('./libs/External_Call');
const { INSERT, UPSERT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = async srv => {
    // location interface
    srv.on(['CREATE'], 'LOCATION_STB', async (req, res) => {
        let getInterfaces = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        let ResultInterface = getInterfaces.filter(i => i.SERVICE_NAME == 'LOCATION_INTERFACE' && i.PARAMETER_NAME == 'CREATE')
        let { VALUE_ID } = ResultInterface[0];
        req['INTERFACE_TYPE'] = VALUE_ID;
        req['TARGETENTITY'] = 'getLocation';
        req['INTERFACE'] = 'LOCATION_INTERFACE';
        try {

            if (VALUE_ID == 'N') {
                const ReturnResponse = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                req.reply(ReturnResponse)
            }
            else {
                let get_result = await Ext_Process.onInsertLocation(req, res)

                if (get_result.STATUS_CODE == 200) {
                    const SReturnResponse = {
                        "type": "Success",
                        "description": "Location is Inserted",
                        "statusCode": 200
                    }
                    req.reply(SReturnResponse)
                }
                else {
                    const EReturnResponse = {
                        Type: "Error",
                        Description: "Location is Not Inserted",
                        MissingFields: get_result.MissingFields,
                        statusCode: 400
                    }
                    req.reply(EReturnResponse)
                }
            }
        } catch (error) {
            console.log(error)
        }
    })
    //customer_interface_call
    srv.on(['CREATE'], 'customer_group', async (req, res) => {
        let getInterfaces = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        let ResultInterface = getInterfaces.filter(i => i.SERVICE_NAME == 'CUSTOMER_INTERFACE' && i.PARAMETER_NAME == 'CREATE')
        let { VALUE_ID } = ResultInterface[0];
        req['INTERFACE_TYPE'] = VALUE_ID;
        req['TARGETENTITY'] = 'getCustgroup';
        req['INTERFACE'] = 'CUSTOMER_INTERFACE';
        try {
            if (VALUE_ID == 'N') {
                const ReturnResponse = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                req.reply(ReturnResponse)
            }
            else {
                let get_result = await Ext_Process.onInsertCustomer(req, res)

                if (get_result.STATUS_CODE == 200) {
                    const SReturnResponse = {
                        "type": "Success",
                        "description": "Customer Group is Inserted",
                        "statusCode": 200
                    }
                    req.reply(SReturnResponse)
                }
                else {
                    const EReturnResponse = {
                        Type: "Error",
                        Description: "Customer Group is Not Inserted",
                        MissingFields: get_result.MissingFields,
                        statusCode: 400
                    }
                    req.reply(EReturnResponse)
                }
            }

        } catch (error) {
            console.log(error)
        }
    });
    srv.on('insertSalesOrder', async (req) => {

        var curent_time = await Ext_Process.CURRENT_TIME()

        try {
            // retrive interfaces from the view to 
            var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))

            var total = data.filter(i => {
                return i.SERVICE_NAME == 'SALES ORDER INTERFACE' && i.PARAMETER_NAME == 'CREATE'
            })
            var intf_payload = {
                INTERAFACE_NAME: 'SALES ORDER INTERFACE',
                INTERFACE_TYPE: total[0].VALUE_ID,
                CREATED_DATE: (new Date()).toISOString().split('T')[0],
                CREATED_TIME: curent_time
            }
            var SalesOrderVaildation = await Ext_Process.SALES_EXT_V(req.data.SALESORDER);

            if (total[0].VALUE_ID == 'N') {
                var obj = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                intf_payload['LOGID'] = uuidv4();
                intf_payload['MESSAGE'] = "The requested resource could not be found or is not accessible";
                intf_payload['STATUS_TYPE'] = "Error";
                intf_payload['STATUS_CODE'] = 403;
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

                req.reply(obj)
            }
            if (total[0].VALUE_ID == 'AU') {
                let AllTheRespons = [];
                for (let index = 0; index < SalesOrderVaildation.length; index++) {
                    const element = SalesOrderVaildation[index];

                    if (element.statusCode == 400 || (req.data.SALESORDER)[0].ITEMS.length == 0) {
                        let SalesInfo = JSON.stringify({
                            SALESDOC: element.SalesDoc,
                            SALES_DOCUMENT_ITEM: element.SALESDOC_ITEM
                        })

                        intf_payload['MESSAGE'] = ((req.data.SALESORDER)[0].ITEMS.length == 0) ? 'NO Config Data' : SalesInfo;
                        intf_payload['LOGID'] = uuidv4();
                        intf_payload['STATUS_TYPE'] = "Bad Request";
                        intf_payload['STATUS_CODE'] = 400;
                        await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
                        AllTheRespons.push({
                            SALESDOC: element.SalesDoc,
                            SALES_DOCUMENT_ITEM: element.SALESDOC_ITEM,
                            statusCode: 400,
                            MESSAGE: `Sales Order  Not Inserted Missing Fields ${JSON.stringify(element.SaleshMissingFields)} ${SalesConfigExistence}`
                        })
                    }
                    else {
                        let payload_record = JSON.stringify({
                            aSalesH: element.SALESH,
                            aSalesHConfig: element.SALESCONFIG
                        })

                        const token = await Ext_Process.generateBearerToken(req);
                        const dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                        const response = await axios.post(
                            dominurl + "salesDeltaProcess",
                            { SALESDATA: payload_record },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        if (response.data?.d?.salesDeltaProcess === 'SUCCESS') {
                            intf_payload['LOGID'] = uuidv4();
                            intf_payload['MESSAGE'] = JSON.stringify({
                                SALESDOC: element.SALESH[0].SALES_DOCUMENT,
                                SALES_DOCUMENT_ITEM: element.SALESH[0].SALES_DOCUMENT_ITEM,
                                SalesConfiglength: element.SALESCONFIG.length
                            })
                            intf_payload['STATUS_TYPE'] = "Success";
                            intf_payload['PAYLOAD'] = JSON.stringify(req.data.SALESORDER);
                            intf_payload['STATUS_CODE'] = 200;
                            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
                            AllTheRespons.push({
                                SALESDOC: element.SALESH[0].SALES_DOCUMENT,
                                SALES_DOCUMENT_ITEM: element.SALESH[0].SALES_DOCUMENT_ITEM,
                                statusCode: 200,
                                MESSAGE: "Sales Order Inserted"
                            })

                        }
                        else {
                            intf_payload['LOGID'] = uuidv4();
                            intf_payload['MESSAGE'] = JSON.stringify({
                                SALES_DOCUMENT: element.SALESH[0].SALES_DOCUMENT,
                                SALES_DOCUMENT_ITEM: element.SALESH[0].SALES_DOCUMENT_ITEM
                            })
                            intf_payload['PAYLOAD'] = JSON.stringify(req.data.SALESORDER);
                            intf_payload['STATUS_TYPE'] = "Error";
                            intf_payload['STATUS_CODE'] = 404;
                            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
                            return {
                                MESSAGE: {
                                    "description": "Sales Order Not Inserted",
                                    "statusCode": 404
                                }
                            }
                        }
                    }

                }
                return {
                    MESSAGE: {
                        statusCodeHeader: ((AllTheRespons.filter(i => i.statusCode == 400)).length > 0) ? 400 : 200,
                        salesResponse: AllTheRespons
                    }
                }
            }
            if (total[0].VALUE_ID == 'M') {
                let AllTheResponses = [];
                for (let index = 0; index < SalesOrderVaildation.length; index++) {
                    const SOV = SalesOrderVaildation[index];
                    if (SOV.statusCode == 400) {
                        intf_payload['MESSAGE'] = JSON.stringify({
                            SALESDOC: SOV.SalesDoc,
                            SALES_DOCUMENT_ITEM: SOV.SALESDOC_ITEM,
                            SalesConfiglength: req.data.SALESORDER[index].ITEMS.length
                        })
                        intf_payload['LOGID'] = uuidv4();
                        intf_payload['INTERFACE_TYPE'] = total[0].VALUE_ID;
                        intf_payload['STATUS_TYPE'] = "Bad Request";
                        intf_payload['STATUS_CODE'] = 400;
                        await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
                        let SalesConfigExistence = (SOV.SaleshConfigMissingFields[0] == 'Missing Config') ? 'No Sales Config' : '';
                        AllTheResponses.push({
                            SALESDOC: SOV.SalesDoc,
                            SALES_DOCUMENT_ITEM: SOV.SALESDOC_ITEM,
                            statusCode: 400,
                            MESSAGE: `Sales Order  Not Inserted Missing Fields ${JSON.stringify(SOV.SaleshMissingFields)} ${SalesConfigExistence}`
                        })

                    } else {
                        (SOV.SALESH.length > 0) ? await cds.run(UPSERT.into('APP_DB_SALESH_STB').entries(SOV.SALESH)) : "";
                        (SOV.SALESCONFIG.length > 0) ? await cds.run(UPSERT.into('APP_DB_SALESH_CONFIG_STB').entries(SOV.SALESCONFIG)) : "";

                        intf_payload['MESSAGE'] = JSON.stringify({
                            SALESDOC: SOV.SALESH[0].SALES_DOCUMENT,
                            SALES_DOCUMENT_ITEM: SOV.SALESH[0].SALES_DOCUMENT_ITEM,
                            SalesConfiglength: req.data.SALESORDER[index].ITEMS.length
                        })
                        intf_payload['LOGID'] = uuidv4();
                        intf_payload['INTERFACE_TYPE'] = total[0].VALUE_ID;
                        intf_payload['STATUS_TYPE'] = "Success";
                        intf_payload['STATUS_CODE'] = 201;
                        await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
                        AllTheResponses.push({
                            SALESDOC: SOV.SALESH[0].SALES_DOCUMENT,
                            SALES_DOCUMENT_ITEM: SOV.SALESH[0].SALES_DOCUMENT_ITEM,
                            statusCode: 200,
                            MESSAGE: "Sales Order Inserted"
                        })
                    }
                }
                return {
                    MESSAGE: {
                        statusCodeHeader: ((AllTheResponses.filter(i => i.statusCode == 400)).length > 0) ? 400 : 200,
                        salesResponse: AllTheResponses
                    }
                }
            }

        } catch (error) {
            intf_payload['LOGID'] = uuidv4();
            intf_payload['MESSAGE'] = JSON.stringify({
                Error: error.message,
                SALESDOC: SalesOrderVaildation[0].SALESH[0].SALES_DOCUMENT,
                SALES_DOCUMENT_ITEM: SalesOrderVaildation[0].SALESH[0].SALES_DOCUMENT_ITEM
            })
            intf_payload['STATUS_TYPE'] = "Error";
            intf_payload['STATUS_CODE'] = 400;
            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            return {
                MESSAGE: error.message
            }
        }
    })
    srv.on('insertClassCharac', async (req, res) => {
        var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        var total = data.filter(i => {
            return i.SERVICE_NAME == 'PRODUCT INTERFACE' && i.PARAMETER_NAME == 'CREATE'
        })
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'PRODUCT INTERFACE',
            INTERFACE_TYPE: total[0].VALUE_ID,
            PAYLOAD: JSON.stringify(req.data.CLASS),
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        let classVaildation = await Ext_Process.CLASS_CHAR(req)

        const { CLASS, CLASS_CHAR, CHAR_VALUES } = classVaildation.filter(item => item.STATUS_CODE === 200).reduce((acc, item) => {
            acc.CLASS.push(...(item.CLASS ?? []))
            acc.CLASS_CHAR.push(...(item.CLASS_CHAR ?? []))
            acc.CHAR_VALUES.push(...(item.CHAR_VALUES ?? []))
            return acc
        }, {
            CLASS: [],
            CLASS_CHAR: [],
            CHAR_VALUES: []
        })
        try {
            if (total[0].VALUE_ID == 'N') {
                var obj = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                req.reply(obj)
            }
            if (total[0].VALUE_ID == 'M') {
                await cds.run(UPSERT.into('APP_DB_CLASS_C_STB').entries(CLASS));
                await cds.run(UPSERT.into('APP_DB_CHARC_DATA_STB1').entries(CLASS_CHAR));
                await cds.run(UPSERT.into('APP_DB_CHARAC_VALUES_STB1').entries(CHAR_VALUES));
            }

            if (total[0].VALUE_ID == 'AU') {
                let token = await Ext_Process.generateBearerToken(req);
                let product_payload = {
                    PRODUCT: [],
                    LOCATION_PRODUCT: [],
                    PRODUCT_CLASS: [],
                    CLASS: CLASS,
                    CHARACTERISTICS_MASTER: CLASS_CHAR,
                    CHAR_VALUES_MASTER: CHAR_VALUES
                }
                let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(product_payload) }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                intf_payload['MESSAGE'] = JSON.stringify({
                    INT_CLS_NUMBER: CLASS?.[0]?.INT_CLS_NUMBER || "No INT_CLS_NUMBER",
                    CLASS: CLASS.length,
                    CLASS_CHAR: CLASS_CHAR.length,
                    CHARAC_VALUE: CHAR_VALUES.length
                })
                let StatusMessasge = (create_transactions.status <= 299) ? "Success" : "Error";
                if (StatusMessasge !== 'Success') {
                    return {
                        MESSAGE: "CLASS is Not Inserted"
                    }
                }
            }


            for (let index = 0; index < classVaildation.length; index++) {
                const { INT_CLS_NUMBER, MESSAGE, STATUS_CODE } = classVaildation[index];
                (MESSAGE !== undefined) ? intf_payload['MESSAGE'] = JSON.stringify({
                    INT_CLS_NUMBER: INT_CLS_NUMBER,
                    MESSAGE: MESSAGE
                }) : intf_payload['MESSAGE'] = JSON.stringify({
                    INT_CLS_NUMBER: INT_CLS_NUMBER
                })
                intf_payload['LOGID'] = uuidv4();
                intf_payload['STATUS_TYPE'] = (STATUS_CODE == 200) ? 'Success' : 'Error';
                intf_payload['STATUS_CODE'] = STATUS_CODE;
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }
            return {
                MESSAGE: {
                    statusCode: ((classVaildation.filter(i => i.STATUS_CODE == 400)).length > 0) ? 400 : 200,
                    ClassResponse: classVaildation.map(i => {
                        delete i.CLASS
                        delete i.CLASS_CHAR
                        delete i.CHAR_VALUES
                        i['Message'] = (i.MESSAGE !== undefined) ? i.MESSAGE : 'CLASS is  Inserted Successfully';
                        delete i.MESSAGE
                        return i
                    })
                }
            }


            // if (STATUS_CODE == 400) {
            //     intf_payload['MESSAGE'] = JSON.stringify({
            //         ClassNumber: INT_CLS_NUMBER,
            //         MissingFields: MissingFields
            //     })
            //     intf_payload['LOGID'] = uuidv4();
            //     intf_payload['STATUS_TYPE'] = "SUCCESS";
            //     intf_payload['STATUS_CODE'] = 200;
            //     await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

            //     return {
            //         MESSAGE: {
            //             type: "Vaildation Error",
            //             MissingFields: MissingFields,
            //             statusCode: STATUS_CODE
            //         }
            //     }
            // }
            // if (STATUS_CODE == 200) {
            //     if (total[0].VALUE_ID == 'M') {
            //         if (INT_CLS_NUMBER == 'UPDATE CHARAC VALUES') {
            //             await cds.run(UPSERT.into('APP_DB_CHARAC_VALUES_STB1').entries(CHARAC_VALUE));

            //             intf_payload['MESSAGE'] = JSON.stringify({
            //                 CHARAC_VALUE: CHARAC_VALUE.length
            //             })

            //         } else {
            //             await cds.run(UPSERT.into('APP_DB_CLASS_C_STB').entries(CLASS));
            //             await cds.run(UPSERT.into('APP_DB_CHARC_DATA_STB1').entries(CLASS_CHAR));
            //             await cds.run(UPSERT.into('APP_DB_CHARAC_VALUES_STB1').entries(CHARAC_VALUE));

            //             intf_payload['MESSAGE'] = JSON.stringify({
            //                 ClassNumber: INT_CLS_NUMBER,
            //                 ClassCount: CLASS.length,
            //                 CLASS_CHAR: CLASS_CHAR.length,
            //                 CHARAC_VALUE: CHARAC_VALUE.length
            //             })
            //         }


            //         intf_payload['LOGID'] = uuidv4();
            //         intf_payload['STATUS_TYPE'] = "SUCCESS";
            //         intf_payload['STATUS_CODE'] = 200;
            //         await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

            //         return {
            //             MESSAGE: `Classc is  Inserted Successfully`
            //         }
            //     }
            //     if (total[0].VALUE_ID == 'AU') {
            //         let token = await Ext_Process.generateBearerToken(req);
            //         let product_payload = {
            //             PRODUCT: "[]",
            //             LOCATION_PRODUCT: "[]",
            //             PRODUCT_CLASS: "[]",
            //             CLASS: (INT_CLS_NUMBER == 'UPDATE CHARAC VALUES') ? [] : CLASS,
            //             CHARACTERISTICS_MASTER: (INT_CLS_NUMBER == 'UPDATE CHARAC VALUES') ? [] : CLASS_CHAR,
            //             CHAR_VALUES_MASTER: CHARAC_VALUE
            //         }
            //         let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
            //         let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(product_payload) }, {
            //             headers: {
            //                 Authorization: `Bearer ${token}`,
            //             }
            //         })
            //         intf_payload['MESSAGE'] = JSON.stringify({
            //             ClassNumber: CLASS[0].INT_CLS_NUMBER,
            //             ClassCount: CLASS.length,
            //             CLASS_CHAR: CLASS_CHAR.length,
            //             CHARAC_VALUE: CHARAC_VALUE.length
            //         })

            //         intf_payload['STATUS_TYPE'] = (create_transactions.status <= 299) ? "Success" : "Error";
            //         intf_payload['STATUS_CODE'] = parseInt(create_transactions.status);
            //         await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

            //         let messInfo = (intf_payload.STATUS_TYPE == 'Success') ? 'Class Data is  Inserted Successfully' : 'Class Data is not Inserted'

            //         return {
            //             MESSAGE: messInfo
            //         }
            //     }
            // }
        } catch (error) {
            console.log(error)
        }
    })
    srv.on('insertProduct', async (req, res) => {
        let ProductVaildation = await Ext_Process.PRODUCT_EXT_VAILD(req)
        var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        var total = data.filter(i => {
            return i.SERVICE_NAME == 'PRODUCT INTERFACE' && i.PARAMETER_NAME == 'CREATE'
        })
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'PRODUCT INTERFACE',
            INTERFACE_TYPE: total[0].VALUE_ID,
            PAYLOAD: JSON.stringify(req.data.PRODUCT),
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        try {
            if (total[0].VALUE_ID == 'N') {
                var obj = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                req.reply(obj)
            }

            const { PRODUCTS, LOCATION_PRODUCT, PRODUCT_CLASS } = ProductVaildation.filter(item => item.STATUS_CODE === 200).reduce((acc, item) => {
                acc.PRODUCTS.push(...(item.PRODUCTS ?? []))
                acc.LOCATION_PRODUCT.push(...(item.LOCATION_PRODUCT ?? []))
                acc.PRODUCT_CLASS.push(...(item.PRODUCT_CLASS ?? []))
                return acc
            }, {
                PRODUCTS: [],
                LOCATION_PRODUCT: [],
                PRODUCT_CLASS: []
            })

            if (total[0].VALUE_ID == 'M') {
                (PRODUCTS.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_PRODUCT_STB').entries(PRODUCTS));
                (LOCATION_PRODUCT.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_LOC_PRODID_STB').entries(LOCATION_PRODUCT));
                (PRODUCT_CLASS.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_PROD_CLASS_STB1').entries(PRODUCT_CLASS));
            }
            if (total[0].VALUE_ID == 'AU') {
                let token = await Ext_Process.generateBearerToken(req);
                let product_payload = {
                    PRODUCT: PRODUCTS,
                    LOCATION_PRODUCT: LOCATION_PRODUCT,
                    PRODUCT_CLASS: PRODUCT_CLASS,
                    CLASS: "[]",
                    CHARACTERISTICS: "[]",
                    CHAR_VALUES: "[]"
                }
                let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(product_payload) }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                intf_payload['MESSAGE'] = JSON.stringify({
                    ProductID: PRODUCTS?.[0]?.PRODUCT_ID || "No Product",
                    ProductCount: PRODUCTS.length,
                    LocPordCount: LOCATION_PRODUCT.length,
                    ProdClassCount: PRODUCT_CLASS.length
                })
                let StatusMessasge = (create_transactions.status <= 299) ? "Success" : "Error";
                if (StatusMessasge !== 'Success') {
                    return {
                        MESSAGE: "Product is Not Inserted"
                    }
                }
            }

            for (let index = 0; index < PRODUCTS.length; index++) {
                const { PRODUCT_ID } = PRODUCTS[index];
                intf_payload['MESSAGE'] = JSON.stringify({
                    PRODUCT_ID: PRODUCT_ID
                })
                intf_payload['LOGID'] = uuidv4();
                intf_payload['STATUS_TYPE'] = "Success";
                intf_payload['STATUS_CODE'] = 200;
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }
            return {
                MESSAGE: {
                    statusCode: ((ProductVaildation.filter(i => i.STATUS_CODE == 400)).length > 0) ? 400 : 200,
                    ProductResponse: ProductVaildation.map(i => {
                        delete i.PRODUCTS
                        delete i.PRODUCT_CLASS
                        delete i.LOCATION_PRODUCT
                        i['Message'] = (i.MissingFields !== undefined) ? i.MissingFields : 'PRODUCT is  Inserted Successfully';
                        delete i.MissingFields
                        return i
                    })
                }
            }
        } catch (error) {
            intf_payload['STATUS_TYPE'] = "Error";
            intf_payload['MESSAGE'] = JSON.stringify({
                ProductID: (req.data.PRODUCT?.[0]?.PRODUCT_ID == "") ? 'NO PRODUCT ID' : req.data.PRODUCT?.[0]?.PRODUCT_ID
            })
            intf_payload['STATUS_CODE'] = 404;
            // let updateMessage = await updateReprocedure({
            //     OBJECT_NAME: "PRODUCT",
            //     OBJECT_VALUE: JSON.stringify({
            //         PRODUCT_ID: PRODUCTS?.[0]?.PRODUCT_ID || "No Product",
            //         PRODUCT_DESC: PRODUCTS?.[0]?.PRODUCT_DESC || "PRODUCT_DESC",
            //         PRODUCT_TYPE: PRODUCTS?.[0]?.PRODUCT_TYPE || "PRODUCT_TYPE"
            //     }),
            //     DATE_OF_ERROR: (new Date()).toISOString().split('T')[0],
            //     TIME_OF_ERROR: curent_time,
            //     MESSAGE_NUMBER: 400,
            //     MESSAGE_TYPE: "E"
            // })
            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            console.log(error.message)

        }
    })
    srv.on('insertPartialProduct', async (req, res) => {
        let PartialProducts = await Ext_Process.PartialProdStrucVaild(req.data.PARTIALPRODUCT)

        const { PROD_HEADER, PROD_ITEMS, LOC_PROD } = PartialProducts.filter(item => item.STATUS_CODE === 200).reduce((acc, item) => {
            acc.PROD_HEADER.push(...(item.PROD_HEADER ?? []))
            acc.PROD_ITEMS.push(...(item.PROD_ITEMS ?? []))
            acc.LOC_PROD.push(...(item.LOC_PROD ?? []))
            return acc
        }, {
            PROD_HEADER: [],
            PROD_ITEMS: [],
            LOC_PROD: []
        })
        var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))

        var total = data.filter(i => {
            return i.SERVICE_NAME == 'PARTIAL PRODUCT INTERFACE' && i.PARAMETER_NAME == 'CREATE'
        })
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'PARTIAL PRODUCT INTERFACE',
            INTERFACE_TYPE: total[0].VALUE_ID,
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        try {
            if (total[0].VALUE_ID == 'N') {
                var obj = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                req.reply(obj)
            }
            if (PROD_HEADER.length > 0) {
                if (total[0].VALUE_ID == 'M') {
                    (PROD_HEADER.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_PARTIALPRODUCT_HEADER').entries(PROD_HEADER));
                    (PROD_ITEMS.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_PARTIALPRODUCT_ITEM').entries(PROD_ITEMS));
                    (LOC_PROD.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_LOC_PRODID_STB').entries(LOC_PROD));
                }
                if (total[0].VALUE_ID == 'AU') {
                    let token = await Ext_Process.generateBearerToken(req);
                    // let product_payload = {
                    //     PARTIALPROD_INTRO: PROD_HEADER,
                    //     PARTIALPROD_CHAR_MASTER: PROD_ITEMS,
                    //     LOCATION_PRODUCT: LOC_PROD
                    // }
                    let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                    let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(req.data) }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    })
                    console.log(create_transactions.data.d.productData)
                }
            }
            for (let index = 0; index < PartialProducts.length; index++) {
                const { PRODUCT_ID, LOCATION_ID, STATUS_CODE, MESSAGE } = PartialProducts[index];
                intf_payload['MESSAGE'] = JSON.stringify({
                    PRODUCT_ID: PRODUCT_ID,
                    LOCATION_ID: LOCATION_ID,
                    Message: MESSAGE
                })
                intf_payload['LOGID'] = uuidv4();
                intf_payload['STATUS_TYPE'] = "Success";
                intf_payload['STATUS_CODE'] = STATUS_CODE;
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }
            return {
                MESSAGE: {
                    statusCode: ((PartialProducts.filter(i => i.STATUS_CODE == 400)).length > 0) ? 400 : 200,
                    ProductResponse: PartialProducts.map(i => {
                        delete i.LOC_PROD
                        delete i.PROD_ITEMS
                        delete i.PROD_HEADER
                        i['Message'] = (i.MESSAGE !== undefined) ? i.MESSAGE : 'PRODUCT is  Inserted Successfully';
                        delete i.MESSAGE
                        return i
                    })
                }
            }
        } catch (error) {
            intf_payload['MESSAGE'] = JSON.stringify("error")
            intf_payload['STATUS_TYPE'] = "Error";
            intf_payload['STATUS_CODE'] = 400;
            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            console.log(error.message)
        }
    })
    srv.on('ExportToVCP', async (req, res) => {
        try {
            let PRODUCT_ID = req.data.PRODUCT_ID;

            let SALESH = await cds.run(`SELECT * FROM "APP_DB_SALESH_STB" WHERE PRODUCT_ID = '${PRODUCT_ID}'`);
                        
            let SALES_CONFIG = await cds.run(
                SELECT.from("APP_DB_SALESH_CONFIG_STB").where({ PRODUCT_ID }).orderBy(
                    "SALES_DOCUMENT",
                    "CHARACTERSTIC",
                    "CHARACTERSTIC_VALUE"
                )
            );

            let ConfigByDoc = new Map();

            for (const row of SALES_CONFIG) {

                if (!ConfigByDoc.has(row.SALES_DOCUMENT)) {
                    ConfigByDoc.set(row.SALES_DOCUMENT, []);
                }

                ConfigByDoc.get(row.SALES_DOCUMENT).push(row);
            }

            let FinalGroups = new Map();

            for (const [salesDoc, configRows] of ConfigByDoc) {

                let compareKey = JSON.stringify(
                    configRows
                        .map(r => ({
                            CHARACTERSTIC: r.CHARACTERSTIC,
                            CHARACTERSTIC_VALUE: r.CHARACTERSTIC_VALUE
                        }))
                );

                if (!FinalGroups.has(compareKey)) {
                    FinalGroups.set(compareKey, {
                        aSalesH: [],
                        aSalesHConfig: configRows
                    });
                }

                let header = SALESH.find(h => h.SALES_DOCUMENT === salesDoc);

                if (header) {
                    FinalGroups.get(compareKey).aSalesH.push(header);
                }
            }

            const Payload = [...FinalGroups.values()];

            for (const group of Payload) {
                console.log("Running salesdoc: ", group.aSalesH.length)
                await apiCall(group, group.aSalesH, req);
            }

        }
        catch (error) {
            console.log(error.message);
        }
    })
    srv.on('insertBomDepn', async (req, res) => {
        let getVaildationResponse = await Ext_Process.BOM_EXT_VAILD1(req)
        var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        var total = data.filter(i => {
            return i.SERVICE_NAME == 'BILL OF MATERIAL INTERFACE' && i.PARAMETER_NAME == 'CREATE'
        })
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'BILL OF MATERIAL INTERFACE',
            INTERFACE_TYPE: total[0].VALUE_ID,
            PAYLOAD: JSON.stringify(req.data.BOM),
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        // try {
        //     if (total[0].VALUE_ID == 'N') {
        //         var obj = {
        //             "type": "Error",
        //             "description": "The requested resource could not be found or is not accessible.",
        //             "statusCode": 404
        //         }
        //         req.reply(obj)
        //     }
        //     const result = getVaildationResponse.reduce((acc, item) => {
        //         if (item.STATUS_CODE !== 200 || !item.BOM_P) return acc

        //         const b = item.BOM_P

        //         acc.BOM_HEADER.push(...(b.BOM_HEADER ?? []))
        //         acc.BOM_OD.push(...(b.BOM_OD ?? []))
        //         acc.BOM_OB_DEP.push(...(b.BOM_OB_DEP ?? []))
        //         acc.LOC_PROD.push(...(b.LOC_PROD ?? []))
        //         acc.PROD_CLASS.push(...(b.PROD_CLASS ?? []))

        //         return acc
        //     }, {
        //         BOM_HEADER: [],
        //         BOM_OD: [],
        //         BOM_OB_DEP: [],
        //         LOC_PROD: [],
        //         PROD_CLASS: []
        //     })
        //     const { BOM_HEADER, BOM_OD, BOM_OB_DEP, LOC_PROD, PROD_CLASS } = result
        //     if (total[0].VALUE_ID == 'M') {
        //         (BOM_HEADER.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_BOM_MAT').entries(BOM_HEADER));
        //         (BOM_OD.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_BOM_OD').entries(BOM_OD));
        //         (BOM_OB_DEP.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_BOM_OD_DEP').entries(BOM_OB_DEP));
        //         (LOC_PROD.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_LOC_PRODID_STB').entries(LOC_PROD));
        //         (PROD_CLASS.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_PROD_CLASS_STB1').entries(PROD_CLASS));
        //     }
        //     if (total[0].VALUE_ID == 'AU') {
        //         let BOM_STRUC = {
        //             BOM_MAT: BOM_HEADER,
        //             BOM_OD: BOM_OD,
        //             BOM_OD_DEP: BOM_OB_DEP,
        //             LOCATION_PRODUCT: LOC_PROD,
        //             PRODUCT_CLASS: PROD_CLASS
        //         }
        //         let token = await Ext_Process.generateBearerToken(req);
        //         let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
        //         let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(BOM_STRUC) }, {
        //             headers: {
        //                 Authorization: `Bearer ${token}`,
        //             }
        //         })

        //         let status = (create_transactions.status <= 299) ? "Success" : "Error";

        //         if (status !== 'Success') {
        //             return {
        //                 MESSAGE: 'BOM is not Inserted '
        //             }
        //         }
        //     }
        //     for (let index = 0; index < BOM_HEADER.length; index++) {
        //         const { LOCATION_ID, MAT_PARENT } = BOM_HEADER[index];
        //         intf_payload['MESSAGE'] = JSON.stringify({
        //             LOCATION_ID: LOCATION_ID,
        //             MAT_PARENT: MAT_PARENT
        //         })
        //         intf_payload['LOGID'] = uuidv4();
        //         intf_payload['STATUS_TYPE'] = "Success";
        //         intf_payload['STATUS_CODE'] = 200;
        //         await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
        //     }
        //     return {
        //         MESSAGE: {
        //             statusCodeHeader: ((getVaildationResponse.filter(i => i.STATUS_CODE == 400)).length > 0) ? 400 : 200,
        //             BOMResponse: getVaildationResponse.map(i => {
        //                 delete i.BOM_P
        //                 delete i.COUNTER
        //                 delete i.MAT_CHILD
        //                 i['Message'] = (i.MESSAGE !== undefined) ? i.MESSAGE : 'BOM is  Inserted Successfully';
        //                 delete i.MESSAGE
        //                 return i
        //             })
        //         }
        //     }

        // } 

        try {
            const { BOM_HEADER, BOM_OD, BOM_OB_DEP, LOC_PROD, PROD_CLASS } =
                getVaildationResponse
                    .filter(item => item.STATUS_CODE === 200)
                    .reduce((acc, item) => {
                        acc.BOM_HEADER.push(...(item.BOM_HEADER ?? []));
                        acc.BOM_OD.push(...(item.BOM_OD ?? []));
                        acc.BOM_OB_DEP.push(...(item.BOM_OB_DEP ?? []));
                        acc.PROD_CLASS.push(...(item.PROD_CLASS ?? []));
                        acc.LOC_PROD.push(...(item.LOC_PROD ?? [])); // ✅ FIXED
                        return acc;
                    }, {
                        BOM_HEADER: [],
                        BOM_OD: [],
                        BOM_OB_DEP: [],
                        LOC_PROD: [],
                        PROD_CLASS: []
                    });

            if (total[0].VALUE_ID == 'M') {
                (BOM_HEADER.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_BOM_MAT').entries(BOM_HEADER));
                (BOM_OD.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_BOM_OD').entries(BOM_OD));
                (BOM_OB_DEP.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_BOM_OD_DEP').entries(BOM_OB_DEP));
                (LOC_PROD.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_LOC_PRODID_STB').entries(LOC_PROD));
                (PROD_CLASS.length == 0) ? '' : await cds.run(UPSERT.into('APP_DB_PROD_CLASS_STB1').entries(PROD_CLASS));
            }


            if (total[0].VALUE_ID == 'AU') {
                const aLocProd = LOC_PROD;
                const aBomMat = BOM_HEADER;

                const mLocProd = new Map(
                    aLocProd.map(lp => [
                        `${lp.LOCATION_ID}_${lp.PRODUCT_ID}`,
                        lp
                    ])
                );

                for (const bom of aBomMat) {
                    const key = `${bom.CHILD_LOC}_${bom.MAT_CHILD}`;

                    if (mLocProd.has(key)) {
                        mLocProd.get(key).UOM = bom.UOM;
                    } else {
                        const newRecord = {
                            LOCATION_ID: bom.CHILD_LOC,
                            PRODUCT_ID: bom.MAT_CHILD,
                            UOM: bom.UOM
                        };

                        aLocProd.push(newRecord);
                        mLocProd.set(key, newRecord);
                    }
                }

                let BOM_STRUC = {
                    BOM_MAT: BOM_HEADER,
                    BOM_OD: BOM_OD,
                    BOM_OD_DEP: BOM_OB_DEP,
                    LOCATION_PRODUCT: aLocProd,
                    PRODUCT_CLASS: PROD_CLASS
                }

                let token = await Ext_Process.generateBearerToken(req);
                let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(BOM_STRUC) }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })

                let status = (create_transactions.status <= 299) ? "Success" : "Error";

                if (status !== 'Success') {
                    return {
                        MESSAGE: 'BOM is not Inserted '
                    }
                }
            }

            for (let index = 0; index < BOM_HEADER.length; index++) {
                const { LOCATION_ID, MAT_PARENT } = BOM_HEADER[index];
                intf_payload['MESSAGE'] = JSON.stringify({
                    LOCATION_ID: LOCATION_ID,
                    MAT_PARENT: MAT_PARENT
                })
                intf_payload['LOGID'] = uuidv4();
                intf_payload['STATUS_TYPE'] = "Success";
                intf_payload['STATUS_CODE'] = 200;
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }

            return {
                MESSAGE: {
                    statusCode: ((getVaildationResponse.filter(i => i.STATUS_CODE == 400)).length > 0) ? 400 : 200,
                    BOMResponse: getVaildationResponse.map(i => {
                        delete i.BOM_HEADER
                        delete i.BOM_OD
                        delete i.BOM_OB_DEP
                        delete i.LOC_PROD
                        delete i.PROD_CLASS
                        i['Message'] = (i.MESSAGE !== undefined) ? i.MESSAGE : 'BOM is  Inserted Successfully';
                        delete i.MESSAGE
                        return i
                    })
                }
            }
        }
        catch (error) {
            intf_payload['MESSAGE'] = JSON.stringify(error.message);
            intf_payload['STATUS_TYPE'] = "Error";
            intf_payload['STATUS_CODE'] = 404;
            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            console.log(error.message)
            return {
                MESSAGE: error.message
            }
        }
    })
    srv.on('REPROCEDURE_S4_LOG', async (req, res) => {
        try {

            let { FLAG, DATA } = req.data;
            if (FLAG == 'R') {
                let getData = await cds.run('select * from APP_DB_REPROCEDURE_S4_LOG')
                return getData
            }
            if (FLAG == 'D') {
                for (let index = 0; index < DATA.length; index++) {
                    const { OBJECT_NAME, OBJECT_VALUE, DATE_OF_ERROR } = DATA[index];
                    await cds.run(`DELETE FROM APP_DB_REPROCEDURE_S4_LOG WHERE OBJECT_NAME = '${OBJECT_NAME}' AND OBJECT_VALUE = '${OBJECT_VALUE}' AND DATE_OF_ERROR = '${DATE_OF_ERROR}'`)

                }

            }
        } catch (error) {
            console.log(error)
        }
    })
    srv.on('insertVarientTable', async (req) => {
        let { STATUS_CODE, HEADER, COUNT, DEF, MissingFields, TABLE_NAME } = await Ext_Process.VARIANT_EXT_VALID(req)
        try {

            var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))
            var total = data.filter(i => {
                return i.SERVICE_NAME == 'BILL OF MATERIAL INTERFACE' && i.PARAMETER_NAME == 'CREATE'
            })
            var curent_time = await Ext_Process.CURRENT_TIME()
            var intf_payload = {
                LOGID: uuidv4(),
                INTERAFACE_NAME: 'BILL OF MATERIAL INTERFACE',
                INTERFACE_TYPE: total[0].VALUE_ID,
                CREATED_DATE: (new Date()).toISOString().split('T')[0],
                CREATED_TIME: curent_time
            }

            if (total[0].VALUE_ID == 'N') {
                var obj = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                req.reply(obj)
            }
            if (STATUS_CODE == 200) {
                if (total[0].VALUE_ID == 'M') {
                    await cds.run(UPSERT.into('APP_DB_VAR_HDR').entries(HEADER));
                    await cds.run(UPSERT.into('APP_DB_VAR_DEF').entries(DEF));
                    await cds.run(UPSERT.into('APP_DB_VAR_CONTNT').entries(COUNT));
                    intf_payload['MESSAGE'] = JSON.stringify({
                        TABLE_NAME: TABLE_NAME,
                        VarientHeader: HEADER.length,
                        VarientDef: DEF.length,
                        VarientCount: COUNT.length
                    })
                    intf_payload['LOGID'] = uuidv4();
                    intf_payload['STATUS_TYPE'] = "SUCCESS";
                    intf_payload['STATUS_CODE'] = 200;
                    await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

                    return {
                        MESSAGE: `Varient is  Inserted Successfully`
                    }
                }
                if (total[0].VALUE_ID == 'AU') {
                    let token = await Ext_Process.generateBearerToken(req);
                    let product_payload = {
                        VAR_HDR: HEADER,
                        VAR_DEF: DEF,
                        VAR_CONTNT: COUNT
                    }
                    let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                    let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(product_payload) }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    })
                    intf_payload['MESSAGE'] = JSON.stringify({
                        TABLE_NAME: TABLE_NAME,
                        VarientHeader: HEADER.length,
                        VarientDef: DEF.length,
                        VarientCount: COUNT.length
                    })
                    intf_payload['STATUS_TYPE'] = (create_transactions.status <= 299) ? "Success" : "Error";
                    intf_payload['STATUS_CODE'] = parseInt(create_transactions.status);
                    await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

                    let messInfo = (intf_payload.STATUS_TYPE == 'Success') ? 'Varient Data is  Inserted Successfully' : 'Varient Data is not Inserted'

                    return {
                        MESSAGE: messInfo
                    }
                }
            }
            if (STATUS_CODE == 400) {
                intf_payload['MESSAGE'] = JSON.stringify({
                    TABLE_NAME: TABLE_NAME,
                    MissingFields: MissingFields
                })
                intf_payload['LOGID'] = uuidv4();
                intf_payload['STATUS_TYPE'] = "Error";
                intf_payload['STATUS_CODE'] = STATUS_CODE;
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

                return {
                    MESSAGE: {
                        type: "Vaildation Error",
                        MissingFields: MissingFields,
                        statusCode: STATUS_CODE
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    })
    srv.on('insertProductionConsumption', async (req) => {
        let Responses = await Ext_Process.onInsertProductionConsumption(req)
        let Interfaces = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        let FilteredInterafce = Interfaces.filter(i => {
            return i.SERVICE_NAME == 'PRODUCTION ORDER INTERFACE' && i.PARAMETER_NAME == 'CREATE'
        })
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'PRODUCTION ORDER INTERFACE',
            INTERFACE_TYPE: FilteredInterafce[0].VALUE_ID,
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        try {
            if (FilteredInterafce[0].VALUE_ID == 'N') {
                req.reply({
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                })
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }
            const Payload = Responses
                .filter(item => item.STATUS_CODE === 200)
                .flatMap(item => item.Payload ?? []);
            if (FilteredInterafce[0].VALUE_ID == 'AU') {
                let token = await Ext_Process.generateBearerToken(req);
                let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                let create_transactions = await axios.post(dominurl + "maintainProdOrdConsumption", {
                    PRDORDDATA: JSON.stringify({
                        PRODUCTION_CON: Payload
                    })
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
            }
            if (FilteredInterafce[0].VALUE_ID == 'M') {
                (Payload.length > 0) ? await cds.run(UPSERT.into("APP_DB_PRODUCTION_CONSUMPTION").entries(Payload)) : "";
            }

            const entries = Responses.map(({ PRODUCT_ID, LOCATION_ID, STATUS_CODE, MESSAGE }) => ({
                ...intf_payload,
                MESSAGE: JSON.stringify({
                    PRODUCT_ID,
                    LOCATION_ID,
                    Message: MESSAGE
                }),
                LOGID: uuidv4(),
                STATUS_TYPE: "Success",
                STATUS_CODE
            }));

            await cds.run(
                INSERT.into("APP_DB_INTERFACELOGINFO").entries(entries)
            );

            return {
                MESSAGE: {
                    StatusCode: (Responses.filter(i => i.StatusCode == 400).length > 0) ? 400 : 200,
                    StatusType: (Responses.filter(i => i.StatusCode == 400).length > 0) ? "Bad Request" : "Success",
                    Responses: Responses.map(i => {
                        delete i.Payload
                        i['Message'] = (i.MissingFields !== undefined) ? i.MissingFields : 'Production Consumption is  Inserted Successfully';
                        delete i.MissingFields
                        return i
                    })
                }
            }
        } catch (error) {
            intf_payload['LOGID'] = uuidv4();
            intf_payload['STATUS_TYPE'] = "ERROR";
            intf_payload['STATUS_CODE'] = 400;
            console.log(error)
            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
        }
    })
    srv.on('insertSalesProductionOrder', async (req) => {
        let getReponses = await Ext_Process.oninsertSalesProductionOrder(req);
        let FinalResponse = [];
        let Interfaces = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        let FilteredInterafce = Interfaces.filter(i => {
            return i.SERVICE_NAME == 'PRODUCTION ORDER INTERFACE' && i.PARAMETER_NAME == 'CREATE'
        })
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'PRODUCTION ORDER INTERFACE',
            INTERFACE_TYPE: FilteredInterafce[0].VALUE_ID,
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        try {
            if (FilteredInterafce[0].VALUE_ID == 'N') {
                req.reply({
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                })

                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }

            if ((getReponses.filter(i => i.StatusCode == 400)).length > 0) {
                let getMissingFieldsInfo = getReponses.filter(i => i.StatusCode == 400);
                getMissingFieldsInfo.forEach(i => {
                    delete i.Payload;
                    i['SALESDOC'] = i.SALES_DOCUMENT;
                    i['SALES_DOCUMENT_ITEM'] = i.SALES_DOCUMENT_ITEM;
                    i['StatusCode'] = i.StatusCode;
                    i['StatusType'] = 'Bad Request';
                    i['MissingFields'] = i.MissingFields
                    FinalResponse.push(i)
                })
            }
            if ((getReponses.filter(i => i.StatusCode == 200)).length > 0) {
                let SuccessResponses = getReponses.filter(i => i.StatusCode !== 400);
                for (let index = 0; index < SuccessResponses.length; index++) {
                    const { SALES_DOCUMENT, SALES_DOCUMENT_ITEM, Payload } = SuccessResponses[index];

                    if (FilteredInterafce[0].VALUE_ID == 'AU') {
                        let token = await Ext_Process.generateBearerToken(req);
                        let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                        let create_transactions = await axios.post(dominurl + "maintainProdOrdConsumption", {
                            PRDORDDATA: JSON.stringify({
                                SALES_PRODUCTION_ORDER: [Payload]
                            })
                        }, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            }
                        })
                        intf_payload['MESSAGE'] = JSON.stringify(Payload)
                        intf_payload['LOGID'] = uuidv4();
                        intf_payload['STATUS_TYPE'] = (create_transactions.status <= 299) ? "Success" : "Error";
                        intf_payload['STATUS_CODE'] = parseInt(create_transactions.status);
                        await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

                        let messInfo = (intf_payload.STATUS_TYPE == 'Success') ? 'Sales Production Order is  Inserted Successfully' : 'Sales Production Order is not Inserted'

                        FinalResponse.push({
                            SALESDOC: SALES_DOCUMENT,
                            SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM,
                            StatusCode: 200,
                            StatusType: intf_payload.STATUS_TYPE,
                            Message: messInfo
                        })
                    }
                    if (FilteredInterafce[0].VALUE_ID == 'M') {

                        intf_payload['MESSAGE'] = JSON.stringify({
                            SALES_PRODUCTION_ORDER: JSON.stringify(Payload)
                        })
                        intf_payload['LOGID'] = uuidv4();
                        intf_payload['STATUS_TYPE'] = "SUCCESS";
                        intf_payload['STATUS_CODE'] = 200;

                        (Payload.length > 0) ? await cds.run(UPSERT.into("APP_DB_SALES_PRODUCTION_ORDERS").entries(Payload)) : "";
                        await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
                        FinalResponse.push({
                            SALESDOC: SALES_DOCUMENT,
                            SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM,
                            StatusCode: 200,
                            StatusType: intf_payload.STATUS_TYPE,
                            Message: "Sales Production Order is  Inserted Successfully"
                        })
                    }

                }
            }
            return {
                MESSAGE: {
                    StatusCode: ((FinalResponse.filter(i => i.StatusCode == 400)).length > 0) ? 400 : 200,
                    StatusType: ((FinalResponse.filter(i => i.StatusCode == 400)).length > 0) ? 'Vaildation Error' : 'Success',
                    Responses: FinalResponse
                }
            }
        } catch (error) {
            intf_payload['LOGID'] = uuidv4();
            intf_payload['STATUS_TYPE'] = "ERROR";
            intf_payload['STATUS_CODE'] = 400;
            console.log(error)
            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
        }
    })
    srv.on('insertAssComp', async (req) => {
        let { Assembly } = req.data;
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'ASSEMBLY INTERFACE',
            INTERFACE_TYPE: "M",
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        try {
            (Assembly.length > 0) ? await cds.run(INSERT.into("APP_DB_ASS_COMP_STB").entries(Assembly)) : "";
            intf_payload['STATUS_TYPE'] = "Success";
            intf_payload['STATUS_CODE'] = 201;
            await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))

            return {
                MESSAGE: Assembly.map(i => {
                    let obj = {};
                    obj['LOCATION_ID'] = i.LOCATION_ID;
                    obj['ASSEMBLY'] = i.ASSEMBLY;
                    obj['SUB_COMP'] = i.SUB_COMP;
                    obj['STATUS_CODE'] = 200;
                    obj['STATUS_TYPE'] = 'Success';
                    return obj
                })
            }
        } catch (error) {
            consolelog(error.message)
        }
    })
    srv.on('insertDerivedCharac', async (req) => {
        let getDerviced = await Ext_Process.DERV_EXT_VAILD(req)
        let data = await cds.run('SELECT * FROM SELECTIONOPTIONS')
        let total = data.filter(i => i.SERVICE_NAME == 'DERIVED CHARACTERISTICS INTERFACE' && i.PARAMETER_NAME == 'CREATE')
        let curent_time = await Ext_Process.CURRENT_TIME()
        let getConcatDERV = getDerviced.filter(i => i.STATUS_CODE == 200).reduce((acc, item) => {
            acc = acc.concat(item.DERV_DATA ?? [])
            return acc
        }, [])
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'DERIVED CHARACTERISTICS INTERFACE',
            INTERFACE_TYPE: total[0].VALUE_ID,
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        try {
            if (total[0].VALUE_ID == 'N') {
                req.reply({
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                })
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }
            if (total[0].VALUE_ID == 'M') {
                await cds.run(UPSERT.into("APP_DB_DERIVECHAR_STB2").entries(getConcatDERV))
            }
            if (total[0].VALUE_ID == 'AU') {
                let token = await Ext_Process.generateBearerToken(req);
                let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                let create_transactions = await axios.post(dominurl + "productData", {
                    PRODUCTDATA: JSON.stringify({
                        DERIVED_CHAR_CONFIG_PRF: getConcatDERV
                    })
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                console.log(create_transactions.data.d.productData)
            }

            return {
                MESSAGE:
                {
                    statusCode: getDerviced.filter(i => i.STATUS_CODE == 400).length > 0 ? 400 : 200,
                    statusType: 'Success',
                    Responses: getDerviced.map(i => {
                        let obj = {};
                        obj['STATUS_CODE'] = i.STATUS_CODE;
                        obj['PRODUCT_ID'] = i.PRODUCT_ID;
                        obj['MESSAGE'] = i.MESSAGE == undefined ? 'Derived Characteristics is Inserted Successfully' : i.MESSAGE;
                        return obj
                    })
                }
            }
        } catch (error) {
            console.log(error.message)
        }
    })
    srv.on('getPIRData', async (req) => {
        let { LOCATION_ID, ASSEMBLY, FROM_DATE, TO_DATE } = req.data.PIR;
        try {

            let token = await Ext_Process.generateBearerToken(req);
            let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
            let url = `${dominurl}postPIRData?LOCATION_ID='${LOCATION_ID}'&ASSEMBLY='${ASSEMBLY}'&FROM_DATE='${(FROM_DATE == '--' ? '' : FROM_DATE)}'&TO_DATE='${(TO_DATE == '--' ? '' : TO_DATE)}'`;
            let response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            return {
                MESSAGE: JSON.parse(response.data.d.postPIRData)
            }

        } catch (error) {
            console.log(error.message)
        }
    })
    srv.on('onInsertIppe', async (req) => {
        var data = await cds.run(SELECT.from("SELECTIONOPTIONS"))
        var total = data.filter(i => {
            return i.SERVICE_NAME == 'IPPE INTERFACE' && i.PARAMETER_NAME == 'CREATE'
        })
        var curent_time = await Ext_Process.CURRENT_TIME()
        var intf_payload = {
            LOGID: uuidv4(),
            INTERAFACE_NAME: 'IPPE INTERFACE',
            INTERFACE_TYPE: total[0].VALUE_ID,
            PAYLOAD: JSON.stringify(req.data.PRODUCT),
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        }
        let getIppeVaildationResponse = await Ext_Process.IPPE_EXT_VAILD(req)
        try {

            const { PRDACCNODE, MASTER_DATA, PVBLL_MAT } = getIppeVaildationResponse.filter(item => item.STATUS_CODE === 200).reduce((acc, item) => {
                acc.PRDACCNODE.push(...(item.PRDACCNODE ?? []))
                acc.MASTER_DATA.push(...(item.MASTER_DATA ?? []))
                acc.PVBLL_MAT.push(...(item.PVBLL_MAT ?? []))
                return acc
            }, {
                PRDACCNODE: [],
                MASTER_DATA: [],
                PVBLL_MAT: []
            })

            if (total[0].VALUE_ID == 'N') {
                var obj = {
                    "type": "Error",
                    "description": "The requested resource could not be found or is not accessible.",
                    "statusCode": 404
                }
                req.reply(obj)
            }
            if (total[0].VALUE_ID == 'M') {
                await cds.run(UPSERT.into("APP_DB_PROD_ACC_NODE_STB").entries(PRDACCNODE))
                await cds.run(UPSERT.into("APP_DB_MAST_DATA_NODE_STB").entries(MASTER_DATA))
                await cds.run(UPSERT.into("APP_DB_PVBLL_MAT_STB").entries(PVBLL_MAT))
            }
            if (total[0].VALUE_ID == 'AU') {
                let token = await Ext_Process.generateBearerToken(req);
                let dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
                let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(req.data) }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })

                console.log(create_transactions.data.d)


            }


            for (let index = 0; index < getIppeVaildationResponse.length; index++) {
                const { LOCATION_ID, PRODUCT_ID } = getIppeVaildationResponse[index];
                intf_payload['MESSAGE'] = JSON.stringify({
                    PRODUCT_ID: PRODUCT_ID,
                    LOCATION_ID: LOCATION_ID
                })
                intf_payload['LOGID'] = uuidv4();
                intf_payload['STATUS_TYPE'] = (getIppeVaildationResponse[index].STATUS_CODE == 200) ? "Success" : "Error";
                intf_payload['STATUS_CODE'] = getIppeVaildationResponse[index].STATUS_CODE;
                await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
            }
            return {
                MESSAGE: {
                    statusCode: ((getIppeVaildationResponse.filter(i => i.STATUS_CODE == 400)).length > 0) ? 400 : 200,
                    ProductResponse: getIppeVaildationResponse.map(i => {
                        delete i.PRDACCNODE
                        delete i.MASTER_DATA
                        delete i.PVBLL_MAT
                        i['Message'] = (i.MESSAGE !== undefined) ? i.MESSAGE : 'IPPE is  Inserted Successfully';
                        delete i.MESSAGE
                        return i
                    })
                }
            }

        } catch (error) {
            console.log(error.message)
        }

    })
    srv.on('ExportMasterData', async (req) => {
        try {
            await RunMasterRequest(req.data.TYPE, req);
            req.reply("Triggered");
        } catch (err) {
            console.error(err);
            req.error(500, err.message);
        }
    });
    async function RunMasterRequest(type, req) {

        let payload = {};

        switch (type) {
            case "LOCATION":

                payload.LOCATION =
                    await cds.run(`SELECT * FROM APP_DB_LOCATION_STB`);

                break;


            case "CUSTOMER":

                payload.CUSTOMERGROUP =
                    await cds.run(`SELECT * FROM APP_DB_CUSTOMER_GROUP`);

                break;


            case "PRODUCT":

                payload.PRODUCT = await cds.run(`SELECT * FROM APP_DB_PRODUCT_STB`);
                payload.LOCATION_PRODUCT = await cds.run(`SELECT * FROM APP_DB_LOC_PRODID_STB`);
                payload.PRODUCT_CLASS = await cds.run(`SELECT * FROM APP_DB_PROD_CLASS_STB1`);

                break;

            case "CLASS":

                payload.CLASS = await cds.run(`SELECT * FROM APP_DB_CLASS_C_STB`);
                payload.CHARACTERISTICS_MASTER = await cds.run(`SELECT * FROM APP_DB_CHARC_DATA_STB1`);
                payload.CHAR_VALUES_MASTER = await cds.run(`SELECT * FROM APP_DB_CHARAC_VALUES_STB1`);

                break;

            case "BOM":

                payload.BOM_MAT = await cds.run(`SELECT * FROM APP_DB_BOM_MAT`);
                payload.BOM_OD = await cds.run(`SELECT * FROM APP_DB_BOM_OD`);
                payload.BOM_OD_DEP = await cds.run(`SELECT * FROM APP_DB_BOM_OD_DEP`);
                payload.LOCATION_PRODUCT = await cds.run(`SELECT * FROM APP_DB_LOC_PRODID_STB`);
                payload.PRODUCT_CLASS = await cds.run(`SELECT * FROM APP_DB_PROD_CLASS_STB1`);

                break;

            case "VARIANT":

                payload.VAR_HDR = await cds.run(`SELECT * FROM APP_DB_VAR_HDR`);
                payload.VAR_DEF = await cds.run(`SELECT * FROM APP_DB_VAR_DEF`);
                payload.VAR_CONTNT = await cds.run(`SELECT * FROM APP_DB_VAR_CONTNT`);

                break;

            case "DERIVED":

                payload.DERIVED_CHAR_CONFIG_PRF =
                    await cds.run(`SELECT * FROM APP_DB_DERIVECHAR_STB2`);

                break;

            case "PARTIALPRODUCT":

                payload.PARTIALPRODUCT =
                    await BuildPartialProductPayload();

                break;

            case "IPPE":

                payload.IPPE =
                    await BuildIppePayload();

                break;

            case "ALL":

                payload.PRODUCT =
                    await cds.run(`SELECT * FROM APP_DB_PRODUCT_STB`);

                payload.LOCATION_PRODUCT =
                    await cds.run(`SELECT * FROM APP_DB_LOC_PRODID_STB`);

                payload.PRODUCT_CLASS =
                    await cds.run(`SELECT * FROM APP_DB_PROD_CLASS_STB1`);


                payload.LOCATION =
                    await cds.run(`SELECT * FROM APP_DB_LOCATION_STB`);


                payload.CUSTOMERGROUP =
                    await cds.run(`SELECT * FROM APP_DB_CUSTOMER_GROUP`);


                payload.CLASS =
                    await cds.run(`SELECT * FROM APP_DB_CLASS_C_STB`);

                payload.CHARACTERISTICS_MASTER =
                    await cds.run(`SELECT * FROM APP_DB_CHARC_DATA_STB1`);

                payload.CHAR_VALUES_MASTER =
                    await cds.run(`SELECT * FROM APP_DB_CHARAC_VALUES_STB1`);


                payload.BOM_MAT =
                    await cds.run(`SELECT * FROM APP_DB_BOM_MAT`);

                payload.BOM_OD =
                    await cds.run(`SELECT * FROM APP_DB_BOM_OD`);

                payload.BOM_OD_DEP =
                    await cds.run(`SELECT * FROM APP_DB_BOM_OD_DEP`);


                payload.VAR_HDR =
                    await cds.run(`SELECT * FROM APP_DB_VAR_HDR`);

                payload.VAR_DEF =
                    await cds.run(`SELECT * FROM APP_DB_VAR_DEF`);

                payload.VAR_CONTNT =
                    await cds.run(`SELECT * FROM APP_DB_VAR_CONTNT`);


                payload.DERIVED_CHAR_CONFIG_PRF =
                    await cds.run(`SELECT * FROM APP_DB_DERIVECHAR_STB2`);


                payload.PARTIALPRODUCT =
                    await BuildPartialProductPayload();


                payload.IPPE =
                    await BuildIppePayload();


                break;


            default:
                throw new Error(`Unsupported Type : ${type}`);
        }

        await sendToDestination(payload, type, req);
    }
    async function sendToDestination(payload, type, req) {

        const token = await Ext_Process.generateBearerToken(req);
       
        const domainurl =("https://" + await GenerateUrl() + "/v2/catalog/").replace("cap-servs-mt", "vcplanner-mt");
        const response = await axios.post(
            domainurl + "productData",
            {
                PRODUCTDATA: JSON.stringify(payload)
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

    }
    async function BuildIppePayload() {

        const accNode =
            await cds.run(`SELECT * FROM APP_DB_PROD_ACC_NODE_STB`);

        const master =
            await cds.run(`SELECT * FROM APP_DB_MAST_DATA_NODE_STB`);

        const bom =
            await cds.run(`SELECT * FROM APP_DB_PVBLL_MAT_STB`);

        return accNode.map(a => {

            const nodeMaster = master
                .filter(m =>
                    m.LOCATION_ID === a.LOCATION_ID &&
                    m.PRODUCT_ID === a.PRODUCT_ID
                )
                .map(node => ({

                    ...node,

                    PV_BOM: bom.filter(b =>
                        b.LOCATION_ID === node.LOCATION_ID &&
                        b.PRODUCT_ID === node.PRODUCT_ID &&
                        b.ACCESS_NODE === node.ACCESS_NODE
                    )

                }));

            return {

                LOCATION_ID: a.LOCATION_ID,
                PRODUCT_ID: a.PRODUCT_ID,
                ACCESS_NODE: a.ACCESS_NODE,
                CHANGED_TIME: a.CHANGED_TIME,
                CHANGED_BY: a.CHANGED_BY,
                CREATED_TIME: a.CREATED_TIME,
                CREATED_BY: a.CREATED_BY,

                NODE_MASTER: nodeMaster

            };

        });

    }
    async function BuildPartialProductPayload() {

        const PROD_HEADER = await cds.run(`
        SELECT *
        FROM APP_DB_PARTIALPRODUCT_HEADER
    `);

        const PROD_ITEMS = await cds.run(`
        SELECT *
        FROM APP_DB_PARTIALPRODUCT_ITEM
    `);

        const LOC_PROD = await cds.run(`
        SELECT *
        FROM APP_DB_LOC_PRODID_STB
    `);


        const partialProducts = [];


        for (const header of PROD_HEADER) {

            const productObj = {

                PRODUCT_ID: header.PRODUCT_ID,
                LOCATION_ID: header.LOCATION_ID,
                REF_PRODID: header.REF_PRODID,
                PRODUCT_TYPE: header.PRODUCT_TYPE,
                PRODUCT_DESC: header.PRODUCT_DESC,

                ITEMS: [],

                LOC_PROD: []

            };


            /*
              Add characteristic items
            */
            productObj.ITEMS = PROD_ITEMS.filter(item =>
                item.PRODUCT_ID === header.PRODUCT_ID &&
                item.LOCATION_ID === header.LOCATION_ID
            ).map(item => ({

                CLASS_NUM: item.CLASS_NUM,
                CHARACTERSTIC_NUM: item.CHAR_NUM,
                CHARACTERISTIC_VALUE: item.CHAR_VALUE

            }));


            /*
              Add location product
            */
            productObj.LOC_PROD = LOC_PROD.filter(loc =>
                loc.PRODUCT_ID === header.PRODUCT_ID &&
                loc.LOCATION_ID === header.LOCATION_ID
            ).map(loc => ({

                LOCATION_ID: loc.LOCATION_ID,
                PRODUCT_ID: loc.PRODUCT_ID,
                LOTSIZE_KEY: loc.LOTSIZE_KEY,
                LOTSIZE: loc.LOT_SIZE,
                PROCUREMENT_TYPE: loc.PROCUREMENT_TYPE,
                PLANNING_STRATEGY: loc.PLANNING_STRATEGY,
                MRP_GROUP: loc.MRP_GROUP,
                MRP_TYPE: loc.MRP_TYPE,
                UOM: loc.UOM

            }));


            partialProducts.push(productObj);

        }


        return partialProducts;

    }

    async function GenerateUrl() {
        var tag = new RegExp('"application_uris"(.*)');
        var uri = vcap_app.match(tag);
        if (uri) {
            var tag1 = new RegExp('"(.*)');
            uri = uri[1].match(tag1);
            let application_uris = "";
            for (let index = 0; index < uri[1].length; index++) {
                if (uri[1][index] != '"') {
                    application_uris = application_uris + uri[1][index];
                }
                else {
                    index = uri[1].length;
                }
            }

            return application_uris;

        }
    }
    

    // async function RunSalesRequest() {
    //     let SALESH = await cds.run('select * from APP_DB_SALESH_STB LIMIT 1;')
    //     if (SALESH.length > 0) {
    //         let SALES_CONFIG = await cds.run(`select * from APP_DB_SALESH_CONFIG_STB where SALES_DOCUMENT = '${SALESH[0].SALES_DOCUMENT}' and SALES_DOCUMENT_ITEM = ${SALESH[0].SALES_DOCUMENT_ITEM};`)
    //         let payload_record = JSON.stringify({
    //             aSalesH: SALESH,
    //             aSalesHConfig: SALES_CONFIG
    //         })
    //         await cds.run(`delete from APP_DB_SALESH_STB where SALES_DOCUMENT = '${SALESH[0].SALES_DOCUMENT}' and SALES_DOCUMENT_ITEM = ${SALESH[0].SALES_DOCUMENT_ITEM};`)
    //         await cds.run(`delete from APP_DB_SALESH_CONFIG_STB where SALES_DOCUMENT = '${SALESH[0].SALES_DOCUMENT}' and SALES_DOCUMENT_ITEM = ${SALESH[0].SALES_DOCUMENT_ITEM};`)
    //         await apiCall(payload_record, SALESH[0].SALES_DOCUMENT, SALESH[0].SALES_DOCUMENT_ITEM)
    //     }
    // }
    async function apiCall(payload, SalesHeaders, req) {
    try {
        var curent_time = await Ext_Process.CURRENT_TIME();

        var intf_payload = {
            INTERAFACE_NAME: 'SALES ORDER INTERFACE',
            INTERFACE_TYPE: "AU",
            CREATED_DATE: (new Date()).toISOString().split('T')[0],
            CREATED_TIME: curent_time
        };

        const token = await Ext_Process.generateBearerToken(req);

        const dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`)
            .replace("cap-servs-mt", "vcplanner-mt");

        const response = await axios.post(
            dominurl + "salesDeltaProcessBatch",
            {
                SALESDATA: JSON.stringify(payload)
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data?.d?.salesDeltaProcess === "SUCCESS") {

            for (const header of SalesHeaders) {

                intf_payload.LOGID = uuidv4();
                intf_payload.MESSAGE = JSON.stringify({
                    SALES_DOCUMENT: header.SALES_DOCUMENT,
                    SALES_DOCUMENT_ITEM: header.SALES_DOCUMENT_ITEM
                });
                intf_payload.STATUS_TYPE = "Success";
                intf_payload.STATUS_CODE = 200;

                await cds.run(
                    INSERT.into("APP_DB_INTERFACELOGINFO")
                        .entries(intf_payload)
                );
            }

        } else {

            for (const header of SalesHeaders) {

                intf_payload.LOGID = uuidv4();
                intf_payload.MESSAGE = JSON.stringify({
                    SALES_DOCUMENT: header.SALES_DOCUMENT,
                    SALES_DOCUMENT_ITEM: header.SALES_DOCUMENT_ITEM
                });
                intf_payload.STATUS_TYPE = "Error";
                intf_payload.STATUS_CODE = 404;

                await cds.run(
                    INSERT.into("APP_DB_INTERFACELOGINFO")
                        .entries(intf_payload)
                );
            }
        }

    } catch (err) {

        console.log(err.message);

        for (const header of SalesHeaders) {

            intf_payload.LOGID = uuidv4();
            intf_payload.MESSAGE = JSON.stringify({
                SALES_DOCUMENT: header.SALES_DOCUMENT,
                SALES_DOCUMENT_ITEM: header.SALES_DOCUMENT_ITEM,
                Error: err.message
            });
            intf_payload.STATUS_TYPE = "Error";
            intf_payload.STATUS_CODE = 404;

            await cds.run(
                INSERT.into("APP_DB_INTERFACELOGINFO")
                    .entries(intf_payload)
            );
        }
    }
}

    // async function apiCall(payload_header, SALESDOC, SALES_DOCUMENT_ITEM) {
    //     try {
    //         var curent_time = await Ext_Process.CURRENT_TIME()
    //         var intf_payload = {
    //             INTERAFACE_NAME: 'SALES ORDER INTERFACE',
    //             INTERFACE_TYPE: "AU",
    //             CREATED_DATE: (new Date()).toISOString().split('T')[0],
    //             CREATED_TIME: curent_time
    //         }
    //         const token = await Ext_Process.generateBearerToken(req);

    //         const dominurl = ("https://" + await GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
    //         const response = await axios.post(
    //             dominurl + "salesDeltaProcess",
    //             { SALESDATA: payload_header },
    //             {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             }
    //         );
    //         if (response.data?.d?.salesDeltaProcess === 'SUCCESS') {
    //             intf_payload['LOGID'] = uuidv4();
    //             intf_payload['MESSAGE'] = JSON.stringify({
    //                 SALES_DOCUMENT: SALESDOC,
    //                 SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM
    //             })
    //             intf_payload['STATUS_TYPE'] = "Success";
    //             intf_payload['STATUS_CODE'] = 200;
    //             await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
    //             RunSalesRequest()
    //         }
    //         else {
    //             intf_payload['LOGID'] = uuidv4();
    //             intf_payload['MESSAGE'] = JSON.stringify({
    //                 SALES_DOCUMENT: SALESDOC,
    //                 SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM
    //             })
    //             intf_payload['STATUS_TYPE'] = "Error";
    //             intf_payload['STATUS_CODE'] = 404;
    //             await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
    //             RunSalesRequest()
    //         }
    //     } catch (err) {
    //         console.error('API call error:', err.message);
    //         RunSalesRequest()
    //         console.log(err)
    //         intf_payload['LOGID'] = uuidv4();
    //         intf_payload['MESSAGE'] = JSON.stringify({
    //             SALES_DOCUMENT: SALESDOC,
    //             SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM,
    //             Error: err.message
    //         })
    //         intf_payload['STATUS_TYPE'] = "Error";
    //         intf_payload['STATUS_CODE'] = 404;
    //         await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
    //     }
    // }
}

