import cds from '@sap/cds';

import { Injectable, HttpStatus } from '@nestjs/common';
import { AppService } from '../../app.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly appService: AppService,
  ) {}

  /** Get all control check points api
   * by Racktim Guin
   */
  async getControlCheckPoints() : Promise<any>{
    try {
      const db = await cds.connect.to('db'); 

      const whereClause = cds.parse.expr(
        `IS_ACTIVE = 'Y'`,
      );

      const allControlCheckpoints = await db.read('PCF_DB_CHECK_POINT_MASTER').where(whereClause);

      if (!allControlCheckpoints || allControlCheckpoints.length === 0) {
        return {
          statuscode: HttpStatus.NOT_FOUND,
          message: 'No Control Check Points found',
          data: allControlCheckpoints,
        };
      }

      return {
        statuscode: HttpStatus.OK,
        message: 'Data fetched successfully',
        data: allControlCheckpoints,
      };
    } catch (error) {
      return {
        statuscode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch check points',
        data: error,
      };
    }

  }
}