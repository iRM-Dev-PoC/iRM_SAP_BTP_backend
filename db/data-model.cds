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
      IS_ACTIVE        : String;

}


entity Control_master : managed {
  key ID             : Integer @cds.autoincrement;
      CONTROL_ID     : UUID    @cds.UUID;
      CONTROL_FAMILY : Association to Control_family_master;
      CONTROL_NAME   : String;
      CONTROL_DESC   : String;
      CUSTOMER_ID    : Association to Customer_master;
      IS_ACTIVE      : String;
}

entity Control_family_master : managed {
  key ID                  : Integer @cds.autoincrement;
      CONTROL_FAMILY_ID   : UUID    @cds.UUID;
      CONTROL_FAMILY_NAME : String;
      CONTROL_FAMILY_DESC : String;
      CUSTOMER_ID         : Association to Customer_master;
      C_MASTER            : Association to many Control_master
                              on C_MASTER.CONTROL_FAMILY = $self;
      IS_ACTIVE           : String;
}


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
      IS_ACTIVE            : String;

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
      IS_ACTIVE             : String;
}

//26-02-2024
entity sync_header : managed {
  key ID              : Integer @cds.autoincrement;
      SYNC_ID         : UUID    @cds.UUID;
      SYNC_STATUS     : String;
      CONTROL_ID      : Association to Control_master;
      CUSTOMER_ID     : Association to Customer_master;
      SYNC_STARTED_AT : DateTime;
      SYNC_ENDED_AT   : DateTime;
      IS_ACTIVE       : String;

}

entity sync_details : managed {
  key ID                 : Integer @cds.autoincrement;
      SYNC_HEADER_ID     : Association to sync_header;
      SYNC_STATUS        : String;
      CONTROL_ID         : Association to Control_master;
      REPORT_ID          : Association to Report_master;
      REPORT_DESTINATION : String;
      SYNC_STARTED_AT    : DateTime;
      SYNC_ENDED_AT      : DateTime;
      CHANGED_BY         : String;
      CHANGED_ON         : DateTime;
      CUSTOMER_ID        : Association to Customer_master;
      IS_ACTIVE          : String;

}

entity Report_master : managed {
  key ID                 : Integer @cds.autoincrement;
      REPORT_ID          : UUID    @cds.UUID;
      REPORT_PATH        : String;
      REPORT_NAME        : String;
      REPORT_CREATED_AT  : DateTime;
      REPORT_DESTINATION : String;
      CUSTOMER_ID        : Association to Customer_master;
      IS_ACTIVE          : String;
      CREATED_BY         : String;
      CREATED_ON         : DateTime;
      CHANGED_ON         : DateTime;
      CHANGED_BY         : String;
}

entity Control_report_mapping : managed {
  key ID          : Integer @cds.autoincrement;
      REPORT_ID   : Association to Report_master;
      CONTROL_ID  : Association to Control_master;
      CUSTOMER_ID : Association to Customer_master;
      IS_ACTIVE   : String;
      CREATED_BY  : String;
      CREATED_ON  : DateTime;
      CHANGED_ON  : DateTime;
      CHANGED_BY  : String;
}

entity Price_mismatch_output : managed {
  key ID           : Integer @cds.autoincrement;
      SYNC_ID      : Association to sync_header;
      EMP_ID       : Association to PA0002_Employee_Master;
      INVOICE_ID   : Association to ZSD0070_Billing_Report;
      ORDER_ID     : Association to VA05_Sales_Order;
      CONTROL_ID   : Association to Control_master;
      CUSTOMER_ID  : Association to Customer_master;
      SIMULATED_AT : DateTime;
      SIMULATED_BY : String;
      IS_ACTIVE    : String;
      CREATED_BY   : String;
      CREATED_ON   : DateTime;
      CHANGED_ON   : DateTime;
      CHANGED_BY   : String;
}

