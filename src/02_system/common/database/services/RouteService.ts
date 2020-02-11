import cluster from 'cluster';

//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from 'uuid/v4';

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import DBConnectionManager from './../../managers/DBConnectionManager';
import { Route } from "../models/Route";
import RoleService from "./RoleService";
import RoleHasRouteService from "./RoleHasRouteService";
import BaseService from "./BaseService";

const debug = require( 'debug' )( 'RouteService' );

export default class RouteService extends BaseService {

  static readonly _ID = "RouteService";

  static async createOrUpdate( intAccessKind: number,
                               intRequestKind: number,
                               strPath: string,
                               strAllowTagAccess: string,
                               strDescription: string,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<Route> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      if ( currentTransaction == null ) {

        const dbConnection = DBConnectionManager.currentInstance;

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const strId = SystemUtilities.hashString( intRequestKind + ":" + strPath, 1, null );

      //let debugMark = debug.extend( '7287EB53C0BF' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
      //debugMark( strId );

      const options = {

        where: { "Id": strId },
        transaction: currentTransaction,
        //context: { TimeZoneId: "America/Los_Angeles" }

      }

      let routeInDB = await Route.findOne( options );

      //debugMark( "1 =>", routeInDB );

      if ( CommonUtilities.isNullOrEmpty( routeInDB ) ) {

        result = await Route.create(
                                     {
                                       AccessKind: intAccessKind,
                                       RequestKind: intRequestKind,
                                       Path: strPath,
                                       AllowTagAccess: strAllowTagAccess,
                                       Description: strDescription,
                                       CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                     },
                                     { transaction: currentTransaction }
                                   );

      }
      else if ( bUpdate ) {

        const currentValues = ( routeInDB as any ).dataValues;
        currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        currentValues.AllowTagAccess = SystemUtilities.mergeTokens( currentValues.AllowTagAccess,
                                                                    strAllowTagAccess,
                                                                    false,
                                                                    logger );

        const updateResult = await Route.update( currentValues,
                                                 options );

        if ( updateResult.length > 0 &&
             updateResult[ 0 ] >= 1 ) {

          result = await Route.findOne( options );

        }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "1C741F130111" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

      result = error;

    }

    return result;

  }

  static async createOrUpdateRouteAndRoles( intAccessKind: number,
                                            intRequestKind: number,
                                            strPath: string,
                                            strAllowTagAccess: string,
                                            roles: [],
                                            strDescription: string,
                                            transaction: any,
                                            logger: any ): Promise<Route> {

    let result = null;

    let currentTransaction = transaction;

    let bApplyTansaction = false;

    try {

      if ( currentTransaction == null ) {

        const dbConnection = DBConnectionManager.currentInstance;

        currentTransaction = await dbConnection.transaction();

        bApplyTansaction = true;

      }

      const route = await this.createOrUpdate( intAccessKind,
                                               intRequestKind,
                                               strPath,
                                               strAllowTagAccess,
                                               strDescription,
                                               true,
                                               currentTransaction,
                                               logger );

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( roles, async ( strRoleName: string, intIndex: number ) => {

          const role = await RoleService.createOrUpdate( strRoleName,
                                                         "Auto created by backend at startup",
                                                         false,
                                                         currentTransaction,
                                                         logger );

          if ( role &&
               ( role as any ).dataValues &&
               route &&
               ( route as any ).dataValues ) {

            await RoleHasRouteService.create( ( role as any ).dataValues.Id,
                                              ( route as any ).dataValues.Id,
                                              currentTransaction,
                                              logger );

          }

        });

        result = route;

      }

      await loopAsync();

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bApplyTansaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdateRouteAndRoles.name;

      const strMark = "B8567B7FDE27" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      if ( currentTransaction != null &&
           bApplyTansaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( ex ) {


        }

      }

    }

    return result;

  }

}