
import cluster from "cluster";
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

import path from "path";
import fs from "fs"; //Load the filesystem module

import {
  Request,
  Response
} from "express";
//import { OriginalSequelize } from "sequelize"; //Original sequelize
//import uuidv4 from "uuid/v4";
//import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,

//import SystemConstants from "../../../02_system/common/SystemContants";
import CommonConstants from "../../../02_system/common/CommonConstants";

import SystemUtilities from "../../../02_system/common/SystemUtilities";
import CommonUtilities from "../../../02_system/common/CommonUtilities";

import DBConnectionManager from "../../../02_system/common/managers/DBConnectionManager";
import BaseService from "../../../02_system/common/database/master/services/BaseService";
import I18NManager from "../../../02_system/common/managers/I18Manager";
import JobQueueManager from "../../../02_system/common/managers/JobQueueManager";
import BIZDriverStatusService from "../../common/database/master/services/BIZDriverStatusService";
import { BIZDriverStatus } from "../../common/database/master/models/BIZDriverStatus";

const debug = require( "debug" )( "Dev007DriverServicesController" );

export default class Dev007DriverServicesController extends BaseService {

  //Common business services

  static async setWorkStart( request: Request,
                             response: Response,
                             transaction: any,
                             logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "primary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      let userSessionStatus = context.UserSessionStatus;

      let bizDriverStatusInDB = await BIZDriverStatusService.createOrUpdate(
                                                                             {

                                                                               Id: userSessionStatus.sysUser.Id,
                                                                               Status: 1, //Working

                                                                             },
                                                                             true,
                                                                             currentTransaction,
                                                                             logger
                                                                           );

      if ( bizDriverStatusInDB &&
           bizDriverStatusInDB instanceof Error === false ) {

        let modelData = ( bizDriverStatusInDB as any ).dataValues;

        const tempModelData = await BIZDriverStatus.convertFieldValues(
                                                                        {
                                                                          Data: modelData,
                                                                          FilterFields: 1, //Force to remove fields like password and value
                                                                          TimeZoneId: context.TimeZoneId, //request.header( "timezoneid" ),
                                                                          Include: null,
                                                                          Logger: logger,
                                                                          ExtraInfo: {
                                                                                        Request: request
                                                                                      }
                                                                        }
                                                                      );

        if ( tempModelData ) {

          modelData = tempModelData;

        }

        //ANCHOR success user update
        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_DRIVER_START_WORK",
                   Message: await I18NManager.translate( strLanguage, "Success driver start to work." ),
                   Mark: "DF04A92ABA0D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           modelData
                         ]
                 }

