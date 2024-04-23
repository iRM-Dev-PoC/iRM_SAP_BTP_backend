namespace pcf.db;

@cds.persistence.exists
entity Customer_master  {
  key ID               : Integer;
      CUSTOMER_NAME    : String;
      CUSTOMER_ADDRESS : String;
      START_DATE       : Date;
      END_DATE         : Date;
      IS_ACTIVE        : String;
      CREATED_ON       : Timestamp;
      CREATED_BY       : Integer;
      CHANGED_ON       : Timestamp;
      CHANGED_BY       : Integer;
}

@cds.persistence.exists
entity Control_master  {
  key ID             : Integer ;
      CONTROL_FAMILY : Association to Control_family_master;
      CONTROL_NAME   : String;
      CONTROL_DESC   : String;
      CUSTOMER_ID    : Association to Customer_master;
      IS_ACTIVE      : String;
      CREATED_ON     :  Timestamp;
      CREATED_BY     : String;
      CHANGED_ON     :  Timestamp;
      CHANGED_BY     : String;
}

@cds.persistence.exists
entity Control_family_master  {
  key ID                  : Integer;
      CONTROL_FAMILY_NAME : String;
      CONTROL_FAMILY_DESC : String;
      CUSTOMER_ID         : Association to Customer_master;
      IS_ACTIVE           : String;
      CREATED_ON          : Timestamp;
      CREATED_BY          : String;
      CHANGED_ON          : Timestamp;
      CHANGED_BY          : String;
}



// entity PA0002_Employee_Master  {
//   key ID               : Integer ;
//       SYNC_ID          : String; //SYNC ID OF SYNC HEADER
//       EMP_ID           : UUID    @cds.UUID;
//       EMP_NAME         : String;
//       EMP_ADDRESS      : String;
//       CUSTOMER_ID      : Association to Customer_master; //CUSTOMER MASTER ID
//       CLIENT           : String;
//       PERSONNEL_NUMBER : String;
//       END_DATE         :  Timestamp;
//       START_DATE       :  Timestamp;
//       IS_ACTIVE        : String;
//       FIRST_NAME       : String;
//       LAST_NAME        : String;
//       MIDDLE_NAME      : String;
//       DATE_OF_BIRTH    :  Timestamp;
//       ID_NUMBER        : String;
//       CREATED_ON       :  Timestamp;
//       CREATED_BY       : String;
//       CHANGED_ON       :  Timestamp;
//       CHANGED_BY       : String;
// }

// entity VA05_Sales_Order  {
//   key ID                   : Integer ;
//       SALES_ORDER_ID       : UUID    @cds.UUID;
//       SALES_ORDER_DATE     :  Timestamp;
//       SALES_ORDER_DESC     : String;
//       SALES_ORDER_ITEM     : String;
//       SALES_ORDER_UNIT     : String;
//       SALES_ORDER_COST     : String;
//       CUSTOMER_ID          : Association to Customer_master;
//       SALES_DOCUMENT       : String;
//       DOCUMENT_DATE        :  Timestamp;
//       CREATED_ON           :  Timestamp;
//       CREATED_BY           : String;
//       CHANGED_ON           :  Timestamp;
//       CHANGED_BY           : String;
//       TIME                 : Time;
//       SOLD_TO_PARTY        : String;
//       NET_VALUE            : String;
//       SOLD_TO_PARTY_NAME   : String;
//       SALES_DOCUMENT_ITEM  : String;
//       MATERIAL_DESCRIPTION : String;
//       PERSONNEL_NUMBER     : String;
//       IS_ACTIVE            : String;

// }

