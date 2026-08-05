context app.db {

    // location_stb
    entity LOCATION_STB {
            MANDT          : String(3);
        key LOCATION_ID    : String(4)  @title: 'Location ';
            LOCATION_DESC  : String(30) @title: 'Location Description';
            LOCATION_TYPE  : String(1)  @title: 'Location Type';
            LATITUDE       : String(20) @title: 'Latitude';
            LONGITUTE      : String(20) @title: 'Longitude';
            RESERVE_FIELD1 : String(20) @title: 'Reserve Field1';
            RESERVE_FIELD2 : String(20) @title: 'Reserve Field2';
            RESERVE_FIELD3 : String(20) @title: 'Reserve Field3';
            RESERVE_FIELD4 : String(20) @title: 'Reserve Field4';
            RESERVE_FIELD5 : String(20) @title: 'Reserve Field5';
            DELETE_FLAG    : String(1);
            CHANGED_DATE   : Date;
            CHANGED_TIME   : Time;
            CHANGED_BY     : String(12);
            CREATED_DATE   : Date;
            CREATED_TIME   : Time;
            CREATED_BY     : String(12);
    }


    // product_stb
    entity PRODUCT_STB {
            MANDT               : String(3);
        key PRODUCT_ID          : String(40) @title: 'Configurable Product';
        key PRODUCT_DESC        : String(40) @title: 'Product Description';
        key PRODUCT_TYPE        : String(4)  @title: 'Product Family';
            PRODUCT_FAMILY      : String(40) @title: 'Product Group';
            PRODUCT_GROUP       : String(20) @title: 'Product Model';
            PRODUCT_MODEL       : String(20) @title: 'Product Range';
            PRODUCT_MODEL_RANGE : String(20) @title: 'Product Series';
            PRODUCT_SERIES      : String(20) @title: 'Product Type';
            UOM                 : String(10);
            RESERVE_FIELD1      : String(20) @title: 'Reserve Field1';
            RESERVE_FIELD2      : String(20) @title: 'Reserve Field2';
            RESERVE_FIELD3      : String(20) @title: 'Reserve Field3';
            RESERVE_FIELD4      : String(20) @title: 'Reserve Field4';
            RESERVE_FIELD5      : String(20) @title: 'Reserve Field5';
            DELETE_FLAG         : String(1);
            CHANGED_DATE        : Date;
            CHANGED_TIME        : Time;
            CHANGED_BY          : String(12);
            CREATED_DATE        : Date;
            CREATED_TIME        : Time;
            CREATED_BY          : String(12);
    }

    // sales

    entity SALESH_STB {
            MANDT                : String(3);
        key SALES_DOCUMENT       : String(10);
        key SALES_DOCUMENT_ITEM  : Integer64;
            DOC_CREATED_DATE     : Date;
            SCHEDULE_LINE_NO     : Integer;
            PRODUCT_ID           : String(40);
            MATERIAL_VARIANT     : String(40);
            REASON_4REJECTION    : String(2);
            UOM                  : String(10);
            CONFIRMED_QTY        : Integer64;
            QTY_UNITS            : Integer64;
            PROD_AVAILABILITY_DT : Date;
            NET_VALUE            : Double;
            CUSTOMER_GROUP       : String(20);
            LOCATION_ID          : String(4);
            SALES_ORG            : String(4);
            DISTR_CHANNEL        : String(2);
            DIVISION             : String(2);
            SAL_DOCU_TYPE        : String(4);
            ITEM_CREATED_DATE    : Date;
            ITEM_CHANGE_DATE     : Date;
            OPEN_ORDER           : String(1);
            CHARG                : String(10);
            IBP_CUSTOMER         : String(10);
            NOT_PLANNING         : String(1);
            ON_HAND_STOCK        : String(1);
            IN_TRANSIT           : String(1);
            SHIP_FROM_LOC        : String(4);
            RESERVE_FIELD1       : String(40);
            RESERVE_FIELD2       : String(40);
            RESERVE_FIELD3       : String(40);
            STOCK_LOC            : String(4);
            TRANS_TO_LOC         : String(4);
            TRANS_FROM_LOC       : String(4);
            DELETE_FLAG          : String(1);
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time;
            CHANGED_BY           : String(12);
            CREATED_DATE         : Date;
            CREATED_TIME         : Time;
            CREATED_BY           : String(12);
    }


    entity SALESH_CONFIG_STB {
            MANDT                : String(3);
        key SALES_DOCUMENT       : String(10);
        key SALES_DOCUMENT_ITEM  : Integer64;
        key CHARACTERSTIC        : String(30);
        key CHARACTERSTIC_VALUE  : String(70);
            PRODUCT_ID           : String(40);
            PROD_AVAILABILITY_DT : Date;
            CLASS                : String(18);
            CLASS_NUM            : Integer;
            CHARACTERSTIC_NUM    : Integer;
            VALUE_NUM            : Integer;
            DELETE_FLAG          : String(1);
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time;
            CHANGED_BY           : String(12);
            CREATED_DATE         : Date;
            CREATED_TIME         : Time;
            CREATED_BY           : String(12);
    }

    // customers_stb
    entity customer_group {
            MANDT          : String(3);
        key CUSTOMER_GROUP : String(20) @title: 'Customer Group';
            CUSTOMER_DESC  : String(20) @title: 'Customer Description';
            RESERVE_FIELD1 : String(20) @title: 'Reserve Field1';
            RESERVE_FIELD2 : String(20) @title: 'Reserve Field2';
            RESERVE_FIELD3 : String(20) @title: 'Reserve Field3';
            RESERVE_FIELD4 : String(20) @title: 'Reserve Field4';
            RESERVE_FIELD5 : String(20) @title: 'Reserve Field5';
            DELETE_FLAG    : String(1);
            CHANGED_DATE   : Date;
            CHANGED_TIME   : Time;
            CHANGED_BY     : String(12);
            CREATED_DATE   : Date;
            CREATED_TIME   : Time;
            CREATED_BY     : String(12);

    }

    // dervived_stb characteristics

    // entity DERIVECHAR_STB {
    //         MANDT                : String(3);
    //     key PRODUCT_ID           : String(40);
    //     key RECORD_TYPE          : String(2);
    //     key CLAUSE               : String(2);
    //     key DEP_NAME             : String(30);
    //     key CHAR_NUM             : String(10);
    //     key CHARVAL_NUM          : String(20);
    //     key SORT_COUNTER         : String(4);
    //     key CHAR_COUNTER         : String(5);
    //     key INT_CLS_NUMBER       : String(10);
    //         CHARACTERISTIC_VALUE : String(70);
    //         VALID_FROM           : Date;
    //         VALID_TO             : Date;
    //         OD_CONDITION         : String(2);
    //         RULE_TYPE            : String(30);
    //         CHANGE_NO            : String(12);
    //         DELETE_FLAG          : String(1);
    //         CHANGED_DATE         : Date;
    //         CHANGED_TIME         : Time;
    //         CHANGED_BY           : String(12);
    //         CREATED_DATE         : Date;
    //         CREATED_TIME         : Time;
    //         CREATED_BY           : String(12);
    // }

    // entity DERIVECHAR_STB {
    //         MANDT                : String(3);
    //     key PRODUCT_ID           : String(40);
    //     key RECORD_TYPE          : String(2);
    //     key CLAUSE               : String(2);
    //     key DEP_NAME             : String(30);
    //     key CHAR_NUM             : Integer;
    //     key CHARVAL_NUM          : String(20);
    //     key SORT_COUNTER         : Integer;
    //     key CHAR_COUNTER         : Integer;
    //     key INT_CLS_NUMBER       : Integer;
    //         CHARACTERISTIC_VALUE : String(70);
    //         VALID_FROM           : Date;
    //         VALID_TO             : Date;
    //         OD_CONDITION         : String(2);
    //         RULE_TYPE            : String(30);
    //         CHANGE_NO            : String(12);
    //         DELETE_FLAG          : String(1);
    //         CHANGED_DATE         : Date;
    //         CHANGED_TIME         : Time;
    //         CHANGED_BY           : String(12);
    //         CREATED_DATE         : Date;
    //         CREATED_TIME         : Time;
    //         CREATED_BY           : String(12);
    // }

    entity DERIVECHAR_STB2 {
            MANDT        : String(3);
        key PRODUCT_ID   : String(40);
        key RECORD_TYPE  : String(2);
        key VALID_FROM   : String(12);
        key DEPENDENCY   : String(30);
        key LINE_NO      : Integer;
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

    // locationproductionid_stb
    entity LOC_PRODID_STB {
            MANDT             : String(3);
        key LOCATION_ID       : String(4);
        key PRODUCT_ID        : String(40);
            LOTSIZE_KEY       : String(2);
            PROCUREMENT_TYPE  : String(1);
            LOTSIZE           : Integer;
            PLANNING_STRATEGY : String(2);
            DELETE_FLAG       : String(1);
            MRP_GROUP         : String(4);
            MRP_TYPE          : String(2);
            CHANGED_DATE      : Date;
            CHANGED_TIME      : Time;
            CHANGED_BY        : String(12);
            CREATED_DATE      : Date;
            CREATED_TIME      : Time;
            CREATED_BY        : String(12);
    }

    //productandclass_st
    entity PROD_CLASS_STB1 {
            MANDT        : String(3);
        key PRODUCT_ID   : String(40);
        key CLINT        : String(10);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }

    //: classC_stb
    entity CLASS_C_STB {
            MANDT          : String(3);
        key INT_CLS_NUMBER : String(10);
        key CLASS_TYPE     : String(3);
        key CLASS          : String(18);
        key ZDESC          : String(40);
            DELETE_FLAG    : String(1);
            CHANGED_DATE   : Date;
            CHANGED_TIME   : Time;
            CHANGED_BY     : String(12);
            CREATED_DATE   : Date;
            CREATED_TIME   : Time;
            CREATED_BY     : String(12);
    }


    //characteristicdata_stb
    entity CHARC_DATA_STB1 {
            MANDT          : String(3);
        key INT_CLS_NUMBER : String(10);
        key INT_CHAR       : String(10);
        key CHAR_NAME      : String(30);
        key CHAR_DESC      : String(50);
            CHAR_GROUP     : String(10);
        key CHAR_DATATYPE  : String(4);
            CHAR_CATEGORY  : String(2);
            MULTI_CHAR     : String(1);
            ENTRY_REQ      : String(1);
            DELETE_FLAG    : String(1);
            CHANGED_DATE   : Date;
            CHANGED_TIME   : Time;
            CHANGED_BY     : String(12);
            CREATED_DATE   : Date;
            CREATED_TIME   : Time;
            CREATED_BY     : String(12);
    }

    //characteristicvalues_stb
    entity CHARAC_VALUES_STB1 {
            MANDT        : String(3);
        key INT_CHAR     : String(10);
        key CHAR_VALUE   : String(70);
        key CHAR_VDESC   : String(70);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }

    //productconfiguration_stb
    entity PROD_CONF_STB {
        key PRODUCT_ID   : String(40);
        key LOCATION_ID  : String(4);
            PRODUCT_DESC : String(40);
            PRODUCT_TYPE : String(4);
            REF_PRODID   : String(40);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }

    //materialitemdata_stb
    entity MAT_LTE_MDATA_STB {
        key PRODUCT_ID        : String(40);
        key LOCATION_ID       : String(4);
        key CLASS_NUM         : String(10);
        key CHARACTERSTIC_NUM : String(10);
        key VALUE_NUM         : String(15);
            CHANGED_DATE      : Date;
            CHANGED_TIME      : Time;
            CHANGED_BY        : String(12);
            CREATED_DATE      : Date;
            CREATED_TIME      : Time;
            CREATED_BY        : String(12);
    }


    entity BOM_MAT {
            MANDT          : String(3);
        key LOCATION_ID    : String(4);
        key COUNTER        : String(6);
        key MAT_PARENT     : String(40);
        key MAT_CHILD      : String(40);
        key VALID_FROM     : Date;
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
            CHANGED_DATE   : Date;
            CHANGED_TIME   : Time;
            CHANGED_BY     : String(12);
            CREATED_DATE   : Date;
            CREATED_TIME   : Time;
            CREATED_BY     : String(12);
    }

    entity BOM_OD {
        key MANDT        : String(3);
        key LOCATION_ID  : String(4);
        key COUNTER      : String(6);
        key MAT_PARENT   : String(40);
        key MAT_CHILD    : String(40);
        key DEPENDENCY   : String(30);
        key VALID_FROM   : Date;
            VALID_TO     : Date;
            DEP_DESC     : String(30);
            CHANGE_NO    : String(12);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }

    entity BOM_OD_DEP {
        key MANDT           : String(3);
        key DEPENDENCY      : String(30);
        key LINE_NO         : Integer;
            LINE            : String(72);
            DEPENDENCY_TYPE : String(1);
            DELETE_FLAG     : String(1);
            CHANGED_DATE    : Date;
            CHANGED_TIME    : Time;
            CHANGED_BY      : String(12);
            CREATED_DATE    : Date;
            CREATED_TIME    : Time;
            CREATED_BY      : String(12);
    }

    // Table for Re-procedure for S4 System
    entity REPROCEDURE_S4_LOG {
            MANDT          : String(3);
        key OBJECT_NAME    : String(50);
        key OBJECT_VALUE   : String(100);
        key DATE_OF_ERROR  : Date;
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


    //Assemblycomponents_stb
    entity ASS_COMP_STB {
            MANDT         : String(3);
        key LOCATION_ID   : String(4);
        key ASSEMBLY      : String(40);
        key SUB_COMP      : String(40);
            VALID_FROM    : Date;
            VALID_TO      : Date;
            COMP_TYPE     : String(4);
            PROD_DESC     : String(40);
            COMPONENT_QTY : String(18);
            UOM           : String(10);
            CRITICAL_COMP : String(1);
            CHANGE_NO     : String(12);
            DELETE_FLAG   : String(1);
            CHANGED_DATE  : Date;
            CHANGED_TIME  : Time;
            CHANGED_BY    : String(12);
            CREATED_DATE  : Date;
            CREATED_TIME  : Time;
            CREATED_BY    : String(12);
    }


    //ObjectDependencyMasterDAta_stb
    entity OBJ_DEPEN_MAS_DATA_STB {
        key OBJ_DEP      : String(30);
        key OBJ_COUNTER  : String(5);
        key CLASS_NUM    : String(10);
        key CHAR_NUM     : String(10);
        key CHAR_COUNTER : String(5);
        key CHARVAL_NUM  : String(15);
            OD_CONDITION : String(2);
            ROW_ID       : String(5);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);

    }


    //masterdatanode_stb--ippe
    entity MAST_DATA_NODE_STB {
        key CHILD_NODE   : String(50);
        key PARENT_NODE  : String(50);
            LOWERLIMIT   : Integer;
            UPPERLIMIT   : Integer;
            ACCESS_NODE  : String(50);
            NODE_TYPE    : String(2);
            NODE_DESC    : String(200);
            AUTH_GROUP   : String(4);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }


    entity partialproduct_header {
            MANDT        : String(3);
        key PRODUCT_ID   : String(40);
        key LOCATION_ID  : String(4);
            PRODUCT_DESC : String(40);
            PRODUCT_TYPE : String(4);
            REF_PRODID   : String(40);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }

    entity partialproduct_item {
            MANDT                : String(3);
        key PRODUCT_ID           : String(40);
        key LOCATION_ID          : String(4);
        key CLASS_NUM            : Integer;
        key CHARACTERSTIC_NUM    : Integer;
        key VALUE_NUM            : String(40);
        key CHARACTERISTIC_VALUE : String(70);
            DELETE_FLAG          : String(1);
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time;
            CHANGED_BY           : String(12);
            CREATED_DATE         : Date;
            CREATED_TIME         : Time;
            CREATED_BY           : String(12);
    }


    //PVBillOfMaterial_stb--ippe
    entity PVBLL_MAT_STB {
        key LOCATION_ID  : String(4);
        key PRODUCT_ID   : String(40);
        key ITM_NUM      : Integer;
        key COMPONENT    : String(40);
            STRUC_NODE   : String(50);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }

    //Product_AccessNode_stb--ippe
    entity PROD_ACC_NODE_STB {
        key LOCATION_ID  : String(4);
        key PRODUCT_ID   : String(40);
            ACCESS_NODE  : String(50);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }


    // bom dependency_stb

    entity BOM_DEPN_STB {
        key LOCATION_ID   : String(4);
        key PRODUCT_ID    : String(40);
        key ITEM_NUM      : String(6);
        key COMPONENT     : String(40);
        key DEPENDENCY    : String(30);
            DEP_DESC      : String(30);
            COMPONENT_QTY : String(13);
            VALID_FROM    : Date;
            VALID_TO      : Date;
            CHANGE_NO     : String(12);
            CHANGED_DATE  : Date;
            CHANGED_TIME  : Time;
            CHANGED_BY    : String(12);
            CREATED_DATE  : Date;
            CREATED_TIME  : Time;
            CREATED_BY    : String(12);
    }


    // maintain_mrp_stb
    entity MAIN_MRP_STB {
        key LOCATION_ID : String(4);
        key MRP_GROUP   : String(4);
    }

    entity INTERFACE_TABLE {
        key SERVICE_ID   : Integer64;
            SERVICE_NAME : String(100);
            SERVICE_DESC : String;
    }


    entity CONFIG_INT_TAB1 {
        key SERVICE_ID     : Integer64;
        key INTERFACE_TYPE : Integer;
    }

    entity INTERFACE_TYPE {
        key INTERFACE_TYPE : Integer;
            TYPE_NAME      : String(100);


    }

    entity INTERFACE_PARAMS {
        key INTERFACE_TYPE : Integer;
        key PARAMETER_ID   : Integer;
            PARAMETER_NAME : String(100);

    }

    entity INTERFACE_PARAMS_VALUE {
        key INTERFACE_TYPE : Integer;
        key PARAMETER_ID   : Integer;
        key VALUE_ID       : String(100);
            VALUE_NAME     : String(200);
            POSITION       : Integer;
    }

    entity INTERFACE_SERV_CONFIG {
        key SERVICE_ID     : Integer;
        key INTERFACE_TYPE : Integer;
        key PARAMETER_ID   : Integer;
            VALUE_ID       : String(100);
    }

    entity interface_log_table {
        key SERVICE_ID : Integer;
        key OPERATION  : String;
        key TIMESTAMP  : String;
        key DATA       : String;
            STATUS     : String;
            MESSAGE    : String;
    }

    entity interface_ext_log {
        key SERVICE_ID    : Integer;
            Path          : String;
        key Connection    : String;
            Auth_type     : String;
            Approval_type : String;
            Credentials   : String;

    }

    entity Config_Job_Status {
        key JOb_NAME : String(100);
        key REQ_TYPE : String(10);
            Time     : String(50);
            STATUS   : String(25);
    }

    entity INTERFACELOGINFO {
        key LOGID           : UUID;
            INTERAFACE_NAME : String(100);
            INTERFACE_TYPE  : String(50);
        key STATUS_TYPE     : String(50);
        key STATUS_CODE     : Integer;
            MESSAGE         : String;
            PAYLOAD         : LargeString;
            CREATED_DATE    : Date @cds.on.insert: $now;
            CREATED_TIME    : Time @cds.on.insert: $now;
    }

    entity LOCATIONMASTERDATA {
        key LOCID           : String(20);
            EXTRISKRELEVANT : String(1);
            GEOLATITUDE     : Double;
            GEOLONGITUDE    : Double;
            HOLDINGCOSTPCT  : Double;
            LOCBUPAID       : String(40);
            LOCDESCR        : String(60);
            LOCIDISPLAY     : String(20);
            LOCREGION       : String(20);
            LOCTYPE         : String(10);
            LOCVALID        : String(1);
            PROFILESETID    : String(10);
            ZCALID          : String(32);
    }

    entity SALES_TEMP_TABLE {
        key SALES_DOCUMENT      : String(10);
        key SALES_DOCUMENT_ITEM : Integer64;
            DATA                : LargeString;
            STATUS              : String;
    }

    entity VAR_HDR {
        key TABLE_NAME      : String(18);
            TABLE_DESC      : String(40);
            BOM_IND         : String(1);
            CON_PROFILE_IND : String(1);
            PROCESS_DATE    : Date;
            DELETE_FLAG     : String(1);
            CHANGED_DATE    : Date;
            CHANGED_TIME    : Time;
            CHANGED_BY      : String(12);
            CREATED_DATE    : Date;
            CREATED_TIME    : Time;
            CREATED_BY      : String(12);
    }

    entity VAR_DEF {
        key TABLE_NAME   : String(18);
        key CHAR_NAME    : String(30);
            CHAR_KEY     : String(1);
            DELETE_FLAG  : String(1);
            CHANGED_DATE : Date;
            CHANGED_TIME : Time;
            CHANGED_BY   : String(12);
            CREATED_DATE : Date;
            CREATED_TIME : Time;
            CREATED_BY   : String(12);
    }

    entity VAR_CONTNT {
        key TABLE_NAME           : String(18);
        key ROW_ID               : Integer;
        key COLUMN_ID            : Integer;
        key CHAR_NAME            : String(30);
            CHAR_NUM             : String(10);
            CHARACTERISTIC_VALUE : String(70);
            DELETE_FLAG          : String(1);
            CHANGED_DATE         : Date;
            CHANGED_TIME         : Time;
            CHANGED_BY           : String(12);
            CREATED_DATE         : Date;
            CREATED_TIME         : Time;
            CREATED_BY           : String(12);
    }

    entity PRODUCTION_CONSUMPTION {
        key LOCATION_ID          : String(4);
        key SALES_DOCUMENT       : String(10);
        key SALES_DOCUMENT_ITEM  : String(10);
        key CONFIG_MAT           : String(40);
        key COMPONENT            : String(40);
        key COMP_LOC             : String(4);
            PARENT_MAT           : String(40);
            PARENT_LOC           : String(4);
            COMP_PROCURE_TYPE    : String(1);
            QUANTITY             : Double;
            UOM                  : String(10);
            PROD_AVAILABILITY_DT : Date;
            DELETE_FLAG          : String(1);
            CHANGED_DATE         : String(20);
            CHANGED_TIME         : String(20);
            CHANGED_BY           : String(12);
            CREATED_DATE         : String(20);
            CREATED_TIME         : String(20);
            CREATED_BY           : String(12);
    }

    entity SALES_PRODUCTION_ORDERS {
        key SALES_DOCUMENT      : String(10);
        key SALES_DOCUMENT_ITEM : String(10);
        key AUFNR               : String(12);
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

}

@cds.persistence.exists
@cds.persistence.table

entity SELECTIONOPTIONS {
        SERVICE_NAME   : String(100);
    key PARAMETER_NAME : String(100);
        VALUE_ID       : String(100);
};

@cds.persistence.exists
@cds.persistence.table

entity CONFIGOPTIONS {
        SERVICE_NAME : String(100);
    key OPERATION    : String;
    key TIMESTAMP    : String;
    key DATA         : String;
        STATUS       : String;
        MESSAGE      : String;
};