        bApplyTransaction = true;

      }
      else {

        const error = bizDriverStatusInDB as any;

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_UNEXPECTED",
                   Message: await I18NManager.translate( strLanguage, "Unexpected error. Please read the server log for more details." ),
                   Mark: "B7175642027E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

      sourcePosition.method = this.name + "." + this.setWorkStart.name;

      const strMark = "59BE59B1DE0F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "8A8748A321B4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async setWorkStop( request: Request,
                            response: Response,
                            transaction: any,
                            logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "primary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //

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

      sourcePosition.method = this.name + "." + this.setWorkStop.name;

      const strMark = "02996FAB8AE8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "CE5D91BDE2A3" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async setPosition( request: Request,
                            response: Response,
                            transaction: any,
                            logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "primary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //

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

      sourcePosition.method = this.name + "." + this.setPosition.name;

      const strMark = "18E4A8B23AC6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "E12BF6DB6F34" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async getPosition( request: Request,
                            response: Response,
                            transaction: any,
                            logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "primary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      //

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

      sourcePosition.method = this.name + "." + this.getPosition.name;

      const strMark = "344AC034143A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "78CA84E654B1" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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


  /*
  static async startOrderTipUberUpdateJob( request: Request,
                                           response: Response,
                                           logger: any ):Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      if ( await JobQueueManager.addJobToQueue( "OrderTipUberUpdateJob",
                                                {
                                                  Id: request.body.Id,
                                                  EstablishmentId: request.body.EstablishmentId,
                                                  Date: request.body.Date,
                                                  Path: request.body.Path,
                                                  Language: strLanguage,
                                                  JobStartedBy: context.UserSessionStatus.UserName
                                                },
                                                {
                                                  jobId: request.body.Id
                                                }, //{ jobId: SystemUtilities.getUUIDv4(), attempts: 0, timeout: 99999999, removeOnComplete: true, removeOnFail: true, backoff: 0 }, //{ repeat: { cron: "* * * * *" } },
                                                logger ) ) {

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_JOB_CREATION",
                   Message: await I18NManager.translate( strLanguage, "Sucess job creation for order tip uber update" ),
                   Mark: "F307A51174EC" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           {
                             Id: request.body.Id
                           }
                         ]
                 };

      }
      else {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_CANNOT_CREATE_THE_JOB",
                   Message: await I18NManager.translate( strLanguage, "Cannot create the job" ),
                   LogId: null,
                   Mark: "C9C15674A81D",
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_CREATE_THE_JOB",
                               Message: await I18NManager.translate( strLanguage, "Cannot create the job" ),
                               Details: "JobQueueManager.addJobToQueue returned false"
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.startOrderTipUberUpdateJob.name;

      const strMark = "4E8745E32647" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: strMark,
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

    return result;

  }

  static async getJobStatus( request: Request,
                             response: Response,
                             logger: any ):Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      if ( request.query.Id ) {

        const strOutputJobPath = path.join( SystemUtilities.strBaseRootPath, "jobs/output/" + request.query.Id + "/" );

        let strOutputJobFile = "";

        const strKind = request.query.Kind;

        if ( strKind === "output" ) {

          strOutputJobFile = strOutputJobPath + request.query.Id + ".output";

        }
        else if ( strKind === "details" ) {

          strOutputJobFile = strOutputJobPath + request.query.Id + ".output.details";

        }
        else {

          strOutputJobFile = strOutputJobPath + request.query.Id + ".status";

        }

        if ( fs.existsSync( strOutputJobFile ) ) {

          let outputContent = fs.readFileSync( strOutputJobFile, "utf8" ) as any;

          const debugMark = debug.extend( "6BD49AF2E6BE" );

          //debugMark( "Result: [%s]", outputContent );

          if ( strKind === "output"  ) {

            outputContent = outputContent.split( "\n" );

          }
          else if ( strKind === "details" ) {

            outputContent = outputContent.substring( 0, outputContent.length - 2 );

            outputContent = "[" + outputContent + "]";

            let jsonDetailsJob = CommonUtilities.parseJSON( outputContent, logger );

            outputContent = jsonDetailsJob;

          }
          else {

            let jsonStatusJob = CommonUtilities.parseJSON( outputContent, logger );

            if ( !jsonStatusJob ||
                Object.keys( jsonStatusJob ).length === 0 ) {

              jsonStatusJob = {
                                Progress: 0,
                                Total: -1,
                                Kind: "",
                                Status: ""
                              };

            }

            outputContent = jsonStatusJob;

          }

          result = {
                     StatusCode: 200, //Ok
                     Code: "SUCCESS_GET_JOB_OUTPUT",
                     Message: await I18NManager.translate( strLanguage, "Sucess get job output" ),
                     Mark: "F9C63B69C3FF" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: outputContent.length >= 0 ? outputContent: [ outputContent ]
                   };

        }
        else {

          result = {
                     StatusCode: 404, //Bad request
                     Code: "ERROR_JOB_ID_NOT_FOUND",
                     Message: await I18NManager.translate( strLanguage, "The job with id not found" ),
                     Mark: "555DD8D4C4B8" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: "ERROR_JOB_ID_NOT_FOUND",
                                 Message: await I18NManager.translate( strLanguage, "The job with id not found" ),
                                 Details: null
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
                   Code: "ERROR_FIELD_ID_MISSING",
                   Message: await I18NManager.translate( strLanguage, "The field id is missing" ),
                   Mark: "5AA705EE0690" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_FIELD_ID_MISSING",
                               Message: await I18NManager.translate( strLanguage, "The field is is missing" ),
                               Details: null
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getJobStatus.name;

      const strMark = "67236D6C9E05" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: strMark,
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

    return result;

  }

  static async getDriverList( request: Request,
                              response: Response,
                              transaction: any,
                              logger: any ):Promise<any> {

    let result = null;

    let currentTransaction = transaction;

    let bIsLocalTransaction = false;

    let bApplyTransaction = false;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by MiddlewareManager.middlewareSetContext function

      strLanguage = context.Language;

      const dbConnection = DBConnectionManager.getDBConnection( "secondary" );

      if ( currentTransaction === null ) {

        currentTransaction = await dbConnection.transaction();

        bIsLocalTransaction = true;

      }

      const strSQL = DBConnectionManager.getStatement( "secondary",
                                                       "getDrivers",
                                                       null,
                                                       context.logger );

      const rows = await dbConnection.query( strSQL, {
                                                       raw: true,
                                                       type: QueryTypes.SELECT,
                                                       transaction: currentTransaction
                                                     } );

      result = {
                 StatusCode: 200, //Ok
                 Code: "SUCCESS_GET_DRIVER_LIST",
                 Message: await I18NManager.translate( strLanguage, "Sucess get the information" ),
                 Mark: "47BB5F21C2B6" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                 LogId: null,
                 IsError: false,
                 Errors: [],
                 Warnings: [],
                 Count: rows ? rows.length: 0,
                 Data: rows ? rows: []
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

      sourcePosition.method = this.name + "." + this.getDriverList.name;

      const strMark = "CAF3637ADCE4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: "3799619EDB99" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
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

  static async startBulkOrderCreateJob( request: Request,
                                        response: Response,
                                        logger: any ):Promise<any> {

    let result = null;

    let strLanguage = "";

    try {

      const context = ( request as any ).context; //context is injected by the midleware MiddlewareManager.middlewareSetContext

      strLanguage = context.Language;

      if ( await JobQueueManager.addJobToQueue( "BulkOrderCreateJob",
                                                {
                                                  Simulate: request.body.Simulate,
                                                  Id: request.body.Id,
                                                  EstablishmentId: request.body.EstablishmentId,
                                                  DriverId: request.body.DriverId,
                                                  CreatedAt: request.body.CreatedAt,
                                                  FileName: request.body.FileName,
                                                  Path: request.body.Path,
                                                  Language: strLanguage,
                                                  CheckAddressAndCustomer: request.body.CheckAddressAndCustomer,
                                                  Backend: request.body.Backend,
                                                  JobStartedBy: context.UserSessionStatus.UserName
                                                },
                                                {
                                                  jobId: SystemUtilities.getUUIDv4(), //request.body.Id
                                                }, //{ jobId: SystemUtilities.getUUIDv4(), attempts: 0, timeout: 99999999, removeOnComplete: true, removeOnFail: true, backoff: 0 }, //{ repeat: { cron: "* * * * *" } },
                                                logger ) ) {

        result = {
                   StatusCode: 200, //Ok
                   Code: "SUCCESS_JOB_CREATION",
                   Message: await I18NManager.translate( strLanguage, "Sucess job creation for bulk order create" ),
                   Mark: "F13258318914" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                   LogId: null,
                   IsError: false,
                   Errors: [],
                   Warnings: [],
                   Count: 1,
                   Data: [
                           {
                             Id: request.body.Id
                           }
                         ]
                 };

      }
      else {

        result = {
                   StatusCode: 500, //Internal server error
                   Code: "ERROR_CANNOT_CREATE_THE_JOB",
                   Message: await I18NManager.translate( strLanguage, "Cannot create the job" ),
                   LogId: null,
                   Mark: "C69FBC40C312",
                   IsError: true,
                   Errors: [
                             {
                               Code: "ERROR_CANNOT_CREATE_THE_JOB",
                               Message: await I18NManager.translate( strLanguage, "Cannot create the job" ),
                               Details: "JobQueueManager.addJobToQueue returned false"
                             }
                           ],
                   Warnings: [],
                   Count: 0,
                   Data: []
                 };

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.startBulkOrderCreateJob.name;

      const strMark = "28A7E540D0E4" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
                 LogId: error.LogId,
                 Mark: strMark,
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

    return result;

  }
  */

}
