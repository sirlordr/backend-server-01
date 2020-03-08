/*
import uuidv4 from 'uuid/v4';
import moment from 'moment-timezone';
import os from 'os';
import bcrypt from 'bcrypt';
*/
import cluster from 'cluster';

import CommonConstants from '../../../../02_system/common/CommonConstants';
import SystemConstants from "../../../../02_system/common/SystemContants";

import CommonUtilities from '../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../02_system/common/SystemUtilities';

//import { User } from '../../../02_system/common/database/models/User';
import { SYSUserGroup } from '../../../../02_system/common/database/models/SYSUserGroup';

const debug = require( 'debug' )( '502_check_business_groups_and_users_exists' );

//Example file import files using code
export default class Always {

  static disabled(): boolean {

    return false;

  }

  static async execute( dbConnection: any, context: any, logger: any ): Promise<any> {

    //The dbConnection parameter is instance of ORM object (sequelize)
    let bSuccess = false;
    let bEmptyContent = true;

    let currentTransaction = null;

    try {

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

      }

      const userGroupEntries = [
                                 {
                                   Id: "d7648ed4-1914-4fe4-9902-072a21db1f00",
                                   Name: "Drivers",
                                   Role: "#Drivers#",
                                   Tag: "#Drivers#",
                                   Comment: "Created from backend startup. Group of users for testing.",
                                   CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                                   DisabledBy: "0", //"1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                                 },
                               ]

      const loopUserGroupEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userGroupEntries as any, async ( userGroupToCreate: any ) => {

          const options = {

            where: { Id: userGroupToCreate.Id },
            //individualHooks: true,
            transaction: currentTransaction,

          }

          const userGroupInDB = await SYSUserGroup.findOne( options );

          if ( userGroupInDB === null ) {

            await SYSUserGroup.create( userGroupToCreate );

          }
          else if ( !userGroupInDB.Tag ||
                     userGroupInDB.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) {

            userGroupInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;
            userGroupInDB.DisabledBy = userGroupToCreate.DisabledBy;
            //userGroup.UpdatedAt = SystemUtilities.getCurrentDateAndTime().format();

            await SYSUserGroup.update( ( userGroupInDB as any ).dataValues, options );

          }

        });

      };

      await loopUserGroupEntriesAsync();

      /*
      const userEntries = [
                            {
                              Id: "23e0a6d8-4cc8-4cec-a2a7-7382539c1cd9",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem01",
                              Password: "@",
                              Role: "#Foreign_Systems#,#Binary_Basic#,#Binary_Search#,#Odin#",
                              Tag: "#Odin#",
                              Comment: "Created from backend startup. Mobile App Drivers, Restaurants. System Odin.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "25fd1d60-3285-42ed-98e7-fe3e6e08bc4b",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem02",
                              Password: "@",
                              Role: "#Foreign_Systems#,#Binary_Basic#,#Binary_Search#,#Odin#",
                              Tag: "#Odin#",
                              Comment: "Created from backend startup. System Migration command line tool.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                            {
                              Id: "4041c2d7-f7e2-44bb-b1fc-00c3a298ab03",
                              GroupId: "fe0476b1-d550-4b32-8731-1aa4c8a2c9bd",
                              ForceChangePassword: 0,
                              ChangePasswordEvery: 0,
                              SessionsLimit: 0,
                              Name: "ForeignSystem03",
                              Password: "@",
                              Role: "#Foreign_Systems#,#Binary_Basic#,#Binary_Search#,#Odin#",
                              Tag: "#Odin#",
                              Comment: "Created from backend startup. System Migration command line tool.",
                              CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET,
                              DisabledBy: "1@" + SystemConstants._DISABLED_BY_BACKEND_SYSTEM_NET,
                            },
                          ]

      const loopUserEntriesAsync = async () => {

        await CommonUtilities.asyncForEach( userEntries as any, async ( userToCreate: any ) => {

          const options = {

            where: { Id: userToCreate.Id },

          }

          const userInDB = await User.findOne( options );

          if ( userInDB === null ) {

            await User.create( userToCreate );

          }
          else if ( !userInDB.Tag ||
                    userInDB.Tag.indexOf( "#NotUpdateOnStartup#" ) === -1 ) {

            userInDB.Name = userToCreate.Name;
            userInDB.Password = userToCreate.Password; //await bcrypt.hash( userToCreate.Password, 10 );
            userInDB.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

            await User.update( ( userInDB as any ).dataValues,
                               options );

          }

        });

      };

      await loopUserEntriesAsync();
      */

      if ( currentTransaction !== null ) {

        await currentTransaction.commit();

      }

      bSuccess = true;
      bEmptyContent = false;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.execute.name;

      const strMark = "2E18A4C3D9F0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

      if ( currentTransaction !== null ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return { bSuccess, bEmptyContent };

  }

}