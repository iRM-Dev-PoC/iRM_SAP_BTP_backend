namespace pcf.db;

using {
  managed,
  Country
} from '@sap/cds/common';

entity Books {
  key ID         : Integer @cds.autoincrement;
      title      : localized String;
      author     : String;
      stock      : Integer;
      INC_ID     : Integer @cds.autoincrement;
      INC_ID_STR : UUID    @cds.UUID;

}

entity Authors {
  key ID   : Integer;
      name : String;

}

entity Orders : managed {
  key ID      : UUID;
      book    : Association to Books;
      country : Country;
      amount  : Integer;
}




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
//   key ID    : Integer @cds.autoincrement;
//       SALES_ORDER_ID : UUID    @cds.UUID;
//       SALES_ORDER_DATE : DateTime;
//       SALES_ORDER_DESC : String;
//       SALES_ORDER_ITEM:String;
//       SALES_ORDER_UNIT:String;
//       SALES_ORDER_COST:Integer;
//       CUSTOMER_ID : Association to Customer_master;
// }

entity student_master : managed {
  key ID      : Integer @cds.autoincrement;
      name    : String;
      age     : Integer;
      address : String;
      email   : String;
}

entity PA0002_Employee_Master : managed {
  key ID               : Integer @cds.autoincrement;
      SYNC_ID          : String; //SYNC ID OF SYNC HEADER
      EMP_ID           : UUID    @cds.UUID;
      EMP_NAME         : String;
      EMP_ADDRESS      : String;
      CUSTOMER_ID      : Association to Customer_master; //CUSTOMER MASTER ID
      CLIENT           : String;
      PERSONNEL_NUMBER : String;
      END_DATE         : DateTime;
      START_DATE       : DateTime;
      IS_ACTIVE        : String;
      FIRST_NAME       : String;
      LAST_NAME        : String;
      MIDDLE_NAME      : String;
      DATE_OF_BIRTH    : DateTime;
      ID_NUMBER        : String;
      CREATED_BY       : String;
      CREATED_ON       : DateTime;
}

entity VA05_Sales_Order : managed {
  key ID                   : Integer @cds.autoincrement;
      SALES_ORDER_ID       : UUID    @cds.UUID;
      SALES_ORDER_DATE     : DateTime;
      SALES_ORDER_DESC     : String;
      SALES_ORDER_ITEM     : String;
      SALES_ORDER_UNIT     : String;
      SALES_ORDER_COST     : String;
      CUSTOMER_ID          : Association to Customer_master;
      SALES_DOCUMENT       : String;
      DOCUMENT_DATE        : DateTime;
      CREATED_BY           : String;
      CREATED_ON           : DateTime;
      TIME                 : Time;
      SOLD_TO_PARTY        : String;
      NET_VALUE            : String;
      SOLD_TO_PARTY_NAME   : String;
      SALES_DOCUMENT_ITEM  : String;
      MATERIAL_DESCRIPTION : String;
      PERSONNEL_NUMBER     : String;

}

entity ZSD0070_Billing_Report : managed {
  key ID                    : Integer @cds.autoincrement;
      BILLING_REPORT_ID     : UUID    @cds.UUID;
      BILLING_DOCUMENT      : String;
      SALES_DOCUMENT        : String;
      CUSTOMER_ID           : Association to Customer_master;
      PAYER_DESCRIPTION     : String;
      ITEM_DESCRIPTION      : String;
      BILLING_DATE          : DateTime;
      NET_VALUE             : String;
      TAX_AMOUNT            : String;
      COST                  : String;
      GRORSS_VALUE          : String;
      SUMOF_NET_GROSS_VALUE : String;
      DELIVERY_NUMBER       : String;
      SHIP_TO_PARTY1        : String;
      CREATED_BY            : String;
      CREATED_ON            : DateTime;
      START_DATE            : DateTime;
      END_DATE              : DateTime;
}