// entity ZSD0070_Billing_Report  {
//   key ID                    : Integer ;
//       BILLING_REPORT_ID     : UUID    @cds.UUID;
//       BILLING_DOCUMENT      : String;
//       SALES_DOCUMENT        : String;
//       CUSTOMER_ID           : Association to Customer_master;
//       PAYER_DESCRIPTION     : String;
//       ITEM_DESCRIPTION      : String;
//       BILLING_DATE          :  Timestamp;
//       NET_VALUE             : String;
//       TAX_AMOUNT            : String;
//       COST                  : String;
//       GRORSS_VALUE          : String;
//       SUMOF_NET_GROSS_VALUE : String;
//       DELIVERY_NUMBER       : String;
//       SHIP_TO_PARTY1        : String;
//       CREATED_ON            :  Timestamp;
//       CREATED_BY            : String;
//       CHANGED_ON            :  Timestamp;
//       CHANGED_BY            : String;
//       START_DATE            :  Timestamp;
//       END_DATE              :  Timestamp;
//       IS_ACTIVE             : String;
// }

//26-02-2024
// entity sync_header  {
//   key ID              : Integer ;
//       SYNC_STATUS     : String;
//       CONTROL_ID      : Association to Control_master;
//       CUSTOMER_ID     : Association to Customer_master;
//       SYNC_STARTED_AT :  Timestamp;
//       SYNC_ENDED_AT   :  Timestamp;
//       IS_ACTIVE       : String;
//       CREATED_ON      :  Timestamp;
//       CREATED_BY      : String;
//       CHANGED_ON      :  Timestamp;
//       CHANGED_BY      : String;

// }

// entity sync_details  {
//   key ID                 : Integer ;
//       SYNC_HEADER_ID     : Association to sync_header;
//       SYNC_STATUS        : String;
//       CONTROL_ID         : Association to Control_master;
//       REPORT_ID          : Association to Report_master;
//       REPORT_DESTINATION : String;
//       SYNC_STARTED_AT    :  Timestamp;
//       SYNC_ENDED_AT      :  Timestamp;
//       CREATED_ON         :  Timestamp;
//       CREATED_BY         : String;
//       CHANGED_ON         :  Timestamp;
//       CHANGED_BY         : String;
//       CUSTOMER_ID        : Association to Customer_master;
//       IS_ACTIVE          : String;

// }

@cds.persistence.exists
entity Report_master  {
  key ID                 : Integer ;
      REPORT_PATH        : String;
      REPORT_NAME        : String;
      REPORT_DESTINATION : String;
      CUSTOMER_ID        : Association to Customer_master;
      IS_ACTIVE          : String;
      CREATED_BY         : String;
      CREATED_ON         : Timestamp;
      CHANGED_ON         : Timestamp;
      CHANGED_BY         : String;
}

@cds.persistence.exists
entity Check_point_master {
  key ID                : Integer ;
      CHECK_POINT_NAME  : String;
      CHECK_POINT_DESC  : String;
      CUSTOMER_ID       : Association to Customer_master;
      IS_ACTIVE         : String;
      CREATED_ON        : Timestamp;
      CREATED_BY        : String;
      CHANGED_ON        : Timestamp;
      CHANGED_BY        : String;

}

@cds.persistence.exists
entity Report_checkpoint_mapping  {
  key ID              : Integer ;
      REPORT_ID       : Association to Report_master;
      CHECK_POINT_ID  : Association to Check_point_master;
      CUSTOMER_ID     : Association to Customer_master;
      IS_ACTIVE       : String;
      CREATED_BY      : String;
      CREATED_ON      : Timestamp;
      CHANGED_ON      : Timestamp;
      CHANGED_BY      : String;
}

// entity Price_mismatch_output  {
//   key ID           : Integer ;
//       SYNC_ID      : Association to sync_header;
//       EMP_ID       : Association to PA0002_Employee_Master;
//       INVOICE_ID   : Association to ZSD0070_Billing_Report;
//       ORDER_ID     : Association to VA05_Sales_Order;
//       CONTROL_ID   : Association to Control_master;
//       CUSTOMER_ID  : Association to Customer_master;
//       SIMULATED_AT :  Timestamp;
//       SIMULATED_BY : String;
//       IS_ACTIVE    : String;
//       CREATED_BY   : String;
//       CREATED_ON   :  Timestamp;
//       CHANGED_ON   :  Timestamp;
//       CHANGED_BY   : String;
// }

