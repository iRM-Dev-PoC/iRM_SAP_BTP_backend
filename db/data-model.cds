namespace pcf.db;

using {managed} from '@sap/cds/common';

entity Books {
  key ID     : Integer @cds.autoincrement;
      title  : localized String;
      author : String;
      stock  : Integer;
}

entity Authors {
  key ID   : Integer @cds.autoincrement;
      name : String;
}

entity Orders : managed {
  key ID : UUID @cds.UUID;
}


// entity Employee_master : managed {
//   key ID          : Integer @cds.autoincrement;
//       SYNC_ID     : String; //SYNC ID OF SYNC HEADER
//       EMP_ID      : UUID    @cds.UUID;
//       EMP_NAME    : String;
//       EMP_ADDRESS : String;
//       CUSTOMER_ID : Association to Customer_master ;//CUSTOMER MASTER ID
// }

entity Customer_master : managed {
  key ID               : Integer @cds.autoincrement;
      CUSTOMER_ID      : UUID    @cds.UUID;
      CUSTOMER_NAME    : String;
      CUSTOMER_ADDRESS : String;
      START_DATE       : DateTime;
      END_DATE         : DateTime;

}

// entity Report_master : managed {
//   key ID          : Integer @cds.autoincrement;
//       REPORT_ID   : UUID    @cds.UUID;
//       REPORT_NAME : String;
//       REPORT_PATH : String;
//       REPORT_TYPE : String;
//       REPORT_STATUS : String;
//       REPORT_DESC : String;
//       CUSTOMER_ID : Association to Customer_master;
// }

entity Control_master : managed {
  key ID             : Integer @cds.autoincrement;
      CONTROL_ID     : UUID    @cds.UUID;
      CONTROL_FAMILY : Association to Control_family_master;
      CONTROL_NAME   : String;
      CONTROL_DESC   : String;
      CUSTOMER_ID    : Association to Customer_master;
}

entity Control_family_master : managed {
  key ID                  : Integer @cds.autoincrement;
      CONTROL_FAMILY_ID   : UUID    @cds.UUID;
      CONTROL_FAMILY_NAME : String;
      CONTROL_FAMILY_DESC : String;
      CUSTOMER_ID         : Association to Customer_master;
      C_MASTER            : Association to many Control_master
                              on C_MASTER.CONTROL_FAMILY = $self;

}

// entity Sales_order_master:managed{
//   key ID          : Integer @cds.autoincrement;
//       SALES_ORDER_ID : UUID    @cds.UUID;
//       SALES_ORDER_DATE : DateTime;
//       SALES_ORDER_DESC : String;
//       SALES_ORDER_ITEM:String;
//       SALES_ORDER_UNIT:String;
//       SALES_ORDER_COST:Integer;
//       CUSTOMER_ID : Association to Customer_master;
// }
