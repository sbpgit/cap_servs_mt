const axios = require('axios');
const vcap_app = process.env.VCAP_APPLICATION;
const { v4: uuidv4 } = require('uuid'); // Import UUID module
var cds = require('@sap/cds');
const { func } = require('@sap/cds/lib/ql/cds-ql');
const jwt = require("jsonwebtoken");
class External_Call {

  constructor() { };
  static async generateBearerToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new Error("Authorization header not found");
    }
    const accessToken = authHeader.replace("Bearer ", "");
    const jwtpayload = jwt.decode(accessToken);
    const subdomain = jwtpayload?.ext_attr?.zdn;
    if (!subdomain) {
        throw new Error("Subdomain not found in JWT");
    }
    let user_provided_credentials = JSON.parse(process.env.config_products)
    let client_id = user_provided_credentials.clientid;
    let client_secret = user_provided_credentials.clientsecret;
    // let TokenUrl = user_provided_credentials.url + "/oauth/token";
    let TokenUrl = user_provided_credentials.url.replace("mttsbpdigital",subdomain) + "/oauth/token";
    const params = new URLSearchParams();

    params.append('grant_type', 'client_credentials');

    params.append('client_id', client_id);

    params.append('client_secret', client_secret);

    const response = await axios.post(TokenUrl, params);

    return response.data.access_token;
  }
  static async onInsertLocation(req, res) {
    try {
      var intf_payload = {
        LOGID: uuidv4(),
        INTERAFACE_NAME: req.INTERFACE,
        INTERFACE_TYPE: req.INTERFACE_TYPE,
        CREATED_DATE: (new Date()).toISOString().split('T')[0],
        CREATED_TIME: await this.CURRENT_TIME()
      }

      let LocationExportFunctions = {
        LocationAutomated: async () => {
          let VcpPayloadLocation = {
            LOCATION_ID: req.data.LOCATION_ID,
            LOCATION_DESC: req.data.LOCATION_DESC,
            LOCATION_TYPE: req.data.LOCATION_TYPE,
            LATITUDE: req.data.LATITUDE,
            LONGITUTE: req.data.LONGITUTE,
            RESERVE_FIELD1: req.data.RESERVE_FIELD1,
            RESERVE_FIELD2: req.data.RESERVE_FIELD2,
            RESERVE_FIELD3: req.data.RESERVE_FIELD3,
            RESERVE_FIELD4: req.data.RESERVE_FIELD4,
            RESERVE_FIELD5: req.data.RESERVE_FIELD5
          }
          const token = await this.generateBearerToken(req);
          let product_payload = {
            LOCATION: [VcpPayloadLocation],
          }
          let dominurl = ("https://" + await this.GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
          let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(product_payload) }, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          })
          intf_payload['MESSAGE'] = JSON.stringify({
            LOCATION_ID: req.data.LOCATION_ID,
            LOCATION_DESC: req.data.LOCATION_DESC
          });
          intf_payload['STATUS_TYPE'] = "SUCCESS";
          intf_payload['STATUS_CODE'] = 200;
          await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
          return {
            "STATUS_CODE": 200
          }
        },
        LocationManual: async () => {
          await cds.run(UPSERT.into('APP_DB_LOCATION_STB').entries(req.data));
          intf_payload['MESSAGE'] = JSON.stringify({
            LOCATION_ID: req.data.LOCATION_ID,
            LOCATION_DESC: req.data.LOCATION_DESC
          });
          intf_payload['STATUS_TYPE'] = "SUCCESS";
          intf_payload['STATUS_CODE'] = 200;
          await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
          return {
            "STATUS_CODE": 200
          }
        },
        LocationPayload: async () => {
          let importantFields = ['LOCATION_ID', 'LOCATION_DESC']
          let empty_fields = [];
          for (let index = 0; index < importantFields.length; index++) {
            const element = importantFields[index];

            if (req.data[element] == "" || element == undefined || element == null) {
              empty_fields.push(element)
            }

          }

          if (empty_fields.length > 0) {
            return {
              STATUS_CODE: 400,
              MissingFields: empty_fields
            }
          } else {
            let LocationResponse = (req.INTERFACE_TYPE == 'M') ? LocationExportFunctions.LocationManual() : LocationExportFunctions.LocationAutomated();

            return LocationResponse
          }

        }
      }

      return LocationExportFunctions.LocationPayload()
    } catch (error) {
      console.log(error.message)
    }
  }
  static async onInsertCustomer(req, res) {
    var intf_payload = {
      LOGID: uuidv4(),
      INTERAFACE_NAME: req.INTERFACE,
      INTERFACE_TYPE: req.INTERFACE_TYPE,
      CREATED_DATE: (new Date()).toISOString().split('T')[0],
      CREATED_TIME: await this.CURRENT_TIME()
    }

    let CustomerExportFunctions = {
      CustomerAutomated: async () => {
        let VcpPayloadCustomer = {
          CUSTOMER_GROUP: req.data.CUSTOMER_GROUP,
          CUSTOMER_DESC: req.data.CUSTOMER_DESC,
          RESERVE_FIELD1: req.data.RESERVE_FIELD1,
          RESERVE_FIELD2: req.data.RESERVE_FIELD2,
          RESERVE_FIELD3: req.data.RESERVE_FIELD3,
          RESERVE_FIELD4: req.data.RESERVE_FIELD4,
          RESERVE_FIELD5: req.data.RESERVE_FIELD5
        }
        const token = await this.generateBearerToken(req);
        let product_payload = {
          CUSTOMERGROUP: [VcpPayloadCustomer],
        }
        let dominurl = ("https://" + await this.GenerateUrl() + `/v2/catalog/`).replace('cap-servs-mt', 'vcplanner-mt');
        let create_transactions = await axios.post(dominurl + "productData", { PRODUCTDATA: JSON.stringify(product_payload) }, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        intf_payload['MESSAGE'] = JSON.stringify({
          CUSTOMER_GROUP: req.data.CUSTOMER_GROUP,
          CUSTOMER_DESC: req.data.CUSTOMER_DESC
        });
        intf_payload['STATUS_TYPE'] = "SUCCESS";
        intf_payload['STATUS_CODE'] = 200;
        await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
        return {
          STATUS_CODE: 200
        }
      },
      CustomerManual: async () => {
        await cds.run(UPSERT.into('APP_DB_CUSTOMER_GROUP').entries(req.data));
        intf_payload['MESSAGE'] = JSON.stringify({
          CUSTOMER_GROUP: req.data.CUSTOMER_GROUP,
          CUSTOMER_DESC: req.data.CUSTOMER_DESC
        });
        intf_payload['STATUS_TYPE'] = "SUCCESS";
        intf_payload['STATUS_CODE'] = 200;
        await cds.run(INSERT.into("APP_DB_INTERFACELOGINFO").entries(intf_payload))
        return {
          STATUS_CODE: 200
        }
      },
      CustomerPayload: async () => {
        let importantFields = ['CUSTOMER_GROUP']
        let empty_fields = [];
        for (let index = 0; index < importantFields.length; index++) {
          const element = importantFields[index];

          if (req.data[element] == "" || element == undefined || element == null) {
            empty_fields.push(element)
          }

        }
        if (empty_fields.length > 0) {
          return {
            STATUS_CODE: 400,
            MissingFields: empty_fields
          }
        } else {
          let CustResponse = (req.INTERFACE_TYPE == 'M') ? CustomerExportFunctions.CustomerManual() : CustomerExportFunctions.CustomerAutomated();
          return CustResponse
        }

      }
    }

    return CustomerExportFunctions.CustomerPayload()

  }
  static async CLASS_CHAR(req) {

    let { CLASS } = req.data

    let ClassCharacFunctions = {
      ClassCharPyldConstruct: (CLASS_STRUC) => {
        let class_c = [];
        let class_chara = [];
        let character_values = []

        for (const order of CLASS_STRUC) {

          let ors = {
            INT_CLS_NUMBER: (order.INT_CLS_NUMBER == 0) ? "" : order.INT_CLS_NUMBER + "",
            CLASS_TYPE: order.CLASS_TYPE,
            CLASS: order.CLASS,
            ZDESC: order.ZDESC,
            DELETE_FLAG: order.DELETE_FLAG,
            CHANGED_DATE: order.CHANGED_DATE === "" || order.CHANGED_DATE === undefined || order.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : order.CHANGED_DATE,
            CHANGED_TIME: order.CHANGED_TIME === "" || order.CHANGED_TIME === undefined || order.CHANGED_TIME === "00:00:00" ? "10:24:07" : order.CHANGED_TIME,
            CHANGED_BY: order.CHANGED_BY == undefined || order.CHANGED_BY == null ? "" : order.CHANGED_BY,
            CREATED_DATE: order.CREATED_DATE === "" || order.CREATED_DATE === undefined || order.CREATED_DATE == "0000-00-00" ? "2025-01-01" : order.CREATED_DATE,
            CREATED_TIME: order.CREATED_TIME === "" || order.CREATED_TIME === undefined || order.CREATED_TIME == "00:00:00" ? "10:24:07" : order.CREATED_TIME,
            CREATED_BY: order.CREATED_BY == undefined || order.CREATED_BY == null ? "" : order.CREATED_BY
          }

          class_c.push(ors)

          for (const item of order.CLASS_CHAR) {
            let classch = {
              INT_CLS_NUMBER: order.INT_CLS_NUMBER + "",
              INT_CHAR: item.INT_CHAR + "",
              CHAR_NAME: item.CHAR_NAME,
              CHAR_DESC: item.CHAR_DESC,
              CHAR_GROUP: item.CHAR_GROUP,
              CHAR_DATATYPE: item.CHAR_DATATYPE,
              CHAR_CATEGORY: item.CHAR_CATEGORY,
              MULTI_CHAR: item.MULTI_CHAR,
              DELETE_FLAG: item.DELETE_FLAG,
              CHANGED_DATE: item.CHANGED_DATE === "" || item.CHANGED_DATE === undefined || item.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : item.CHANGED_DATE,
              CHANGED_TIME: item.CHANGED_TIME === "" || item.CHANGED_TIME === undefined || item.CHANGED_TIME === "00:00:00" ? "10:24:07" : item.CHANGED_TIME,
              CHANGED_BY: item.CHANGED_BY == undefined || item.CHANGED_BY == null ? "" : item.CHANGED_BY,
              CREATED_DATE: item.CREATED_DATE === "" || item.CREATED_DATE === undefined || item.CREATED_DATE == "0000-00-00" ? "2025-01-01" : item.CREATED_DATE,
              CREATED_TIME: item.CREATED_TIME === "" || item.CREATED_TIME === undefined || item.CREATED_TIME == "00:00:00" ? "10:24:07" : item.CREATED_TIME,
              CREATED_BY: item.CREATED_BY == undefined || item.CREATED_BY == null ? "" : item.CREATED_BY
            }

            class_chara.push(classch)

            for (const item1 of item.CHAR_VALUES) {

              let charv = {
                INT_CHAR: item.INT_CHAR + "",
                CHAR_VALUE: item1.CHAR_VALUE,
                CHAR_VDESC: item1.CHAR_VDESC,
                DELETE_FLAG: item1.DELETE_FLAG,
                CHANGED_DATE: item1.CHANGED_DATE === "" || item1.CHANGED_DATE === undefined || item1.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : item1.CHANGED_DATE,
                CHANGED_TIME: item1.CHANGED_TIME === "" || item1.CHANGED_TIME === undefined || item1.CHANGED_TIME === "00:00:00" ? "10:24:07" : item1.CHANGED_TIME,
                CHANGED_BY: item1.CHANGED_BY == undefined || item1.CHANGED_BY == null ? "" : item1.CHANGED_BY,
                CREATED_DATE: item1.CREATED_DATE === "" || item1.CREATED_DATE === undefined || item1.CREATED_DATE == "0000-00-00" ? "2025-01-01" : item1.CREATED_DATE,
                CREATED_TIME: item1.CREATED_TIME === "" || item1.CREATED_TIME === undefined || item1.CREATED_TIME == "00:00:00" ? "10:24:07" : item1.CREATED_TIME,
                CREATED_BY: item1.CREATED_BY == undefined || item1.CREATED_BY == null ? "" : item1.CREATED_BY
              }

              character_values.push(charv)

            }

          }
        }
        return {
          CLASS: class_c,
          CLASS_CHAR: class_chara,
          CHARAC_VALUE: character_values
        }
      },
      ClassCheck: (Classes) => {

        let CLS_IMP = ['INT_CLS_NUMBER', 'CLASS_TYPE', 'CLASS', 'ZDESC']
        let missingFields = [];
        for (let index = 0; index < Classes.length; index++) {
          const obj = Classes[index];

          for (let index = 0; index < CLS_IMP.length; index++) {
            const field = CLS_IMP[index];
            if (obj[field] == "" || obj[field] == undefined || obj[field] == null) {
              missingFields.push(field)
            }
          }

        }

        return missingFields.length > 0 ? [...new Set(missingFields)] : [];

      },
      CLASS_CHARAC_CHECK: (CLASS_CHAR) => {

        let CHAR_DATA = ['CHAR_NAME', 'CHAR_DESC', 'CHAR_DATATYPE']
        let missingFields = [];

        for (let index = 0; index < CLASS_CHAR.length; index++) {
          const obj = CLASS_CHAR[index];
          for (let index = 0; index < CHAR_DATA.length; index++) {
            const field = CHAR_DATA[index];
            if (obj[field] == "" || obj[field] == undefined || obj[field] == null) {
              missingFields.push(field)
            }
          }

        }
        return missingFields.length > 0 ? [...new Set(missingFields)] : [];
      },
      CHARAC_VALUES_CHECK: (CHARAC_VALUE) => {
        let missingFields = [];
        let CHAR_VALUE = ['INT_CHAR', 'CHAR_VALUE', 'CHAR_VDESC']
        for (let index = 0; index < CHARAC_VALUE.length; index++) {
          const obj = CHARAC_VALUE[index];
          for (let index = 0; index < CHAR_VALUE.length; index++) {
            const field = CHAR_VALUE[index];
            if (obj[field] == "" || obj[field] == undefined || obj[field] == null) {
              missingFields.push(field)
            }
          }

        }
        return missingFields.length > 0 ? [...new Set(missingFields)] : [];
      },
      CLASS_RESPONSE: (CLASS_STRUC) => {

        let AllResponses = [];

        for (let index = 0; index < CLASS_STRUC.length; index++) {

          let { CLASS, CLASS_CHAR, CHARAC_VALUE } =
            ClassCharacFunctions.ClassCharPyldConstruct([CLASS_STRUC[index]]);

          let ClassChk = ClassCharacFunctions.ClassCheck(CLASS);
          let CLASS_CHAR_CHK = ClassCharacFunctions.CLASS_CHARAC_CHECK(CLASS_CHAR);
          let CHAR_VALUES_CHK = ClassCharacFunctions.CHARAC_VALUES_CHECK(CHARAC_VALUE);

          if (ClassChk.length == 0 && CLASS_CHAR_CHK.length == 0 && CHAR_VALUES_CHK.length == 0) {
            AllResponses.push({
              INT_CLS_NUMBER: CLASS[0].INT_CLS_NUMBER,
              CLASS: CLASS,
              CLASS_CHAR: CLASS_CHAR,
              CHAR_VALUES: CHARAC_VALUE, // ⚠️ also fix variable name here
              STATUS_CODE: 200
            });
          } else {
            AllResponses.push({
              INT_CLS_NUMBER: CLASS?.[0]?.INT_CLS_NUMBER,
              STATUS_CODE: 400,
              MESSAGE: `
${ClassChk.length > 0 ? `Field Values Missing: ${ClassChk}` : ''}
${CLASS_CHAR_CHK.length > 0 ? `Field Values Missing: ${CLASS_CHAR_CHK}` : ''}
${CHAR_VALUES_CHK.length > 0 ? `Field Values Missing: ${CHAR_VALUES_CHK}` : ''}
        `.trim()
            });
          }
        }

        return AllResponses; // ✅ THIS IS THE FIX
      }
    }

    return ClassCharacFunctions.CLASS_RESPONSE(CLASS)

  }
  static async CURRENT_TIME() {
    const date = new Date();
    const indiaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hours = String(indiaTime.getHours()).padStart(2, '0');
    const minutes = String(indiaTime.getMinutes()).padStart(2, '0');
    const seconds = String(indiaTime.getSeconds()).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return formattedTime
  }
  static async PartialProdStrucVaild(PPPayload) {
    let AllResponses = [];
    let PartialProductPayload = {
      Partial_Payload_Manupulation: (PPPayload) => {
        var Productsh = [];
        var Productsc = [];
        var location_product = [];

        for (const Product of PPPayload) {
          let ProdH = {
            PRODUCT_ID: Product.PRODUCT_ID,
            LOCATION_ID: Product.LOCATION_ID,
            PRODUCT_DESC: Product.PRODUCT_DESC,
            PRODUCT_TYPE: Product.PRODUCT_TYPE,
            REF_PRODID: Product.REF_PRODID,
            DELETE_FLAG: Product.DELETE_FLAG,
            CHANGED_DATE: Product.CHANGED_DATE === "" || Product.CHANGED_DATE === undefined ? "2025-01-01" : Product.CHANGED_DATE,
            CREATED_DATE: Product.CREATED_DATE === "" || Product.CREATED_DATE === undefined ? "2025-01-01" : Product.CREATED_DATE,
            CHANGED_TIME: Product.CHANGED_TIME === "" || Product.CHANGED_TIME === undefined ? "10:24:07" : Product.CHANGED_TIME,
            CREATED_TIME: Product.CREATED_TIME === "" || Product.CREATED_TIME === undefined ? "10:24:07" : Product.CREATED_TIME
          }
          Productsh.push(ProdH)

          for (const ProdC of Product.ITEMS) {
            let ProductConf = {
              PRODUCT_ID: Product.PRODUCT_ID,
              LOCATION_ID: Product.LOCATION_ID,
              CLASS_NUM: (ProdC.CLASS_NUM == 0) ? "" : ProdC.CLASS_NUM == 0,
              CHARACTERSTIC_NUM: ProdC.CHARACTERSTIC_NUM,
              VALUE_NUM: ProdC.VALUE_NUM,
              CHARACTERISTIC_VALUE: ProdC.CHARACTERISTIC_VALUE,
              DELETE_FLAG: Product.DELETE_FLAG,
              CHANGED_DATE: ProdC.CHANGED_DATE === "" || ProdC.CHANGED_DATE === undefined ? "2025-01-01" : ProdC.CHANGED_DATE,
              CREATED_DATE: ProdC.CREATED_DATE === "" || ProdC.CREATED_DATE === undefined ? "2025-01-01" : ProdC.CREATED_DATE,
              CHANGED_TIME: ProdC.CHANGED_TIME === "" || ProdC.CHANGED_TIME === undefined ? "10:24:07" : ProdC.CHANGED_TIME,
              CREATED_TIME: ProdC.CREATED_TIME === "" || ProdC.CREATED_TIME === undefined ? "10:24:07" : ProdC.CREATED_TIME
            }
            Productsc.push(ProductConf)
          }
          for (const LP of Product.LOC_PROD) {
            let location_prod = {
              LOCATION_ID: LP.LOCATION_ID,
              PRODUCT_ID: LP.PRODUCT_ID,
              LOTSIZE_KEY: LP.LOTSIZE_KEY,
              PROCUREMENT_TYPE: LP.PROCUREMENT_TYPE,
              LOTSIZE: LP.LOTSIZE,
              PLANNING_STRATEGY: LP.PLANNING_STRATEGY,
              DELETE_FLAG: LP.DELETE_FLAG,
              MRP_GROUP: LP.MRP_GROUP,
              MRP_TYPE: LP.MRP_TYPE,
              CHANGED_DATE: LP.CHANGED_DATE === "" || LP.CHANGED_DATE === undefined ? "2025-01-01" : LP.CHANGED_DATE,
              CREATED_DATE: LP.CREATED_DATE === "" || LP.CREATED_DATE === undefined ? "2025-01-01" : LP.CREATED_DATE,
              CHANGED_TIME: LP.CHANGED_TIME === "" || LP.CHANGED_TIME === undefined ? "10:24:07" : LP.CHANGED_TIME,
              CREATED_TIME: LP.CREATED_TIME === "" || LP.CREATED_TIME === undefined ? "10:24:07" : LP.CREATED_TIME
            }
            location_product.push(location_prod)
          }

        }

        return {
          ProdHeader: Productsh,
          ProdConf: Productsc,
          LocationProd: location_product
        }
      },
      Header_Vaildation: (Header) => {
        const HimportantFields = ["LOCATION_ID", "PRODUCT_ID", "PRODUCT_DESC", "PRODUCT_TYPE", "REF_PRODID"];
        let P_H = [];
        for (let key of HimportantFields) {
          const value = Header?.[0][key];
          if (value === undefined || value === "" || value === null) {
            P_H.push(key);
          }
        }
        return P_H.length > 0 ? [...new Set(P_H)] : [];
      },
      Items_Vaildation: (items) => {
        let P_Items = [];

        let importantFields = ["CLASS_NUM", "CHARACTERSTIC_NUM"]
        const item = items || [];

        for (let i = 0; i < item.length; i++) {
          let LPO = item[i];
          for (let index = 0; index < importantFields.length; index++) {
            let element = importantFields[index];
            if (LPO[element] === undefined || LPO[element] === "" || LPO[element] === null) {
              P_Items.push(element);
            }
          }
        }

        return P_Items.length > 0 ? [...new Set(P_Items)] : [];

      },
      loc_prod_vaildation: (locprod) => {
        const LPimportantFields = ["LOCATION_ID", "PRODUCT_ID"];
        let LPV = [];
        const locProdArray = locprod || [];
        for (let i = 0; i < locProdArray.length; i++) {
          const LPO = locProdArray[i];
          for (let key of LPimportantFields) {
            const value = LPO[key];
            if (value === undefined || value === "" || value === null) {
              LPV.push(key);
            }
          }
        }

        return LPV.length > 0 ? [...new Set(LPV)] : [];
      },
      FinalResponse: (PPPayload) => {
        for (let index = 0; index < PPPayload.length; index++) {
          const PartialProduct = PPPayload[index];

          let { ProdHeader, ProdConf, LocationProd } = PartialProductPayload.Partial_Payload_Manupulation([PartialProduct])
          let Product_H_Check = PartialProductPayload.Header_Vaildation(ProdHeader);
          let Product_Items_Check = PartialProductPayload.Items_Vaildation(ProdConf);
          let LOC_PROD_Check = PartialProductPayload.loc_prod_vaildation(LocationProd);
          if (Product_H_Check.length == 0 && Product_Items_Check.length == 0 && LOC_PROD_Check.length == 0) {
            AllResponses.push({
              PRODUCT_ID: ProdHeader[0].PRODUCT_ID,
              LOCATION_ID: ProdHeader[0].LOCATION_ID,
              STATUS_CODE: 200,
              PROD_HEADER: ProdHeader,
              PROD_ITEMS: ProdConf,
              LOC_PROD: LocationProd
            })
          } else {
            AllResponses.push({
              PRODUCT_ID: ProdHeader[0].PRODUCT_ID,
              LOCATION_ID: ProdHeader[0].LOCATION_ID,
              STATUS_CODE: 400,
              MESSAGE: `
${Product_H_Check.length > 0 ? `Field Values Missing: ${Product_H_Check}` : ''}
${Product_Items_Check.length > 0 ? `Field Values Missing: ${Product_Items_Check}` : ''}
${LOC_PROD_Check.length > 0 ? `Field Values Missing: ${LOC_PROD_Check}` : ''}
        `.trim()
            })
          }

        }
        return AllResponses;
      }
    }

    return PartialProductPayload.FinalResponse(PPPayload)
  }
  static async PRODUCT_EXT_VAILD(req) {

    let vaildationsyntax = {
      PRODUCT_PAYLOAD: (productStructure) => {

        let products = []
        let location_product = []
        let products_classes = []

        for (const product of productStructure) {
          let prod = {
            PRODUCT_ID: product.PRODUCT_ID,
            PRODUCT_DESC: product.PRODUCT_DESC,
            PRODUCT_TYPE: product.PRODUCT_TYPE,
            PRODUCT_FAMILY: product.PRODUCT_FAMILY,
            PRODUCT_GROUP: product.PRODUCT_GROUP,
            PRODUCT_MODEL: product.PRODUCT_MODEL,
            PRODUCT_MODEL_RANGE: product.PRODUCT_MODEL_RANGE,
            PRODUCT_SERIES: product.PRODUCT_SERIES,
            RESERVE_FIELD1: product.RESERVE_FIELD1,
            RESERVE_FIELD2: product.RESERVE_FIELD2,
            RESERVE_FIELD3: product.RESERVE_FIELD3,
            RESERVE_FIELD4: product.RESERVE_FIELD4,
            RESERVE_FIELD5: product.RESERVE_FIELD5,
            DELETE_FLAG: product.DELETE_FLAG,
            CHANGED_DATE: product.CHANGED_DATE === "" || product.CHANGED_DATE === undefined ? "2025-01-01" : product.CHANGED_DATE,
            CHANGED_TIME: product.CHANGED_TIME === "" || product.CHANGED_TIME === undefined ? "10:24:07" : product.CHANGED_TIME,
            CHANGED_BY: product.CHANGED_BY,
            CREATED_DATE: product.CHANGED_DATE === "" || product.CHANGED_DATE === undefined ? "2025-01-01" : product.CHANGED_DATE,
            CREATED_TIME: product.CHANGED_TIME === "" || product.CHANGED_TIME === undefined ? "10:24:07" : product.CHANGED_TIME,
            CREATED_BY: product.CREATED_BY
          }
          products.push(prod)

          for (const lp of product.LOC_PROD) {
            let lpo = {
              LOCATION_ID: lp.LOCATION_ID,
              PRODUCT_ID: product.PRODUCT_ID,
              LOTSIZE_KEY: lp.LOTSIZE_KEY,
              PROCUREMENT_TYPE: lp.PROCUREMENT_TYPE,
              LOTSIZE: lp.LOTSIZE + "",
              PLANNING_STRATEGY: lp.PLANNING_STRATEGY,
              DELETE_FLAG: lp.DELETE_FLAG,
              MRP_GROUP: lp.MRP_GROUP,
              MRP_TYPE: lp.MRP_TYPE,
              CHANGED_DATE: lp.CHANGED_DATE === "" || lp.CHANGED_DATE === undefined ? "2025-01-01" : lp.CHANGED_DATE,
              CHANGED_TIME: lp.CHANGED_TIME === "" || lp.CHANGED_TIME === undefined ? "10:24:07" : lp.CHANGED_TIME,
              CHANGED_BY: lp.CHANGED_BY,
              CREATED_DATE: lp.CHANGED_DATE === "" || lp.CHANGED_DATE === undefined ? "2025-01-01" : lp.CHANGED_DATE,
              CREATED_TIME: lp.CHANGED_TIME === "" || lp.CHANGED_TIME === undefined ? "10:24:07" : lp.CHANGED_TIME,
              CREATED_BY: lp.CREATED_BY
            }
            location_product.push(lpo)

          }
          for (const pc of product.PROD_CLS) {
            let pco = {
              PRODUCT_ID: product.PRODUCT_ID,
              CLINT: (pc.CLINT == 0) ? "" : pc.CLINT + "",
              DELETE_FLAG: pc.DELETE_FLAG,
              CHANGED_DATE: pc.CHANGED_DATE === "" || pc.CHANGED_DATE === undefined ? "2025-01-01" : pc.CHANGED_DATE,
              CHANGED_TIME: pc.CHANGED_TIME === "" || pc.CHANGED_TIME === undefined ? "10:24:07" : pc.CHANGED_TIME,
              CHANGED_BY: pc.CHANGED_BY,
              CREATED_DATE: pc.CHANGED_DATE === "" || pc.CHANGED_DATE === undefined ? "2025-01-01" : pc.CHANGED_DATE,
              CREATED_TIME: pc.CHANGED_TIME === "" || pc.CHANGED_TIME === undefined ? "10:24:07" : pc.CHANGED_TIME,
              CREATED_BY: pc.CREATED_BY
            }
            products_classes.push(pco)
          }

        }
        return {
          PRODUCTS: products,
          LOCATION_PRODUCT: location_product,
          PRODUCT_CLASS: products_classes
        }
      },
      ProductFlag: (PRODS) => {
        const ImportantFields = ["PRODUCT_ID", "PRODUCT_DESC", "PRODUCT_TYPE"];
        let missingFields = [];

        for (let index = 0; index < PRODS.length; index++) {
          const element = PRODS[index];
          for (let key of ImportantFields) {
            if (element[key] === undefined || element[key] === "" || element[key] === null) {
              missingFields.push(key);
            }
          }
        }

        return missingFields.length > 0 ? [...new Set(missingFields)] : [];
      },
      LOC_PROD: (LOCPRODS) => {
        const LPimportantFields = ["LOCATION_ID", "MRP_TYPE"];
        let LPV = [];

        for (let i = 0; i < LOCPRODS.length; i++) {
          const LPO = LOCPRODS[i];
          for (let key of LPimportantFields) {
            if (LPO[key] === undefined || LPO[key] === "" || LPO[key] === null) {
              LPV.push(key);
            }
          }
        }

        return LPV.length > 0 ? [...new Set(LPV)] : [];
      },
      PROD_CLS: (PRODCLASSES) => {
        let missingFields = [];

        for (let i = 0; i < PRODCLASSES.length; i++) {
          const CLINT = PRODCLASSES[i]['CLINT'];
          if (CLINT === undefined || CLINT === "" || CLINT === null) {
            missingFields.push("CLINT");
          }
        }

        return missingFields.length > 0 ? [...new Set(missingFields)] : [];
      },
      PROD_RESPONSE: (PROD_STRUC) => {
        let FProdResponse = [];
        for (let index = 0; index < PROD_STRUC.length; index++) {

          let { PRODUCTS, LOCATION_PRODUCT, PRODUCT_CLASS } = vaildationsyntax.PRODUCT_PAYLOAD([PROD_STRUC[index]])

          let PRODUCT_CHECK = vaildationsyntax.ProductFlag(PRODUCTS)
          let PROD_LOC_CHECK = vaildationsyntax.LOC_PROD(LOCATION_PRODUCT)
          let PRODUCT_CLASS_CHECK = vaildationsyntax.PROD_CLS(PRODUCT_CLASS)

          if (PRODUCT_CHECK.length == 0 && PROD_LOC_CHECK.length == 0 && PRODUCT_CLASS_CHECK.length == 0) {
            FProdResponse.push({
              STATUS_CODE: 200,
              PRODUCT_ID: PROD_STRUC[index].PRODUCT_ID,
              PRODUCTS: PRODUCTS,
              LOCATION_PRODUCT: LOCATION_PRODUCT,
              PRODUCT_CLASS: PRODUCT_CLASS
            })
          }
          else {
            FProdResponse.push({
              PRODUCT_ID: PROD_STRUC[index].PRODUCT_ID,
              STATUS_CODE: 400,
              MissingFields: `${(PRODUCT_CHECK.length > 0) ? `Product Field Values Missing : [${PRODUCT_CHECK}]` : ""} ${(PROD_LOC_CHECK.length > 0) ? `LocationProduct Field Values Missing : [${PROD_LOC_CHECK}]` : ""}  ${(PRODUCT_CLASS_CHECK.length > 0) ? `Productclass Field Values Missing : [${PRODUCT_CLASS_CHECK}]` : ""}`
            })
          }

        }

        return FProdResponse
      }
    };

    return vaildationsyntax.PROD_RESPONSE(req.data.PRODUCT)
  }
  static async IPPE_EXT_VAILD(req) {
    try {
      let ippeFunc = {
        ippe_payload: (ippePayload) => {
          let prdaccnode = [];
          let master_data = [];
          let pvbll_mat = [];
          for (const ippeData of ippePayload) {
            let ippeObj = {
              LOCATION_ID: ippeData.LOCATION_ID,
              PRODUCT_ID: ippeData.PRODUCT_ID,
              ACCESS_NODE: ippeData.ACCESS_NODE,
              DELETE_FLAG: ippeData.DELETE_FLAG,
              CHANGED_DATE: ippeData.CHANGED_DATE === "" || ippeData.CHANGED_DATE === undefined ? "2025-01-01" : ippeData.CHANGED_DATE,
              CHANGED_TIME: ippeData.CHANGED_TIME === "" || ippeData.CHANGED_TIME === undefined ? "10:24:07" : ippeData.CHANGED_TIME,
              CHANGED_BY: ippeData.CHANGED_BY,
              CREATED_DATE: ippeData.CREATED_DATE === "" || ippeData.CREATED_DATE === undefined ? "2025-01-01" : ippeData.CREATED_DATE,
              CREATED_TIME: ippeData.CREATED_TIME === "" || ippeData.CREATED_TIME === undefined ? "10:24:07" : ippeData.CREATED_TIME,
              CREATED_BY: ippeData.CREATED_BY
            }
            prdaccnode.push(ippeObj)

            for (const master of ippeData.NODE_MASTER) {
              let masterObj = {
                CHILD_NODE: master.CHILD_NODE,
                PARENT_NODE: master.PARENT_NODE,
                LOWERLIMIT: master.LOWERLIMIT,
                UPPERLIMIT: master.UPPERLIMIT,
                ACCESS_NODE: master.ACCESS_NODE,
                NODE_TYPE: master.NODE_TYPE,
                NODE_DESC: master.NODE_DESC,
                DELETE_FLAG: master.DELETE_FLAG,
                CHANGED_DATE: master.CHANGED_DATE === "" || master.CHANGED_DATE === undefined ? "2025-01-01" : master.CHANGED_DATE,
                CHANGED_TIME: master.CHANGED_TIME === "" || master.CHANGED_TIME === undefined ? "10:24:07" : master.CHANGED_TIME,
                CHANGED_BY: master.CHANGED_BY,
                CREATED_DATE: master.CREATED_DATE === "" || master.CREATED_DATE === undefined ? "2025-01-01" : master.CREATED_DATE,
                CREATED_TIME: master.CREATED_TIME === "" || master.CREATED_TIME === undefined ? "10:24:07" : master.CREATED_TIME,
                CREATED_BY: master.CREATED_BY
              }
              master_data.push(masterObj)

              for (const PVBLL_MAT of master.PV_BOM) {

                let pvbllMatObj = {
                  LOCATION_ID: PVBLL_MAT.LOCATION_ID,
                  PRODUCT_ID: PVBLL_MAT.PRODUCT_ID,
                  ITM_NUM: PVBLL_MAT.ITM_NUM,
                  COMPONENT: PVBLL_MAT.COMPONENT,
                  STRUC_NODE: PVBLL_MAT.STRUC_NODE,
                  DELETE_FLAG: PVBLL_MAT.DELETE_FLAG,
                  CHANGED_DATE: PVBLL_MAT.CHANGED_DATE === "" || PVBLL_MAT.CHANGED_DATE === undefined ? "2025-01-01" : PVBLL_MAT.CHANGED_DATE,
                  CHANGED_TIME: PVBLL_MAT.CHANGED_TIME === "" || PVBLL_MAT.CHANGED_TIME === undefined ? "10:24:07" : PVBLL_MAT.CHANGED_TIME,
                  CHANGED_BY: PVBLL_MAT.CHANGED_BY,
                  CREATED_DATE: PVBLL_MAT.CREATED_DATE === "" || PVBLL_MAT.CREATED_DATE === undefined ? "2025-01-01" : PVBLL_MAT.CREATED_DATE,
                  CREATED_TIME: PVBLL_MAT.CREATED_TIME === "" || PVBLL_MAT.CREATED_TIME === undefined ? "10:24:07" : PVBLL_MAT.CREATED_TIME,
                  CREATED_BY: PVBLL_MAT.CREATED_BY
                }

                pvbll_mat.push(pvbllMatObj)
              }
            }
          }

          return {
            PRDACCNODE: prdaccnode,
            MASTER_DATA: master_data,
            PVBLL_MAT: pvbll_mat
          }
        },
        prodaccenode_check: (PRDACCNODE) => {
          let importantfields = ['PRODUCT_ID', 'LOCATION_ID'];
          let missingFields = [];
          for (let index = 0; index < PRDACCNODE.length; index++) {
            const element = PRDACCNODE[index];
            for (let key of importantfields) {
              if (element[key] === undefined || element[key] === "" || element[key] === null) {
                missingFields.push(key)
              }
            }
          }

         return missingFields.length > 0 ? [...new Set(missingFields)] : [];
        },
        master_data_check: (MASTER_DATA) => {
          let importantfields = ['CHILD_NODE', 'PARENT_NODE'];
          let missingFields = [];
          for (let index = 0; index < MASTER_DATA.length; index++) {
            const element = MASTER_DATA[index];
            for (let key of importantfields) {
              if (element[key] === undefined || element[key] === "" || element[key] === null) {
                missingFields.push(key)
              }
            }
          }
          return missingFields.length > 0 ? [...new Set(missingFields)] : [];
        },
        pvbll_mat_check: (PVBLL_MAT) => {
          let importantfields = ['LOCATION_ID', 'PRODUCT_ID', 'ITM_NUM', 'COMPONENT'];
          let missingFields = [];
          for (let index = 0; index < PVBLL_MAT.length; index++) {
            const element = PVBLL_MAT[index];
            for (let key of importantfields) {
              if (element[key] === undefined || element[key] === "" || element[key] === null) {
                missingFields.push(key)
              }
            }
          }
          return missingFields.length > 0 ? [...new Set(missingFields)] : [];
        },
        final_response: (IPPE_STRUC) => {
          let AllResponses = [];
          for (let index = 0; index < IPPE_STRUC.length; index++) {
            let { PRDACCNODE, MASTER_DATA, PVBLL_MAT } = ippeFunc.ippe_payload([IPPE_STRUC[index]])
            let prodaccenode_check = ippeFunc.prodaccenode_check(PRDACCNODE);
            let master_data_check = ippeFunc.master_data_check(MASTER_DATA);
            let pvbll_mat_check = ippeFunc.pvbll_mat_check(PVBLL_MAT);

            if (prodaccenode_check.length == 0 && master_data_check.length == 0 && pvbll_mat_check.length == 0) {
              AllResponses.push({
                STATUS_CODE: 200,
                LOCATION_ID: IPPE_STRUC[index].LOCATION_ID,
                PRODUCT_ID: IPPE_STRUC[index].PRODUCT_ID,
                PRDACCNODE: PRDACCNODE,
                MASTER_DATA: MASTER_DATA,
                PVBLL_MAT: PVBLL_MAT
              })
            }
            else {
              AllResponses.push({
                LOCATION_ID: IPPE_STRUC[index].LOCATION_ID,
                PRODUCT_ID: IPPE_STRUC[index].PRODUCT_ID,
                STATUS_CODE: 400,
                MESSAGE: `
${prodaccenode_check.length > 0 ? `ProductAccNode Field Values Missing : [${prodaccenode_check}]` : ""} 
${master_data_check.length > 0 ? `MasterData Field Values Missing : [${master_data_check}]` : ""}
${pvbll_mat_check.length > 0 ? `PVBLL_MAT Field Values Missing : [${pvbll_mat_check}]` : ""}
        `.trim()
              })
            }
          }

          return AllResponses;
        }
      }

      return ippeFunc.final_response(req.data.IPPE)


    } catch (error) {
      console.log(error.message)
    }
  }
  static async DERV_EXT_VAILD(req) {
    try {
      let DervFunc = {
        DervCheck: (DERV_ARR) => {
          let importantfields = ['RECORD_TYPE', 'PRODUCT_ID','VALID_FROM','DEPENDENCY','LINE_NO'];
          let missingFields = [];
          for (let index = 0; index < DERV_ARR.length; index++) {
            const element = DERV_ARR[index];
            for (let key of importantfields) {
              if (element[key] === undefined || element[key] === "" || element[key] === null) {
                missingFields.push(key)
              }
            }
          }
          return missingFields.length > 0 ? [...new Set(missingFields)] : [];
        },
        final_response: (DERV_STRUC) => {
          let AllResponses = [];
          for (let index = 0; index < DERV_STRUC.length; index++) {
            let DervCheck = DervFunc.DervCheck([DERV_STRUC[index]])

            if (DervCheck.length == 0) {
              AllResponses.push({
                STATUS_CODE: 200,
                PRODUCT_ID: DERV_STRUC[index].PRODUCT_ID,
                DERV_DATA: [DERV_STRUC[index]]
              })
            }
            else {
              AllResponses.push({
                PRODUCT_ID: DERV_STRUC[index].PRODUCT_ID,
                STATUS_CODE: 400,
                MESSAGE: `${DervCheck.length > 0 ? `Field Values Missing : [${DervCheck}]` : ""} `.trim()
              })
            }
          }
          return AllResponses;
        }
      }
      return DervFunc.final_response(req.data.DER)
    } catch (error) {
      console.log(error.message)
    }
  }
  static async SALES_EXT_V(arrayOfObjects) {
    let SalesExtFunctions = {
      SalesH: (arrayOfObjects) => {
        let AllSalesResponse = [];
        let Maparray = arrayOfObjects.map((head) => (
          {
            ...head,
            MANDT: "100",
            SCHEDULE_LINE_NO: head.SCHEDULE_LINE_NO === undefined ? 0 : head.SCHEDULE_LINE_NO,
            PRODUCT_ID: head.PRODUCT_ID === undefined ? "" : head.PRODUCT_ID,
            MATERIAL_VARIANT: head.MATERIAL_VARIANT === undefined ? "" : head.MATERIAL_VARIANT,
            REASON_4REJECTION: head.REASON_4REJECTION === undefined ? "" : head.REASON_4REJECTION,
            UOM: head.UOM === undefined ? "" : head.UOM,
            CONFIRMED_QTY: head.CONFIRMED_QTY === undefined ? 0 : head.CONFIRMED_QTY,
            QTY_UNITS: head.QTY_UNITS === undefined ? 0 : head.QTY_UNITS,
            NET_VALUE: head.NET_VALUE === undefined ? "" : head.NET_VALUE,
            CUSTOMER_GROUP: head.CUSTOMER_GROUP === undefined ? "" : head.CUSTOMER_GROUP,
            LOCATION_ID: head.LOCATION_ID === undefined ? "" : head.LOCATION_ID,
            SALES_ORG: head.SALES_ORG === undefined ? "" : head.SALES_ORG,
            DISTR_CHANNEL: head.DISTR_CHANNEL === undefined ? "" : head.DISTR_CHANNEL,
            DIVISION: head.DIVISION === undefined ? "" : head.DIVISION,
            SAL_DOCU_TYPE: head.SAL_DOCU_TYPE === undefined ? "" : head.SAL_DOCU_TYPE,
            ITEM_CREATED_DATE: head.ITEM_CREATED_DATE === "" || head.ITEM_CREATED_DATE === undefined ? "2025-01-01" : head.ITEM_CREATED_DATE,
            ITEM_CHANGE_DATE: head.ITEM_CHANGE_DATE === "" || head.ITEM_CHANGE_DATE === undefined || head.ITEM_CHANGE_DATE == "0000-00-00" ? "2025-01-01" : head.ITEM_CHANGE_DATE,
            OPEN_ORDER: head.OPEN_ORDER === undefined ? "" : head.OPEN_ORDER,
            CHARG: head.CHARG === undefined ? "" : head.CHARG,
            IBP_CUSTOMER: head.IBP_CUSTOMER === undefined ? "" : head.IBP_CUSTOMER,
            NOT_PLANNING: head.NOT_PLANNING === undefined ? "" : head.NOT_PLANNING,
            ON_HAND_STOCK: head.ON_HAND_STOCK === undefined ? "" : head.ON_HAND_STOCK,
            IN_TRANSIT: head.IN_TRANSIT === undefined ? "" : head.IN_TRANSIT,
            SHIP_FROM_LOC: head.SHIP_FROM_LOC === undefined ? "" : head.SHIP_FROM_LOC,
            RESERVE_FIELD1: head.RESERVE_FIELD1 === undefined ? "" : head.RESERVE_FIELD1,
            RESERVE_FIELD2: head.RESERVE_FIELD2 === undefined ? "" : head.RESERVE_FIELD2,
            RESERVE_FIELD3: head.RESERVE_FIELD3 === undefined ? "" : head.RESERVE_FIELD3,
            STOCK_LOC: head.STOCK_LOC === undefined ? "" : head.STOCK_LOC,
            TRANS_TO_LOC: head.TRANS_TO_LOC === undefined ? "" : head.TRANS_TO_LOC,
            TRANS_FROM_LOC: head.TRANS_FROM_LOC === undefined ? "" : head.TRANS_FROM_LOC,
            DELETE_FLAG: head.DELETE_FLAG === undefined ? "" : head.DELETE_FLAG,
            CHANGED_DATE: head.CHANGED_DATE === "" || head.CHANGED_DATE === undefined ? "2025-01-01" : head.CHANGED_DATE,
            CREATED_DATE: head.CREATED_DATE === "" || head.CREATED_DATE === undefined ? "2025-01-01" : head.CREATED_DATE,
            CHANGED_TIME: head.CHANGED_TIME === "" || head.CHANGED_TIME === undefined ? "10:24:07" : head.CHANGED_TIME,
            CREATED_TIME: head.CREATED_TIME === "" || head.CREATED_TIME === undefined ? "10:24:07" : head.CREATED_TIME
          }
        ))

        arrayOfObjects.forEach((header, index) => {
          delete Maparray[index].ITEMS;

          let missingFields = [];
          const importantFields = [
            "PRODUCT_ID",
            "UOM",
            "CONFIRMED_QTY",
            "QTY_UNITS",
            "PROD_AVAILABILITY_DT",
            "NET_VALUE",
            "CUSTOMER_GROUP",
            "LOCATION_ID",
            "SALES_ORG",
            "DISTR_CHANNEL",
            "DIVISION",
            "SAL_DOCU_TYPE",
            "OPEN_ORDER"
          ];
          for (const field of importantFields) {
            const value = header[field];
            const isEmpty = value === "" || value === undefined || value === null;

            if (field === "PROD_AVAILABILITY_DT") {
              const isValidDate = !isNaN(new Date(value).getTime());
              if (isEmpty || !isValidDate) {
                missingFields.push(field);
              }
            } else if (isEmpty) {
              missingFields.push(field);
            }
          }

          if (missingFields.length > 0) {
            let errResponse = {
              SALESDOC: header.SALES_DOCUMENT,
              SALESDOC_ITEM: header.SALES_DOCUMENT_ITEM,
              missingFields: missingFields
            }
            AllSalesResponse.push(errResponse)
          }
          else {
            let SucessResponse = {
              SALESDOC: header.SALES_DOCUMENT,
              SALESDOC_ITEM: header.SALES_DOCUMENT_ITEM,
              SALESH: [Maparray[index]],
              missingFields: []
            }
            AllSalesResponse.push(SucessResponse)
          }

        })
        return AllSalesResponse;
      },
      SalesConfig: (arrayOfObjects) => {

        let AllConfigResponses = [];
        for (let index = 0; index < arrayOfObjects.length; index++) {
          const { SALES_DOCUMENT, SALES_DOCUMENT_ITEM, ITEMS, PRODUCT_ID, PROD_AVAILABILITY_DT } = arrayOfObjects[index];
          if (ITEMS.length == 0) {
            AllConfigResponses.push({
              SALESDOCUMENT: SALES_DOCUMENT,
              SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM,
              ConfigItems: [],
              MissingFields: ['Missing Config']
            })
          } else {
            const configTest = ITEMS.map((item) => ({
              ...item,
              SALES_DOCUMENT: SALES_DOCUMENT,
              SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM,
              CHARACTERSTIC: item.CHARACTERSTIC === undefined ? "" : item.CHARACTERSTIC,
              CHARACTERSTIC_VALUE: item.CHARACTERSTIC_VALUE === undefined ? "" : item.CHARACTERSTIC_VALUE,
              PRODUCT_ID: PRODUCT_ID,
              PROD_AVAILABILITY_DT: PROD_AVAILABILITY_DT,
              CLASS: item.CLASS === undefined ? "" : item.CLASS,
              CLASS_NUM: item.CLASS_NUM === undefined ? "" : item.CLASS_NUM,
              CHARACTERSTIC_NUM: item.CHARACTERSTIC_NUM === undefined ? "" : item.CHARACTERSTIC_NUM,
              VALUE_NUM: item.VALUE_NUM === undefined ? "" : item.VALUE_NUM,
              CHANGED_DATE: item.CHANGED_DATE === "" ? "2025-01-01" : item.CHANGED_DATE,
              CREATED_DATE: item.CREATED_DATE === "" ? "2025-01-01" : item.CREATED_DATE,
              CHANGED_TIME: item.CHANGED_TIME === "" ? "10:24:07" : item.CHANGED_TIME,
              CREATED_TIME: item.CREATED_TIME === "" ? "10:24:07" : item.CREATED_TIME
            }))
            let MissingConfigItems = [];
            for (let lt = 0; lt < configTest.length; lt++) {
              const ConfItem = configTest[lt]
              let missingfieldsCon = [];
              let configImportantFields = [
                "CHARACTERSTIC_NUM",
                "CHARACTERSTIC_VALUE",
                "CLASS"
              ]
              for (let field of configImportantFields) {
                const Cvalue = ConfItem[field]
                if (Cvalue == "") {
                  missingfieldsCon.push(field)
                }
              }
              if (missingfieldsCon.length > 0) {
                MissingConfigItems.push({
                  index: lt,
                  missingfields: missingfieldsCon
                })
              }
            }
            AllConfigResponses.push({
              SALESDOCUMENT: SALES_DOCUMENT,
              SALES_DOCUMENT_ITEM: SALES_DOCUMENT_ITEM,
              ConfigItems: configTest,
              MissingFields: MissingConfigItems
            })
          }
        }
        return AllConfigResponses
      },
      SalesFResponses: () => {
        var AllSalesOrderResponses = [];
        var SalesOrder = {
          SALESDOC: SalesExtFunctions.SalesH(arrayOfObjects),
          SALESCONFIG: SalesExtFunctions.SalesConfig(arrayOfObjects)
        }
        for (let index = 0; index < SalesOrder.SALESDOC.length; index++) {
          const salesh = SalesOrder.SALESDOC[index];
          const salesconfig = SalesOrder.SALESCONFIG[index];

          if ((salesh.missingFields.length == 0) && (salesconfig.MissingFields.length == 0)) {
            AllSalesOrderResponses.push(
              {
                statusCode: 200,
                SALESH: salesh.SALESH,
                SALESCONFIG: salesconfig.ConfigItems
              })
          }
          else {
            AllSalesOrderResponses.push(
              {
                type: "ValidationError",
                SalesDoc: salesh.SALESDOC,
                SALESDOC_ITEM: salesh.SALESDOC_ITEM,
                SaleshMissingFields: salesh.missingFields,
                SaleshConfigMissingFields: salesconfig.MissingFields,
                statusCode: 400
              }
            );
          }
        }

        return AllSalesOrderResponses;
      }
    }
    return SalesExtFunctions.SalesFResponses()
  }
  static async GenerateUrl() {
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
  static async BOM_EXT_VAILD(req) {
    var BOMSTRUCTURE = req.data.BOM;
    let vaildationsyntax = {
      BOM_PAYLOAD: (BOMSTRUCTURE) => {
        let BOM_HEADER = []
        let BOM_OD = []
        let BOM_OB_DEP = []
        let LOC_PROD = []
        let PROD_CLASS = []

        for (const item of BOMSTRUCTURE) {
          let bomH = {
            MANDT: "100",
            LOCATION_ID: item.LOCATION_ID,
            COUNTER: item.COUNTER,
            MAT_PARENT: item.MAT_PARENT,
            MAT_CHILD: item.MAT_CHILD,
            VALID_FROM: item.VALID_FROM,
            VALID_TO: item.VALID_TO,
            CHILD_LOC: item.CHILD_LOC,
            COMP_TYPE: item.COMP_TYPE,
            PHANTOM_IND: item.PHANTOM_IND,
            CONFIGURABLE: item.CONFIGURABLE,
            CLASS_FLG: item.CLASS_FLG,
            PROD_DESC: item.PROD_DESC,
            COMPONENT_QTY: item.COMPONENT_QTY,
            CRITICAL_ASM: item.CRITICAL_ASM,
            COMPONENT_FLAG: item.COMPONENT_FLAG,
            CHANGE_NO: item.CHANGE_NO,
            DELETE_FLAG: item.DELETE_FLAG,
            BOM_PROCESS: item.BOM_PROCESS,
            TIMESTAMP: item.TIMESTAMP,
            CHANGED_DATE: item.CHANGED_DATE === "" || item.CHANGED_DATE === undefined || item.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : item.CHANGED_DATE,
            CHANGED_TIME: item.CHANGED_TIME === "" || item.CHANGED_TIME === undefined || item.CHANGED_TIME === "00-00-00" ? "10:24:07" : item.CHANGED_TIME,
            CHANGED_BY: item.CHANGED_BY == undefined || item.CHANGED_BY == null ? "" : item.CHANGED_BY,
            CREATED_DATE: item.CREATED_DATE === "" || item.CREATED_DATE === undefined || item.CREATED_DATE == "0000-00-00" ? "2025-01-01" : item.CREATED_DATE,
            CREATED_TIME: item.CREATED_TIME === "" || item.CREATED_TIME === undefined || item.CREATED_TIME == "00-00-00" ? "10:24:07" : item.CREATED_TIME,
            CREATED_BY: item.CREATED_BY == undefined || item.CREATED_BY == null ? "" : item.CREATED_BY
          }
          BOM_HEADER.push(bomH)

          for (const itemOd of item.BOM_OD) {
            let bomOdObj = {
              MANDT: "100",
              LOCATION_ID: item.LOCATION_ID,
              COUNTER: item.COUNTER,
              MAT_PARENT: item.MAT_PARENT,
              MAT_CHILD: item.MAT_CHILD,
              DEPENDENCY: itemOd.DEPENDENCY,
              VALID_FROM: item.VALID_FROM,
              VALID_TO: item.VALID_TO,
              DEP_DESC: itemOd.DEP_DESC,
              CHANGE_NO: item.CHANGE_NO,
              DELETE_FLAG: itemOd.DELETE_FLAG,
              CHANGED_DATE: itemOd.CHANGED_DATE === "" || itemOd.CHANGED_DATE === undefined || itemOd.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemOd.CHANGED_DATE,
              CHANGED_TIME: itemOd.CHANGED_TIME === "" || itemOd.CHANGED_TIME === undefined || itemOd.CHANGED_TIME === "00-00-00" ? "10:24:07" : itemOd.CHANGED_TIME,
              CHANGED_BY: itemOd.CHANGED_BY == undefined || itemOd.CHANGED_BY == null ? "" : itemOd.CHANGED_BY,
              CREATED_DATE: itemOd.CREATED_DATE === "" || itemOd.CREATED_DATE === undefined || itemOd.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemOd.CREATED_DATE,
              CREATED_TIME: itemOd.CREATED_TIME === "" || itemOd.CREATED_TIME === undefined || itemOd.CREATED_TIME == "00-00-00" ? "10:24:07" : itemOd.CREATED_TIME,
              CREATED_BY: itemOd.CREATED_BY == undefined || itemOd.CREATED_BY == null ? "" : itemOd.CREATED_BY
            }
            BOM_OD.push(bomOdObj);
          }
          for (var itemDep of item.BOM_OD_DEP) {
            let bomDepObj = {
              MANDT: "100",
              DEPENDENCY: itemDep.DEPENDENCY,
              LINE_NO: itemDep.LINE_NO,
              LINE: itemDep.LINE,
              DEPENDENCY_TYPE: itemDep.DEPENDENCY_TYPE,
              DELETE_FLAG: itemDep.DELETE_FLAG,
              CHANGED_DATE: itemDep.CHANGED_DATE === "" || itemDep.CHANGED_DATE === undefined || itemDep.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemDep.CHANGED_DATE,
              CHANGED_TIME: itemDep.CHANGED_TIME === "" || itemDep.CHANGED_TIME === undefined || itemDep.CHANGED_TIME === "00-00-00" ? "10:24:07" : itemDep.CHANGED_TIME,
              CHANGED_BY: itemDep.CHANGED_BY == undefined || itemDep.CHANGED_BY == null ? "" : itemDep.CHANGED_BY,
              CREATED_DATE: itemDep.CREATED_DATE === "" || itemDep.CREATED_DATE === undefined || itemDep.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemDep.CREATED_DATE,
              CREATED_TIME: itemDep.CREATED_TIME === "" || itemDep.CREATED_TIME === undefined || itemDep.CREATED_TIME == "00-00-00" ? "10:24:07" : itemDep.CREATED_TIME,
              CREATED_BY: itemDep.CREATED_BY == undefined || itemDep.CREATED_BY == null ? "" : itemDep.CREATED_BY
            }
            BOM_OB_DEP.push(bomDepObj)

          }

          for (var itemLp of item.LOC_PROD) {
            let lpo = {
              MANDT: "100",
              LOCATION_ID: item.LOCATION_ID,
              PRODUCT_ID: itemLp.PRODUCT_ID,
              LOTSIZE_KEY: itemLp.LOTSIZE_KEY,
              PROCUREMENT_TYPE: itemLp.PROCUREMENT_TYPE,
              LOTSIZE: itemLp.LOTSIZE + "",
              PLANNING_STRATEGY: itemLp.PLANNING_STRATEGY,
              DELETE_FLAG: itemLp.DELETE_FLAG,
              MRP_GROUP: itemLp.MRP_GROUP,
              MRP_TYPE: itemLp.MRP_TYPE,
              CHANGED_DATE: itemLp.CHANGED_DATE === "" || itemLp.CHANGED_DATE === undefined || itemLp.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemLp.CHANGED_DATE,
              CHANGED_TIME: itemLp.CHANGED_TIME === "" || itemLp.CHANGED_TIME === undefined || itemLp.CHANGED_TIME === "00-00-00" ? "10:24:07" : itemLp.CHANGED_TIME,
              CHANGED_BY: itemLp.CHANGED_BY == undefined || itemLp.CHANGED_BY == null ? "" : itemLp.CHANGED_BY,
              CREATED_DATE: itemLp.CREATED_DATE === "" || itemLp.CREATED_DATE === undefined || itemLp.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemLp.CREATED_DATE,
              CREATED_TIME: itemLp.CREATED_TIME === "" || itemLp.CREATED_TIME === undefined || itemLp.CREATED_TIME == "00-00-00" ? "10:24:07" : itemLp.CREATED_TIME,
              CREATED_BY: itemLp.CREATED_BY == undefined || itemLp.CREATED_BY == null ? "" : itemLp.CREATED_BY
            }
            LOC_PROD.push(lpo)

          }


          for (const itemPC of item.PROD_CLASS) {
            let pco = {
              MANDT: "100",
              PRODUCT_ID: itemPC.PRODUCT_ID,
              CLINT: itemPC.CLINT + "",
              DELETE_FLAG: itemPC.DELETE_FLAG,
              CHANGED_DATE: itemPC.CHANGED_DATE === "" || itemPC.CHANGED_DATE === undefined || itemPC.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemPC.CHANGED_DATE,
              CHANGED_TIME: itemPC.CHANGED_TIME === "" || itemPC.CHANGED_TIME === undefined || itemPC.CHANGED_TIME === "00-00-00" ? "10:24:07" : itemPC.CHANGED_TIME,
              CHANGED_BY: itemPC.CHANGED_BY == undefined || itemPC.CHANGED_BY == null ? "" : itemPC.CHANGED_BY,
              CREATED_DATE: itemPC.CREATED_DATE === "" || itemPC.CREATED_DATE === undefined || itemPC.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemPC.CREATED_DATE,
              CREATED_TIME: itemPC.CREATED_TIME === "" || itemPC.CREATED_TIME === undefined || itemPC.CREATED_TIME == "00-00-00" ? "10:24:07" : itemPC.CREATED_TIME,
              CREATED_BY: itemPC.CREATED_BY == undefined || itemPC.CREATED_BY == null ? "" : itemPC.CREATED_BY
            }
            PROD_CLASS.push(pco)
          }

        }
        return {
          BOM_HEADER: BOM_HEADER,
          BOM_OD: BOM_OD,
          BOM_OB_DEP: BOM_OB_DEP,
          LOC_PROD: LOC_PROD,
          PROD_CLASS: PROD_CLASS

        }
      },
      BOM_Header: (BOMSTRUCTURE) => {
        const ImportantFields = ["LOCATION_ID", "COUNTER", "MAT_PARENT", "MAT_CHILD", "VALID_FROM"];
        let tResponses = [];
        for (let index = 0; index < BOMSTRUCTURE.length; index++) {
          let missingFields = [];
          const BomHeader = BOMSTRUCTURE[index];
          for (let key of ImportantFields) {
            const value = BomHeader[key];
            if (value === undefined || value === "" || value === null) {
              missingFields.push(key);
            }
          }
          if (missingFields.length > 0) {
            tResponses.push({
              LOCATION_ID: BomHeader?.LOCATION_ID || '',
              COUNTER: BomHeader?.COUNTER || '',
              MAT_PARENT: BomHeader?.MAT_PARENT || "",
              MAT_CHILD: BomHeader?.MAT_CHILD || "",
              MISSING_FIELD: [... new Set(missingFields)]
            })
          }
        }
        return tResponses.length > 0 ? tResponses : [];
      },
      BOM_OD: (BOMSTRUCTURE) => {
        let ODimportantFields = ["DEPENDENCY"];
        let ODV = [];

        for (let index = 0; index < BOMSTRUCTURE.length; index++) {
          const { BOM_OD, LOCATION_ID, COUNTER, MAT_PARENT, MAT_CHILD } = BOMSTRUCTURE[index];
          for (let i = 0; i < BOM_OD.length; i++) {
            const ODObj = BOM_OD[i];
            let missingFields = [];

            for (let key of ODimportantFields) {
              const value = ODObj[key];
              if (value === undefined || value === "" || value === null) {
                missingFields.push(key);
              }
            }

            if (missingFields.length > 0) {
              ODV.push({
                LOCATION_ID: LOCATION_ID,
                COUNTER: COUNTER,
                MAT_PARENT: MAT_PARENT,
                MAT_CHILD: MAT_CHILD,
                MISSING_FIELD: [... new Set(missingFields)]
              });
            }
          }
        }
        return ODV.length > 0 ? ODV : [];
      },
      BOM_OD_DEP: (BOMSTRUCTURE) => {
        const ODDepimportantFields = ["DEPENDENCY", "LINE_NO"];
        let ODDepV = [];
        for (let index = 0; index < BOMSTRUCTURE.length; index++) {
          const { BOM_OD_DEP, LOCATION_ID, COUNTER, MAT_PARENT, MAT_CHILD } = BOMSTRUCTURE[index];

          for (let i = 0; i < BOM_OD_DEP.length; i++) {
            const ODDepObj = BOM_OD_DEP[i];
            let missingFields = [];
            for (let key of ODDepimportantFields) {
              const value = ODDepObj[key];
              if (value === undefined || value === "" || value === null) {
                missingFields.push(key);
              }
            }

            if (missingFields.length > 0) {
              ODDepV.push({
                LOCATION_ID: LOCATION_ID,
                COUNTER: COUNTER,
                MAT_PARENT: MAT_PARENT,
                MAT_CHILD: MAT_CHILD,
                MISSING_FIELD: [... new Set(missingFields)]
              })
            }
          }
        }
        return ODDepV.length > 0 ? ODDepV : []
      },
      LOC_PROD: (BOMSTRUCTURE) => {
        const locProdimportantFields = ["LOCATION_ID", "PRODUCT_ID"];
        let lp = [];
        for (let index = 0; index < BOMSTRUCTURE.length; index++) {
          const { LOC_PROD, LOCATION_ID, COUNTER, MAT_PARENT, MAT_CHILD } = BOMSTRUCTURE[index];
          for (let i = 0; i < LOC_PROD.length; i++) {
            const lpObj = LOC_PROD[i];
            let missingFields = [];

            for (let key of locProdimportantFields) {
              const value = lpObj[key];
              if (value === undefined || value === "" || value === null) {
                missingFields.push(key);
              }
            }
            if (missingFields.length > 0) {
              lp.push({
                LOCATION_ID: LOCATION_ID,
                COUNTER: COUNTER,
                MAT_PARENT: MAT_PARENT,
                MAT_CHILD: MAT_CHILD,
                MISSING_FIELD: [... new Set(missingFields)]
              })
            }
          }
        }
        return lp.length > 0 ? lp : [];
      },
      PROD_CLASS: (BOMSTRUCTURE) => {
        const prodClimportantFields = ["PRODUCT_ID", "CLINT"];
        let PC = [];
        for (let index = 0; index < BOMSTRUCTURE.length; index++) {
          const { PROD_CLASS, LOCATION_ID, COUNTER, MAT_PARENT, MAT_CHILD } = BOMSTRUCTURE[index];
          for (let i = 0; i < PROD_CLASS.length; i++) {
            const pcObj = PROD_CLASS[i];
            let missingFields = [];
            for (let key of prodClimportantFields) {
              const value = pcObj[key];
              if (value === undefined || value === "" || value === null) {
                missingFields.push(key);
              }
            }
            if (missingFields.length > 0) {
              PC.push({
                LOCATION_ID: LOCATION_ID,
                COUNTER: COUNTER,
                MAT_PARENT: MAT_PARENT,
                MAT_CHILD: MAT_CHILD,
                MISSING_FIELD: [... new Set(missingFields)]
              });
            }
          }
        }
        return PC.length > 0 ? PC : [];
      }
    };
    // return vaildationsyntax.BOM_PAYLOAD(BOMSTRUCTURE)

    let getBomHeaderVaild = vaildationsyntax.BOM_Header(BOMSTRUCTURE);
    let getBOMOD = vaildationsyntax.BOM_OD(BOMSTRUCTURE);
    let getBOMODDEP = vaildationsyntax.BOM_OD_DEP(BOMSTRUCTURE);
    let getLOCPROD = vaildationsyntax.LOC_PROD(BOMSTRUCTURE);
    let getProdClass = vaildationsyntax.PROD_CLASS(BOMSTRUCTURE);
    let TBomResponse = []

    for (let index = 0; index < BOMSTRUCTURE.length; index++) {
      const { LOCATION_ID, COUNTER, MAT_PARENT, MAT_CHILD } = BOMSTRUCTURE[index];

      let BomCheck = getBomHeaderVaild.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).length > 0 ? getBomHeaderVaild.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).filter(i => i.MISSING_FIELD.length > 0) : [];
      let BomODCheck = getBOMOD.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).length > 0 ? getBOMOD.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).filter(i => i.MISSING_FIELD.length > 0) : [];
      let BomODEPCheck = getBOMODDEP.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).length > 0 ? getBOMODDEP.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).filter(i => i.MISSING_FIELD.length > 0) : [];
      let LPCheck = getLOCPROD.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).length > 0 ? getLOCPROD.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).filter(i => i.MISSING_FIELD.length > 0) : [];
      let PCCheck = getProdClass.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).length > 0 ? getProdClass.filter(i => i.LOCATION_ID == LOCATION_ID && i.COUNTER == COUNTER && i.MAT_CHILD == MAT_CHILD && i.MAT_PARENT == MAT_PARENT).filter(i => i.MISSING_FIELD.length > 0) : [];

      if (BomCheck.length == 0 && BomODCheck.length == 0 && BomODEPCheck.length == 0 && LPCheck.length == 0 && PCCheck.length == 0) {
        TBomResponse.push({
          LOCATION_ID: LOCATION_ID,
          COUNTER: COUNTER,
          MAT_PARENT: MAT_PARENT,
          MAT_CHILD: MAT_CHILD,
          STATUS_CODE: 200,
          BOM_P: vaildationsyntax.BOM_PAYLOAD([BOMSTRUCTURE[index]])
        })
      }
      else {
        TBomResponse.push({
          LOCATION_ID: LOCATION_ID,
          COUNTER: COUNTER,
          MAT_PARENT: MAT_PARENT,
          MAT_CHILD: MAT_CHILD,
          STATUS_CODE: 400,
          MESSAGE: `${BomCheck.length > 0}?${BomCheck}:'' ${BomODCheck.length > 0}?${BomODCheck}:'' ${BomODEPCheck.length > 0}?${BomODEPCheck}:'' ${LPCheck.length > 0}?${LPCheck}:'' ${PCCheck.length > 0}?${PCCheck}:''`
        })
      }
    }
    return TBomResponse
  }
  static async BOM_EXT_VAILD1(req) {
    var BOMSTRUCTURE = req.data.BOM;
    let vaildationsyntax = {
      BOM_PAYLOAD: (BOMSTRUCTURE) => {
        let BOM_HEADER = []
        let BOM_OD = []
        let BOM_OB_DEP = []
        let LOC_PROD = []
        let PROD_CLASS = []

        for (const item of BOMSTRUCTURE) {
          let bomH = {
            MANDT: "100",
            LOCATION_ID: item.LOCATION_ID,
            COUNTER: item.COUNTER,
            MAT_PARENT: item.MAT_PARENT,
            MAT_CHILD: item.MAT_CHILD,
            VALID_FROM: item.VALID_FROM,
            VALID_TO: item.VALID_TO,
            CHILD_LOC: item.CHILD_LOC,
            COMP_TYPE: item.COMP_TYPE,
            PHANTOM_IND: item.PHANTOM_IND,
            CONFIGURABLE: item.CONFIGURABLE,
            CLASS_FLG: item.CLASS_FLG,
            PROD_DESC: item.PROD_DESC,
            COMPONENT_QTY: item.COMPONENT_QTY,
            UOM: item.UOM,
            CRITICAL_ASM: item.CRITICAL_ASM,
            COMPONENT_FLAG: item.COMPONENT_FLAG,
            CHANGE_NO: item.CHANGE_NO,
            DELETE_FLAG: item.DELETE_FLAG,
            BOM_PROCESS: item.BOM_PROCESS,
            TIMESTAMP: item.TIMESTAMP,
            CHANGED_DATE: item.CHANGED_DATE === "" || item.CHANGED_DATE === undefined || item.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : item.CHANGED_DATE,
            CHANGED_TIME: item.CHANGED_TIME === "" || item.CHANGED_TIME === undefined || item.CHANGED_TIME == "00:00:00" ? "10:24:07" : item.CHANGED_TIME,
            CHANGED_BY: item.CHANGED_BY == undefined || item.CHANGED_BY == null ? "" : item.CHANGED_BY,
            CREATED_DATE: item.CREATED_DATE === "" || item.CREATED_DATE === undefined || item.CREATED_DATE == "0000-00-00" ? "2025-01-01" : item.CREATED_DATE,
            CREATED_TIME: item.CREATED_TIME === "" || item.CREATED_TIME === undefined || item.CREATED_TIME == "00:00:00" ? "10:24:07" : item.CREATED_TIME,
            CREATED_BY: item.CREATED_BY == undefined || item.CREATED_BY == null ? "" : item.CREATED_BY
          }
          BOM_HEADER.push(bomH)

          for (const itemOd of item.BOM_OD) {
            let bomOdObj = {
              MANDT: "100",
              LOCATION_ID: item.LOCATION_ID,
              COUNTER: item.COUNTER,
              MAT_PARENT: item.MAT_PARENT,
              MAT_CHILD: item.MAT_CHILD,
              DEPENDENCY: itemOd.DEPENDENCY,
              VALID_FROM: item.VALID_FROM,
              VALID_TO: item.VALID_TO,
              DEP_DESC: itemOd.DEP_DESC,
              CHANGE_NO: item.CHANGE_NO,
              DELETE_FLAG: itemOd.DELETE_FLAG,
              CHANGED_DATE: itemOd.CHANGED_DATE === "" || itemOd.CHANGED_DATE === undefined || itemOd.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemOd.CHANGED_DATE,
              CHANGED_TIME: itemOd.CHANGED_TIME === "" || itemOd.CHANGED_TIME === undefined || itemOd.CHANGED_TIME == "00:00:00" ? "10:24:07" : itemOd.CHANGED_TIME,
              CHANGED_BY: itemOd.CHANGED_BY == undefined || itemOd.CHANGED_BY == null ? "" : itemOd.CHANGED_BY,
              CREATED_DATE: itemOd.CREATED_DATE === "" || itemOd.CREATED_DATE === undefined || itemOd.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemOd.CREATED_DATE,
              CREATED_TIME: itemOd.CREATED_TIME === "" || itemOd.CREATED_TIME === undefined || itemOd.CREATED_TIME == "00:00:00" ? "10:24:07" : itemOd.CREATED_TIME,
              CREATED_BY: itemOd.CREATED_BY == undefined || itemOd.CREATED_BY == null ? "" : itemOd.CREATED_BY
            }
            BOM_OD.push(bomOdObj);
          }
          for (var itemDep of item.BOM_OD_DEP) {
            let bomDepObj = {
              MANDT: "100",
              DEPENDENCY: itemDep.DEPENDENCY,
              LINE_NO: itemDep.LINE_NO,
              LINE: itemDep.LINE,
              DEPENDENCY_TYPE: itemDep.DEPENDENCY_TYPE,
              DELETE_FLAG: itemDep.DELETE_FLAG,
              CHANGED_DATE: itemDep.CHANGED_DATE === "" || itemDep.CHANGED_DATE === undefined || itemDep.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemDep.CHANGED_DATE,
              CHANGED_TIME: itemDep.CHANGED_TIME === "" || itemDep.CHANGED_TIME === undefined || itemDep.CHANGED_TIME == "00:00:00" ? "10:24:07" : itemDep.CHANGED_TIME,
              CHANGED_BY: itemDep.CHANGED_BY == undefined || itemDep.CHANGED_BY == null ? "" : itemDep.CHANGED_BY,
              CREATED_DATE: itemDep.CREATED_DATE === "" || itemDep.CREATED_DATE === undefined || itemDep.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemDep.CREATED_DATE,
              CREATED_TIME: itemDep.CREATED_TIME === "" || itemDep.CREATED_TIME === undefined || itemDep.CREATED_TIME == "00:00:00" ? "10:24:07" : itemDep.CREATED_TIME,
              CREATED_BY: itemDep.CREATED_BY == undefined || itemDep.CREATED_BY == null ? "" : itemDep.CREATED_BY
            }
            BOM_OB_DEP.push(bomDepObj)

          }

          for (var itemLp of item.LOC_PROD) {
            let lpo = {
              MANDT: "100",
              LOCATION_ID: item.LOCATION_ID,
              PRODUCT_ID: itemLp.PRODUCT_ID,
              LOTSIZE_KEY: itemLp.LOTSIZE_KEY,
              PROCUREMENT_TYPE: itemLp.PROCUREMENT_TYPE,
              LOTSIZE: itemLp.LOTSIZE + "",
              PLANNING_STRATEGY: itemLp.PLANNING_STRATEGY,
              DELETE_FLAG: itemLp.DELETE_FLAG,
              MRP_GROUP: itemLp.MRP_GROUP,
              MRP_TYPE: itemLp.MRP_TYPE,
              CHANGED_DATE: itemLp.CHANGED_DATE === "" || itemLp.CHANGED_DATE === undefined || itemLp.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemLp.CHANGED_DATE,
              CHANGED_TIME: itemLp.CHANGED_TIME === "" || itemLp.CHANGED_TIME === undefined || itemLp.CHANGED_TIME == "00:00:00" ? "10:24:07" : itemLp.CHANGED_TIME,
              CHANGED_BY: itemLp.CHANGED_BY == undefined || itemLp.CHANGED_BY == null ? "" : itemLp.CHANGED_BY,
              CREATED_DATE: itemLp.CREATED_DATE === "" || itemLp.CREATED_DATE === undefined || itemLp.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemLp.CREATED_DATE,
              CREATED_TIME: itemLp.CREATED_TIME === "" || itemLp.CREATED_TIME === undefined || itemLp.CREATED_TIME == "00:00:00" ? "10:24:07" : itemLp.CREATED_TIME,
              CREATED_BY: itemLp.CREATED_BY == undefined || itemLp.CREATED_BY == null ? "" : itemLp.CREATED_BY
            }
            LOC_PROD.push(lpo)

          }


          for (const itemPC of item.PROD_CLASS) {
            let pco = {
              MANDT: "100",
              PRODUCT_ID: itemPC.PRODUCT_ID,
              CLINT: itemPC.CLINT + "",
              DELETE_FLAG: itemPC.DELETE_FLAG,
              CHANGED_DATE: itemPC.CHANGED_DATE === "" || itemPC.CHANGED_DATE === undefined || itemPC.CHANGED_DATE == "0000-00-00" ? "2025-01-01" : itemPC.CHANGED_DATE,
              CHANGED_TIME: itemPC.CHANGED_TIME === "" || itemPC.CHANGED_TIME === undefined || itemPC.CHANGED_TIME == "00:00:00" ? "10:24:07" : itemPC.CHANGED_TIME,
              CHANGED_BY: itemPC.CHANGED_BY == undefined || itemPC.CHANGED_BY == null ? "" : itemPC.CHANGED_BY,
              CREATED_DATE: itemPC.CREATED_DATE === "" || itemPC.CREATED_DATE === undefined || itemPC.CREATED_DATE == "0000-00-00" ? "2025-01-01" : itemPC.CREATED_DATE,
              CREATED_TIME: itemPC.CREATED_TIME === "" || itemPC.CREATED_TIME === undefined || itemPC.CREATED_TIME == "00:00:00" ? "10:24:07" : itemPC.CREATED_TIME,
              CREATED_BY: itemPC.CREATED_BY == undefined || itemPC.CREATED_BY == null ? "" : itemPC.CREATED_BY
            }
            PROD_CLASS.push(pco)
          }

        }
        return {
          BOM_HEADER: BOM_HEADER,
          BOM_OD: BOM_OD,
          BOM_OB_DEP: BOM_OB_DEP,
          LOC_PROD: LOC_PROD,
          PROD_CLASS: PROD_CLASS

        }
      },
      BOM_Header: (Headers) => {
        const ImportantFields = ["LOCATION_ID", "COUNTER", "MAT_PARENT", "MAT_CHILD", "VALID_FROM"];
        let missingFields = [];
        const BomHeader = Headers[0];
        for (let key of ImportantFields) {
          const value = BomHeader[key];
          if (value === undefined || value === "" || value === null) {
            missingFields.push(key);
          }
        }
        return missingFields.length > 0 ? [...Set(missingFields)] : [];
      },
      BOM_OD: (BOMOD) => {
        let ODimportantFields = ["DEPENDENCY"];
        let missingFields = [];
        for (let i = 0; i < BOMOD.length; i++) {
          const ODObj = BOMOD[i];
          for (let key of ODimportantFields) {
            const value = ODObj[key];
            if (value === undefined || value === "" || value === null) {
              missingFields.push(key);
            }
          }
        }
        return missingFields.length > 0 ? [... new Set(missingFields)] : [];
      },
      BOM_OD_DEP: (BOM_OD_DEPS) => {
        const ODDepimportantFields = ["DEPENDENCY", "LINE_NO"];
        let missingFields = [];
        for (let i = 0; i < BOM_OD_DEPS.length; i++) {
          const ODDepObj = BOM_OD_DEPS[i];
          for (let key of ODDepimportantFields) {
            const value = ODDepObj[key];
            if (value === undefined || value === "" || value === null) {
              missingFields.push(key);
            }
          }
        }

        return missingFields.length > 0 ? [... new Set(missingFields)] : []
      },
      LOC_PROD: (LOCPRODS) => {
        const locProdimportantFields = ["LOCATION_ID", "PRODUCT_ID"];
        let missingFields = [];
        for (let i = 0; i < LOCPRODS.length; i++) {
          const lpObj = LOCPRODS[i];
          for (let key of locProdimportantFields) {
            const value = lpObj[key];
            if (value === undefined || value === "" || value === null) {
              missingFields.push(key);
            }
          }
        }
        return missingFields.length > 0 ? [... new Set(missingFields)] : []
      },
      PROD_CLASS: (PRODCLASSS) => {
        const prodClimportantFields = ["PRODUCT_ID", "CLINT"];
        let missingFields = [];
        for (let i = 0; i < PRODCLASSS.length; i++) {
          const pcObj = PRODCLASSS[i];

          for (let key of prodClimportantFields) {
            const value = pcObj[key];
            if (value === undefined || value === "" || value === null) {
              missingFields.push(key);
            }
          }
        }
        return missingFields.length > 0 ? [... new Set(missingFields)] : []
      }
    };
    let AllResponses = [];
    for (let index = 0; index < BOMSTRUCTURE.length; index++) {
      const { BOM_HEADER, BOM_OD, BOM_OB_DEP, LOC_PROD, PROD_CLASS } = vaildationsyntax.BOM_PAYLOAD([BOMSTRUCTURE[index]])
      let BOMHEADERCHECK = vaildationsyntax.BOM_Header(BOM_HEADER);
      let BOM_ODCHECK = vaildationsyntax.BOM_OD(BOM_OD);
      let BOM_OB_DEPCHECK = vaildationsyntax.BOM_OD_DEP(BOM_OB_DEP);
      let LOC_PRODCHECK = vaildationsyntax.LOC_PROD(LOC_PROD);
      let PROD_CLASSCHECK = vaildationsyntax.PROD_CLASS(PROD_CLASS);
      if (BOMHEADERCHECK.length == 0 && BOM_ODCHECK.length == 0 && BOM_OB_DEPCHECK.length == 0 && LOC_PRODCHECK.length == 0 && PROD_CLASSCHECK.length == 0) {
        AllResponses.push({
          LOCATION_ID: BOM_HEADER?.[0].LOCATION_ID,
          MAT_PARENT: BOM_HEADER?.[0].MAT_PARENT,
          MAT_CHILD: BOM_HEADER?.[0].MAT_CHILD,
          STATUS_CODE: 200,
          BOM_HEADER: BOM_HEADER,
          BOM_OD: BOM_OD,
          BOM_OB_DEP: BOM_OB_DEP,
          LOC_PROD: LOC_PROD,
          PROD_CLASS: PROD_CLASS
        })
      }
      else {
        AllResponses.push({
          LOCATION_ID: BOM_HEADER?.[0]?.LOCATION_ID,
          MAT_PARENT: BOM_HEADER?.[0]?.MAT_PARENT,
          MAT_CHILD: BOM_HEADER?.[0]?.MAT_CHILD,
          STATUS_CODE: 400,
          MESSAGE: `
    ${BOMHEADERCHECK.length > 0 ? `Field Values Missing: ${BOMHEADERCHECK}` : ''}
    ${BOM_ODCHECK.length > 0 ? `Field Values Missing: ${BOM_ODCHECK}` : ''}
    ${BOM_OB_DEPCHECK.length > 0 ? `Field Values Missing: ${BOM_OB_DEPCHECK}` : ''}
    ${LOC_PRODCHECK.length > 0 ? `Field Values Missing: ${LOC_PRODCHECK}` : ''}
    ${PROD_CLASSCHECK.length > 0 ? `Field Values Missing: ${PROD_CLASSCHECK}` : ''}
  `.trim()
        });
      }
    }
    return AllResponses
  }

  static async VARIANT_EXT_VALID(req) {
    let vaildationsyntax = {
      VAR_CONT: (VARIANT_STRUCTURE) => {
        let VAR_HEADER = []
        let VAR_DEF = []
        let VAR_CONT = []

        for (const VARitem of VARIANT_STRUCTURE) {
          let varHObj = {
            TABLE_NAME: VARitem.TABLE_NAME,
            TABLE_DESC: VARitem.TABLE_DESC,
            BOM_IND: VARitem.BOM_IND,
            CON_PROFILE_IND: VARitem.CON_PROFILE_IND,
            PROCESS_DATE: VARitem.PROCESS_DATE,
            CHANGED_DATE: VARitem.CHANGED_DATE === "" || VARitem.CHANGED_DATE === undefined ? "2025-01-01" : VARitem.CHANGED_DATE,
            CHANGED_TIME: VARitem.CHANGED_TIME === "" || VARitem.CHANGED_TIME === undefined ? "10:24:07" : VARitem.CHANGED_TIME,
            CREATED_DATE: VARitem.CREATED_DATE === "" || VARitem.CREATED_DATE === undefined ? "2025-01-01" : VARitem.CREATED_DATE,
            CREATED_TIME: VARitem.CREATED_TIME === "" || VARitem.CREATED_TIME === undefined ? "10:24:07" : VARitem.CREATED_TIME,
          }
          VAR_HEADER.push(varHObj);

          for (const defItem of VARitem.VAR_DEF) {
            let varDefObj = {
              TABLE_NAME: VARitem.TABLE_NAME,
              CHAR_NAME: defItem.CHAR_NAME,
              CHAR_KEY: defItem.CHAR_KEY,
              CHANGED_DATE: defItem.CHANGED_DATE === "" || defItem.CHANGED_DATE === undefined ? "2025-01-01" : defItem.CHANGED_DATE,
              CHANGED_TIME: defItem.CHANGED_TIME === "" || defItem.CHANGED_TIME === undefined ? "10:24:07" : defItem.CHANGED_TIME,
              CREATED_DATE: defItem.CREATED_DATE === "" || defItem.CREATED_DATE === undefined ? "2025-01-01" : defItem.CREATED_DATE,
              CREATED_TIME: defItem.CREATED_TIME === "" || defItem.CREATED_TIME === undefined ? "10:24:07" : defItem.CREATED_TIME
            }
            VAR_DEF.push(varDefObj);
          }

          for (const conItem of VARitem.VAR_CONTNT) {
            let VARConObj = {
              TABLE_NAME: conItem.TABLE_NAME,
              ROW_ID: (conItem.ROW_ID == 0) ? '' : conItem.ROW_ID,
              COLUMN_ID: (conItem.COLUMN_ID == 0) ? '' : conItem.COLUMN_ID,
              CHAR_NAME: conItem.CHAR_NAME,
              CHAR_NUM: conItem.CHAR_NUM,
              CHARACTERISTIC_VALUE: conItem.CHARACTERISTIC_VALUE,
              CHANGED_DATE: conItem.CHANGED_DATE === "" || conItem.CHANGED_DATE === undefined ? "2025-01-01" : conItem.CHANGED_DATE,
              CHANGED_TIME: conItem.CHANGED_TIME === "" || conItem.CHANGED_TIME === undefined ? "10:24:07" : conItem.CHANGED_TIME,
              CREATED_DATE: conItem.CREATED_DATE === "" || conItem.CREATED_DATE === undefined ? "2025-01-01" : conItem.CREATED_DATE,
              CREATED_TIME: conItem.CREATED_TIME === "" || conItem.CREATED_TIME === undefined ? "10:24:07" : conItem.CREATED_TIME,
            }
            VAR_CONT.push(VARConObj);
          }
        }
        return {
          TABLE_NAME: VARIANT_STRUCTURE?.[0]?.TABLE_NAME || "No Table Name",
          VAR_HEADER: VAR_HEADER,
          VAR_DEF: VAR_DEF,
          VAR_CONT: VAR_CONT
        }
      },
      VARIENT_HEADER_VAILDATION: (Header) => {

        var MissingFields = [];

        for (let index = 0; index < Header.length; index++) {
          const { TABLE_NAME } = Header[index];
          if (TABLE_NAME == "" || TABLE_NAME == null || TABLE_NAME == undefined) {
            MissingFields.push("TABLE_NAME")
          }
        }
        return (MissingFields.length == 0) ? [] : [...new Set(MissingFields)];

      },
      VAR_DEF_VAILDATION: (DEF) => {

        let HMissingFields = [];

        for (let index = 0; index < DEF.length; index++) {
          const { CHAR_NAME } = DEF[index];

          if (CHAR_NAME == "" || CHAR_NAME == null || CHAR_NAME == undefined) {
            HMissingFields.push("CHAR_NAME")

          }
        }
        return (HMissingFields.length == 0) ? [] : [...new Set(HMissingFields)];

      },
      VAR_CONT_VAILDATION: (COUNT) => {

        let CImpFields = ["COLUMN_ID", "ROW_ID", "CHAR_NUM", "CHARACTERISTIC_VALUE"];
        let MissingC = [];

        for (let index = 0; index < COUNT.length; index++) {
          const obj_COUNT = COUNT[index];
          for (let index = 0; index < CImpFields.length; index++) {
            const element = CImpFields[index];

            if (obj_COUNT[element] == "" || obj_COUNT[element] == null || obj_COUNT[element] == undefined) {
              MissingC.push(element)
            }

          }
        }
        return (MissingC.length == 0) ? [] : [...new Set(MissingC)];

      },
      VARIENT_RESPONSE: (req) => {
        var variant_data = req.data.VARIANT_TABLE;
        let { VAR_HEADER, VAR_DEF, VAR_CONT, TABLE_NAME } = vaildationsyntax.VAR_CONT(variant_data);

        let getVaildateHeader = vaildationsyntax.VARIENT_HEADER_VAILDATION(VAR_HEADER)
        let getVaildateDef = vaildationsyntax.VAR_DEF_VAILDATION(VAR_DEF)
        let getVaildateCount = vaildationsyntax.VAR_CONT_VAILDATION(VAR_CONT)


        if (getVaildateHeader.length == 0 && getVaildateDef.length == 0 && getVaildateCount.length == 0) {

          return {
            STATUS_CODE: 200,
            TABLE_NAME: TABLE_NAME,
            HEADER: VAR_HEADER,
            DEF: VAR_DEF,
            COUNT: VAR_CONT
          }

        } else {
          return {
            STATUS_CODE: 400,
            MissingFields: `${(getVaildateHeader.length > 0) ? `Header Fields is Missing value : ${getVaildateHeader}` : ""} ${(getVaildateDef.length > 0) ? ` VAR_DEF Fields Missing : ${getVaildateDef}` : ""}  ${(getVaildateCount.length) ? `VAR_CONT Vaues Fields Missing : ${getVaildateCount}` : ""}`
          }
        }

      }
    }
    return vaildationsyntax.VARIENT_RESPONSE(req)
  }
  static async onInsertProductionConsumption(req) {
    let { PRODUCTION_CON } = req.data;
    let importantFields = ['LOCATION_ID', 'SALES_DOCUMENT', 'SALES_DOCUMENT_ITEM', 'CONFIG_MAT', 'COMPONENT', 'COMP_LOC', 'PARENT_MAT', 'PARENT_LOC'];
    let Responses = [];
    for (let index = 0; index < PRODUCTION_CON.length; index++) {
      const element = PRODUCTION_CON[index];
      let fieldsmissing = [];
      for (let imp = 0; imp < importantFields.length; imp++) {
        const field = importantFields[imp];

        if (element['QUANTITY'] == 0 || element['QUANTITY'] == undefined || element['QUANTITY'] == null) {
          fieldsmissing.push('QUANTITY')

        }
        else if (element[field] == "" || element[field] == undefined || element[field] == null) {
          fieldsmissing.push(field)
        }
      }
      if (fieldsmissing.length > 0) {
        Responses.push({
          SALES_DOCUMENT: element?.SALES_DOCUMENT || "No Sales Document",
          COMPONENT: element?.COMPONENT || "No Component",
          STATUS_CODE: 400,
          MissingFields: [...new Set(fieldsmissing)]
        })
      }
      else {
        Responses.push({
          SALES_DOCUMENT: element.SALES_DOCUMENT,
          COMPONENT: element.COMPONENT,
          STATUS_CODE: 200,
          Payload: element,
          MissingFields: []
        })
      }
    }
    return Responses
  }
  static async oninsertSalesProductionOrder(req) {
    let { SALES_PRODUCTION_ORDER } = req.data;
    let importantFields = ['SALES_DOCUMENT', 'SALES_DOCUMENT_ITEM', 'AUFNR', 'QUANTITY'];
    let overall_responses = [];

    for (let index = 0; index < SALES_PRODUCTION_ORDER.length; index++) {
      let object_vaildation = [];
      const element = SALES_PRODUCTION_ORDER[index];

      for (let index = 0; index < importantFields.length; index++) {
        const field = importantFields[index];
        element['QUANTITY'] = (element.QUANTITY == 0) ? "" : element.QUANTITY;
        if (element[field] == "" || element[field] == undefined || element[field] == null) {
          object_vaildation.push(field)
        }
      }

      overall_responses.push({
        SALES_DOCUMENT: element?.SALES_DOCUMENT || "NO SALES_DOCUMENT",
        SALES_DOCUMENT_ITEM: element?.SALES_DOCUMENT_ITEM || "SALES_DOCUMENT_ITEM",
        Payload: element,
        MissingFields: object_vaildation,
        StatusCode: (object_vaildation.length > 0) ? 400 : 200
      })
    }

    return overall_responses
  }
}
module.exports = External_Call;