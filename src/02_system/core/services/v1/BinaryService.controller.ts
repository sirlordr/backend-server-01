import cluster from "cluster";
import path from "path";
import fs from "fs"; //Load the filesystem module

import fetch from "node-fetch";

import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import Jimp from "jimp";
import glob from "glob";

import {
  Request,
  Response
} from "express";

import CommonConstants from "../../../common/CommonConstants";
import SystemConstants, { ICheckUserRoles } from "../../../common/SystemContants";

import CommonUtilities from "../../../common/CommonUtilities";
import SystemUtilities from "../../../common/SystemUtilities";

import DBConnectionManager from "../../../common/managers/DBConnectionManager";
import MiddlewareManager from "../../../common/managers/MiddlewareManager";
import CacheManager from "../../../common/managers/CacheManager";
import I18NManager from "../../../common/managers/I18Manager";
//import NotificationManager from "../../../common/managers/NotificationManager";
import HookManager from "../../../common/managers/HookManager";

import BaseService from "../../../common/database/master/services/BaseService";
import SYSConfigValueDataService from "../../../common/database/master/services/SYSConfigValueDataService";
import SYSBinaryIndexService from "../../../common/database/master/services/SYSBinaryIndexService";
import SYSUserService from "../../../common/database/master/services/SYSUserService";
import SYSUserGroupService from "../../../common/database/master/services/SYSUserGroupService";
import SYSUserSessionPersistentService from "../../../common/database/master/services/SYSUserSessionPersistentService";

import { SYSUserGroup } from "../../../common/database/master/models/SYSUserGroup";
import { SYSUser } from "../../../common/database/master/models/SYSUser";
import { SYSBinaryIndex } from "../../../common/database/master/models/SYSBinaryIndex";
//import { AccessKind } from "../../../common/CommonConstants";

const debug = require( "debug" )( "BinaryServiceController" );

export default class BinaryServiceController extends BaseService {

  static readonly _ID = "BinaryServiceController";

  static async getConfigBinaryDataMaximumSize( transaction: any,
                                               logger: any ): Promise<number> {

    let intResult = 0;

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_BinaryDataMaximumSize.Id,
                                                                             SystemConstants._CONFIG_ENTRY_BinaryDataMaximumSize.Owner,
                                                                             transaction,
                                                                             logger );

      if ( configData.Value && isNaN( parseInt( configData.Value ) ) === false ) {

        intResult = Number.parseInt( configData.Value, 10 ) * 1024; //Value in kilobytes transform to bytes

      }
      else if ( configData.Default && isNaN( parseInt( configData.Default ) ) === false ) {

        intResult = Number.parseInt( configData.Default, 10 ) * 1024; //Value in kilobytes transform to bytes

      }
      else {

        intResult = 1 * 1024 * 1024; //1MB default expressed in bytes

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigBinaryDataMaximumSize.name;

      const strMark = "39318E93ECFB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return intResult;

  }

  static async getConfigBinaryDataBasePath( transaction: any,
                                            logger: any ): Promise<string> {

    let strResult = "";

    try {

      const configData = await SYSConfigValueDataService.getConfigValueData( SystemConstants._CONFIG_ENTRY_BinaryDataBasePath.Id,
                                                                             SystemConstants._CONFIG_ENTRY_BinaryDataBasePath.Owner,
                                                                             transaction,
                                                                             logger );

      if ( configData.Value ) {

        strResult = configData.Value;

      }
      else if ( configData.Default ) {

        strResult = configData.Default;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigBinaryDataBasePath.name;

      const strMark = "488ECC417710" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return strResult;

  }

  static async getConfigBinaryDataAllowedCategory( userSessionStatus: any,
                                                   strCategory: string,
                                                   transaction: any,
                                                   logger: any ): Promise<any> {

    //ANCHOR getConfigValueDataObjectDeniedAllowed
    return await SYSConfigValueDataService.getConfigValueDataObjectDeniedAllowed( userSessionStatus,
                                                                                  SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Id,
                                                                                  SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Owner,
                                                                                  strCategory,
                                                                                  null,
                                                                                  true,
                                                                                  transaction,
                                                                                  logger );

  }

  static async getConfigBinaryDataAllowedMimeType( userSessionStatus: any,
                                                   strCategory: string,
                                                   transaction: any,
                                                   logger: any ): Promise<any> {

    return await SYSConfigValueDataService.getConfigValueDataObjectDeniedAllowed( userSessionStatus,
                                                                                  SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Id,
                                                                                  SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Owner,
                                                                                  strCategory,
                                                                                  null,
                                                                                  true,
                                                                                  transaction,
                                                                                  logger );

  }

  static async checkThumbnailNeeded( userSessionStatus: any,
                                     strCategory: string,
                                     strMimeType: string,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result: boolean = false;

    try {

      let configData = await SYSConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail.Id,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail.Owner,
                                                                                      strCategory,
                                                                                      null,
                                                                                      false,
                                                                                      transaction,
                                                                                      logger );

      if ( CommonUtilities.isNotNullOrEmpty( configData ) ) {

        for ( let intIndex = 0; intIndex < configData.length; intIndex++ ) {

          const item = configData[ intIndex ];

          if ( item.mime && item.factor ) {

            if ( item.mime.indexOf( "#" + strMimeType + "#" ) !== -1 ) {

              result = true;
              break;

            }

          }

        }

      }

      if ( strMimeType === "image/png" ||
           strMimeType === "image/jpeg" ) {

        result = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkThumbnailNeeded.name;

      const strMark = "487B8739ED6A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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


    }

    return result;

  }

  static async getConfigBinaryDataThumbnail( userSessionStatus: any,
                                             strCategory: string,
                                             strMimeType: string,
                                             transaction: any,
                                             logger: any ): Promise<any> {

    let result: any = [];

    try {

      let configData = await SYSConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail.Id,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataThumbnail.Owner,
                                                                                      strCategory,
                                                                                      null,
                                                                                      false,
                                                                                      transaction,
                                                                                      logger );

      if ( CommonUtilities.isNotNullOrEmpty( configData ) ) {

        for ( let intIndex = 0; intIndex < configData.length; intIndex++ ) {

          const item = configData[ intIndex ];

          if ( item.mime && item.factor ) {

            if ( item.mime.indexOf( "#" + strMimeType + "#" ) !== -1 ) {

              result.push( item.factor );
              //break;

            }

          }

        }

      }

      if ( result.length === 0 &&
         ( strMimeType === "image/png" ||
           strMimeType === "image/jpeg" ) ) {

        result.push( 300 ); //Scale to 300 pixeles if the mime type is png or jpeg

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigBinaryDataThumbnail.name;

      const strMark = "41EB37D707B7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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


    }

    return result;

  }

  static async getConfigBinaryDataProcess( userSessionStatus: any,
                                           strCategory: string,
                                           strMimeType: string,
                                           transaction: any,
                                           logger: any ): Promise<any> {

    let result: any = [];

    try {

      let configData = await SYSConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataProcess.Id,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataProcess.Owner,
                                                                                      strCategory,
                                                                                      null,
                                                                                      false,
                                                                                      transaction,
                                                                                      logger );

      if ( CommonUtilities.isNotNullOrEmpty( configData ) ) {

        for ( let intIndex = 0; intIndex < configData.length; intIndex++ ) {

          const item = configData[ intIndex ];

          if ( item.mime && item.factor && item.size ) {

            if ( item.mime.indexOf( "#" + strMimeType + "#" ) !== -1 ) {

              result.push( item );

            }

          }

        }

      }

      if ( result.length === 0 &&
         ( strMimeType === "image/png" ||
           strMimeType === "image/jpeg" ) ) {

        result.push(
                     {
                       mime: strMimeType,
                       factor: 1500,
                       size: 1024
                     }
                   ); //Scale to 300 pixeles if the mime type is png or jpeg

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getConfigBinaryDataProcess.name;

      const strMark = "3F18533ED8B4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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


    }

    return result;

  }

  static async checkAllowedCategory( userSessionStatus: any,
                                     //strMimeType: string,
                                     strCategory: string,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result = { result: 1, allowed: "*", denied: "" }; //Default allow all

    const checkData = await SYSConfigValueDataService.checkAllowed( userSessionStatus,
                                                                    SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Id,
                                                                    SystemConstants._CONFIG_ENTRY_BinaryDataAllowedCategory.Owner,
                                                                    strCategory,
                                                                    "",
                                                                    null,
                                                                    false,
                                                                    transaction,
                                                                    true,
                                                                    logger );

    if ( checkData &&
         checkData.value !== undefined &&
         checkData.allowed !== undefined &&
         checkData.denied !== undefined ) {

      result = checkData;

    }

    return result;

  }

  static async checkAllowedMimeType( userSessionStatus: any,
                                     strMimeType: string,
                                     strCategory: string,
                                     transaction: any,
                                     logger: any ): Promise<any> {

    let result = { result: 1, allowed: "*", denied: "" }; //Default allow all

    const checkData = await SYSConfigValueDataService.checkAllowed( userSessionStatus,
                                                                    SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Id,
                                                                    SystemConstants._CONFIG_ENTRY_BinaryDataAllowedMimeType.Owner,
                                                                    strMimeType,
                                                                    strCategory,
                                                                    null,
                                                                    true,
                                                                    transaction,
                                                                    true,
                                                                    logger );

    if ( checkData &&
         checkData.value !== undefined &&
         checkData.allowed !== undefined &&
         checkData.denied !== undefined ) {

      result = checkData;

    }

    return result;

  }

  static async getDefaultOwners( userSessionStatus: any,
                                 strCategory: string,
                                 transaction: any,
                                 logger: any ): Promise<any> {

    let result = SystemConstants._CREATED_BY_UNKNOWN_SYSTEM_NET;

    try {

      let configData = await SYSConfigValueDataService.getConfigValueDataFromSession( userSessionStatus,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataDefaultOwner.Id,
                                                                                      SystemConstants._CONFIG_ENTRY_BinaryDataDefaultOwner.Owner,
                                                                                      strCategory,
                                                                                      null,
                                                                                      false,
                                                                                      transaction,
                                                                                      logger );

      if ( CommonUtilities.isNotNullOrEmpty( configData ) ) {

        if ( configData.indexOf( "#@@UserGroupId@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserGroupId@@#", "gi" ), "#GId:" + userSessionStatus.UserGroupId + "#" );

        }
        else {

          configData = configData + ( configData ? ",#GId:" + userSessionStatus.UserGroupId + "#": "#GId:" + userSessionStatus.UserGroupId + "#" );

        }

        if ( configData.indexOf( "#@@UserGroupShortId@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserGroupShortId@@#", "gi" ), "#GSId:" + userSessionStatus.UserGroupShortId + "#" );

        }

        if ( configData.indexOf( "#@@UserGroupName@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserGroupName@@#", "gi" ), "#GName:" + userSessionStatus.UserGroupName + "#" );

        }
        else {

          configData = configData + ",#GName:" + userSessionStatus.UserGroupName + "#";

        }

        if ( configData.indexOf( "#@@UserId@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserId@@#", "gi" ), "#UId:" + userSessionStatus.UserId + "#" );

        }
        else {

          configData = configData + ",#UId:" + userSessionStatus.UserId + "#";

        }

        if ( configData.indexOf( "#@@UserShortId@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserShortId@@#", "gi" ), "#USId:" + userSessionStatus.UserShortId + "#" );

        }

        if ( configData.indexOf( "#@@UserName@@#" ) !== -1 ) {

          configData = configData.replace( new RegExp( "#@@UserName@@#", "gi" ), "#UName:" + userSessionStatus.UserName + "#" );

        }
        else {

          configData = configData + ",#UName:" + userSessionStatus.UserName + "#";

        }

