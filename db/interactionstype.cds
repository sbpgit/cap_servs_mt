context interactionstype {


    type SalesOrderDetails {
        MANDT                : String(3);
        SALES_DOCUMENT       : String(20);
        SALES_DOCUMENT_ITEM  : Integer;
        DOC_CREATED_DATE     : String(10);
        SCHEDULE_LINE_NO     : Integer;
        PRODUCT_ID           : String(40);
        MATERIAL_VARIANT     : String(40);
        REASON_4REJECTION    : String(40);
        UOM                  : String(10);
        CONFIRMED_QTY        : Integer;
        QTY_UNITS            : Integer;
        PROD_AVAILABILITY_DT : String(10);
        NET_VALUE            : Decimal(15, 2);
        CUSTOMER_GROUP       : String(20);
        LOCATION_ID          : String(10);
        SALES_ORG            : String(10);
        DISTR_CHANNEL        : String(10);
        DIVISION             : String(10);
        SAL_DOCU_TYPE        : String(10);
        ITEM_CREATED_DATE    : String(10);
        ITEM_CHANGE_DATE     : String(10);
        OPEN_ORDER           : String(1);
        CHARG                : String(40);
        IBP_CUSTOMER         : String(40);
        NOT_PLANNING         : String(1);
        ON_HAND_STOCK        : String(1);
        IN_TRANSIT           : String(40);
        SHIP_FROM_LOC        : String(40);
        RESERVE_FIELD1       : String(40);
        RESERVE_FIELD2       : String(40);
        RESERVE_FIELD3       : String(40);
        STOCK_LOC            : String(40);
        TRANS_TO_LOC         : String(40);
        TRANS_FROM_LOC       : String(40);
        DELETE_FLAG          : String(1);
        CHANGED_DATE         : String(10);
        CHANGED_TIME         : String(8);
        CHANGED_BY           : String(20);
        CREATED_DATE         : String(10);
        CREATED_TIME         : String(8);
        CREATED_BY           : String(20);
        ITEMS                : array of ItemDetails;

    }

    type ItemDetails {
        CHARACTERSTIC        : String(30);
        CHARACTERSTIC_VALUE  : String(50);
        PRODUCT_ID           : String(40);
        PROD_AVAILABILITY_DT : String(10);
        CLASS                : String(40);
        CLASS_NUM            : Integer;
        CHARACTERSTIC_NUM    : Integer;
        VALUE_NUM            : Integer;
        DELETE_FLAG          : String(1);
        CHANGED_DATE         : String(10);
        CHANGED_TIME         : String(8);
        CHANGED_BY           : String(20);
        CREATED_DATE         : String(10);
        CREATED_TIME         : String(8);
        CREATED_BY           : String(20);
    }

    type RESPONSE {
        MESSAGE : String;
    }

    type CLASS_STRC {
        INT_CLS_NUMBER : Integer;
        CLASS_TYPE     : String(3);
        CLASS          : String(18);
        ZDESC          : String(40);
        DELETE_FLAG    : String(1);
        CHANGED_DATE   : String;
        CHANGED_TIME   : String;
        CHANGED_BY     : String(12);
        CREATED_DATE   : String;
        CREATED_TIME   : String;
        CREATED_BY     : String(12);
        CLASS_CHAR     : array of CHARAC_DATA_STRUC;
    }

    type CHARAC_DATA_STRUC {
        INT_CHAR      : Integer;
        CHAR_NAME     : String(30);
        CHAR_DESC     : String(50);
        CHAR_GROUP    : String(10);
        CHAR_DATATYPE : String(4);
        CHAR_CATEGORY : String(2);
        MULTI_CHAR    : String(1);
        ENTRY_REQ     : String(1);
        DELETE_FLAG   : String(1);
        CHANGED_DATE  : String;
        CHANGED_TIME  : String;
        CHANGED_BY    : String(12);
        CREATED_DATE  : String;
        CREATED_TIME  : String;
        CREATED_BY    : String(12);
        CHAR_VALUES   : array of CHARAC_VALUES_STRUC;
    }

    type CHARAC_VALUES_STRUC {
        CHAR_VALUE   : String(70);
        CHAR_VDESC   : String(70);
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String;
        CHANGED_TIME : String;
        CHANGED_BY   : String(12);
        CREATED_DATE : String;
        CREATED_TIME : String;
        CREATED_BY   : String(12);
    }

    type PRODUCT_STRUC {
        MANDT               : String(3);
        PRODUCT_ID          : String(40) @title: 'Configurable Product';
        PRODUCT_DESC        : String(40) @title: 'Product Description';
        PRODUCT_TYPE        : String(4)  @title: 'Product Family';
        PRODUCT_FAMILY      : String(40) @title: 'Product Group';
        PRODUCT_GROUP       : String(20) @title: 'Product Model';
        PRODUCT_MODEL       : String(20) @title: 'Product Range';
        PRODUCT_MODEL_RANGE : String(20) @title: 'Product Series';
        PRODUCT_SERIES      : String(20) @title: 'Product Type';
        RESERVE_FIELD1      : String(20) @title: 'Reserve Field1';
        RESERVE_FIELD2      : String(20) @title: 'Reserve Field2';
        RESERVE_FIELD3      : String(20) @title: 'Reserve Field3';
        RESERVE_FIELD4      : String(20) @title: 'Reserve Field4';
        RESERVE_FIELD5      : String(20) @title: 'Reserve Field5';
        DELETE_FLAG         : String(1);
        CHANGED_DATE        : String;
        CHANGED_TIME        : String;
        CHANGED_BY          : String(12);
        CREATED_DATE        : String;
        CREATED_TIME        : String;
        CREATED_BY          : String(12);
        LOC_PROD            : array of LOC_PROD_STRUC;
        PROD_CLS            : array of PROD_CLASS;
    }

    type LOC_PROD_STRUC {
        LOCATION_ID       : String(4);
        PRODUCT_ID        : String(40);
        LOTSIZE_KEY       : String(2);
        PROCUREMENT_TYPE  : String(1);
        LOTSIZE           : Integer;
        PLANNING_STRATEGY : String(2);
        DELETE_FLAG       : String(1);
        MRP_GROUP         : String(4);
        MRP_TYPE          : String(2);
        CHANGED_DATE      : String;
        CHANGED_TIME      : String;
        CHANGED_BY        : String(12);
        CREATED_DATE      : String;
        CREATED_TIME      : String;
        CREATED_BY        : String(12);

    }

    type PROD_CLASS {
        PRODUCT_ID   : String(40);
        CLINT        : Integer;
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String;
        CHANGED_TIME : String;
        CHANGED_BY   : String(12);
        CREATED_DATE : String;
        CREATED_TIME : String;
        CREATED_BY   : String(12);
    }

    type LOCATION_STRC {
        MANDT          : String(5);
        LOCATION_ID    : String(4);
        LOCATION_DESC  : String(30);
        LOCATION_TYPE  : String(1);
        LATITUDE       : String(20);
        LONGITUTE      : String(20);
        RESERVE_FIELD1 : String(20);
        RESERVE_FIELD2 : String(20);
        RESERVE_FIELD3 : String(20);
        RESERVE_FIELD4 : String(20);
        RESERVE_FIELD5 : String(20);
        CHANGED_DATE   : String(20);
        CHANGED_TIME   : String(20);
        CHANGED_BY     : String(12);
        CREATED_DATE   : String(20);
        CREATED_TIME   : String(20);
        CREATED_BY     : String(12);
    }

    type CUSTOMER_STRUC {
        CUSTOMER_GROUP : String(20);
        CUSTOMER_DESC  : String(20);
        RESERVE_FIELD1 : String(20);
        RESERVE_FIELD2 : String(20);
        RESERVE_FIELD3 : String(20);
        RESERVE_FIELD4 : String(20);
        RESERVE_FIELD5 : String(20);
        CHANGED_DATE   : String(20);
        CHANGED_TIME   : String(20);
        CHANGED_BY     : String(12);
        CREATED_DATE   : String(20);
        CREATED_TIME   : String(20);
        CREATED_BY     : String(12);
    }

    type partialproduct_header {
        MANDT        : String(3);
        PRODUCT_ID   : String(40);
        LOCATION_ID  : String(4);
        PRODUCT_DESC : String(40);
        PRODUCT_TYPE : String(4);
        REF_PRODID   : String(40);
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String(20);
        CHANGED_TIME : String(20);
        CHANGED_BY   : String(12);
        CREATED_DATE : String(20);
        CREATED_TIME : String(20);
        CREATED_BY   : String(12);
        ITEMS        : array of partialproduct_item;
        LOC_PROD     : array of LOC_PROD_STRUC;
    }

    type partialproduct_item {
        CLASS_NUM            : Integer;
        CHARACTERSTIC_NUM    : Integer;
        VALUE_NUM            : String(40);
        CHARACTERISTIC_VALUE : String(70);
        DELETE_FLAG          : String(1);
        CHANGED_DATE         : String(20);
        CHANGED_TIME         : String(20);
        CHANGED_BY           : String(12);
        CREATED_DATE         : String(20);
        CREATED_TIME         : String(20);
        CREATED_BY           : String(12);
    }

    type LOCATION_MASTER_DATA {
        LOCATION_ID   : String(4);
        LOCATION_DESC : String(30);
        LOCATION_TYPE : String(1);
    }

    type LOCATION_MASTER_DATA_RESPONSE {
        MESSAGE : String;
    }

    type BOM_MAT_TYPE {
        LOCATION_ID    : String(4);
        COUNTER        : String(6);
        MAT_PARENT     : String;
        MAT_CHILD      : String;
        VALID_FROM     : Date;
        VALID_TO       : Date;
        CHILD_LOC      : String(4);
        MRP_GROUP      : String(4);
        MRP_TYPE       : String(2);
        COMP_TYPE      : String(4);
        PHANTOM_IND    : String(1);
        CONFIGURABLE   : String(1);
        CLASS_FLG      : String(1);
        PROD_DESC      : String(40);
        COMPONENT_QTY  : Double;
        UOM            : String(10);
        CRITICAL_ASM   : String(1);
        COMPONENT_FLAG : String(1);
        CHANGE_NO      : String(12);
        DELETE_FLAG    : String(1);
        BOM_PROCESS    : String;
        TIMESTAMP      : String;
        CHANGED_DATE   : String(20);
        CHANGED_TIME   : String(20);
        CHANGED_BY     : String(12);
        CREATED_DATE   : String(20);
        CREATED_TIME   : String(20);
        CREATED_BY     : String(12);
        BOM_OD         : array of BOM_OD_TYPE;
        BOM_OD_DEP     : array of BOM_OD_DEP_TYPE;
        LOC_PROD       : array of LOC_PROD_STRUC;
        PROD_CLASS     : array of PROD_CLASS;
    }

    type BOM_OD_TYPE {
        DEPENDENCY   : String(30);
        DEP_DESC     : String;
        CHANGE_NO    : String;
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String(20);
        CHANGED_TIME : String(20);
        CHANGED_BY   : String(12);
        CREATED_DATE : String(20);
        CREATED_TIME : String(20);
        CREATED_BY   : String(12);
    }

    type BOM_OD_DEP_TYPE {
        DEPENDENCY      : String(30);
        LINE_NO         : Integer;
        LINE            : String(72);
        DEPENDENCY_TYPE : String(1);
        DELETE_FLAG     : String(1);
        CHANGED_DATE    : String(20);
        CHANGED_TIME    : String(20);
        CHANGED_BY      : String(12);
        CREATED_DATE    : String(20);
        CREATED_TIME    : String(20);
        CREATED_BY      : String(12);
    }


    type REPROCEDURE_S4_LOG_TYPE_RESPONSE {
        RESPONSE : array of REPROCEDURE_S4_LOG_TYPE
    }

    type REPROCEDURE_S4_LOG_TYPE {
        MANDT          : String(3);
        OBJECT_NAME    : String(50);
        OBJECT_VALUE   : String(50);
        DATE_OF_ERROR  : Date;
        TIME_OF_ERROR  : String;
        MESSAGE_CLASS  : String(20);
        MESSAGE_NUMBER : Integer;
        MESSAGE_TYPE   : String(1);
        MESSAGE        : String;
        MESSAGE_V1     : String(50);
        MESSAGE_V2     : String(50);
        MESSAGE_V3     : String(50);
        MESSAGE_V4     : String(50);
    }

    type VARIENT_TABLE_TYPE {
        TABLE_NAME      : String(18);
        TABLE_DESC      : String(40);
        BOM_IND         : String(1);
        CON_PROFILE_IND : String(1);
        PROCESS_DATE    : Date;
        VAR_DEF         : array of VAR_DEF_TYPE;
        VAR_CONTNT      : array of VAR_CONTENT_TYPE;
    }

    type VAR_DEF_TYPE {
        TABLE_NAME : String(18);
        CHAR_NAME  : String(30);
        CHAR_KEY   : String(1);
    }

    type VAR_CONTENT_TYPE {
        TABLE_NAME           : String(18);
        ROW_ID               : Integer;
        COLUMN_ID            : Integer;
        CHAR_NAME            : String(30);
        CHAR_NUM             : Integer;
        CHARACTERISTIC_VALUE : String(70);
    }

    type varientHeader {
        VARIANTID        : Integer     @title: 'Variant ID';
        VARIANTNAME      : String(100) @title: 'Variant Name';
        USER             : String(100) @title: 'User';
        APPLICATION_NAME : String(100) @title: 'Application_Name';
        DEFAULT          : String(2)   @title: 'Default';
        SCOPE            : String(20)  @title: 'Scope';
    }

    type con {
        JOb_NAME : String(100);
        REQ_TYPE : String(10);
        Time     : String(50);
        STATUS   : String(25);
    }

    type PRODUCTION_CON {
        LOCATION_ID          : String(4);
        SALES_DOCUMENT       : String(10);
        SALES_DOCUMENT_ITEM  : String(10);
        CONFIG_MAT           : String(40);
        COMPONENT            : String(40);
        COMP_LOC             : String(4);
        PARENT_MAT           : String(40);
        PARENT_LOC           : String(4);
        COMP_PROCURE_TYPE    : String(1);
        QUANTITY             : Double;
        PROD_AVAILABILITY_DT : Date;
        DELETE_FLAG          : String(1);
        CHANGED_DATE         : String(20);
        CHANGED_TIME         : String(20);
        CHANGED_BY           : String(12);
        CREATED_DATE         : String(20);
        CREATED_TIME         : String(20);
        CREATED_BY           : String(12);
    }

    type SALES_PRODUCTION_ORDERS {
        SALES_DOCUMENT      : String(10);
        SALES_DOCUMENT_ITEM : String(10);
        AUFNR               : String(12);
        PARENT_MAT          : String(40);
        QUANTITY            : Double;
        ORDER_TYPE          : String(20);
        CHANGED_DATE        : String(20);
        CHANGED_TIME        : String(20);
        CHANGED_BY          : String(12);
        CREATED_DATE        : String(20);
        CREATED_TIME        : String(20);
        CREATED_BY          : String(12);
    }

    type ASS_COMP {
        MANDT         : String(3);
        LOCATION_ID   : String(4);
        ASSEMBLY      : String(40);
        SUB_COMP      : String(40);
        VALID_FROM    : String(20);
        VALID_TO      : String(20);
        COMP_TYPE     : String(4);
        PROD_DESC     : String(40);
        COMPONENT_QTY : String(18);
        UOM           : Double;
        CRITICAL_COMP : String(1);
        CHANGE_NO     : String(12);
        CHANGED_DATE  : String(20);
        CHANGED_TIME  : String(20);
        CHANGED_BY    : String(12);
        CREATED_DATE  : String(20);
        CREATED_TIME  : String(20);
        CREATED_BY    : String(12);
    }

    type DERIVECHAR_STB {
        MANDT        : String(3);
        PRODUCT_ID   : String(40);
        RECORD_TYPE  : String(2);
        VALID_FROM   : String(12);
        DEPENDENCY   : String(30);
        LINE_NO      : Integer;
        LINE         : String(100);
        VALID_TO     : String(12);
        RULE_TYPE    : String(30);
        CHANGE_NO    : String(12);
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String(20);
        CHANGED_TIME : String(20);
        CHANGED_BY   : String(12);
        CREATED_DATE : String(20);
        CREATED_TIME : String(20);
        CREATED_BY   : String(12);
    }

    type PIR_IN {
        LOCATION_ID : String(4);
        ASSEMBLY    : String(40);
        FROM_DATE   : String(12);
        TO_DATE     : String(12);
    }


    type PROD_ACC_NODE_STB {
        LOCATION_ID  : String(4);
        PRODUCT_ID   : String(40);
        ACCESS_NODE  : String(50);
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String(20);
        CHANGED_TIME : String(20);
        CHANGED_BY   : String(12);
        CREATED_DATE : String(20);
        CREATED_TIME : String(20);
        CREATED_BY   : String(12);
        NODE_MASTER  : array of MAST_DATA_NODE_STB;
    }

    type MAST_DATA_NODE_STB {
        CHILD_NODE   : String(50);
        PARENT_NODE  : String(50);
        LOWERLIMIT   : Integer;
        UPPERLIMIT   : Integer;
        ACCESS_NODE  : String(50);
        NODE_TYPE    : String(2);
        NODE_DESC    : String(200);
        AUTH_GROUP   : String(4);
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String(20);
        CHANGED_TIME : String(20);
        CHANGED_BY   : String(12);
        CREATED_DATE : String(20);
        CREATED_TIME : String(20);
        CREATED_BY   : String(12);
        PV_BOM       : array of PVBLL_MAT;
    }

    type PVBLL_MAT {
        LOCATION_ID  : String(4);
        PRODUCT_ID   : String(40);
        ITM_NUM      : Integer;
        COMPONENT    : String(40);
        STRUC_NODE   : String(50);
        DELETE_FLAG  : String(1);
        CHANGED_DATE : String(20);
        CHANGED_TIME : String(20);
        CHANGED_BY   : String(12);
        CREATED_DATE : String(20);
        CREATED_TIME : String(20);
        CREATED_BY   : String(12);
    }


}