@cds.persistence.exists
entity Login_user  {
  key ID          : Integer;
      USER_NAME   : String;
      USER_EMAIL  : String;
      USER_EMP_ID : String;
      PASSWORD    : String;
      CUSTOMER_ID : Association to Customer_master;
      IS_ACTIVE   : String;
      CREATED_ON  : Timestamp;
      CREATED_BY  : Integer;
      CHANGED_ON  : Timestamp;
      CHANGED_BY  : Integer;
      ROLE_ID     : Association to Role_master;
      DESIGNATION : String;
}

@cds.persistence.exists
entity Role_master  {
  key ID              : Integer;
      ROLE_NAME       : String;
      ROLE_DESC       : String;
      CUSTOMER_ID     : Association to Customer_master;
      ROLE_PERMISSION : String;
      IS_ACTIVE       : String;
      CREATED_BY      : Integer;
      CREATED_ON      : Timestamp;
      CHANGED_ON      : Timestamp;
      CHANGED_BY      : Integer;
}

@cds.persistence.exists
entity Privilege {
  key ID             : Integer ;
      PRIVILEGE_NAME : String;
      PRIVILEGE_DESC : String;
      IS_ACTIVE      : String;
      CREATED_BY     : Integer;
      CREATED_ON     : Timestamp;
      CHANGED_ON     : Timestamp;
      CHANGED_BY     : Integer;
      CUSTOMER_ID    : Association to Customer_master;
}

@cds.persistence.exists
entity User_privilege_mapping {
  key ID                    : Integer ;
      USER_ID               : Association to Login_user;
      PRIVILEGE_ID          : Association to Privilege;
      IS_ACTIVE             : String;
      CREATED_BY            : Integer;
      CREATED_ON            : Timestamp;
      CHANGED_ON            : Timestamp;
      CHANGED_BY            : Integer;
      CUSTOMER_ID           : Association to Customer_master;
      MODULE_ID             : Association to Module_master;
      SUBMODULE_ID          : Association to SubModule_master;
      DIRECT_PRIVILEGE_FLAG : String;

}

@cds.persistence.exists
entity User_role_mapping {
  key ID          : Integer ;
      USER_ID     : Association to Login_user;
      ROLE_ID     : Association to Role_master;
      IS_ACTIVE   : String;
      CREATED_BY  : Integer;
      CREATED_ON  : Timestamp;
      CHANGED_ON  : Timestamp;
      CHANGED_BY  : Integer;
      CUSTOMER_ID : Association to Customer_master;
}

@cds.persistence.exists
entity Module_master {
  key ID                  : Integer ;
      MODULE_NAME         : String;
      DISPLAY_MODULE_NAME : String;
      MODULE_DESC         : String;
      PARENT_MODULE_ID    : Association to Module_master;
      IS_ACTIVE           : String;
      CREATED_ON          : Timestamp;
      CREATED_BY          : Integer;
      CHANGED_ON          : Timestamp;
      CHANGED_BY          : Integer;
      CUSTOMER_ID         : Association to Customer_master;
}

@cds.persistence.exists
entity SubModule_master {
  key ID                     : Integer;
      SUBMODULE_NAME         : String;
      DISPLAY_SUBMODULE_NAME : String;
      SUBMODULE_DESC         : String;
      PARENT_MODULE_ID       : Association to Module_master;
      IS_ACTIVE              : String;
      CREATED_ON             : Timestamp;
      CREATED_BY             : Integer;
      CHANGED_ON             : Timestamp;
      CHANGED_BY             : Integer;
      CUSTOMER_ID            : Association to Customer_master;
}

@cds.persistence.exists
entity Role_module_submodule_mapping {
  key ID             : Integer ;
      ROLE_ID        : Association to Role_master;
      MODULE_ID      : Association to Module_master;
      SUBMODULE_ID   : Association to SubModule_master;
      IS_ACTIVE      : String;
      CREATED_ON     : Timestamp;
      CREATED_BY     : Integer;
      CHANGED_ON     : Timestamp;
      CHANGED_BY     : Integer;
      CUSTOMER_ID    : Association to Customer_master;
      PRIVILEGE_FLAG : String;
      PRIVILEGE_ID   : Association to Privilege;
}