        if ( configData.indexOf( "@@Category@@" ) !== -1 ) {

          configData = configData.replace( new RegExp( "@@Category@@", "gi" ), strCategory );

        }

      }

      if ( configData ) {

        result = configData;

      }
      else {

        result = userSessionStatus.UserName;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "AEF931FF8501" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async detectProcessNeeded( userSessionStatus: any,
                                    strCategory: string,
                                    strMimeType: string,
                                    intFileSize: number,
                                    transaction: any,
                                    logger: any ): Promise<any> {

    let result = { value: 0, process: [] };

    try {

      const dataProcess = await BinaryServiceController.getConfigBinaryDataProcess(
                                                                                    userSessionStatus,
                                                                                    strCategory,
                                                                                    strMimeType,
                                                                                    transaction,
                                                                                    logger
                                                                                  );

      if ( dataProcess.length > 0 ) {

        for ( let intIndex = 0; intIndex < dataProcess.length; intIndex++ ) {

          if ( intFileSize > dataProcess[ intIndex ].size * 1024 ) {

            result.value = 1;
            result.process.push(
                                 {
                                   mime: strMimeType,
                                   size: dataProcess[ intIndex ].size,
                                   factor: dataProcess[ intIndex ].factor,
                                   keepOriginal: dataProcess[ intIndex ].keepOriginal ? dataProcess[ intIndex ].keepOriginal: false,
                                   status: {
                                             code: "WAITING_FOR",
                                             started: null,
                                             finished: null
                                           },
                                   file: "",
                                 }
                               );

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "359CD3A1387E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async generateThumbnail( strFullPath: string,
                                  strFileName: string,
                                  strFileExtension: string,
                                  thumbnailFactor: number[],
                                  logger: any ): Promise<any> {

    let result = { value: 0, thumbnail: [] };

    try {

      const strMark = "F0742629564B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

      const debugMark = debug.extend( strMark + "@" + ( cluster.isWorker ? cluster.worker.id : "0" ) );

      debugMark( "Reading binary file" );

      const util = require( "util" );
      const exec = util.promisify( require( "child_process" ).exec );

      const strCommandIdentify = `identify -format "%w;%h" ${strFullPath}${strFileName}${strFileExtension}`;

      const { stdout } = await exec( strCommandIdentify );

      debugMark( "Identify command output: %s", stdout );

      const imageSize = stdout.split( ";" );

      if ( imageSize &&
           imageSize.length > 1 ) {

        const intImageWidth = imageSize[ 0 ];
        const intImageHeight = imageSize[ 1 ];

        for ( let intIndex = 0; intIndex < thumbnailFactor.length; intIndex++ ) {

          const strThumbnailFile = strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ];

          if ( intImageWidth >= thumbnailFactor[ intIndex ] && intImageWidth >= intImageHeight ) {

            debugMark( "Resize image file by the width side" );

            const strCommandConvert = `convert "${strFullPath}${strFileName}${strFileExtension}" -resize "${thumbnailFactor[ intIndex ]}x${thumbnailFactor[ intIndex ]}" "${strThumbnailFile}"`;

            const { stdout } = await exec( strCommandConvert );

            debugMark( "Convert command output: %s", stdout ? stdout : "Success" );

            //imageData.resize( thumbnailFactor[ intIndex ], Jimp.AUTO )

            //debugMark( "Wrinting new file" );

            //await imageData.writeAsync( strFullPath + strFileName );

            //const fileStats = fs.statSync( strFullPath + strFileName );
            const fileStats = fs.statSync( strThumbnailFile );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "width",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ],
                                     hash: "md5://" + await SystemUtilities.getFileHash( strThumbnailFile,
                                                                                         undefined,
                                                                                         logger )
                                   }
                                 );

          }
          else if ( intImageHeight >= thumbnailFactor[ intIndex ] ) {

            debugMark( "Resize image file by the height side" );

            const strCommandConvert = `convert ${strFullPath}${strFileName}${strFileExtension} -resize ${thumbnailFactor[ intIndex ]}x${thumbnailFactor[ intIndex ]} ${strThumbnailFile}`;

            const { stdout } = await exec( strCommandConvert );

            debugMark( "Convert command output: %s", stdout );

            //imageData.resize( Jimp.AUTO, thumbnailFactor[ intIndex ] )

            //debugMark( "Wrinting new file" );

            //await imageData.writeAsync( strFullPath + strFileName );

            //const fileStats = fs.statSync( strFullPath + strFileName );
            const fileStats = fs.statSync( strThumbnailFile );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "height",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ],
                                     hash: "md5://" + await SystemUtilities.getFileHash( strThumbnailFile,
                                                                                         undefined,
                                                                                         logger )
                                   }
                                 );

          }
          else {

            debugMark( "No resize image needed for factor of [%s]. Copied the same file name", thumbnailFactor[ intIndex ] );

            fs.copyFileSync( strFullPath + strFileName, strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ] );
            //await imageData.writeAsync( strFullPath + strFileName ); // + "." + thumbnailFactor[ intIndex ] + ".thumbnail" );

          }

          //fs.renameSync( strFullPath + strFileName, strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ] );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.generateThumbnail.name;

      const strMark = "74B6730AB038" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  /*
  static async generateThumbnail( strFullPath: string,
                                  strFileName: string,
                                  strFileExtension: string,
                                  thumbnailFactor: number[],
                                  logger: any ): Promise<any> {

    let result = { value: 0, thumbnail: [] };

    try {

      if ( thumbnailFactor &&
           thumbnailFactor.length > 0 ) {

        const strMark = "3B23F0152978" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

        const debugMark = debug.extend( strMark + "@" + ( cluster.isWorker ? cluster.worker.id : "0" ) );

        debugMark( "Reading binary file" );

        const imageData = await Jimp.read( strFullPath + strFileName + strFileExtension );

        const intImageWidth = imageData.bitmap.width;
        const intImageHeight = imageData.bitmap.height;

        for ( let intIndex = 0; intIndex < thumbnailFactor.length; intIndex++ ) {

          if ( intImageWidth >= thumbnailFactor[ intIndex ] && intImageWidth >= intImageHeight ) {

            debugMark( "Resize image file" );

            imageData.resize( thumbnailFactor[ intIndex ], Jimp.AUTO )

            debugMark( "Wrinting new file" );

            await imageData.writeAsync( strFullPath + strFileName );

            const fileStats = fs.statSync( strFullPath + strFileName );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "width",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ]
                                   }
                                 );

          }
          else if ( intImageHeight >= thumbnailFactor[ intIndex ] ) {

            debugMark( "Resize image file" );

            imageData.resize( Jimp.AUTO, thumbnailFactor[ intIndex ] )

            debugMark( "Wrinting new file" );

            await imageData.writeAsync( strFullPath + strFileName );

            const fileStats = fs.statSync( strFullPath + strFileName );

            result.value = 1;
            result.thumbnail.push(
                                   {
                                     side: "height",
                                     factor: thumbnailFactor[ intIndex ],
                                     size: fileStats[ "size" ],
                                     file: strFileName + ".thumbnail." + thumbnailFactor[ intIndex ]
                                   }
                                 );

          }
          else {

            await imageData.writeAsync( strFullPath + strFileName ); // + "." + thumbnailFactor[ intIndex ] + ".thumbnail" );

          }

          fs.renameSync( strFullPath + strFileName, strFullPath + strFileName + ".thumbnail." + thumbnailFactor[ intIndex ] );

        }

        if ( global.gc ) {

          global.gc();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getDefaultOwners.name;

      const strMark = "8DE49AF0AFFC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }
  */


  static async selectThumbnail( strBasePath: string,
                                strFullPath: string,
                                strFileThumbnailName: string,
                                strFileName: string,
                                strFileExtension: string,
                                strMimeType: string,
                                lngFileSize: number,
                                strThumbnail: string,
                                logger: any ):Promise<any> {

    let result = {
                   File: "",
                   FileName: "",
                   MimeType: "",
                   FileSize: 0,
                   Hash: "",
                   MimeThumbnail: false,
                 };

    try {

      if ( fs.existsSync( path.join( strFullPath,
                                     strFileThumbnailName + "." + strThumbnail ) ) ) {

        result.File = path.join( strFullPath,
                                 strFileThumbnailName + "." + strThumbnail );
        result.FileName = strFileName;
        result.MimeType = strMimeType;
        result.FileSize = lngFileSize;
        result.Hash = "md5://" + await SystemUtilities.getFileHash( result.File,
                                                                    undefined,
                                                                    logger );
        result.MimeThumbnail = false;

      }
      else {

        let thumbnailList = glob.sync( strFileThumbnailName + ".*",
                                       {
                                         cwd: strFullPath,
                                         nodir: true
                                       } );

        if ( thumbnailList &&
             thumbnailList.length > 0 ) {

          result.File = path.join( strFullPath,
                                   thumbnailList[ 0 ] ); //The first thumbnail found in the list of possible options
          result.FileName = strFileName;

          const fileStats = fs.statSync( result.File );

          result.MimeType = strMimeType;
          result.FileSize = fileStats.size;
          result.Hash = "md5://" + await SystemUtilities.getFileHash( result.File,
                                                                      undefined,
                                                                      logger );
          result.MimeThumbnail = false;

        }
        else if ( fs.existsSync( path.join( strBasePath,
                                            "@default@/images/mime_types/",
                                            strFileExtension + ".png" ) ) ) { //Use predefined thumbnail files

          result.File = path.join( strBasePath,
                                   "@default@/images/mime_types/",
                                   strFileExtension + ".png" ); //pdf.png, docx.png
          result.FileName = strFileExtension + ".png";

          const fileStats = fs.statSync( result.File );

          result.MimeType = "image/png";
          result.FileSize = fileStats.size;
          result.Hash = "md5://" + await SystemUtilities.getFileHash( result.File,
                                                                      undefined,
                                                                      logger );
          result.MimeThumbnail = true;

        }
        else {

          result.File = path.join( strBasePath,
                                   "@default@/images/mime_types/default.png" );
          result.FileName = "default.png";

          const fileStats = fs.statSync( result.File );

          result.MimeType = strMimeType;
          result.FileSize = fileStats.size;
          result.Hash = "md5://" + await SystemUtilities.getFileHash( result.File,
                                                                      undefined,
                                                                      logger );
          result.MimeThumbnail = true;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.selectThumbnail.name;

      const strMark = "003B5338EC0B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async checkIsOwner( strOwners: string,
                             strUserId: string,
                             strUserName: string,
                             strGroupId: string,
                             strGroupName: string,
                             //strSessionTag: string,
                             logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( strOwners.includes( "#UId:" + strUserId + "#" ) ||
           strOwners.includes( "#UName:" + strUserName + "#" ) ||
           strOwners.includes( "#GId:" + strGroupId + "#" ) ||
           strOwners.includes( "#GName:" + strGroupName + "#" ) ) {

        bResult = true;

      }
      /*
      else {

        const sessionTag = strSessionTag.split( "," );

        for ( let intIndex = 0; intIndex < sessionTag.length; intIndex++ ) {

          if ( strOwners.includes( sessionTag[ intIndex ] ) ) {

            bResult = true;
            break;

          }

        }

      }
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkIsOwner.name;

      const strMark = "EA2FCDFC5049" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return bResult;

  }

  //ANCHOR checkUserRoleLevel
  static checkUserRoleLevel( userSessionStatus: any,
                             sysUserInDB: SYSUser,
                             strActionRole: string,
                             logger: any ): ICheckUserRoles {

    let result: ICheckUserRoles = {
                                    isAuthorizedAdmin: false,
                                    isAuthorizedL03: false,
                                    isAuthorizedL02: false,
                                    isAuthorizedL01: false,
                                    isNotAuthorized: false
                                  };

    try {

      result.isAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ) ||
                                                          userSessionStatus.Role.includes( "#" + strActionRole + "L99#" ): false;

      if ( result.isAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" ); // "#ChangeUserPasswordL03#" );

        }

        if ( !roleSubTag ) {

          roleSubTag = [];

        }

        result.isAuthorizedL03 = userSessionStatus.Role && sysUserInDB ? ( roleSubTag.includes( "#GName:" +  sysUserInDB.sysUserGroup.Name + "#" ) ||
                                                                           roleSubTag.includes( "#GName:*#" ) ||
                                                                           roleSubTag.includes( "#GId:" +  sysUserInDB.sysUserGroup.Id + "#" ) ||
                                                                           roleSubTag.includes( "#GId:*#" ) ||
                                                                           roleSubTag.includes( "#GSId:" +  sysUserInDB.sysUserGroup.ShortId + "#" ) ||
                                                                           roleSubTag.includes( "#GSId:*#" ) ): false;

        if ( result.isAuthorizedL03 === false ) {

          let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L02#" );

          if ( !roleSubTag ||
              roleSubTag.length === 0 &&
              strActionRole ) {

            roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L02#" );

          }

          result.isAuthorizedL02 = userSessionStatus.Role ? ( roleSubTag.includes( "#UName:" +  sysUserInDB.Name + "#" ) ||
                                                              roleSubTag.includes( "#UId:" +  sysUserInDB.Id + "#" ) ||
                                                              roleSubTag.includes( "#USId:" +  sysUserInDB.ShortId + "#" ) ) : false;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkUserRoleLevel.name;

      const strMark = "C75647D48A4D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  //ANCHOR checkUserGroupRoleLevel
  static checkUserGroupRoleLevel( userSessionStatus: any,
                                  sysUserGroupInDB: SYSUserGroup,
                                  strActionRole: string,
                                  logger: any ): ICheckUserRoles {

    let result: ICheckUserRoles = {
                                    isAuthorizedAdmin: false,
                                    isAuthorizedL03: false,
                                    isAuthorizedL02: false,
                                    isAuthorizedL01: false,
                                    isNotAuthorized: false
                                  };

    try {

      let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

      if ( !roleSubTag ||
           roleSubTag.length === 0 &&
           strActionRole ) {

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#" + strActionRole + "L03#" );

      }

      result.isAuthorizedL03 = userSessionStatus.Role ? ( roleSubTag.includes( "#GName:" +  sysUserGroupInDB.Name + "#" ) ||
                                                          roleSubTag.includes( "#GName:*#" ) ||
                                                          roleSubTag.includes( "#GId:" +  sysUserGroupInDB.Id + "#" ) ||
                                                          roleSubTag.includes( "#GSId:" +  sysUserGroupInDB.ShortId + "#" ) ) : false;

      if ( result.isAuthorizedL03 === false ) {

        result.isAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                          userSessionStatus.Role.includes( "#" + strActionRole + "L01#" ): false;

        if ( result.isAuthorizedL01 &&
             userSessionStatus.UserGroupId !== sysUserGroupInDB.Id ) {

          result.isAuthorizedL01 = false;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkUserGroupRoleLevel.name;

      const strMark = "F20C3245AC58" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static getUserOwner( strOwner: string, logger: any ): any[] {

    let result = [];

    try {

      const ownerList = strOwner.split( "," );

      for ( let intOwner = 0; intOwner < ownerList.length; intOwner++ ) {

        if ( ownerList[ intOwner ].startsWith( "#UId:" ) ) {

          result.push( { Id: ownerList[ intOwner ], ShortId: null, Name: null } );

        }
        else if ( ownerList[ intOwner ].startsWith( "#USId:" ) ) {

          result.push( { Id: null, ShortId: ownerList[ intOwner ], Name: null } );

        }
        else if ( ownerList[ intOwner ].startsWith( "#UName:" ) ) {

          result.push( { Id: null, ShortId: null, Name: ownerList[ intOwner ] } );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserOwner.name;

      const strMark = "4F1CD17DEFE6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static getUserGroupOwner( strOwner: string, logger: any ): any[] {

    let result = [];

    try {

      const ownerList = strOwner.split( "," );

      for ( let intOwner = 0; intOwner < ownerList.length; intOwner++ ) {

        if ( ownerList[ intOwner ].startsWith( "#GId:" ) ) {

          result.push( { Id: ownerList[ intOwner ], ShortId: null, Name: null } );

        }
        else if ( ownerList[ intOwner ].startsWith( "#GSId:" ) ) {

          result.push( { Id: null, ShortId: ownerList[ intOwner ], Name: null } );

        }
        else if ( ownerList[ intOwner ].startsWith( "#GName:" ) ) {

          result.push( { Id: null, ShortId: null, Name: ownerList[ intOwner ] } );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getUserGroupOwner.name;

      const strMark = "4F1CD17DEFE6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  /*
  static async checkTagIsAllowedToAccess( strTagToCheck: string,
                                          strRole: string,
                                          strUserId: string,
                                          strUserName: string,
                                          strUserTag: string,
                                          strGroupId: string,
                                          strGroupName: string,
                                          strGroupTag: string,
                                          strSessionTag: string,
                                          bAllowAny: boolean,
                                          logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      let tagList = strTagToCheck.split( "," );
      let roleList = strRole.split( "," );
      let userTagList = strUserTag ? strUserTag.split( "," ): [];
      let groupTagList = strGroupTag ? strGroupTag.split( "," ): [];
      let sessionTagList = strSessionTag ? strSessionTag.split( "," ): [];

      if ( bAllowAny &&
           strTagToCheck === SystemConstants._VALUE_ANY ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          roleList,
                                          logger ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#UId:" + strUserId + "#" ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#UName:" + strUserName + "#" ) ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          userTagList,
                                          logger ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#GId:" + strGroupId + "#" ) ) {

        bResult = true;

      }
      else if ( tagList.includes( "#GName:" + strGroupName + "#" ) ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          groupTagList,
                                          logger ) ) {

        bResult = true;

      }
      else if ( CommonUtilities.isInList( tagList,
                                          sessionTagList,
                                          logger ) ) {

        bResult = true;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkTagIsAllowedToAccess.name;

      const strMark = "09301995CE61" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return bResult;

  }
  */

  static async createBinaryDataAuthorization( request: Request,
                                              transaction: any,
                                              logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      const userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let strBinaryDataToken = null;

      if ( CommonUtilities.isNullOrEmpty( userSessionStatus.BinaryDataToken ) ||
           ( request.query.Force === "1" /*&&
           userSessionStatus.Token.startsWith( "p:" ) === false*/ ) ) {

        const strId = SystemUtilities.getUUIDv4();

        strBinaryDataToken = SystemUtilities.hashString( strId, 1, logger ); //xx hash

        userSessionStatus.BinaryDataToken = userSessionStatus.Token.startsWith( "p:" ) ? "p:" + strBinaryDataToken: strBinaryDataToken;

        //Update the cache and database
        await SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                               userSessionStatus,
                                                               {
                                                                 updateAt: true,        //Update the field updatedAt
                                                                 setRoles: false,       //Set roles?
                                                                 groupRoles: null,      //User group roles
                                                                 userRoles: null,       //User roles
                                                                 forceUpdate: true,     //Force update?
                                                                 tryLock: 2,            //Only 1 try
                                                                 lockSeconds: 4 * 1000, //Second
                                                               },
                                                               /*
                                                               false,    //Set roles?
                                                               null,     //User group roles
                                                               null,     //User roles
                                                               true,     //Force update?
                                                               2,        //Only 1 try
                                                               4 * 1000, //Second
                                                               */
                                                               currentTransaction,
                                                               logger );

        await CacheManager.setData( strBinaryDataToken,
                                    userSessionStatus.Token,
                                    logger ); //Save to cache the association between generated binary data Auth Token and the main Authorization Token

      }
      else {

        await CacheManager.setData( strBinaryDataToken,
                                    userSessionStatus.Token,
                                    logger ); //Save to cache the association between generated binary data Auth Token and the main Authorization Token

        strBinaryDataToken = userSessionStatus.BinaryDataToken;

      }

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_AUTH_TOKEN_CREATED",
                 Message: await I18NManager.translate( strLanguage, "The binary data authorization token has been success created." ),
                 Mark: "73057DAD2CAF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: 1,
                 Data: [
                         {
                           Auth: strBinaryDataToken,
                         }
                       ]
               };

      bApplyTransaction = true;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {


        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.createBinaryDataAuthorization.name;

      const strMark = "05A79B4A16B1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async deleteBinaryDataAuthorization( request: Request,
                                              transaction: any,
                                              logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      const userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      if ( userSessionStatus.Token.startsWith( "p:" ) === false ) {

        if ( userSessionStatus.BinaryDataToken ) {

          await CacheManager.deleteData( userSessionStatus.BinaryDataToken,
                                         logger ); //Remove from cache

          userSessionStatus.BinaryDataToken = null;

          //Update the cache and database
          await SystemUtilities.createOrUpdateUserSessionStatus( userSessionStatus.Token,
                                                                 userSessionStatus,
                                                                 {
                                                                   updateAt: true,        //Update the field updatedAt
                                                                   setRoles: false,       //Set roles?
                                                                   groupRoles: null,      //User group roles
                                                                   userRoles: null,       //User roles
                                                                   forceUpdate: true,     //Force update?
                                                                   tryLock: 2,            //Only 1 try
                                                                   lockSeconds: 4 * 1000, //Second
                                                                 },
                                                                 /*
                                                                 false,    //Set roles?
                                                                 null,     //User group roles
                                                                 null,     //User roles
                                                                 true,     //Force update?
                                                                 2,        //Only 1 try
                                                                 4 * 1000, //Second
                                                                 */
                                                                 currentTransaction,
                                                                 logger );

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_AUTH_TOKEN_DELETED",
                     Message: await I18NManager.translate( strLanguage, "The binary data authorization token has been success deleted." ),
                     Mark: "473D6FEA3F86" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

          bApplyTransaction = true;

        }
        else {

          result = {
                     StatusCode: 404, //Not found
                     Code: "ERROR_AUTH_TOKEN_NOT_FOUND",
                     Message: await I18NManager.translate( strLanguage, "The binary data authorization token not found." ),
                     Mark: "3B11E61CDD49" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_AUTH_TOKEN_NOT_FOUND",
                                 Message: await I18NManager.translate( strLanguage, "The binary data authorization token not found." ),
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_AUTH_TOKEN_IS_PERSISTENT",
                   Message: await I18NManager.translate( strLanguage, "Auth token provided is persistent. You cannot delete it" ),
                   Mark: "88EE1E318404" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_AUTH_TOKEN_IS_PERSISTENT",
                               Message: await I18NManager.translate( strLanguage, "Auth token provided is persistent. You cannot delete it" ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                };

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteBinaryDataAuthorization.name;

      const strMark = "1FD534D0F6D8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }


  public static tranformTagListToWhere( tagList: string[] ): string {

    let strResult = "";

    try {

      for ( const strCurrentTag of tagList ) {

        if ( strResult ) {

          strResult = strResult + " Or A.Owner Like '%" + strCurrentTag + "%'";

        }
        else {

          strResult = "A.Owner Like '%" + strCurrentTag + "%'";

        }

      }

      if ( strResult ) {

        strResult = "( " + strResult + " )";

      }

    }
    catch ( error ) {

      //

    }

    return strResult;

  }

  static async searchBinaryData( request: Request,
                                 transaction: any,
                                 logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      const userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const bIsAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ) ||
                                                          userSessionStatus.Role.includes( "#SearchBinaryL99#" ) : false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL02 = false;
      let strWhereL02 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";
      let strWhere = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_Binary_L03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = this.tranformTagListToWhere( roleSubTag );

        }

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L02#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_Binary_L02#" );

        }

        if ( roleSubTag &&
            roleSubTag.length > 0 ) {

          bIsAuthorizedL02 = true;

          strWhereL02 = this.tranformTagListToWhere( roleSubTag );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                    userSessionStatus.Role.includes( "#Search_Binary_L01#" ): false;

        if ( bIsAuthorizedL01 ) {

          strWhereL01 = " ( A.Owner Like '%GId:" + userSessionStatus.UserGroupId + "%' Or A.Owner Like '%GName:" + userSessionStatus.UserGroupName + "%' Or A.Owner Like '%UId:" + userSessionStatus.UserId + "%' Or A.Owner Like '%UName:" + userSessionStatus.UserName + "%' )";

        }
        else {

          strWhere = " ( A.Owner Like '%UId:" + userSessionStatus.UserId + "%' Or A.Owner Like '%UName:" + userSessionStatus.UserName + "%' )";

        }

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchBinaryData",
                                                     {
                                                       //
                                                     },
                                                     logger );

      strSQL = request.query.where ? strSQL + "( " + request.query.where + " )" : strSQL + "( 1 )";

      if ( !bIsAuthorizedAdmin ) {

        let strBeforeParenthesis = " And ( ";

        if ( bIsAuthorizedL03 ) {

          strSQL = strSQL + strBeforeParenthesis + strWhereL03;

          strBeforeParenthesis = "";

        }

        if ( bIsAuthorizedL02 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL02;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL02;
            strBeforeParenthesis = "";

          }

        }

        if ( bIsAuthorizedL01 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL01;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL01;
            strBeforeParenthesis = "";

          }

        }
        else {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhere;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhere;
            strBeforeParenthesis = "";

          }

        }

        if ( !strBeforeParenthesis ) {

          strSQL = strSQL + " )";

        }

      }

      strSQL = request.query.orderBy ? strSQL + " Order By " + request.query.orderBy: strSQL;

      let intLimit = 200;

      const warnings = [];

      if ( request.query.limit &&
           isNaN( parseInt( request.query.limit as any ) ) === false &&
           Number.parseInt( request.query.limit as any ) <= intLimit ) {

        intLimit = Number.parseInt( request.query.limit as any );

      }
      else {

        warnings.push(
                       {
                         Code: "WARNING_DATA_LIMITED_TO_MAX",
                         Message: await I18NManager.translate( strLanguage, "Data limited to the maximun of %s rows", intLimit ),
                         Details: await I18NManager.translate( strLanguage, "To protect to server and client of large result set of data, the default maximun rows is %s, you must use \"offset\" and \"limit\" query parameters to paginate large result set of data.", intLimit )
                       }
                     );

      }

      if ( !bIsAuthorizedAdmin ) {

        warnings.push(
                       {
                         Code: "WARNING_DATA_RESTRICTED",
                         Message: await I18NManager.translate( strLanguage, "It is possible that certain information is not shown due to limitations in their roles" ),
                         Details: {
                                    Role: userSessionStatus.Role
                                  }
                       }
                     );

      }

      //if ( DBConnectionManager.currentInstance.options.dialect === "mysql" ) {

      strSQL = strSQL + " LIMIT " + intLimit.toString() + " OFFSET " + ( request.query.offset && !isNaN( parseInt( request.query.offset as any ) ) ? request.query.offset : "0" );

      //}

      //ANCHOR dbConnection.query
      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      const convertedRows = [];

      for ( const currentRow of rows ) {

        const tempModelData = await SYSBinaryIndex.convertFieldValues(
                                                                       {
                                                                         Data: currentRow,
                                                                         FilterFields: 1, //Force to remove fields like password and value
                                                                         TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                         Include: null, //[ { model: SYSUser } ],
                                                                         Exclude: null, //[ { model: SYSUser } ],
                                                                         Logger: logger,
                                                                         ExtraInfo: {
                                                                                      Request: request
                                                                                    }
                                                                       }
                                                                     );
        if ( tempModelData ) {

          convertedRows.push( tempModelData );

        }
        else {

          convertedRows.push( currentRow );

        }

      }

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_SEARCH",
                 Message: await I18NManager.translate( strLanguage, "Success search." ),
                 Mark: "29B492BF56BC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: warnings,
                 Count: convertedRows.length,
                 Data: convertedRows
               }

      bApplyTransaction = true;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.searchBinaryData.name;

      const strMark = "7B39F7E451EC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async searchCountBinaryData( request: Request,
                                      transaction: any,
                                      logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      const userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const bIsAuthorizedAdmin = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Administrator#" ) ||
                                                          userSessionStatus.Role.includes( "#BManager_L99#" ) ||
                                                          userSessionStatus.Role.includes( "#SearchBinaryL99#" ): false;

      let bIsAuthorizedL03 = false;
      let strWhereL03 = "";
      let bIsAuthorizedL02 = false;
      let strWhereL02 = "";
      let bIsAuthorizedL01 = false;
      let strWhereL01 = "";
      let strWhere = "";

      if ( bIsAuthorizedAdmin === false ) {

        let roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L03#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_Binary_L03#" );

        }

        if ( roleSubTag &&
             roleSubTag.length > 0 ) {

          bIsAuthorizedL03 = true;

          strWhereL03 = this.tranformTagListToWhere( roleSubTag );

        }

        roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Master_L02#" );

        if ( !roleSubTag ||
              roleSubTag.length === 0 ) {

          roleSubTag = CommonUtilities.getSubTagFromComposeTag( userSessionStatus.Role, "#Search_Binary_L02#" );

        }

        if ( roleSubTag &&
            roleSubTag.length > 0 ) {

          bIsAuthorizedL02 = true;

          strWhereL02 = this.tranformTagListToWhere( roleSubTag );

        }

        bIsAuthorizedL01 = userSessionStatus.Role ? userSessionStatus.Role.includes( "#Master_L01#" ) ||
                                                    userSessionStatus.Role.includes( "#Search_Binary_L01#" ): false;

        if ( bIsAuthorizedL01 ) {

          strWhereL01 = " ( A.Owner Like '%GId:" + userSessionStatus.UserGroupId + "%' Or A.Owner Like '%GName:" + userSessionStatus.UserGroupName + "%' Or A.Owner Like '%UId:" + userSessionStatus.UserId + "%' Or A.Owner Like '%UName:" + userSessionStatus.UserName + "%' )";

        }
        else {

          strWhere = " ( A.Owner Like '%UId:" + userSessionStatus.UserId + "%' Or A.Owner Like '%UName:" + userSessionStatus.UserName + "%' )";

        }

      }

      let strSQL = DBConnectionManager.getStatement( "master",
                                                     "searchCountBinaryData",
                                                     {
                                                       //
                                                     },
                                                     logger );

      strSQL = request.query.where ? strSQL + "( " + request.query.where + " )" : strSQL + "( 1 )";

      if ( !bIsAuthorizedAdmin ) {

        let strBeforeParenthesis = " And ( ";

        if ( bIsAuthorizedL03 ) {

          strSQL = strSQL + strBeforeParenthesis + strWhereL03;

          strBeforeParenthesis = "";

        }

        if ( bIsAuthorizedL02 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL02;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL02;
            strBeforeParenthesis = "";

          }

        }

        if ( bIsAuthorizedL01 ) {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhereL01;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhereL01;
            strBeforeParenthesis = "";

          }

        }
        else {

          if ( !strBeforeParenthesis ) {

            strSQL = strSQL + " Or " + strBeforeParenthesis + strWhere;

          }
          else {

            strSQL = strSQL + strBeforeParenthesis + strWhere;
            strBeforeParenthesis = "";

          }

        }

        if ( !strBeforeParenthesis ) {

          strSQL = strSQL + " )";

        }

      }

      const warnings = [];

      if ( !bIsAuthorizedAdmin ) {

        warnings.push(
                       {
                         Code: "WARNING_DATA_RESTRICTED",
                         Message: await I18NManager.translate( strLanguage, "It is possible that certain information is not shown due to limitations in their roles" ),
                         Details: {
                                    Role: userSessionStatus.Role
                                  }
                       }
                     );

      }

      //ANCHOR dbConnection.query
      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_SEARCH_COUNT",
                 Message: await I18NManager.translate( strLanguage, "Success search count." ),
                 Mark: "29B492BF56BC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: warnings,
                 Count: 1,
                 Data: [
                         {
                           Count: rows.length > 0 ? rows[ 0 ].Count: 0
                         }
                       ]
               }

      bApplyTransaction = true;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.searchCountBinaryData.name;

      const strMark = "2DEB4C0A7B47" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async callDownloadBinaryData( headers: any,
                                       strRequestPath: string,
                                       query: any ): Promise<any> {

    let result = { input: null, output: null };

    try {

      const options = {
                        method: "GET",
                        body: null,
                        headers: headers,
                      };

      const callResult = await fetch( strRequestPath,
                                      options );

      const strXBodyResponse = callResult.headers.get( "x-body-response" ) as any; //callResult.headers.raw()

      const jsonXBodyResponse = CommonUtilities.parseJSON( strXBodyResponse, null );

      const strPath = query.SavePath + "/" + jsonXBodyResponse.Name;

      fs.mkdirSync( query.SavePath, { recursive: true }  );

      if ( callResult &&
           callResult.status === 200 ) {

        const destinationFileStream = fs.createWriteStream( strPath );

        await new Promise( ( resolve: any, reject: any ) => {

          callResult.body.pipe( destinationFileStream ).on( "close", () => { resolve( true ) } ); //Wait for the stream finish to write to file system

        } );

      }

      result.output = callResult ? {
                                     status: callResult.status,
                                     statusText: callResult.statusText,
                                     body: jsonXBodyResponse
                                   }:
                                   {
                                     status: null,
                                     statusText: null,
                                     body: {
                                             Code: ""
                                           }
                                   };

      //( options as any ).body = jsonXBodyResponse; //callResult.headers[ "X-Body-Response" ];

      result.input = options;

    }
    catch ( error ) {

      //console.log( error );

    }

    return result;

  }

  static async processFallbackData( //strAuth: string,
                                    strThumbnail: string,
                                    //sysBinaryIndexInDB: SYSBinaryIndex,
                                    strId: string,
                                    strFullSavePath: string,
                                    strFileToGet: string,
                                    logger: any ):Promise<boolean> {

    let bResult = false;

    try {

      fs.mkdirSync( strFullSavePath, { recursive: true } );

      let strRequestPath = process.env.BINARY_DATA_SERVICE_FALLBACK_URI;

      if ( strRequestPath ) {

        strRequestPath = strRequestPath.replace( "@__id__@", strId );
        strRequestPath = strRequestPath.replace( "@__auth__@", process.env.BINARY_DATA_SERVICE_FALLBACK_AUTH );
        strRequestPath = strRequestPath.replace( "@__thumbnail__@", strThumbnail );

        const downloadResult = await BinaryServiceController.callDownloadBinaryData( {},
                                                                                    strRequestPath,
                                                                                    {
                                                                                      SavePath: strFullSavePath
                                                                                    } );

        if ( downloadResult.output &&
            downloadResult.output.status === 200 ) {

          const originExists = fs.existsSync( strFullSavePath + downloadResult.output.body.Name );

          if ( originExists ) {

            fs.renameSync( strFullSavePath + downloadResult.output.body.Name, strFileToGet );

          }

          bResult = true;

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.processFallbackData.name;

      const strMark = "31337604554D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return bResult;

  }

  static async getBinaryData( request: Request,
                              response: Response,
                              transaction: any,
                              logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const strId = request.query.id as string;
      const strAuth = request.query.auth as string;
      const strThumbnail = request.query.thumbnail as string;

      if ( CommonUtilities.isNotNullOrEmpty( strId ) ) {

        /*
        const options = {

          where: { "Id": strId },
          transaction: currentTransaction,

        }
        */

        const strBasePath = await BinaryServiceController.getConfigBinaryDataBasePath( currentTransaction,
                                                                                       logger );

        let strFullPath = "";

        if ( strBasePath.startsWith( "full://" ) ) {

          strFullPath = strBasePath.replace( "full://", "" );

        }
        else {

          strFullPath = path.join( SystemUtilities.strBaseRootPath, strBasePath );

        }

        //const binaryIndexInDB = await SYSBinaryIndex.findOne( options );
        const sysBinaryIndexInDB = await SYSBinaryIndexService.getById( strId,
                                                                        null,
                                                                        currentTransaction,
                                                                        logger );

        if ( sysBinaryIndexInDB ) {

          let binaryData = {
                             File: "",
                             FileName: "",
                             MimeType: "",
                             FileSize: 0,
                             Hash: "",
                             MimeThumbnail: false
                           };

          if ( !strThumbnail ||
               strThumbnail === "0" ) {

            binaryData.File = path.join( strFullPath,
                                         sysBinaryIndexInDB.FilePath,
                                         strId + "." + sysBinaryIndexInDB.FileExtension + ".data" );
            binaryData.FileName = sysBinaryIndexInDB.FileName;
            binaryData.FileSize = sysBinaryIndexInDB.FileSize;
            binaryData.MimeType = sysBinaryIndexInDB.MimeType;
            binaryData.Hash = sysBinaryIndexInDB.Hash;

          }
          else {

            binaryData = await BinaryServiceController.selectThumbnail( strFullPath,
                                                                        path.join( strFullPath, sysBinaryIndexInDB.FilePath ),
                                                                        strId + "." + sysBinaryIndexInDB.FileExtension + ".thumbnail",
                                                                        sysBinaryIndexInDB.FileName,
                                                                        sysBinaryIndexInDB.FileExtension,
                                                                        sysBinaryIndexInDB.MimeType,
                                                                        sysBinaryIndexInDB.FileSize,
                                                                        strThumbnail,
                                                                        logger );

          }

          let userSessionStatus = null;

          if ( await SYSBinaryIndexService.checkDisabledById( sysBinaryIndexInDB.Id,
                                                              currentTransaction,
                                                              logger ) === false ) {

            if ( await SYSBinaryIndexService.checkExpiredById( sysBinaryIndexInDB.Id,
                                                               currentTransaction,
                                                               logger ) === false ) {

              //if ( fs.existsSync( binaryData.File ) ) {

              if ( sysBinaryIndexInDB.AccessKind === 1 ||        //Public
                   sysBinaryIndexInDB.ShareCode === strAuth ) { //Auth code match with the share code, in this case allow to access to the data

                const debugMark = debug.extend( "1E5FFD458AF3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
                debugMark( "Success get the resource with id [%s]", strId );

                result = {
                           StatusCode: 200, //Ok
                           File: binaryData.File,
                           Name: binaryData.FileName,
                           Mime: binaryData.MimeType,
                           Size: binaryData.FileSize,
                           "X-Body-Response": {
                                                Code: "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                Name: binaryData.FileName,
                                                Mime: binaryData.MimeType,
                                                Size: binaryData.FileSize,
                                                Hash: binaryData.Hash,
                                              }
                          }

                bApplyTransaction = true;

              }
              else if ( CommonUtilities.isNotNullOrEmpty( strAuth ) ) { //Authenticated

                let strAuthorization = null;

                strAuthorization = await CacheManager.getData( strAuth,
                                                               logger ); //get from cache the real authorization token

                if ( !strAuthorization &&
                     strAuth.startsWith( "p:" ) ) {

                  const sysUserSessionPersistent = await SYSUserSessionPersistentService.getUserSessionPersistentByBinaryDataToken( strAuth,
                                                                                                                                    currentTransaction,
                                                                                                                                    logger );

                  strAuthorization = sysUserSessionPersistent ? sysUserSessionPersistent.Token: null;

                }

                if ( CommonUtilities.isNotNullOrEmpty( strAuthorization ) ) {

                  userSessionStatus = await SystemUtilities.getUserSessionStatus( strAuthorization,
                                                                                  context,
                                                                                  true,
                                                                                  false,
                                                                                  currentTransaction,
                                                                                  logger );

                  if ( userSessionStatus ) {

                    context.UserSessionStatus = userSessionStatus; //Inject the user session status to context

                    await CacheManager.setData( strAuth,
                                                strAuthorization,
                                                logger );

                  }

                }

                ( request as any ).returnResult = 1; //Force to return the result

                //Check for valid session token
                let resultData = await MiddlewareManager.middlewareCheckIsAuthenticated( request,
                                                                                         null, //Not write response back
                                                                                         null );

                if ( resultData &&
                     resultData.StatusCode === 200 ) { //Ok the authorization token is valid

                  const userSessionStatus = context.UserSessionStatus;

                  if ( sysBinaryIndexInDB.AccessKind === 2 ||
                       userSessionStatus.Role.includes( "#Administrator#" ) ||
                       userSessionStatus.Role.includes( "#ManagerL99#" ) ||
                       userSessionStatus.Role.includes( "#GetBinaryL99#" ) ) { //Authenticated

                    const debugMark = debug.extend( "8D5B10C3A61C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
                    debugMark( "Success get the resource with id [%s]", strId );

                    result = {
                               StatusCode: 200, //Ok
                               File: binaryData.File,
                               Name: binaryData.FileName,
                               Mime: binaryData.MimeType,
                               Size: binaryData.FileSize,
                               "X-Body-Response": {
                                                    Code: "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                    Name: binaryData.FileName,
                                                    Mime: binaryData.MimeType,
                                                    Size: binaryData.FileSize,
                                                    Hash: binaryData.Hash,
                                                  }
                             }

                    bApplyTransaction = true;

                  }
                  else { //Tag

                    //ANCHOR Check is owner of BinaryData
                    const bIsOwner = await BinaryServiceController.checkIsOwner(
                                                                                 sysBinaryIndexInDB.Owner,
                                                                                 userSessionStatus.UserId,
                                                                                 userSessionStatus.UserName,
                                                                                 userSessionStatus.UserGroupId,
                                                                                 userSessionStatus.UserGroupName,
                                                                                 logger
                                                                               );

                    let checkUserRoles: ICheckUserRoles = {
                                                            isAuthorizedAdmin: false,
                                                            isAuthorizedL03: false,
                                                            isAuthorizedL02: false,
                                                            isAuthorizedL01: false,
                                                            isNotAuthorized: false
                                                          };

                    let ownerList = null;

                    if ( bIsOwner === false ) {

                      ownerList = BinaryServiceController.getUserOwner( sysBinaryIndexInDB.Owner, logger );

                      for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

                        const sysUserInDB = await SYSUserService.getBy( ownerList[ intOnwerIndex ],
                                                                        null,
                                                                        currentTransaction,
                                                                        logger );

                        checkUserRoles = BinaryServiceController.checkUserRoleLevel( userSessionStatus,
                                                                                     sysUserInDB,
                                                                                     "GetBinary",
                                                                                     logger );

                        if ( checkUserRoles.isAuthorizedAdmin ||
                             checkUserRoles.isAuthorizedL02 ||
                             checkUserRoles.isAuthorizedL03 ) {

                          break;

                        }

                      }

                      if ( checkUserRoles.isAuthorizedAdmin === false &&
                           checkUserRoles.isAuthorizedL02 === false &&
                           checkUserRoles.isAuthorizedL03 === false ) {

                        ownerList = BinaryServiceController.getUserGroupOwner( sysBinaryIndexInDB.Owner, logger );

                        for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

                          const sysUserGroupInDB = await SYSUserGroupService.getBy( ownerList[ intOnwerIndex ],
                                                                                    null,
                                                                                    currentTransaction,
                                                                                    logger );

                          checkUserRoles = BinaryServiceController.checkUserGroupRoleLevel( userSessionStatus,
                                                                                            sysUserGroupInDB,
                                                                                            "GetBinary",
                                                                                            logger );

                          if ( checkUserRoles.isAuthorizedL01 ||
                                checkUserRoles.isAuthorizedL03 ) {

                            break;

                          }

                        }

                      }

                    }

                    if ( bIsOwner ||
                         checkUserRoles.isAuthorizedAdmin ||
                         checkUserRoles.isAuthorizedL03 ||
                         checkUserRoles.isAuthorizedL02 ||
                         checkUserRoles.isAuthorizedL01 ) { //} || ( bDenyTagAccess === false && bAllowTagAccess ) ) {

                      const debugMark = debug.extend( "D7654B20FADE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
                      debugMark( "Success get the resource with id [%s]", strId );

                      result = {
                                 StatusCode: 200, //Ok
                                 File: binaryData.File,
                                 Name: binaryData.FileName,
                                 Mime: binaryData.MimeType,
                                 Size: binaryData.FileSize,
                                 "X-Body-Response": {
                                                      Code: "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                      Name: binaryData.FileName,
                                                      Mime: binaryData.MimeType,
                                                      Size: binaryData.FileSize,
                                                      Hash: binaryData.Hash,
                                                    }
                               }

                      bApplyTransaction = true;

                    }
                    else {

                      const debugMark = debug.extend( "35384331CEF2" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

                      debugMark( "Forbidden access to resource with id [%s]", strId );

                      resultData = {
                                     StatusCode: 403, //Forbidden
                                     Code: "ERROR_ACCESS_NOT_ALLOWED",
                                     Message: await I18NManager.translate( strLanguage, "Access not allowed to binary data" ),
                                     Mark: "B429C5C08377" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                     LogId: null,
                                     IsError: true,
                                     Errors: [
                                               {
                                                 Code: "ERROR_ACCESS_NOT_ALLOWED",
                                                 Message: await I18NManager.translate( strLanguage, "Access not allowed to binary data" ),
                                                 Details: null,
                                               }
                                             ],
                                     Warnings: [],
                                     Count: 0,
                                     Data: []
                                   };

                      //ANCHOR binary data download Fobidden
                      result = {
                                 StatusCode: resultData.StatusCode, //Forbidden
                                 File: path.join( strFullPath, "/@default@/images/http_codes/403.png" ),
                                 Name: "403.png",
                                 Mime: "image/png",
                                 Size: 13129,
                                 "X-Body-Response": resultData
                               }

                    }

                  }

                }
                else {

                  const debugMark = debug.extend( "203763C284E4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
                  debugMark( "Unauthorized access to resource with id [%s]", strId );

                  //ANCHOR binary data download Unauthorized
                  result = {
                             StatusCode: resultData.StatusCode, //Unauthorized
                             File: path.join( strFullPath, "/@default@/images/http_codes/401.png" ),
                             Name: "401.png",
                             Mime: "image/png",
                             Size: 14591,
                             "X-Body-Response": resultData
                           }

                }

              }
              else {

                const debugMark = debug.extend( "E6F9268B1B43" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

                debugMark( "Bad request" );

                const resultHeaders = {
                                        StatusCode: 400, //Bad request
                                        Code: "ERROR_AUTH_PARAMETER_IS_EMPTY",
                                        Message: await I18NManager.translate( strLanguage, "The auth parameter cannot be empty." ),
                                        Mark: "B0D3A4067071" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                        LogId: null,
                                        IsError: true,
                                        Errors: [
                                                  {
                                                    Code: "ERROR_AUTH_PARAMETER_IS_EMPTY",
                                                    Message: await I18NManager.translate( strLanguage, `The auth parameter cannot be empty.` ),
                                                    Details: null,
                                                  }
                                                ],
                                        Warnings: [],
                                        Count: 0,
                                        Data: []
                                      };

                result = {
                           StatusCode: 400, //Bad request
                           "X-Body-Response": resultHeaders
                         }

              }

              //}
              //else {

              let bThumbnailNeeded = false;

              if ( userSessionStatus &&
                   sysBinaryIndexInDB &&
                   strThumbnail &&
                   strThumbnail !== "0" ) {

                bThumbnailNeeded = await this.checkThumbnailNeeded( userSessionStatus,
                                                                    sysBinaryIndexInDB.Category,
                                                                    sysBinaryIndexInDB.MimeType,
                                                                    currentTransaction,
                                                                    logger );

              }

              let defaultThumbnail = null;

              if ( ( result.File &&
                     fs.existsSync( result.File ) === false ) ||
                   ( bThumbnailNeeded &&
                     binaryData.MimeThumbnail ) ) {

                let strFileToGet = null;

                if ( bThumbnailNeeded ) {

                  let extraData = null;

                  if ( sysBinaryIndexInDB.ExtraData as any instanceof String ) {

                    extraData = CommonUtilities.parseJSON( sysBinaryIndexInDB.ExtraData, logger );

                  }
                  else {

                    extraData = sysBinaryIndexInDB.ExtraData;

                  }

                  if ( extraData.Thumbnail &&
                       extraData.Thumbnail.length > 0 ) {

                    defaultThumbnail = extraData.Thumbnail[ 0 ]
                    strFileToGet = strFullPath + sysBinaryIndexInDB.FilePath + extraData.Thumbnail[ 0 ].file;

                    for ( let intIndexThumbnail = 0; intIndexThumbnail < extraData.Thumbnail.length; intIndexThumbnail++ ) {

                      if ( extraData.Thumbnail[ intIndexThumbnail ].factor.toString() === strThumbnail ) {

                        defaultThumbnail = extraData.Thumbnail[ intIndexThumbnail ];
                        strFileToGet = strFullPath + sysBinaryIndexInDB.FilePath + extraData.Thumbnail[ intIndexThumbnail ].file;
                        break;

                      }

                    }

                  }

                }
                else {

                  strFileToGet = result.File;

                }

                if ( result.StatusCode === 200 &&
                     process.env.BINARY_DATA_SERVICE_FALLBACK_MODE === "1" &&
                     process.env.BINARY_DATA_SERVICE_FALLBACK_URL ) {

                  await BinaryServiceController.processFallbackData( strThumbnail,
                                                                     strId,
                                                                     path.join( strFullPath,
                                                                                sysBinaryIndexInDB.FilePath ),
                                                                     strFileToGet,
                                                                     logger );

                  if ( bThumbnailNeeded ) {

                    binaryData = await BinaryServiceController.selectThumbnail( strFullPath,
                                                                                path.join( strFullPath, sysBinaryIndexInDB.FilePath ),
                                                                                strId + "." + sysBinaryIndexInDB.FileExtension + ".thumbnail",
                                                                                sysBinaryIndexInDB.FileName,
                                                                                sysBinaryIndexInDB.FileExtension,
                                                                                sysBinaryIndexInDB.MimeType,
                                                                                sysBinaryIndexInDB.FileSize,
                                                                                strThumbnail,
                                                                                logger );

                    result = {
                               StatusCode: 200, //Ok
                               File: binaryData.File,
                               Name: binaryData.FileName,
                               Mime: binaryData.MimeType,
                               Size: binaryData.FileSize,
                               "X-Body-Response": {
                                                    Code: "SUCCESS_BINARY_DATA_DOWNLOAD",
                                                    Name: binaryData.FileName,
                                                    Mime: binaryData.MimeType,
                                                    Size: binaryData.FileSize,
                                                    Hash: binaryData.Hash,
                                                  }
                             }

                  }

                }

                if ( fs.existsSync( result.File ) === false ) {

                  const resultHeaders = {
                                          StatusCode: 404, //Not found
                                          Code: "ERROR_FILE_NOT_FOUND",
                                          Message: await I18NManager.translate( strLanguage, "The binary data file not found." ),
                                          Mark: "1109E2A671E8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                          LogId: null,
                                          IsError: true,
                                          Errors: [
                                                    {
                                                      Code: "ERROR_FILE_NOT_FOUND",
                                                      Message: await I18NManager.translate( strLanguage, "The binary data file not found." ),
                                                      Details: null,
                                                    }
                                                  ],
                                          Warnings: [],
                                          Count: 0,
                                          Data: []
                                        };

                  //ANCHOR binary data download FILE NOT FOUND
                  result = {
                             StatusCode: 404, //Not found
                             File: path.join( strFullPath, "/@default@/images/http_codes/404_file.png" ),
                             Name: "404_file.png",
                             Mime: "image/png",
                             Size: 13218,
                             "X-Body-Response": resultHeaders
                           }

                }

              }

            }
            else {

              const resultHeaders = {
                                      StatusCode: 400, //Bad request
                                      Code: "ERROR_BINARY_DATA_EXPIRED",
                                      Message: await I18NManager.translate( strLanguage, "The binary data is expired." ),
                                      Mark: "C3B1BFFB4FF1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      LogId: null,
                                      IsError: true,
                                      Errors: [
                                                {
                                                  Code: "ERROR_BINARY_DATA_EXPIRED",
                                                  Message: await I18NManager.translate( strLanguage, "The binary data is expired." ),
                                                  Details: null,
                                                }
                                              ],
                                      Warnings: [],
                                      Count: 0,
                                      Data: []
                                    };

              //ANCHOR binary data download EXPIRED
              result = {
                         StatusCode: 400, //Not found
                         File: path.join( strFullPath, "/@default@/images/others/expired.png" ),
                         Name: "expired.png",
                         Mime: "image/png",
                         Size: 13218,
                         "X-Body-Response": resultHeaders
                       }

            }

          }
          else {

            const resultHeaders = {
                                    StatusCode: 400, //Bad request
                                    Code: "ERROR_BINARY_DATA_DISABLED",
                                    Message: await I18NManager.translate( strLanguage, "The binary data is disabled." ),
                                    Mark: "7E8321B74295" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    LogId: null,
                                    IsError: true,
                                    Errors: [
                                              {
                                                Code: "ERROR_BINARY_DATA_DISABLED",
                                                Message: await I18NManager.translate( strLanguage, "The binary data is disabled." ),
                                                Details: null,
                                              }
                                            ],
                                    Warnings: [],
                                    Count: 0,
                                    Data: []
                                  };

            //ANCHOR binary data download DISABLED
            result = {
                       StatusCode: 400, //Not found
                       File: path.join( strFullPath, "/@default@/images/others/disabled.png" ),
                       Name: "disabled.png",
                       Mime: "image/png",
                       Size: 13218,
                       "X-Body-Response": resultHeaders
                     }

          }

        }
        else {

          const resultHeaders = {
                                  StatusCode: 404, //Not found
                                  Code: "ERROR_BINARY_DATA_NOT_FOUND",
                                  Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                                  Mark: "E4650CE42D99" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                  LogId: null,
                                  IsError: true,
                                  Errors: [
                                            {
                                              Code: "ERROR_BINARY_DATA_NOT_FOUND",
                                              Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                                              Details: null,
                                            }
                                          ],
                                  Warnings: [],
                                  Count: 0,
                                  Data: []
                                };

          //ANCHOR binary data download DB NOT FOUND
          result = {
                     StatusCode: 404, //Not found
                     File: path.join( strFullPath, "/@default@/images/http_codes/404.png" ),
                     Name: "404.png",
                     Mime: "image/png",
                     Size: 13218,
                     "X-Body-Response": resultHeaders
                   }

        }

      }
      else {

        const resultHeaders = {
                                StatusCode: 400, //Bad request
                                Code: "ERROR_ID_PARAMETER_IS_EMPTY",
                                Message: await I18NManager.translate( strLanguage, "The id parameter cannot be empty." ),
                                Mark: "67F2D64A113E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                LogId: null,
                                IsError: true,
                                Errors: [
                                          {
                                            Code: "ERROR_ID_PARAMETER_IS_EMPTY",
                                            Message: await I18NManager.translate( strLanguage, "The id parameter cannot be empty." ),
                                            Details: null,
                                          }
                                        ],
                                Warnings: [],
                                Count: 0,
                                Data: []
                              };

        result = {
                   StatusCode: 400, //Bad request
                   "X-Body-Response": resultHeaders
                 }

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getBinaryData.name;

      const strMark = "1AB14A900E5E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      const resultHeaders = {
                              StatusCode: 500, //Internal server error
                              Code: "ERROR_UNEXPECTED",
                              Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                              Mark: strMark,
                              LogId: error.logId,
                              IsError: true,
                              Errors: [
                                        {
                                          Code: error.name,
                                          Message: error.message,
                                          Details: await SystemUtilities.processErrorDetails( error ) //error
                                        }
                                      ],
                              Warnings: [],
                              Count: 0,
                              Data: []
                            };

      response.setHeader( "X-Body-Response", JSON.stringify( resultHeaders ) );

      result = {
                 StatusCode: 500, //Internal server error
               };


      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }


    }

    return result;

  }

  static async getBinaryDataDetails( request: Request,
                                     transaction: any,
                                     logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      const userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const sysBinaryIndexInDB = await SYSBinaryIndexService.getById( request.query.id as string,
                                                                      null,
                                                                      currentTransaction,
                                                                      logger );

      if ( sysBinaryIndexInDB instanceof Error ) {

        const error = sysBinaryIndexInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "AEEC8C097CD6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: error.name,
                               Message: error.message,
                               Details: await SystemUtilities.processErrorDetails( error ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysBinaryIndexInDB ) {

        //ANCHOR Check is owner of BinaryData
        const bIsOwner = await BinaryServiceController.checkIsOwner(
                                                                     sysBinaryIndexInDB.Owner,
                                                                     userSessionStatus.UserId,
                                                                     userSessionStatus.UserName,
                                                                     userSessionStatus.UserGroupId,
                                                                     userSessionStatus.UserGroupName,
                                                                     logger
                                                                   );

        let checkUserRoles: ICheckUserRoles = {
                                                isAuthorizedAdmin: false,
                                                isAuthorizedL03: false,
                                                isAuthorizedL02: false,
                                                isAuthorizedL01: false,
                                                isNotAuthorized: false
                                              };

        let ownerList = null;

        if ( bIsOwner === false ) {

          ownerList = BinaryServiceController.getUserOwner( sysBinaryIndexInDB.Owner, logger );

          for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

            const sysUserInDB = await SYSUserService.getBy( ownerList[ intOnwerIndex ],
                                                            null,
                                                            currentTransaction,
                                                            logger );

            checkUserRoles = BinaryServiceController.checkUserRoleLevel( userSessionStatus,
                                                                         sysUserInDB,
                                                                         "GetBinary",
                                                                         logger );

            if ( checkUserRoles.isAuthorizedAdmin ||
                 checkUserRoles.isAuthorizedL02 ) {

              break;

            }

          }

          if ( checkUserRoles.isAuthorizedAdmin === false &&
               checkUserRoles.isAuthorizedL02 === false ) {

            ownerList = BinaryServiceController.getUserGroupOwner( sysBinaryIndexInDB.Owner, logger );

            for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

              const sysUserGroupInDB = await SYSUserGroupService.getBy( ownerList[ intOnwerIndex ],
                                                                        null,
                                                                        currentTransaction,
                                                                        logger );

              checkUserRoles = BinaryServiceController.checkUserGroupRoleLevel( userSessionStatus,
                                                                                sysUserGroupInDB,
                                                                                "GetBinary",
                                                                                logger );

              if ( checkUserRoles.isAuthorizedL01 ||
                   checkUserRoles.isAuthorizedL03 ) {

                break;

              }

            }

          }

        }

        if ( bIsOwner ||
             checkUserRoles.isAuthorizedAdmin ||
             checkUserRoles.isAuthorizedL03 ||
             checkUserRoles.isAuthorizedL02 ||
             checkUserRoles.isAuthorizedL01 ) {

          let modelData = ( sysBinaryIndexInDB as any ).dataValues;

          const tempModelData = await SYSBinaryIndex.convertFieldValues(
                                                                         {
                                                                           Data: modelData,
                                                                           FilterFields: 1, //Force to remove fields like password and value
                                                                           TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                           Include: null, //[ { model: SYSUser } ],
                                                                           Exclude: null, //[ { model: SYSUser } ],
                                                                           Logger: logger,
                                                                           ExtraInfo: {
                                                                                        Request: request
                                                                                      }
                                                                         }
                                                                       );

          if ( tempModelData ) {

            modelData = tempModelData;

          }

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_GET_BINARY_DATA_DETAILS",
                     Message: await I18NManager.translate( strLanguage, "Success binary data details from the id %s", sysBinaryIndexInDB.Id ),
                     Mark: "F5509D216548" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 0,
                     Data: [
                             modelData
                           ]
                   }

        }
        else {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: "ERROR_CANNOT_GET_BINARY_DATA",
                     Message: await I18NManager.translate( strLanguage, "Not allowed to get the binary data information" ),
                     Mark: "BE576C66151B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_GET_BINARY_DATA",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to get the binary data information" ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_BINARY_DATA_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                   Mark: "344684A4B26F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_BINARY_DATA_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getBinaryDataDetails.name;

      const strMark = "8786D9821FCD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async uploadRegularBinaryData( request: Request,
                                        transaction: any,
                                        logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      const userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      let debugMark = debug.extend( "9B7197376B5B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
      debugMark( "Time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "uploadRegularBinaryData" );

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const intBinaryDataMaximumSize = await BinaryServiceController.getConfigBinaryDataMaximumSize( transaction,
                                                                                                     logger );

      if ( request.body.FileEncoded &&
           request.body.FileEncodedKind ) {

        //data:image/png;base64,iVBORw0KG...ASUVORK5CYII=
        let strMimeType = request.body.FileEncodedKind.replace( "data:", "" ).replace( ";base64", "" );

        let buffer = Buffer.from( request.body.FileEncoded, "base64" );

        const strFileName = SystemUtilities.getUUIDv4() + ".data";

        fs.writeFileSync( SystemUtilities.strBaseRootPath +
                          "/temp/" +
                          SystemUtilities.getHostName() +
                          "/" +
                          strFileName,
                          buffer );

        request.body.FileEncoded = null;
        buffer = null;

        const strTempFullFilePath = SystemUtilities.strBaseRootPath + "/temp/" + strFileName;

        if ( fs.existsSync( strTempFullFilePath ) ) {

          const intFileSize = fs.statSync( strTempFullFilePath )[ "size" ];

          //const x = UploadedFile( ,  );
          request.files = {

                            File: {
                                    data: Buffer.from( [ 0 ] ),
                                    md5: await SystemUtilities.getFileHash( strTempFullFilePath,
                                                                            "md5",
                                                                            logger ),
                                    mimetype: strMimeType,
                                    //mimetype: SystemUtilities.getMimeType( strTempFullFilePath,
                                    //                                       "image/jpeg",
                                    //                                       logger ),
                                    mv: null,
                                    name: strFileName,
                                    size: fs.statSync( strTempFullFilePath )[ "size" ],
                                    tempFilePath: strTempFullFilePath,
                                    truncated: intBinaryDataMaximumSize > 0 && intFileSize > intBinaryDataMaximumSize,
                                  }

                          } as any

        }

      }

      if ( request.files &&
           Object.keys( request.files ).length > 0 ) {

        let uploadedFile = null;

        uploadedFile = request.files.File;

        if ( uploadedFile.truncated === false ) {

          if ( request.body.Category ) {

            let strCategory = CommonUtilities.clearSpecialChars( request.body.Category,
                                                                 `!@#$^&%*()+=[]\/\\{}|:<>?,.""\`` );

            strCategory = CommonUtilities.unaccent( strCategory );

            const allowedCategory = await BinaryServiceController.checkAllowedCategory( userSessionStatus,
                                                                                        strCategory.toLowerCase(),
                                                                                        currentTransaction,
                                                                                        logger );

            if ( allowedCategory.value === 1 ) {

              if ( parseInt( request.body.AccessKind ) >= 1 && parseInt( request.body.AccessKind ) <= 3 ) {

                if ( parseInt( request.body.StorageKind ) >= 0 && parseInt( request.body.StorageKind ) <= 1 ) {

                  const fileDetectedType = SystemUtilities.getMimeType( uploadedFile.tempFilePath,
                                                                        uploadedFile.mimetype,
                                                                        logger );

                  const allowedMimeType = await BinaryServiceController.checkAllowedMimeType( userSessionStatus,
                                                                                              fileDetectedType.mime,
                                                                                              strCategory.toLowerCase(),
                                                                                              currentTransaction,
                                                                                              logger );

                  if ( allowedMimeType.value === 1 ) {

                    const strDefaultOwners = await BinaryServiceController.getDefaultOwners( userSessionStatus,
                                                                                             strCategory.toLowerCase(),
                                                                                             currentTransaction,
                                                                                             logger );

                    let strId = request.body.Id;

                    if ( !strId ||
                         !userSessionStatus.UserTag ||
                         userSessionStatus.UserTag.includes( "#Binary_Data_Allow_To_Define_Id#" ) === false ) {

                      if ( !strId ||
                           !userSessionStatus.UserGroupTag ||
                           userSessionStatus.UserGroupTag.includes( "#Binary_Data_Allow_To_Define_Id#" ) === false ) {

                        if ( !strId ||
                             !userSessionStatus.Tag ||
                             userSessionStatus.Tag.includes( "#Binary_Data_Allow_To_Define_Id#" ) === false ) {

                           strId = SystemUtilities.getUUIDv4();

                        }

                      }

                    }

                    let date = SystemUtilities.getCurrentDateAndTimeFrom( request.body.Date );
                    let strDate = null;

                    if ( date ) {

                      strDate = date.format( "YYYY-MM-DD-HH" );

                    }

                    if ( !strDate ||
                         !userSessionStatus.UserTag ||
                         userSessionStatus.UserTag.includes( "#Binary_Data_Allow_To_Define_Date#" ) ) {

                      if ( !strDate ||
                           !userSessionStatus.UserGroupTag ||
                           userSessionStatus.UserGroupTag.includes( "#Binary_Data_Allow_To_Define_Date#" ) ) {

                        if ( !strDate ||
                             !userSessionStatus.Tag ||
                             userSessionStatus.Tag.includes( "#Binary_Data_Allow_To_Define_Date#" ) ) {

                          strDate = SystemUtilities.getCurrentDateAndTime().format( "YYYY-MM-DD-HH" );

                        }

                      }

                    }

                    //ANCHOR BinaryData BasePath
                    let strRelativePath = "";
                    let strFullPath = "";
                    let expireAt = null;
                    const strBasePath = await BinaryServiceController.getConfigBinaryDataBasePath( currentTransaction,
                                                                                                   logger );

                    let strContextPath = CommonUtilities.clearSpecialChars( request.body.ContextPath,
                                                                            `!@#$^&%*()+=[]\\{}|:<>?,.""\`` );

                    strContextPath = CommonUtilities.unaccent( strContextPath );

                    if ( !strContextPath ) {

                      strContextPath = "/";

                    }

                    if ( strContextPath.startsWith( "/" ) === false ) {

                      strContextPath = "/" + strContextPath;

                    }

                    if ( strContextPath.endsWith( "/" ) === false ) {

                      strContextPath = strContextPath + "/";

                    }

                    if ( parseInt( request.body.StorageKind ) === 0 ) { //Persistent

                      strRelativePath = "persistent/" + strCategory + "/" + strDate + "/" + userSessionStatus.UserName + strContextPath;

                      expireAt = SystemUtilities.isValidDateTime( request.body.ExpireAt ) ? request.body.ExpireAt : null;

                    }
                    else if ( parseInt( request.body.Storagekind ) === 1 ) { //Temporal

                      strRelativePath = "temporal/" + strCategory + "/" + strDate + "/" + userSessionStatus.UserName + strContextPath;

                      expireAt = SystemUtilities.isValidDateTime( request.body.ExpireAt ) ? request.body.ExpireAt : SystemUtilities.getCurrentDateAndTimeIncDays( 30 ).format();

                    }

                    if ( strBasePath.startsWith( "full://" ) ) {

                      strFullPath = path.join( strBasePath.replace( "full://", "" ), strRelativePath );

                    }
                    else {

                      strFullPath = path.join( SystemUtilities.strBaseRootPath,
                                               strBasePath,
                                               strRelativePath );

                    }

                    debugMark( "Put binary data file in folder [%s]", strFullPath );

                    if ( logger &&
                         typeof logger.info === "function" ) {

                      logger.info( "Put binary data file in folder [%s]", strFullPath );

                    }

                    debugMark( "Moving file" );

                    if ( uploadedFile.mv ) {

                      await uploadedFile.mv( strFullPath + strId + "." + fileDetectedType.ext + ".data" );

                    }
                    else {

                      fs.mkdirSync( strFullPath, { recursive: true } );

                      const moveFile = require('move-file');

                      await moveFile( uploadedFile.tempFilePath,
                                      strFullPath + strId + "." + fileDetectedType.ext + ".data" );

                      //fs.renameSync( uploadedFile.tempFilePath,
                      //               strFullPath + strId + "." + fileDetectedType.ext + ".data" );

                    }

                    delete request.body.CreatedBy;
                    delete request.body.CreatedAt;
                    delete request.body.UpdatedBy;
                    delete request.body.UpdatedAt;
                    delete request.body.ExtraData;

                    if ( request.body.DisabledBy !== "0" &&
                         request.body.DisabledBy !== "1" ) {

                      delete request.body.DisabledBy;

                    }

                    delete request.body.DisabledAt;
                    delete request.body.ExtraData;

                    //Create thumbnail
                    const thumbnailFactor = await this.getConfigBinaryDataThumbnail( userSessionStatus,
                                                                                     strCategory,
                                                                                     fileDetectedType.mime,
                                                                                     currentTransaction,
                                                                                     logger );

                    debugMark( "Generating thumbnail" );

                    const thumbnailData = await BinaryServiceController.generateThumbnail( strFullPath,
                                                                                           strId + "." + fileDetectedType.ext,
                                                                                           ".data",
                                                                                           thumbnailFactor,
                                                                                           logger );

                    debugMark( "Detect process needed" );

                    const processData = await BinaryServiceController.detectProcessNeeded( userSessionStatus,
                                                                                           strCategory,
                                                                                           fileDetectedType.mime,
                                                                                           uploadedFile.size,
                                                                                           currentTransaction,
                                                                                           logger );

                    const strCurrentFileExtension = CommonUtilities.getFileExtension( uploadedFile.name );

                    let strFinalFileName = request.body.Name ? request.body.Name: uploadedFile.name;

                    if ( strCurrentFileExtension !== "." + fileDetectedType.ext ) {

                      strFinalFileName = strFinalFileName + "." + fileDetectedType.ext;

                    }
                    else if ( request.body.Name ) {

                      strFinalFileName = strFinalFileName + strCurrentFileExtension;

                    }

                    const extraData = {
                                        Thumbnail: thumbnailData && thumbnailData.thumbnail ? thumbnailData.thumbnail : [],
                                        Process: processData && processData.process ? processData.process : [],
                                      };

                    const binaryIndexData = {
                                              Id: strId,
                                              AccessKind: request.body.AccessKind,
                                              StorageKind: request.body.StorageKind,
                                              ExpireAt: expireAt,
                                              Category: strCategory,
                                              Hash: "md5://" + uploadedFile.md5,
                                              MimeType: fileDetectedType.mime,
                                              Label: CommonUtilities.isNotNullOrEmpty( request.body.Label ) ? request.body.Label: strFinalFileName,
                                              FilePath: strRelativePath,
                                              FileName: strFinalFileName,
                                              FileExtension: fileDetectedType.ext,
                                              FileSize: uploadedFile.size, //In bytes
                                              Tag: CommonUtilities.isNotNullOrEmpty( request.body.Tag ) ? request.body.Tag: null,
                                              System: CommonUtilities.isNotNullOrEmpty( context.FrontendId ) ? context.FrontendId: null,
                                              Context: CommonUtilities.isNotNullOrEmpty( request.body.Context ) ? request.body.Context: null,
                                              Comment: CommonUtilities.isNotNullOrEmpty( request.body.Comment ) ? request.body.Comment : null,
                                              ShareCode: CommonUtilities.isNotNullOrEmpty( request.body.ShareCode ) ? request.body.ShareCode: null,
                                              Owner: strDefaultOwners,
                                              ProcessNeeded: processData && processData.value ? processData.value : 0,
                                              CreatedBy: userSessionStatus.UserName,
                                              DisabledBy: request.body.DisabledBy === "1"? "1@" + userSessionStatus.UserName: "0",
                                              ExtraData: extraData
                                            }

                    debugMark( "Writing info to database" );

                    const sysBinaryIndexInDB = await SYSBinaryIndexService.createOrUpdate( strId,
                                                                                           binaryIndexData,
                                                                                           true,
                                                                                           currentTransaction,
                                                                                           logger );

                    if ( sysBinaryIndexInDB &&
                         sysBinaryIndexInDB instanceof Error === false ) {

                      const payload = {
                                        SystemId: SystemUtilities.getSystemId(),
                                        SystemName: process.env.APP_SERVER_DATA_NAME,
                                        SubSystem: "BinaryService",
                                        Token: context.UserSessionStatus.Token,
                                        UserId: context.UserSessionStatus.UserId,
                                        UserName: context.UserSessionStatus.UserName,
                                        UserGroupId: context.UserSessionStatus.UserGroupId,
                                        Code: "SUCCESS_BINARY_DATA_UPLOAD",
                                        EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                        Data: {
                                                Id: sysBinaryIndexInDB.Id,
                                                FilePath: sysBinaryIndexInDB.FilePath,
                                                FileName: sysBinaryIndexInDB.FileName,
                                                Hash: sysBinaryIndexInDB.Hash
                                              }
                                      };

                      HookManager.processHookHandlersInChain( "SystemEvent",
                                                              payload,
                                                              logger );

                      /*
                      NotificationManager.publishOnTopic( "SystemEvent",
                                                          {
                                                            SystemId: SystemUtilities.getSystemId(),
                                                            SystemName: process.env.APP_SERVER_DATA_NAME,
                                                            SubSystem: "BinaryService",
                                                            Token: context.UserSessionStatus.Token,
                                                            UserId: context.UserSessionStatus.UserId,
                                                            UserName: context.UserSessionStatus.UserName,
                                                            UserGroupId: context.UserSessionStatus.UserGroupId,
                                                            Code: "SUCCESS_BINARY_DATA_UPLOAD",
                                                            EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                            Data: {
                                                                    Id: sysBinaryIndexInDB.Id,
                                                                    FilePath: sysBinaryIndexInDB.FilePath,
                                                                    FileName: sysBinaryIndexInDB.FileName,
                                                                    Hash: sysBinaryIndexInDB.Hash
                                                                  }
                                                          },
                                                          logger );
                      */

                      const metaData = ( sysBinaryIndexInDB as any ).dataValues;

                      metaData.ExtraData = extraData; //JSON.parse( metaData.ExtraData );

                      fs.writeFileSync( strFullPath +
                                        strId +
                                        "." +
                                        fileDetectedType.ext +
                                        ".meta.json",
                                        JSON.stringify( metaData,
                                                        null,
                                                        2 ) );

                      debugMark( "Success" );

                      delete binaryIndexData.ExtraData;

                      result = {
                                 StatusCode: 200, //Ok
                                 Code: "SUCCESS_BINARY_DATA_UPLOAD",
                                 Message: await I18NManager.translate( strLanguage, "The binary data has been uploaded success." ),
                                 Mark: "8030662B75FA" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: null,
                                 IsError: false,
                                 Errors: [],
                                 Warnings: [],
                                 Count: 1,
                                 Data: [
                                         ( sysBinaryIndexInDB as any ).dataValues
                                       ]
                               };

                      bApplyTransaction = true;

                    }
                    else {

                      const error = sysBinaryIndexInDB as any;

                      debugMark( "Failed" );

                      result = {
                                 StatusCode: 500, //Internal server error
                                 Code: "ERROR_UNEXPECTED",
                                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                 Mark: "E8913CD0BAD0" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: error.logId,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: error.name,
                                             Message: error.message,
                                             Details:  await SystemUtilities.processErrorDetails( error ) //dbOperationResult.error
                                           }
                                         ],
                                 Warnings: [],
                                 Count: 0,
                                 Data: []
                               };

                    }

                  }
                  else {

                    result = {
                               StatusCode: 400, //Bad request
                               Code: "ERROR_NOT_VALID_FILE_MIME_TYPE",
                               Message: await I18NManager.translate( strLanguage, "The %s detected for the file is invalid in the category.", fileDetectedType.mime ),
                               Mark: "47946C96B03B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: "ERROR_NOT_VALID_FILE_MIME_TYPE",
                                           Message: await I18NManager.translate( strLanguage, "The %s detected for the file is invalid in the category.", fileDetectedType.mime ),
                                           Details: {
                                                      Category: strCategory,
                                                      Detected: fileDetectedType.mime,
                                                      Denied: allowedMimeType.denied,
                                                      Allowed: allowedMimeType.allowed,
                                                    }
                                         }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             };

                  }

                }
                else {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: "ERROR_NOT_VALID_STORAGE_KIND_DEFINED",
                             Message: await I18NManager.translate( strLanguage, "The StorageKind parameter cannot be empty or null. Only 0 or 1 are valid values." ),
                             Mark: "7FBB0F51D723" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_NOT_VALID_STORAGE_KIND_DEFINED",
                                         Message: await I18NManager.translate( strLanguage, "The StorageKind parameter cannot be empty or null. Only 0 or 1 are valid values." ),
                                         Details: {
                                                    0: "Persistent",
                                                    1: "Temporal",
                                                  }
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

                }

              }
              else {

                result = {
                           StatusCode: 400, //Bad request
                           Code: "ERROR_NOT_VALID_ACCESS_KIND_DEFINED",
                           Message: await I18NManager.translate( strLanguage, "The AccessKind parameter cannot be empty or null. Only 1 or 2 or 3 are valid values." ),
                           Mark: "4E8EDBF7499A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                           LogId: null,
                           IsError: true,
                           Errors: [
                                     {
                                       Code: "ERROR_NOT_VALID_ACCESS_KIND_DEFINED",
                                       Message: await I18NManager.translate( strLanguage, "The AccessKind parameter cannot be empty or null. Only 1 or 2 or 3 are valid values." ),
                                       Details: {
                                                  1: "Public",
                                                  2: "Authenticated",
                                                  3: "Role"
                                                }
                                     }
                                   ],
                           Warnings: [],
                           Count: 0,
                           Data: []
                         };

              }

            }
            else {

              result = {
                        StatusCode: 400, //Bad request
                        Code: "ERROR_NOT_VALID_CATEGORY_NAME",
                        Message: await I18NManager.translate( strLanguage, "The Category parameter is not valid." ),
                        Mark: "242D82D6BF0D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                        LogId: null,
                        IsError: true,
                        Errors: [
                                  {
                                    Code: "ERROR_NOT_VALID_CATEGORY_NAME",
                                    Message: await I18NManager.translate( strLanguage, "The Category parameter is not valid." ),
                                    Details: {
                                               Category: strCategory,
                                               Denied: allowedCategory.denied,
                                               Allowed: allowedCategory.allowed,
                                             }
                                  }
                                ],
                        Warnings: [],
                        Count: 0,
                        Data: []
                      };

            }

          }
          else {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_NOT_VALID_CATEGORY_DEFINED",
                       Message: await I18NManager.translate( strLanguage, "The Category parameter cannot be empty, null or contains especial chars. Only A-Z a-z , - are valid." ),
                       Mark: "0372A2B30F59" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_NOT_VALID_CATEGORY_DEFINED",
                                   Message: await I18NManager.translate( strLanguage, "The Category parameter cannot be empty, null or contains especial chars. Only A-Z a-z , - are valid." ),
                                   Details: {
                                              Valid: [ "A-Z", "a-z", "0-9", "_", "-" ],
                                            }
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }

        }
        else {

          //const intBinaryDataMaximumSize = await BinaryServiceController.getConfigBinaryDataMaximumSize( transaction,
          //                                                                                               logger );

          result = {
                     StatusCode: 413, //Request Entity Too Large
                     Code: "ERROR_FILE_TOO_BIG",
                     Message: await I18NManager.translate( strLanguage, "The file is too big." ),
                     Mark: "B7AF6279E7EB" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_FILE_TOO_BIG",
                                 Message: await I18NManager.translate( strLanguage, "The file is too big." ),
                                 Details: {
                                            Maximum: intBinaryDataMaximumSize / 1024,
                                            Unit: "kilobytes"
                                          }
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_NOT_FILE_UPLOADED",
                   Message: await I18NManager.translate( strLanguage, "No file uploaded." ),
                   Mark: "8E3E1D2078AE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_NOT_FILE_UPLOADED",
                               Message: await I18NManager.translate( strLanguage, "No file uploaded." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.uploadRegularBinaryData.name;

      const strMark = "763DC880AD6C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async uploadOtherBinaryData( request: Request,
                                      transaction: any,
                                      logger: any ): Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      //const userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      let debugMark = debug.extend( "E1E3CA5B40A6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );
      debugMark( "Time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( "uploadOtherBinaryData" );

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const intBinaryDataMaximumSize = await BinaryServiceController.getConfigBinaryDataMaximumSize( transaction,
                                                                                                     logger );

      if ( request.body.FileEncoded &&
           request.body.FileEncodedKind ) {

        //data:image/png;base64,iVBORw0KG...ASUVORK5CYII=
        let strMimeType = request.body.FileEncodedKind.replace( "data:", "" ).replace( ";base64", "" );

        let buffer = Buffer.from( request.body.FileEncoded, "base64" );

        const strFileName = SystemUtilities.getUUIDv4() + ".data";

        fs.writeFileSync( SystemUtilities.strBaseRootPath +
                          "/temp/" +
                          SystemUtilities.getHostName() +
                          "/" +
                          strFileName,
                          buffer );

        request.body.FileEncoded = null;
        buffer = null;

        const strTempFullFilePath = SystemUtilities.strBaseRootPath + "/temp/" + strFileName;

        if ( fs.existsSync( strTempFullFilePath ) ) {

          const intFileSize = fs.statSync( strTempFullFilePath )[ "size" ];

          //const x = UploadedFile( ,  );
          request.files = {

                            File: {
                                    data: Buffer.from( [] ),
                                    md5: await SystemUtilities.getFileHash( strTempFullFilePath,
                                                                            "md5",
                                                                            logger ),
                                    mimetype: strMimeType,
                                    //mimetype: SystemUtilities.getMimeType( strTempFullFilePath,
                                    //                                       "image/jpeg",
                                    //                                       logger ),
                                    mv: null,
                                    name: strFileName,
                                    size: intFileSize,
                                    tempFilePath: strTempFullFilePath,
                                    truncated: intBinaryDataMaximumSize > 0 && intFileSize > intBinaryDataMaximumSize,
                                  }

                          } as any;

        }

      }

      if ( request.files &&
           Object.keys( request.files ).length > 0 ) {

        let uploadedFile = null;

        uploadedFile = request.files.File;

        if ( uploadedFile.truncated === false ) {

          //ANCHOR BinaryData BasePath
          let strRelativePath = "";

          let strBasePath = "temp/";

          let strPrefix = "temp-";

          if ( request.body.UploadTo === "job" ) {

            strBasePath = "jobs/input/";

            strPrefix = "job-";

          }
          else if ( request.body.UploadTo === "task" ) {

            strBasePath = "tasks/input/";

            strPrefix = "task-";

          }

          const strFullPath = path.join( SystemUtilities.strBaseRootPath,
                                         strBasePath,
                                         strRelativePath );

          debugMark( "Put binary data file in folder [%s]", strFullPath );

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "Put binary data file in folder [%s]", strFullPath );

          }

          const fileDetectedType = SystemUtilities.getMimeType( uploadedFile.tempFilePath,
                                                                uploadedFile.mimetype,
                                                                logger );

          let strId = request.body.Id || SystemUtilities.getUUIDv4();

          debugMark( "Moving file" );

          const strFinalPath = strFullPath + strPrefix + strId + "/";

          fs.mkdirSync( strFinalPath, { recursive: true } );

          await uploadedFile.mv( strFinalPath + strPrefix + strId + "." + fileDetectedType.ext + ".data" );

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_BINARY_DATA_UPLOAD",
                     Message: await I18NManager.translate( strLanguage, "The binary data has been uploaded success." ),
                     Mark: "AF4FE8CB700E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             {
                               Id: strPrefix + strId,
                               Path: strFinalPath + strPrefix + strId + "." + fileDetectedType.ext + ".data"
                             }
                           ]
                   };

        }
        else {

          //const intBinaryDataMaximumSize = await BinaryServiceController.getConfigBinaryDataMaximumSize( transaction,
          //                                                                                               logger );

          result = {
                     StatusCode: 413, //Request Entity Too Large
                     Code: "ERROR_FILE_TOO_BIG",
                     Message: await I18NManager.translate( strLanguage, "The file is too big." ),
                     Mark: "288FCEE65C27" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_FILE_TOO_BIG",
                                 Message: await I18NManager.translate( strLanguage, "The file is too big." ),
                                 Details: {
                                            Maximum: intBinaryDataMaximumSize / 1024,
                                            Unit: "kilobytes"
                                          }
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 400, //Bad request
                   Code: "ERROR_NOT_FILE_UPLOADED",
                   Message: await I18NManager.translate( strLanguage, "No file uploaded." ),
                   Mark: "4ED8443CDF85" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_NOT_FILE_UPLOADED",
                               Message: await I18NManager.translate( strLanguage, "No file uploaded." ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.uploadOtherBinaryData.name;

      const strMark = "8845B0594200" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async uploadBinaryData( request: Request,
                                 transaction: any,
                                 logger: any ):Promise<any> {

    let result = null;

    if ( !request.body.UploadTo || request.body.UploadTo === "regular" ) {

      result = await BinaryServiceController.uploadRegularBinaryData( request,
                                                                      transaction,
                                                                      logger );

    }
    else {

      result = await BinaryServiceController.uploadOtherBinaryData( request,
                                                                    transaction,
                                                                    logger );

    }

    return result;

  }

  static async updateStorageKind( intNewStorageKind: number,
                                  strBasePath: string,
                                  strFullOldPath: string,
                                  sysBinaryIndex: SYSBinaryIndex,
                                  //transaction: any,
                                  logger: any ): Promise<Error|boolean> {

    let result = null;

    //let strFullOldPath = "";
    let strFullNewPath = "";

    let strOldRelativePath = sysBinaryIndex.FilePath;
    let strNewRelativePath = "";

    try {

      /*
      const strBasePath = await BinaryServiceController.getConfigBinaryDataBasePath( transaction,
                                                                                     logger );
                                                                                     */

      if ( sysBinaryIndex.StorageKind === 1 && intNewStorageKind === 0 ) { //From 1 = Temporal to 0 = Persistent

        strNewRelativePath = strOldRelativePath.replace( "temporal/", "persistent/" );

      }
      else if ( sysBinaryIndex.StorageKind === 0 && intNewStorageKind === 1 ) { //From 0 = Persistent to 1 = Temporal

        strNewRelativePath = strOldRelativePath.replace( "persistent/", "temporal/" );

      }

      if ( strBasePath.startsWith( "full://" ) ) {

        strFullNewPath = path.join( strBasePath.replace( "full://", "" ),
                                    strNewRelativePath );

      }
      else {

        strFullNewPath = path.join( SystemUtilities.strBaseRootPath,
                                    strBasePath,
                                    strNewRelativePath );

      }

      result = await SystemUtilities.moveFilesPrefixedBy( strFullOldPath,
                                                          strFullNewPath,
                                                          sysBinaryIndex.Id,
                                                          logger );

      if ( result === true ) {

        sysBinaryIndex.StorageKind = intNewStorageKind;
        sysBinaryIndex.FilePath = strNewRelativePath;

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.updateStorageKind.name;

      const strMark = "96764A9F824A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

    }

    return result;

  }

  static async updateBinaryData( request: Request,
                                 transaction: any,
                                 logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      let userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let sysBinaryIndexInDB = await SYSBinaryIndexService.getById( request.body.Id,
                                                                    null,
                                                                    currentTransaction,
                                                                    logger );

      if ( sysBinaryIndexInDB instanceof Error ) {

        const error = sysBinaryIndexInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "301F6A1F6FEE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: error.name,
                               Message: error.message,
                               Details: await SystemUtilities.processErrorDetails( error ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysBinaryIndexInDB ) {

        //ANCHOR Check is owner of BinaryData
        const bIsOwner = await BinaryServiceController.checkIsOwner(
                                                                     sysBinaryIndexInDB.Owner,
                                                                     userSessionStatus.UserId,
                                                                     userSessionStatus.UserName,
                                                                     userSessionStatus.UserGroupId,
                                                                     userSessionStatus.UserGroupName,
                                                                     logger
                                                                   );

        let checkUserRoles: ICheckUserRoles = {
                                                isAuthorizedAdmin: false,
                                                isAuthorizedL03: false,
                                                isAuthorizedL02: false,
                                                isAuthorizedL01: false,
                                                isNotAuthorized: false
                                              };

        let ownerList = null;

        if ( bIsOwner === false ) {

          ownerList = BinaryServiceController.getUserOwner( sysBinaryIndexInDB.Owner, logger );

          for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

            const sysUserInDB = await SYSUserService.getBy( ownerList[ intOnwerIndex ],
                                                            null,
                                                            currentTransaction,
                                                            logger );

            checkUserRoles = BinaryServiceController.checkUserRoleLevel( userSessionStatus,
                                                                         sysUserInDB,
                                                                         "Update_Binary",
                                                                         logger );

            if ( checkUserRoles.isAuthorizedAdmin ||
                 checkUserRoles.isAuthorizedL02 ) {

              break;

            }

          }

          if ( checkUserRoles.isAuthorizedAdmin === false &&
               checkUserRoles.isAuthorizedL02 === false ) {

            ownerList = BinaryServiceController.getUserGroupOwner( sysBinaryIndexInDB.Owner, logger );

            for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

              const sysUserGroupInDB = await SYSUserGroupService.getBy( ownerList[ intOnwerIndex ],
                                                                        null,
                                                                        currentTransaction,
                                                                        logger );

              checkUserRoles = BinaryServiceController.checkUserGroupRoleLevel( userSessionStatus,
                                                                                sysUserGroupInDB,
                                                                                "Update_Binary",
                                                                                logger );

              if ( checkUserRoles.isAuthorizedL01 ||
                   checkUserRoles.isAuthorizedL03 ) {

                break;

              }

            }

          }

        }

        if ( bIsOwner ||
             checkUserRoles.isAuthorizedAdmin ||
             checkUserRoles.isAuthorizedL03 ||
             checkUserRoles.isAuthorizedL02 ||
             checkUserRoles.isAuthorizedL01 ) {

          if ( request.body.Category ) {

            let strCategory = CommonUtilities.clearSpecialChars( request.body.Category,
                                                                 `!@#$^&%*()+=[]\/\\{}|:<>?,.""\`` );

            strCategory = CommonUtilities.unaccent( strCategory );

            const allowedCategory = await BinaryServiceController.checkAllowedCategory( userSessionStatus,
                                                                                        strCategory.toLowerCase(),
                                                                                        currentTransaction,
                                                                                        logger );

            if ( allowedCategory.value === 1 ) {

              if ( parseInt( request.body.AccessKind ) >= 1 && parseInt( request.body.AccessKind ) <= 3 ) {

                if ( parseInt( request.body.StorageKind ) >= 0 && parseInt( request.body.StorageKind ) <= 1 ) {

                  const strBasePath = await BinaryServiceController.getConfigBinaryDataBasePath( transaction,
                                                                                                 logger );
                  let strFullPath = "";

                  if ( strBasePath.startsWith( "full://" ) ) {

                    strFullPath = path.join( strBasePath.replace( "full://", "" ),
                                             sysBinaryIndexInDB.FilePath );

                  }
                  else {

                    strFullPath = path.join( SystemUtilities.strBaseRootPath,
                                             strBasePath,
                                             sysBinaryIndexInDB.FilePath );

                  }

                  const fileDetectedType = SystemUtilities.getMimeType( strFullPath + sysBinaryIndexInDB.Id + "." + sysBinaryIndexInDB.FileExtension + ".data",
                                                                        sysBinaryIndexInDB.MimeType,
                                                                        logger );

                  const allowedMimeType = await BinaryServiceController.checkAllowedMimeType( userSessionStatus,
                                                                                              fileDetectedType.mime,
                                                                                              strCategory.toLowerCase(),
                                                                                              currentTransaction,
                                                                                              logger );

                  if ( allowedMimeType.value === 1 ) {

                    const strDefaultOwners = await BinaryServiceController.getDefaultOwners( userSessionStatus,
                                                                                             strCategory.toLowerCase(),
                                                                                             currentTransaction,
                                                                                             logger );

                    let updateStorageKindResult = null;

                    if ( request.body.StorageKind !== sysBinaryIndexInDB.StorageKind ) {

                      //Move the binary data to to new folder according with the storage type
                      updateStorageKindResult = await BinaryServiceController.updateStorageKind( request.body.StorageKind,
                                                                                                 strBasePath,
                                                                                                 strFullPath,
                                                                                                 sysBinaryIndexInDB,
                                                                                                 //currentTransaction,
                                                                                                 logger );

                    }
                    else {

                      updateStorageKindResult = true;

                    }

                    if ( updateStorageKindResult === true ) {

                      delete request.body.CreatedBy;
                      delete request.body.CreatedAt;
                      delete request.body.UpdatedBy;
                      delete request.body.UpdatedAt;

                      if ( request.body.DisabledBy !== "0" &&
                           request.body.DisabledBy !== "1" ) {

                        delete request.body.DisabledBy;

                      }

                      delete request.body.DisabledAt;
                      delete request.body.ExtraData;

                      sysBinaryIndexInDB.Owner =  SystemUtilities.mergeTokens( strDefaultOwners,
                                                                               sysBinaryIndexInDB.Owner,
                                                                               true,
                                                                               logger );

                      sysBinaryIndexInDB.Category = request.body.Category ? request.body.Category: sysBinaryIndexInDB.Category;
                      sysBinaryIndexInDB.AccessKind = request.body.AccessKind ? request.body.AccessKind: sysBinaryIndexInDB.AccessKind;
                      sysBinaryIndexInDB.Label = request.body.Label ? request.body.Label: sysBinaryIndexInDB.Label;

                      if ( request.body.ExpireAt !== undefined ) {

                        sysBinaryIndexInDB.ExpireAt = SystemUtilities.isValidDateTime( request.body.ExpireAt ) ? request.body.ExpireAt: null;

                      }

                      if ( sysBinaryIndexInDB.Tag !== undefined ) {

                        sysBinaryIndexInDB.Tag = request.body.Tag ? request.body.Tag: null;

                      }

                      if ( request.body.Context !== undefined ) {

                        sysBinaryIndexInDB.Context = request.body.Context ? request.body.Context: null;

                      }

                      if ( request.body.Comment !== undefined ) {

                        sysBinaryIndexInDB.Comment = request.body.Comment ? request.body.Comment: null;

                      }

                      if ( request.body.ShareCode !== undefined ) {

                        sysBinaryIndexInDB.ShareCode = request.body.ShareCode ? request.body.ShareCode: null;

                      }

                      sysBinaryIndexInDB.UpdatedBy = userSessionStatus.UserName || SystemConstants._UPDATED_BY_UNKNOWN_SYSTEM_NET;
                      sysBinaryIndexInDB.UpdatedAt = null;
                      sysBinaryIndexInDB.DisabledBy = request.body.DisabledBy === "1"? "1@" + userSessionStatus.UserName: "0";

                      sysBinaryIndexInDB = await SYSBinaryIndexService.createOrUpdate(
                                                                                       sysBinaryIndexInDB.Id,
                                                                                       ( sysBinaryIndexInDB as any ).dataValues,
                                                                                       true,
                                                                                       currentTransaction,
                                                                                       logger
                                                                                     );

                      if ( sysBinaryIndexInDB instanceof Error ) {

                        const error = sysBinaryIndexInDB as any;

                        result = {
                                   StatusCode: 500, //Internal server error
                                   Code: "ERROR_UNEXPECTED",
                                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                   Mark: "DB8042C7F21E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   LogId: error.logId,
                                   IsError: true,
                                   Errors: [
                                             {
                                               Code: error.name,
                                               Message: error.message,
                                               Details: await SystemUtilities.processErrorDetails( error ) //error
                                             }
                                           ],
                                   Warnings: [],
                                   Count: 0,
                                   Data: []
                                 };

                      }
                      else {

                        let modelData = ( sysBinaryIndexInDB as any ).dataValues;

                        if ( strBasePath.startsWith( "full://" ) ) {

                          strFullPath = path.join( strBasePath.replace( "full://", "" ),
                                                   modelData.FilePath );

                        }
                        else {

                          strFullPath = path.join( SystemUtilities.strBaseRootPath,
                                                   strBasePath,
                                                   modelData.FilePath );

                        }

                        fs.writeFileSync( strFullPath +
                                          sysBinaryIndexInDB.Id +
                                          "." +
                                          fileDetectedType.ext +
                                          ".meta.json",
                                          JSON.stringify( modelData,
                                                          null,
                                                          2 ) );

                        const tempModelData = await SYSBinaryIndex.convertFieldValues(
                                                                                       {
                                                                                         Data: modelData,
                                                                                         FilterFields: 1, //Force to remove fields like password and value
                                                                                         TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                                         Include: null, //[ { model: SYSUser } ],
                                                                                         Exclude: null, //[ { model: SYSUser } ],
                                                                                         Logger: logger,
                                                                                         ExtraInfo: {
                                                                                                      Request: request
                                                                                                    }
                                                                                       }
                                                                                     );

                        if ( tempModelData ) {

                          modelData = tempModelData;

                        }

                        result = {
                                   StatusCode: 200, //Ok
                                   Code: "SUCCESS_BINARY_DATA_UPDATE",
                                   Message: await I18NManager.translate( strLanguage, "Success binary data update." ),
                                   Mark: "FBE65384949A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   LogId: null,
                                   IsError: false,
                                   Errors: [],
                                   Warnings: [],
                                   Count: 1,
                                   Data: [
                                           modelData
                                         ]
                                 };

                        bApplyTransaction = true;

                      }

                    }
                    else {

                      const error = updateStorageKindResult;

                      result = {
                                 StatusCode: 500, //Internal server error
                                 Code: "ERROR_UNEXPECTED",
                                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                 Mark: "10BA34FB2495" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                 LogId: error.logId,
                                 IsError: true,
                                 Errors: [
                                           {
                                             Code: error.name,
                                             Message: error.message,
                                             Details: await SystemUtilities.processErrorDetails( error ) //error
                                           }
                                         ],
                                 Warnings: [],
                                 Count: 0,
                                 Data: []
                               };

                    }

                  }
                  else {

                    result = {
                               StatusCode: 400, //Bad request
                               Code: "ERROR_NOT_VALID_FILE_MIME_TYPE",
                               Message: await I18NManager.translate( strLanguage, "The %s detected for the file is invalid in the category.", fileDetectedType.mime ),
                               Mark: "47946C96B03B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                               LogId: null,
                               IsError: true,
                               Errors: [
                                         {
                                           Code: "ERROR_NOT_VALID_FILE_MIME_TYPE",
                                           Message: await I18NManager.translate( strLanguage, "The %s detected for the file is invalid in the category.", fileDetectedType.mime ),
                                           Details: {
                                                      Category: strCategory,
                                                      Detected: fileDetectedType.mime,
                                                      Denied: allowedMimeType.denied,
                                                      Allowed: allowedMimeType.allowed,
                                                    }
                                         }
                                       ],
                               Warnings: [],
                               Count: 0,
                               Data: []
                             };

                  }

                }
                else {

                  result = {
                             StatusCode: 400, //Bad request
                             Code: "ERROR_NOT_VALID_STORAGE_KIND_DEFINED",
                             Message: await I18NManager.translate( strLanguage, "The StorageKind parameter cannot be empty or null. Only 0 or 1 are valid values." ),
                             Mark: "7FBB0F51D723" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                             LogId: null,
                             IsError: true,
                             Errors: [
                                       {
                                         Code: "ERROR_NOT_VALID_STORAGE_KIND_DEFINED",
                                         Message: await I18NManager.translate( strLanguage, "The StorageKind parameter cannot be empty or null. Only 0 or 1 are valid values." ),
                                         Details: {
                                                    0: "Persistent",
                                                    1: "Temporal",
                                                  }
                                       }
                                     ],
                             Warnings: [],
                             Count: 0,
                             Data: []
                           };

                }

              }
              else {

                result = {
                          StatusCode: 400, //Bad request
                          Code: "ERROR_NOT_VALID_ACCESS_KIND_DEFINED",
                          Message: await I18NManager.translate( strLanguage, "The AccessKind parameter cannot be empty or null. Only 1 or 2 or 3 are valid values." ),
                          Mark: "63D318D61799" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                          LogId: null,
                          IsError: true,
                          Errors: [
                                    {
                                      Code: "ERROR_NOT_VALID_ACCESS_KIND_DEFINED",
                                      Message: await I18NManager.translate( strLanguage, "The AccessKind parameter cannot be empty or null. Only 1 or 2 or 3 are valid values." ),
                                      Details: {
                                                 1: "Public",
                                                 2: "Authenticated",
                                                 3: "Role"
                                               }
                                    }
                                  ],
                          Warnings: [],
                          Count: 0,
                          Data: []
                        };

              }

            }
            else {

              result = {
                        StatusCode: 400, //Bad request
                        Code: "ERROR_NOT_VALID_CATEGORY_NAME",
                        Message: await I18NManager.translate( strLanguage, "The Category parameter is not valid." ),
                        Mark: "1E13DBCFF853" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                        LogId: null,
                        IsError: true,
                        Errors: [
                                  {
                                    Code: "ERROR_NOT_VALID_CATEGORY_NAME",
                                    Message: await I18NManager.translate( strLanguage, "The Category parameter is not valid." ),
                                    Details: {
                                               Category: strCategory,
                                               Denied: allowedCategory.denied,
                                               Allowed: allowedCategory.allowed,
                                             }
                                  }
                                ],
                        Warnings: [],
                        Count: 0,
                        Data: []
                      };

            }

          }
          else {

            result = {
                       StatusCode: 400, //Bad request
                       Code: "ERROR_NOT_VALID_CATEGORY_DEFINED",
                       Message: await I18NManager.translate( strLanguage, "The Category parameter cannot be empty, null or contains especial chars. Only A-Z a-z , - are valid." ),
                       Mark: "FDA7E437172D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: "ERROR_NOT_VALID_CATEGORY_DEFINED",
                                   Message: await I18NManager.translate( strLanguage, "The Category parameter cannot be empty, null or contains especial chars. Only A-Z a-z , - are valid." ),
                                   Details: {
                                              Valid: [ "A-Z", "a-z", "0-9", "_", "-" ],
                                            }
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }

        }
        else {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: "ERROR_CANNOT_UDPATE_BINARY_DATA",
                     Message: await I18NManager.translate( strLanguage, "Not allowed to update the binary data" ),
                     Mark: "05947E763583" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_UDPATE_BINARY_DATA",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to update the binary data" ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_BINARY_DATA_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                   Mark: "1FCC26425B32" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_BINARY_DATA_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.updateBinaryData.name;

      const strMark = "60373DE8CB8E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async bulkBinaryDataOperation( strBulkOperation: string,
                                        request: Request,
                                        transaction: any,
                                        logger: any ): Promise<any> {

    let result: any = {
                        data:[],
                        errors:[],
                        warnings: []
                      };

    let strLanguage = null;

    try {

      const context = ( request as any ).context;

      strLanguage = context.Language;

      const bulkData = request.body.bulk;

      const userSessionStatus = context.UserSessionStatus;

      for ( let intIndex= 0; intIndex < bulkData.length; intIndex++ ) {

        const bulkUserData = bulkData[ intIndex ];

        try {

          let sysBinaryIndexInDB = await SYSBinaryIndexService.getById( bulkUserData.Id,
                                                                        null,
                                                                        transaction,
                                                                        logger );

          if ( !sysBinaryIndexInDB ) {

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   Code: "ERROR_BINARY_DATA_NOT_FOUND",
                                   Mark: "CA9D0E3BB1FE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: "The binary data not found in database.",
                                   Details: null,
                                 }
                               );

          }
          else if ( sysBinaryIndexInDB instanceof Error ) {

            const error = sysBinaryIndexInDB as any;

            result.errors.push (
                                 {
                                   Id: bulkUserData.Id,
                                   Code: error.name,
                                   Mark: "D7CB3D1C049C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               );

          }
          else {

            //ANCHOR Check is owner of BinaryData
            const bIsOwner = await BinaryServiceController.checkIsOwner(
                                                                        sysBinaryIndexInDB.Owner,
                                                                        userSessionStatus.UserId,
                                                                        userSessionStatus.UserName,
                                                                        userSessionStatus.UserGroupId,
                                                                        userSessionStatus.UserGroupName,
                                                                        logger
                                                                      );

            let checkUserRoles: ICheckUserRoles = {
                                                    isAuthorizedAdmin: false,
                                                    isAuthorizedL03: false,
                                                    isAuthorizedL02: false,
                                                    isAuthorizedL01: false,
                                                    isNotAuthorized: false
                                                  };

            let ownerList = null;

            if ( bIsOwner === false ) {

              ownerList = BinaryServiceController.getUserOwner( sysBinaryIndexInDB.Owner, logger );

              for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

                const sysUserInDB = await SYSUserService.getBy( ownerList[ intOnwerIndex ],
                                                                null,
                                                                transaction,
                                                                logger );

                checkUserRoles = BinaryServiceController.checkUserRoleLevel( userSessionStatus,
                                                                             sysUserInDB,
                                                                             strBulkOperation === "deleteBinaryData" ? "DeleteBinaryData": "Update_Binary",
                                                                             logger );

                if ( checkUserRoles.isAuthorizedAdmin ||
                     checkUserRoles.isAuthorizedL02 ) {

                  break;

                }

              }

              if ( checkUserRoles.isAuthorizedAdmin === false &&
                   checkUserRoles.isAuthorizedL02 === false ) {

                ownerList = BinaryServiceController.getUserGroupOwner( sysBinaryIndexInDB.Owner, logger );

                for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

                  const sysUserGroupInDB = await SYSUserGroupService.getBy( ownerList[ intOnwerIndex ],
                                                                            null,
                                                                            transaction,
                                                                            logger );

                  checkUserRoles = BinaryServiceController.checkUserGroupRoleLevel( userSessionStatus,
                                                                                    sysUserGroupInDB,
                                                                                    strBulkOperation === "deleteBinary" ? "Delete_Binary": "Update_Binary",
                                                                                    logger );

                  if ( checkUserRoles.isAuthorizedL01 ||
                      checkUserRoles.isAuthorizedL03 ) {

                    break;

                  }

                }

              }

            }

            if ( !bIsOwner &&
                 !checkUserRoles.isAuthorizedAdmin &&
                 !checkUserRoles.isAuthorizedL03 &&
                 !checkUserRoles.isAuthorizedL02 &&
                 !checkUserRoles.isAuthorizedL01 ) {

              if ( strBulkOperation === "deleteBinary" ) {

                result.errors.push(
                                    {
                                      Id: sysBinaryIndexInDB.Id,
                                      Code: "ERROR_CANNOT_DELETE_BINARY_DATA",
                                      Mark: "FE62746C4B68" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, "Not allowed to delete the binary data" ),
                                      Details: null
                                    }
                                  );

              }
              else {

                result.errors.push(
                                    {
                                      Id: sysBinaryIndexInDB.Id,
                                      Code: "ERROR_CANNOT_UDPATE_BINARY_DATA",
                                      Mark: "1C70E75F0D28" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Message: await I18NManager.translate( strLanguage, "Not allowed to update the binary data" ),
                                      Details: null
                                    }
                                  );

              }

            }
            else if ( strBulkOperation === "deleteBinary" ) {

              const deleteResult = await SYSBinaryIndexService.deleteByModel( sysBinaryIndexInDB,
                                                                              transaction,
                                                                              logger );

              if ( deleteResult instanceof Error ) {

                const error = deleteResult as Error;

                result.errors.push(
                                    {
                                      Id: sysBinaryIndexInDB.Id,
                                      Code: "ERROR_UNEXPECTED",
                                      Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                      Mark: "18851D6A2F26" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: await SystemUtilities.processErrorDetails( error ) //error
                                    }
                                  );


              }
              else if ( deleteResult === true ) {

                result.data.push(
                                  {
                                    Id: sysBinaryIndexInDB.Id,
                                    Code: "SUCCESS_BINARY_DATA_DELETE",
                                    Message: await I18NManager.translate( strLanguage, "Success binary data with id %s deleted.", sysBinaryIndexInDB.Id ),
                                    Mark: "1EE09075BE43" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: null
                                  }
                                );

              }
              else {

                result.errors.push(
                                    {
                                      Id: sysBinaryIndexInDB.Id,
                                      Code: "ERROR_BINARY_DATA_DELETE",
                                      Message: await I18NManager.translate( strLanguage, "Error in binary data delete." ),
                                      Mark: "8E5B5D6B1FE4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: "Method deleteByModel return false"
                                    }
                                  );

              }

            }
            else {

              sysBinaryIndexInDB.UpdatedBy = userSessionStatus.UserName;
              sysBinaryIndexInDB.UpdatedAt = null;

              if ( strBulkOperation === "disableBinary" ) {

                sysBinaryIndexInDB.DisabledBy = "1@" + userSessionStatus.UserName;

              }
              else if ( strBulkOperation === "enableBinary" ) {

                sysBinaryIndexInDB.DisabledBy = "0";

              }

              sysBinaryIndexInDB = await SYSBinaryIndexService.createOrUpdate( sysBinaryIndexInDB.Id,
                                                                               ( sysBinaryIndexInDB as any ).dataValues,
                                                                               true,
                                                                               transaction,
                                                                               logger );

              if ( sysBinaryIndexInDB instanceof Error ) {

                const error = sysBinaryIndexInDB as any;

                result.errors.push(
                                    {
                                      Id: sysBinaryIndexInDB.Id,
                                      Code: "ERROR_UNEXPECTED",
                                      Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                                      Mark: "E1FF18F8269C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                      Details: await SystemUtilities.processErrorDetails( error ) //error
                                    }
                                  );

              }
              else {

                result.data.push(
                                  {
                                    Id: sysBinaryIndexInDB.Id,
                                    Code: "SUCCESS_BINARY_DATA_UPDATE",
                                    Message: await I18NManager.translate( strLanguage, "Success binary data update." ),
                                    Mark: "5BF69F0B73CE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                                    Details: {
                                               DisabledBy: sysBinaryIndexInDB.DisabledBy,
                                               DisabledAt: sysBinaryIndexInDB.DisabledAt
                                             }
                                  }
                                );

              }

            }

          }

        }
        catch ( error ) {

          result.data.push(
                            {
                              Id: bulkUserData.Id,
                              ShortId: bulkUserData.ShortId,
                              Name: bulkUserData.Name,
                              Code: "ERROR_UNEXPECTED",
                              Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                              Mark: "348D1629BE0B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                              Details: await SystemUtilities.processErrorDetails( error ) //error
                            }
                          );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.bulkBinaryDataOperation.name;

      const strMark = "D2FE308E9041" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result.errors.push(
                          {
                            Code: "ERROR_UNEXPECTED",
                            Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                            Mark: strMark,
                            Details: await SystemUtilities.processErrorDetails( error ) //error
                          }
                        );

    }

    return result;

  }

  static async disableBulkBinaryData( request: Request,
                                      transaction: any,
                                      logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const bulkResult = await this.bulkBinaryDataOperation( "disableBinary",
                                                             request,
                                                             currentTransaction,
                                                             logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_BINARY_DATA_DISABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success disable ALL binary data" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_BINARY_DATA_DIABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot disable the binary data. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL binary data has been disabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "CBEFF0A51342" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

      bApplyTransaction = true;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.disableBulkBinaryData.name;

      const strMark = "12E562ACC8F8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async enableBulkBinaryData( request: Request,
                                     transaction: any,
                                     logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const bulkResult = await this.bulkBinaryDataOperation( "enableBinary",
                                                             request,
                                                             currentTransaction,
                                                             logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_BINARY_DATA_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Success enable ALL binary data" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_BINARY_DATA_ENABLE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot enable the binary data. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL binary data has been enabled. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "DB9BB148AE82" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

      bApplyTransaction = true;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.enableBulkBinaryData.name;

      const strMark = "F8E2AADC8FF8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async deleteBinaryData( request: Request,
                                 transaction: any,
                                 logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      let userSessionStatus = context.UserSessionStatus;

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const sysBinaryIndexInDB = await SYSBinaryIndexService.getById( request.query.id as string,
                                                                      null,
                                                                      currentTransaction,
                                                                      logger );

      if ( sysBinaryIndexInDB instanceof Error ) {

        const error = sysBinaryIndexInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "8516092C5844" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: error.name,
                               Message: error.message,
                               Details: await SystemUtilities.processErrorDetails( error ) //error
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }
      else if ( sysBinaryIndexInDB ) {

        //ANCHOR Check is owner of BinaryData
        const bIsOwner = await BinaryServiceController.checkIsOwner(
                                                                     sysBinaryIndexInDB.Owner,
                                                                     userSessionStatus.UserId,
                                                                     userSessionStatus.UserName,
                                                                     userSessionStatus.UserGroupId,
                                                                     userSessionStatus.UserGroupName,
                                                                     logger
                                                                   );

        let checkUserRoles: ICheckUserRoles = {
                                                isAuthorizedAdmin: false,
                                                isAuthorizedL03: false,
                                                isAuthorizedL02: false,
                                                isAuthorizedL01: false,
                                                isNotAuthorized: false
                                              };

        let ownerList = null;

        if ( bIsOwner === false ) {

          ownerList = BinaryServiceController.getUserOwner( sysBinaryIndexInDB.Owner, logger );

          for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

            const sysUserInDB = await SYSUserService.getBy( ownerList[ intOnwerIndex ],
                                                            null,
                                                            currentTransaction,
                                                            logger );

            checkUserRoles = BinaryServiceController.checkUserRoleLevel( userSessionStatus,
                                                                         sysUserInDB,
                                                                         "Delete_Binary",
                                                                         logger );

            if ( checkUserRoles.isAuthorizedAdmin ||
                 checkUserRoles.isAuthorizedL02 ) {

              break;

            }

          }

          if ( checkUserRoles.isAuthorizedAdmin === false &&
               checkUserRoles.isAuthorizedL02 === false ) {

            ownerList = BinaryServiceController.getUserGroupOwner( sysBinaryIndexInDB.Owner, logger );

            for ( let intOnwerIndex = 0; intOnwerIndex < ownerList.length; intOnwerIndex++ ) {

              const sysUserGroupInDB = await SYSUserGroupService.getBy( ownerList[ intOnwerIndex ],
                                                                        null,
                                                                        currentTransaction,
                                                                        logger );

              checkUserRoles = BinaryServiceController.checkUserGroupRoleLevel( userSessionStatus,
                                                                                sysUserGroupInDB,
                                                                                "Delete_Binary",
                                                                                logger );

              if ( checkUserRoles.isAuthorizedL01 ||
                   checkUserRoles.isAuthorizedL03 ) {

                break;

              }

            }

          }

        }

        if ( bIsOwner ||
             checkUserRoles.isAuthorizedAdmin ||
             checkUserRoles.isAuthorizedL03 ||
             checkUserRoles.isAuthorizedL02 ||
             checkUserRoles.isAuthorizedL01 ) {

          if ( userSessionStatus.Role &&
               ( userSessionStatus.Role.includes( "#Administrator#" ) ||
                 userSessionStatus.Role.includes( "#BManager_L99#" ) ||
                 userSessionStatus.Role.includes( "#DeleteBinaryL99#" ) ||
                 userSessionStatus.Role.includes( "#DeleteBinaryFile#" ) ) ) {

            const strBasePath = await BinaryServiceController.getConfigBinaryDataBasePath( currentTransaction,
                                                                                           logger );

            let strFullPath = "";

            if ( strBasePath.startsWith( "full://" ) ) {

              strFullPath = strBasePath.replace( "full://", "" );

            }
            else {

              strFullPath = path.join( SystemUtilities.strBaseRootPath,
                                       strBasePath );

            }

            await SystemUtilities.deleteFilesPrefixedBy( strFullPath + sysBinaryIndexInDB.FilePath,
                                                         sysBinaryIndexInDB.Id,
                                                         logger );

          }

          const deleteResult = await SYSBinaryIndexService.deleteByModel( sysBinaryIndexInDB,
                                                                          currentTransaction,
                                                                          logger );

          if ( deleteResult instanceof Error ) {

            const error = deleteResult as any;

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_UNEXPECTED",
                       Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                       Mark: "429D44B24E88" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: true,
                       Errors: [
                                 {
                                   Code: error.name,
                                   Message: error.message,
                                   Details: await SystemUtilities.processErrorDetails( error ) //error
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     };

          }
          else if ( deleteResult === true ) {

            const payload = {
                              SystemId: SystemUtilities.getSystemId(),
                              SystemName: process.env.APP_SERVER_DATA_NAME,
                              SubSystem: "BinaryService",
                              Token: context.UserSessionStatus.Token,
                              UserId: context.UserSessionStatus.UserId,
                              UserName: context.UserSessionStatus.UserName,
                              UserGroupId: context.UserSessionStatus.UserGroupId,
                              Code: "SUCCESS_BINARY_DATA_DELETE",
                              EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                              Data: {
                                      Id: sysBinaryIndexInDB.Id,
                                      FilePath: sysBinaryIndexInDB.FilePath,
                                      FileName: sysBinaryIndexInDB.FileName,
                                      Hash: sysBinaryIndexInDB.Hash
                                    }
                            };

            HookManager.processHookHandlersInChain( "SystemEvent",
                                                    payload,
                                                    logger );

            /*
            NotificationManager.publishOnTopic( "SystemEvent",
                                                {
                                                  SystemId: SystemUtilities.getSystemId(),
                                                  SystemName: process.env.APP_SERVER_DATA_NAME,
                                                  SubSystem: "BinaryService",
                                                  Token: context.UserSessionStatus.Token,
                                                  UserId: context.UserSessionStatus.UserId,
                                                  UserName: context.UserSessionStatus.UserName,
                                                  UserGroupId: context.UserSessionStatus.UserGroupId,
                                                  Code: "SUCCESS_BINARY_DATA_DELETE",
                                                  EventAt: SystemUtilities.getCurrentDateAndTime().format(),
                                                  Data: {
                                                          Id: sysBinaryIndexInDB.Id,
                                                          FilePath: sysBinaryIndexInDB.FilePath,
                                                          FileName: sysBinaryIndexInDB.FileName,
                                                          Hash: sysBinaryIndexInDB.Hash
                                                        }
                                                },
                                                logger );
            */

            result = {
                       StatusCode: 200, //Ok
                       Code: "SUCCESS_BINARY_DATA_DELETE",
                       Message: await I18NManager.translate( strLanguage, "Success binary data with id %s deleted.", sysBinaryIndexInDB.Id ),
                       Mark: "BDA125C61987" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

            bApplyTransaction = true;

          }
          else {

            result = {
                       StatusCode: 500, //Internal server error
                       Code: "ERROR_BINARY_DATA_DELETE",
                       Message: await I18NManager.translate( strLanguage, "Error in binary data delete." ),
                       Mark: "CDAC887D1CB4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                       LogId: null,
                       IsError: false,
                       Errors: [
                                 {
                                   Code: "ERROR_METHOD_DELETE_RETURN_FALSE",
                                   Message: "Method deleteByModel return false",
                                   Details: null
                                 }
                               ],
                       Warnings: [],
                       Count: 0,
                       Data: []
                     }

          }

        }
        else {

          result = {
                     StatusCode: 403, //Forbidden
                     Code: "ERROR_CANNOT_DELETE_BINARY_DATA",
                     Message: await I18NManager.translate( strLanguage, "Not allowed to delete the binary data" ),
                     Mark: "BE576C66151B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_CANNOT_DELETE_BINARY_DATA",
                                 Message: await I18NManager.translate( strLanguage, "Not allowed to delete the binary data" ),
                                 Details: null,
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   };

        }

      }
      else {

        result = {
                   StatusCode: 404, //Not found
                   Code: "ERROR_BINARY_DATA_NOT_FOUND",
                   Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                   Mark: "6AE6292D2DCD" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_BINARY_DATA_NOT_FOUND",
                               Message: await I18NManager.translate( strLanguage, "The binary data not found in database." ),
                               Details: null,
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteBinaryData.name;

      const strMark = "AB5BE4A80EF8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

  static async deleteBulkBinaryData( request: Request,
                                     transaction: any,
                                     logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "master" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const bulkResult = await this.bulkBinaryDataOperation( "deleteBinary",
                                                             request,
                                                             currentTransaction,
                                                             logger );

      let intStatusCode = -1;
      let strCode = "";
      let strMessage = "";
      let bIsError = false;

      if ( bulkResult.errors.length === 0 ) {

        intStatusCode = 200
        strCode = "SUCCESS_BULK_BINARY_DATA_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Success delete ALL binary data" );

      }
      else if ( bulkResult.errors.length === request.body.bulk.length ) {

        intStatusCode = 400
        strCode = "ERROR_BULK_BINARY_DATA_DELETE";
        strMessage = await I18NManager.translate( strLanguage, "Cannot delete the binary data. Please check the errors and warnings section" );
        bIsError = true;

      }
      else {

        intStatusCode = 202
        strCode = "CHECK_DATA_AND_ERRORS_AND_WARNINGS";
        strMessage = await I18NManager.translate( strLanguage, "Not ALL binary data has been deleted. Please check the data and errors and warnings section" );
        bIsError = bulkResult.errors && bulkResult.errors.length > 0;

      }

      result = {
                 StatusCode: intStatusCode,
                 Code: strCode,
                 Message: strMessage,
                 Mark: "3D4D0F25EAB5" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: bIsError,
                 Errors: bulkResult.errors,
                 Warnings: bulkResult.warnings,
                 Count: request.body.bulk.length - bulkResult.errors.length,
                 Data: bulkResult.data
               };

      bApplyTransaction = true;

      if ( currentTransaction !== null &&
           currentTransaction.finished !== "rollback" &&
           bIsLocalTransaction ) {

        if ( bApplyTransaction ) {

          await currentTransaction.commit();

        }
        else {

          await currentTransaction.rollback();

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.enableBulkBinaryData.name;

      const strMark = "7032FDAF4C3B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      result = {
                 StatusCode: 500, //Internal server error
                 Code: "ERROR_UNEXPECTED",
                 Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                 Mark: strMark,
                 LogId: error.logId,
                 IsError: true,
                 Errors: [
                           {
                             Code: error.name,
                             Message: error.message,
                             Details: await SystemUtilities.processErrorDetails( error ) //error
                           }
                         ],
                 Warnings: [],
                 Count: 0,
                 Data: []
               };

      if ( currentTransaction !== null &&
           bIsLocalTransaction ) {

        try {

          await currentTransaction.rollback();

        }
        catch ( error ) {


        }

      }

    }

    return result;

  }

}
