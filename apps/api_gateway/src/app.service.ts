import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@app/share_lib/database/database.service';

@Injectable()
export class AppService {
  constructor(private databaseService: DatabaseService) {}

  async someMethod() {
    // this.databaseService.connectHana();
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
