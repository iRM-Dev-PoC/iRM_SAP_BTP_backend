import { HttpStatus, Injectable } from "@nestjs/common";
import cds from "@sap/cds";

@Injectable()
export class DataService {
  // async dataSimulation(hdrId: number): Promise<any> {
  //   try {
  //     const db = await cds.connect.to("db");

  //     const simulations = await db
  //       .read("PCF_DB_CHECK_POINT_MASTER")
  //       .columns("SIMULATION", "OUT_TABLE")
  //       .where("IS_ACTIVE = 'Y'");

  //     const queries = simulations.map((simulation) => ({
  //       query: simulation.SIMULATION.replace(/\${hdrId}/g, hdrId),
  //       outTable: simulation.OUT_TABLE,
  //     }));

  //     for (const { query, outTable } of queries) {
  //       const result = await db.run(query);

  //       const controlOutData = result.map((item) => ({
  //         ...item,
  //         SYNC_HEADER_ID: hdrId,
  //         CUSTOMER_ID: 1,
  //       }));

  //       if (controlOutData.length > 0) {
  //         const insertRows = await cds.run(
  //           INSERT.into(outTable).entries(controlOutData),
  //         );
  //         console.log(`Data Inserted Successfully`);
  //       } else {
  //         console.log(`No data to insert into ${outTable}`);
  //       }
  //     }

  //     await cds.run(
  //       UPDATE("PCF_DB_SYNC_HEADER")
  //         .set({ IS_SIMULATED: true })
  //         .where({ ID: hdrId }),
  //     );

  //     return {
  //       statusCode: HttpStatus.OK,
  //       message: "Data Simulated Successfully!",
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     return {
  //       statusCode: HttpStatus.BAD_REQUEST,
  //       message:
  //         "Error in Data Simulation! - Please fill all the required fields",
  //     };
  //   }
  // }
}
