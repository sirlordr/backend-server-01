import cluster from 'cluster';

import CommonConstants from "../../CommonConstants";
import SystemConstants from "../../SystemContants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

import { SYSUserGroup } from "../models/SYSUserGroup";

import DBConnectionManager from "../../managers/DBConnectionManager";

import BaseService from "./BaseService";

const debug = require( 'debug' )( 'SYSUserGroupService' );

export default class SYSUserGroupService extends BaseService {

  static readonly _ID = "sysUserGroupService";

  static async getBy( by: { Id: string, ShortId: string, Name: string },
                      strTimeZoneId: string,
                      transaction: any,
                      logger: any ): Promise<SYSUserGroup> {

    let result: SYSUserGroup = null;

    if ( by.Id ) {

      result = await this.getById( by.Id,
                                   strTimeZoneId,
                                   transaction,
                                   logger );

    }

    if ( result === null &&
         by.ShortId ) {

      result = await this.getByShortId( by.ShortId,
                                        strTimeZoneId,
                                        transaction,
                                        logger );

    }

    if ( result === null &&
         by.Name ) {

      result = await this.getByName( by.Name,
                                     strTimeZoneId,
                                     transaction,
                                     logger );

    }

    return result;

  }

  static async getById( strId: string,
                        strTimeZoneId: string,
                        transaction: any,
                        logger: any ): Promise<SYSUserGroup> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "Id": strId },
        transaction: currentTransaction,

      }

      result = await SYSUserGroup.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getById.name;

      const strMark = "E0F4B6151C3C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return result;

  }

  static async getByShortId( strShortId: string,
                             strTimeZoneId: string,
                             transaction: any,
                             logger: any ): Promise<SYSUserGroup> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "ShortId": strShortId },
        transaction: currentTransaction,

      }

      result = await SYSUserGroup.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getById.name;

      const strMark = "55D9FD1115C6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return result;

  }

  static async getByName( strName: string,
                          strTimeZoneId: string,
                          transaction: any,
                          logger: any ): Promise<SYSUserGroup> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "Name": strName },
        transaction: currentTransaction,

      }

      result = await SYSUserGroup.findOne( options );

      if ( CommonUtilities.isValidTimeZone( strTimeZoneId ) ) {

        SystemUtilities.transformModelToTimeZone( result,
                                                  strTimeZoneId,
                                                  logger );

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getByName.name;

      const strMark = "8E36301230F7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

    }

    return result;

  }

  static async checkExistsById( strId: string,
                                transaction: any,
                                logger: any ): Promise<boolean> {

    return await this.getById( strId,
                               null,
                               transaction,
                               logger ) !== null;

  }

  static async checkDisabledById( strId: string,
                                  transaction: any,
                                  logger: any ): Promise<boolean> {

    const userGroup = await this.getById( strId,
                                          null,
                                          transaction,
                                          logger );

    return userGroup ? userGroup.DisabledBy !== null || userGroup.DisabledAt !== null : false;

  }

  static async checkExistsByName( strName: string,
                                  transaction: any,
                                  logger: any ): Promise<boolean> {

    return await this.getByName( strName,
                                 null,
                                 transaction,
                                 logger ) !== null;

  }

  static async checkDisabledByName( strName: string,
                                    transaction: any,
                                    logger: any ): Promise<boolean> {

    const userGroup = await this.getByName( strName,
                                            null,
                                            transaction,
                                            logger );

    return userGroup ? userGroup.DisabledBy !== null || userGroup.DisabledAt !== null : false;

  }

  static async checkExpiredById( strId: string,
                                 transaction: any,
                                 logger: any ): Promise<boolean> {

    const userGroup = await this.getById( strId,
                                          null,
                                          transaction,
                                          logger );

    return userGroup ? SystemUtilities.isDateAndTimeAfter( userGroup.ExpireAt ) : false;

  }

  static async checkExpiredByName( strName: string,
                                    transaction: any,
                                    logger: any ): Promise<boolean> {

    const userGroup = await this.getByName( strName,
                                            null,
                                            transaction,
                                            logger );

    return userGroup ? SystemUtilities.isDateAndTimeAfter( userGroup.ExpireAt ) : false;

  }

  static async checkDisabled( userGroup: SYSUserGroup ): Promise<boolean> {

    return userGroup ? userGroup.DisabledBy !== null ||
                       userGroup.DisabledAt !== null : false;

  }

  static async checkExpired( userGroup: SYSUserGroup ): Promise<boolean> {

    return userGroup ? SystemUtilities.isDateAndTimeAfter( userGroup.ExpireAt ) : false;

  }

  static async checkDisabledOrExpired( userGroup: SYSUserGroup ): Promise<boolean> {

    return userGroup ? userGroup.DisabledBy !== null ||
                       userGroup.DisabledAt !== null ||
                       SystemUtilities.isDateAndTimeAfter( userGroup.ExpireAt ) : false;

  }

  static async createOrUpdate( createOrUpdateData: any,
                               bUpdate: boolean,
                               transaction: any,
                               logger: any ): Promise<SYSUserGroup> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    try {

      const dbConnection = DBConnectionManager.currentInstance;

      if ( currentTransaction == null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const options = {

        where: { "Id": createOrUpdateData.Id ? createOrUpdateData.Id : "" },
        transaction: currentTransaction,

      }

      result = await SYSUserGroup.findOne( options );

      if ( result === null ) {

        result = await SYSUserGroup.create(
                                         createOrUpdateData,
                                         { transaction: currentTransaction }
                                       );

      }
      else if ( bUpdate ) {

        const currentValues = createOrUpdateData; //( result as any ).dataValues;

        if ( CommonUtilities.isNullOrEmpty( currentValues.UpdatedBy ) ) {

          currentValues.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

        }

        const updateResult = await SYSUserGroup.update( currentValues,
                                                     options );

        if ( updateResult.length > 0 &&
          updateResult[ 0 ] >= 1 ) {

          result = await SYSUserGroup.findOne( options );

        }

      }

      if ( currentTransaction != null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        await currentTransaction.commit();

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createOrUpdate.name;

      const strMark = "1CC6DB5BA1E2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error1 ) {


        }

      }

      result = error;

    }

    return result;

  }

}