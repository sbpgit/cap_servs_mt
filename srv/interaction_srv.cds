using app.db from '../db/interactions';
using {SELECTIONOPTIONS} from '../db/interactions';
using {CONFIGOPTIONS} from '../db/interactions';
using interactionstype from '../db/interactionstype';


@cds.query.limit: {
    default: 100,
    max    : 9000
}
service CatalogService {
    //standby tables
    entity LOCATION_STB           as projection on db.LOCATION_STB; //location_standby
    entity PRODUCT_STB            as projection on db.PRODUCT_STB; //product_stb
    entity customer_group         as projection on db.customer_group; // customers_stb
    entity MAINT_MRP_STB          as projection on db.MAIN_MRP_STB; // maintain mrp_stb

    // PRODUCT AND ATTRIBUTES EXTRACT stand by
    entity CLASS_C_STB            as projection on db.CLASS_C_STB;
    entity PROD_CLASS_STB         as projection on db.PROD_CLASS_STB1;
    entity CHARC_DATA_STB         as projection on db.CHARC_DATA_STB1;
    entity CHARAC_VALUES_STB      as projection on db.CHARAC_VALUES_STB1;
    //bill of materials stand_by
    entity BOM_DEPN_STB           as projection on db.BOM_DEPN_STB; //bomdependcy_stb
    entity ASS_COMP_STB           as projection on db.ASS_COMP_STB; // assumble_stb

    // Partial_product stand by
    entity PROD_CONF_STB          as projection on db.PROD_CONF_STB; //product cnfiguration_standby
    entity MAT_LTE_MDATA_STB      as projection on db.MAT_LTE_MDATA_STB; //materiallitemdata
    entity LOC_PRODID_STB         as projection on db.LOC_PRODID_STB; //locationandproduction

    // SALES ORDER STAND BY
    entity SALESH_STB             as projection on db.SALESH_STB; //sales_stb
    entity SALESH_CONFIG_STB      as projection on db.SALESH_CONFIG_STB; //salesh_stb
    // entity SALESH_LOG as projection on db.SALESH_LOG;

    // ippe extract
    entity OBJ_DEPEN_MAS_DATA_STB as projection on db.OBJ_DEPEN_MAS_DATA_STB;
    entity PROD_ACC_NODE_STB      as projection on db.PROD_ACC_NODE_STB;
    // SERVICE INTERFACE
    entity config_interface_log   as projection on CONFIGOPTIONS;
    entity INTERFACE_TABLE        as projection on db.INTERFACE_TABLE;
    entity CONFIG_INT_TAB         as projection on db.CONFIG_INT_TAB1;
    entity interface_log_table    as projection on db.interface_log_table;
    // interface_tables
    entity Options                as projection on SELECTIONOPTIONS;
    entity INTERFACE_TYPE1        as projection on db.INTERFACE_TYPE;
    entity INTERFACE_PARAMS       as projection on db.INTERFACE_PARAMS;
    entity INTERFACE_PARAMS_VALUE as projection on db.INTERFACE_PARAMS_VALUE;
    entity INTERFACE_SERV_CONFIG  as projection on db.INTERFACE_SERV_CONFIG;
    entity interface_ext_log      as projection on db.interface_ext_log;
    entity Config_Job_Status      as projection on db.Config_Job_Status;
    entity INTERFACELOGINFO       as projection on db.INTERFACELOGINFO;
    entity partialproduct_header  as projection on db.partialproduct_header;
    entity partialproduct_item    as projection on db.partialproduct_item;
    entity PRODUCTION_CONSUMPTION as projection on db.PRODUCTION_CONSUMPTION;

    // interface functions
    function VC_interface(FLAG: String, Data: String)                                                              returns String;
    action   insertLocation(Location: array of interactionstype.LOCATION_STRC)                                     returns interactionstype.RESPONSE;
    action   insertCutomer(Customer: array of interactionstype.CUSTOMER_STRUC)                                     returns interactionstype.RESPONSE;
    action   insertSalesOrder(SALESORDER: array of interactionstype.SalesOrderDetails)                             returns interactionstype.RESPONSE;
    action   insertClassCharac(CLASS: array of interactionstype.CLASS_STRC)                                        returns interactionstype.RESPONSE;
    action   insertDerivedCharac(DER: array of interactionstype.DERIVECHAR_STB)                                    returns interactionstype.RESPONSE;
    action   insertProduct(PRODUCT: array of interactionstype.PRODUCT_STRUC)                                       returns interactionstype.RESPONSE;
    action   insertPartialProduct(PARTIALPRODUCT: array of interactionstype.partialproduct_header)                 returns interactionstype.RESPONSE;
    action   insertBomDepn(BOM: array of interactionstype.BOM_MAT_TYPE)                                            returns interactionstype.RESPONSE;
    action   insertVarientTable(VARIANT_TABLE: array of interactionstype.VARIENT_TABLE_TYPE)                       returns interactionstype.RESPONSE;
    action   insertProductionConsumption(PRODUCTION_CON: array of interactionstype.PRODUCTION_CON)                 returns interactionstype.RESPONSE;
    action   insertSalesProductionOrder(SALES_PRODUCTION_ORDER: array of interactionstype.SALES_PRODUCTION_ORDERS) returns interactionstype.RESPONSE;
    action   insertAssComp(Assembly: array of interactionstype.ASS_COMP)                                           returns interactionstype.RESPONSE;
    function deleteInterfaceLogs()                                                                                 returns String;
    function process_dependency(UID: String, OD: String)                                                           returns String;
    function vaildateEntity(Flag: String, entityparam: String)                                                     returns String;
    function pushToVCP(Flag: String, payload: String)                                                              returns String;
    function ExportToVCP(PRODUCT_ID:String )                                                                       returns String;
    action   ExportMasterData(TYPE: String)                                                                        returns String;
    action   onInsertIppe(IPPE: array of interactionstype.PROD_ACC_NODE_STB)                                       returns interactionstype.RESPONSE;
    action   REPROCEDURE_S4_LOG(FLAG: String, DATA: array of interactionstype.REPROCEDURE_S4_LOG_TYPE)             returns array of interactionstype.REPROCEDURE_S4_LOG_TYPE;
    action   getPIRData(PIR: interactionstype.PIR_IN)                                                              returns array of interactionstype.RESPONSE;
}