entity Login_user : managed {
  key ID          : Integer @cds.autoincrement;
      USER_ID     : UUID    @cds.UUID;
      USER_NAME   : String;
      USER_EMAIL  : String;
      USER_EMP_ID : String;
      PASSWORD    : String;
      CUSTOMER_ID : Association to Customer_master;
      IS_ACTIVE   : String;
      CREATED_ON  : DateTime;
      CREATED_BY  : String;
      CHANGED_ON  : DateTime;
      CHANGED_BY  : String;
      ROLE_ID     : Association to Role_master;
      ROLE_NAME   : String;
}

entity Role_master : managed {
  key ID              : Integer @cds.autoincrement;
      ROLE_ID         : UUID    @cds.UUID;
      ROLE_NAME       : String;
      ROLE_DESC       : String;
      CUSTOMER_ID     : Association to Customer_master;
      ROLE_PERMISSION : String;
      IS_ACTIVE       : String;
      CREATED_BY      : String;
      CREATED_ON      : DateTime;
      CHANGED_ON      : DateTime;
      CHANGED_BY      : String;
}

entity Privilege {
  key ID             : Integer @cds.autoincrement;
      PRIVILEGE_ID   : UUID    @cds.UUID;
      PRIVILEGE_NAME : String;
      PRIVILEGE_DESC : String;
      IS_ACTIVE      : String;
      CREATED_BY     : String;
      CREATED_ON     : DateTime;
      CHANGED_ON     : DateTime;
      CHANGED_BY     : String;
      CUSTOMER_ID    : Association to Customer_master;
}

entity User_privilege_mapping {
  key ID           : Integer @cds.autoincrement;
      USER_ID      : Association to Login_user;
      PRIVILEGE_ID : Association to Privilege;
      IS_ACTIVE    : String;
      CREATED_BY   : String;
      CREATED_ON   : DateTime;
      CHANGED_ON   : DateTime;
      CHANGED_BY   : String;
      CUSTOMER_ID  : Association to Customer_master;
}

entity User_role_mapping {
  key ID          : Integer @cds.autoincrement;
      USER_ID     : Association to Login_user;
      ROLE_ID     : Association to Role_master;
      IS_ACTIVE   : String;
      CREATED_BY  : String;
      CREATED_ON  : DateTime;
      CHANGED_ON  : DateTime;
      CHANGED_BY  : String;
      CUSTOMER_ID : Association to Customer_master;
}

entity Module_master {
  key ID               : Integer @cds.autoincrement;
      MODULE_ID        : UUID    @cds.UUID;
      MODULE_NAME      : String;
      DISPLAY_MODULE_NAME : String;
      MODULE_DESC      : String;
      PARENT_MODULE_ID : Association to Module_master;
      IS_ACTIVE        : String;
      CREATED_ON       : DateTime;
      CREATED_BY       : String;
      CHANGED_ON       : DateTime;
      CHANGED_BY       : String;
      CUSTOMER_ID      : Association to Customer_master;
}

entity SubModule_master {
  key ID               : Integer @cds.autoincrement;
      SUBMODULE_ID     : UUID    @cds.UUID;
      SUBMODULE_NAME   : String;
      DISPLAY_SUBMODULE_NAME:String;
      SUBMODULE_DESC   : String;
      PARENT_MODULE_ID : Association to Module_master;
      IS_ACTIVE        : String;
      CREATED_ON       : DateTime;
      CREATED_BY       : String;
      CHANGED_ON       : DateTime;
      CHANGED_BY       : String;
      CUSTOMER_ID      : Association to Customer_master;
}

entity Role_module_submodule_mapping {
  key ID             : Integer @cds.autoincrement;
      ROLE_ID        : Association to Role_master;
      MODULE_ID      : Association to Module_master;
      SUBMODULE_ID   : Association to SubModule_master;
      IS_ACTIVE      : String;
      CREATED_ON     : DateTime;
      CREATED_BY     : String;
      CHANGED_ON     : DateTime;
      CHANGED_BY     : String;
      CUSTOMER_ID    : Association to Customer_master;
      PRIVILEGE_FLAG : String;
}
