import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/share_lib/database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) { }
  
  // for auto id increment for hana (cds)
  async getLastUserId(tableName: string): Promise<number>{
    const hanaOptions = this.databaseService.getHanaOptions();
    try {
      const generateQuery = `SELECT id FROM ${hanaOptions.schema}.${tableName} ORDER BY id DESC LIMIT 1`;
      const res = await this.databaseService.executeQuery(generateQuery, hanaOptions);

      if (res && res.length > 0) {
        return parseInt(res[0].ID) + 1;
      } else {
        return 1;
      }
    } catch (error) {
      console.error('Error:', error);
      return 0;
    }
  }

  // testing the database connection 
  async someMethod() {
    const hanaOptions = this.databaseService.getHanaOptions();
    console.log('Schema:', hanaOptions.schema);
    try {
      const result = await this.databaseService.executeQuery(
        `SELECT * FROM ${hanaOptions.schema}.PCF_DB_CONTROL_FAMILY_MASTER`, hanaOptions
      );
      return result; 
    } catch (error) {
      console.error('Error executing query:', error);
      throw error; 
    }
  }
}
