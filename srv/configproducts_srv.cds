using {config_products as external} from './external/config_products';
using {alerts as external1} from './external/alerts';
using {config_products_anal as cp_analytical} from './external/config_products_anal';
using {planner as planner_entity} from './external/planner';

@cds.query.limit: {
    default: 100,
    max    : 9000
}
service CatalogInterface {
    entity getForecastSnapshotLag  as projection on external.getForecastSnapshotLag;
    entity getAssemblySnapshotLag  as projection on external.getAssemblySnapshotLag;
    entity getfactorylocdesc       as projection on external.getfactorylocdesc;
    entity getPlannerAlerts        as projection on external1.getPlannerAlerts;
    entity getVariantHeader        as projection on external.getVariantHeader;
    entity getVariant              as projection on external.getVariant;
    entity getDemandAndForecast    as projection on cp_analytical.getDemandAndForecast;
    entity getDMDForecast          as projection on cp_analytical.getDMDForecast;
    entity getAssemblyRequirements as projection on external.getAssemblyRequirements;
    entity getIBPCalenderWeek      as projection on external.getIBPCalenderWeek;
    entity getAssemblyCompQty      as projection on external.getAssemblyCompQty;
    entity getDMDAnalytical        as projection on external.getDMDAnalytical;
    entity getLocation             as projection on external.getLocation;
    entity getAssemblyData         as projection on planner_entity.getAssemblyData;
    entity getPlannerLocProd as projection on planner_entity.getPlannerLocProd;
    //To get distinct restriction data
    entity getAssemblyDesc as projection on planner_entity.getAssemblyDesc;
    entity getRTRData              as projection on planner_entity.getRTRData;
    //To get distinct Option percent data
    entity getOptPrtData           as projection on planner_entity.getOptPrtData;
    //To get distinct product demand data
    entity getPrdDmdData           as projection on planner_entity.getPrdDmdData;
    function getAlertToken()                                                                                                                                                                  returns String;
    function createVariantPlanner(Flag: String, USER: String, VARDATA: String)                                                                                                                       returns String;
    function updateVariantPlanner(VARDATA: String)                                                                                                                                                   returns String;
    function getcharAnalysis(FROM_DATE: String, TO_DATE: String)                                                                                                                              returns String;
    function getAssemblyLag()                                                                                                                                                                 returns String;
    function getAssemblyLagfun(FACTORY_LOCATION: String(10), LOCATION: String(10), PRODUCT: String(40), START_MONTH: String(50), END_MONTH: String(40))                                          returns String;
    //Function for Assembly lags
    //Function for option percentage lags
    function getOptPercentLagFun(FACTORY_LOCATION: String(10), LOCATION: String(10), PRODUCT: String(40), START_MONTH: String(20),END_MONTH:String(20)) returns String;

    //Function for Restriction Lags
 function getRestrictionLagFun(FACTORY_LOCATION: String(10), LOCATION: String(10),START_MONTH: String(20), END_MONTH: String(20) ) returns String;
    //Function for ProductDemand lag
    function getPrdDmdLagFun(FACTORY_LOCATION: String(10), LOCATION: String(10),PRODUCT:String(40),START_MONTH: String(20),END_MONTH:String(20)) returns String;
    function getStatForecast(FACTORY_LOCATION: String(10), LOCATION: String(10),PRODUCT:String(40),START_MONTH: String(20),END_MONTH:String(20)) returns String;
}