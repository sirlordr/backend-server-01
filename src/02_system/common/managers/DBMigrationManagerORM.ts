//import mysql from 'mysql2/promise';

//import Hashes from 'jshashes';
//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
import fs from 'fs';
//import minify from 'pg-minify';

import CommonUtilities from '../CommonUtilities';
import SystemUtilities from '../SystemUtilities';
import { QueryTypes } from "sequelize"; //Original sequelize //OriginalSequelize,
//import config from "../database/00_config/config.json"
import { DBMigratedData } from '../database/models/DBMigratedData';
import { DBImportedData } from '../database/models/DBImportedData';
import SystemConstants from "../SystemContants";
import CommonConstants from '../CommonConstants';

const debug = require( 'debug' )( 'DBMigrationManagerORM' );

export class DBMigrationManagerORM {

  static async checkTableExits( dbConnection: any,
                                strTableName: string,
                                logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( dbConnection ) ) {

        await dbConnection.query( "Select * From " + strTableName, {
                                                                     raw: true,
                                                                     type: QueryTypes.SELECT
                                                                   } );

        bResult = true;

      }
      else {

        let debugMark = debug.extend( '2F866EBC3283' );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `No database connection available!` );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.checkTableExits.name;

      const strMark = "ADEC7F415353";

      const debugMark = debug.extend( strMark );

      debugMark( "The table [%s] not exists!", strTableName );
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

  static async getTableContent( dbConnection: any,
                                strTableName: string,
                                logger: any ): Promise<any> {

    let result = [];

    try {

      if ( CommonUtilities.isNotNullOrEmpty( dbConnection ) ) {

        result = await dbConnection.query( "Select * From " + strTableName, {
                                                                              raw: true,
                                                                              type: QueryTypes.SELECT
                                                                            } );

      }
      else {

        let debugMark = debug.extend( '3EFDDB863595' );

        debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
        debugMark( `No database connection available!` );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getTableContent.name;

      const strMark = "77674D0CF60D";

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

  static getFileExecuted( tableContent: any,
                            strFilePath: string,
                            strFileName: string,
                            logger: any ): any {

    let result = null;

    try {

      if ( Array.isArray( tableContent ) &&
           tableContent.length > 0 ) {

        for ( let row of tableContent ) {

          if ( row[ 'FilePath' ] === strFilePath &&
               row[ 'FileName' ] === strFileName ) {

            result = row;
            break;

          }

        }

        /*
        tableContent[ 0 ].map( ( row: any, intIndex: number ) => {

          let debugMark = debug.extend( '3F31461C084F' );
          debugMark( "FilePath => ", strFilePath );
          debugMark( "FileName => ", strFileName );
          debugMark( "Row FP => ", row[ 'FilePath' ] );
          debugMark( "Row FN => ", row[ 'FileName' ] );

        })
        */

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getFileExecuted.name;

      const strMark = "7EE5480378AB";

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

  static async migrateDatabase( dbConnection: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const dbMigrationContent = await this.getTableContent( dbConnection,
                                                             "DBMigratedData",
                                                             null ); //Force silent errors

      const strRootPath = __dirname; //require( 'app-root-path' );
      const strMigrationsFolder = strRootPath + '/../../../01_database/02_migration_data/orm/';
      const path = require('path')
      const os = require( 'os' );

      const dirs = fs.readdirSync( strMigrationsFolder );

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          if ( this.getFileExecuted( dbMigrationContent,
                                     strMigrationsFolder,
                                     strFileName,
                                     logger ) === null ) {

            let bEmptyContent = true;
            let bSuccess = false;
            let strContentCheckSum = null;

            const strFileExt = path.extname( strFileName );

            if ( strFileExt === ".js" ||
                 strFileExt === ".ts" ) {

              const strOnlyFileName = strFileName.replace( strFileExt, "" );

              try {

                const migrationModule = require( strMigrationsFolder + strOnlyFileName );

                const resultCall = await migrationModule.default.migrateUp( dbConnection, logger ); //Call the migrate method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strMigrationsFolder + "/" + strFileName, 'utf8' );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.migrateDatabase.name;

                const strMark = "5F3DE434B7C2";

                const debugMark = debug.extend( strMark );

                debugMark( "Error to execute the script migration from the file [%s]!", strFileName );
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

            }

            if ( bEmptyContent === false ) { //Not take info for empty content files

              try {

                const strFullPathCheckSum = SystemUtilities.hashString( strMigrationsFolder + "/" + strFileName, 2, null ); //Hashes.CRC32( strMigrationsFolder + "/" + strFileName ).toString( 16 );

                await DBMigratedData.create( {
                                               FilePath: strMigrationsFolder,
                                               FileName: strFileName,
                                               FullPathCheckSum: strFullPathCheckSum,
                                               ContentCheckSum: strContentCheckSum,
                                               Success: ( bSuccess ? 1 : 0 ),
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                             } );
                /*
                const strValues = "'" + SystemUtilities.getUUIDv4() + "','" + os.hostname() + "','" + strMigrationsFolder + "','" + strFileName + "','" + strFullPathCheckSum + "','" + strContentCheckSum + "'," + ( bSuccess ? 1 : 0 ) + ",NULL,'backend@system.net','" + SystemUtilities.getCurrentDateAndTime().format() + "'";

                const strSQL = `Insert Into DBMigratedData( Id, SystemId, FilePath, FileName, FullPathCheckSum, ContentCheckSum, Success, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

                await dbConnection.execute( strSQL );
                */

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.migrateDatabase.name;

                const strMark = "2DD9427C1C90";

                const debugMark = debug.extend( strMark );

                debugMark( "Error to insert the executed migration data for the file %s!", strFileName );
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

            }

          }

        });

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateDatabase.name;

      const strMark = "D57A07564F39";

      const debugMark = debug.extend( strMark );

      debugMark( "Error to migrate database!" );
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

  static async importDataToDatabase( dbConnection: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const dbImportedDataContent = await this.getTableContent( dbConnection,
                                                                "DBImportedData",
                                                                logger );

      const strRootPath = __dirname; //require( 'app-root-path' );
      const strImportDataFolder = strRootPath + '/../../../01_database/03_import_data/orm/';
      const path = require('path')
      const os = require( 'os' );

      const dirs = fs.readdirSync( strImportDataFolder );

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          if ( this.getFileExecuted( dbImportedDataContent,
                                       strImportDataFolder,
                                       strFileName,
                                       logger ) === null ) {

            let bEmptyContent = true;
            let bSuccess = false;
            let strContentCheckSum = null;

            const strFileExt = path.extname( strFileName );

            if ( strFileExt === ".js" ||
                 strFileExt === ".ts" ) {

              const strOnlyFileName = strFileName.replace( strFileExt, "" );

              try {

                const importDataModule = require( strImportDataFolder + strOnlyFileName );

                const resultCall = await importDataModule.default.importUp( dbConnection, logger ); //Call the import method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strImportDataFolder + "/" + strFileName, 'utf8' );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

                const strMark = "A2FF434B0B5F";

                const debugMark = debug.extend( strMark );

                debugMark( "Error to execute the script migration from the file [%s]!", strFileName );
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

            }

            if ( bEmptyContent === false ) { //Not take info for empty content files

              try {

                const strFullPathCheckSum = strContentCheckSum = SystemUtilities.hashString( strImportDataFolder + "/" + strFileName, 2, null ); //Hashes.CRC32( strImportDataFolder + "/" + strFileName ).toString( 16 );

                await DBImportedData.create( {
                                               FilePath: strImportDataFolder,
                                               FileName: strFileName,
                                               FullPathCheckSum: strFullPathCheckSum,
                                               ContentCheckSum: strContentCheckSum,
                                               Success: ( bSuccess ? 1 : 0 ),
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                             } );

                /*
                const strValues = "'" + SystemUtilities.getUUIDv4() + "','" + os.hostname() + "','" + strImportDataFolder + "','" + strFileName + "','" + strFullPathCheckSum + "','" + strContentCheckSum + "'," + ( bSuccess ? 1 : 0 ) + ",NULL,'backend@system.net','" + SystemUtilities.getCurrentDateAndTime().format() + "'";

                const strSQL = `Insert Into DBImportedData( Id, SystemId, FilePath, FileName, FullPathCheckSum, ContentCheckSum, Success, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

                await dbConnection.execute( strSQL );
                */

              }
              catch ( error ) {

                const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

                sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

                const strMark = "1B86A993C171";

                const debugMark = debug.extend( strMark );

                debugMark( "Error to insert the imported data from the file [%s]!", strFileName );
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

            }

          }

        });

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.importDataToDatabase.name;

      const strMark = "BB9C524DB6B6";

      const debugMark = debug.extend( strMark );

      debugMark( "Error to migrate database!" );
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

  static async alwaysExecute( dbConnection: any, logger: any ): Promise<boolean> {

    let bResult = false;

    try {

      const dbImportedDataContent = await this.getTableContent( dbConnection,
                                                                "DBImportedData",
                                                                logger );

      const strRootPath = __dirname; //require( 'app-root-path' );
      const strImportDataFolder = strRootPath + '/../../../01_database/04_always_execute/orm/';
      const path = require('path')
      //const os = require( 'os' );

      const dirs = fs.readdirSync( strImportDataFolder );

      const loopAsync = async () => {

        await CommonUtilities.asyncForEach( dirs as any, async ( strFileName: string ) => {

          let bEmptyContent = true;
          let bSuccess = false;
          let strContentCheckSum = null;

          const strFileExt = path.extname( strFileName );

          const importedDataRow = this.getFileExecuted( dbImportedDataContent,
                                                        strImportDataFolder,
                                                        strFileName,
                                                        logger );

          if ( strFileExt === ".js" ||
               strFileExt === ".ts" ) {

            const strOnlyFileName = strFileName.replace( strFileExt, "" );

            try {

              const importDataModule = require( strImportDataFolder + strOnlyFileName );

              if ( CommonUtilities.isNullOrEmpty( importDataModule.default.disabled ) ||
                   importDataModule.default.disabled() === false ) {

                const resultCall = await importDataModule.default.execute( dbConnection, null, logger ); //Call the import method

                bSuccess = resultCall.bSuccess;
                bEmptyContent = resultCall.bEmptyContent;

                if ( bSuccess && bEmptyContent === false ) {

                  const strFileContent = fs.readFileSync( strImportDataFolder + "/" + strFileName, 'utf8' );

                  strContentCheckSum = SystemUtilities.hashString( strFileContent, 2, null ); //Hashes.CRC32( strFileContent ).toString( 16 );

                }

              }

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.alwaysExecute.name;

              const strMark = "C4D455C1E245";

              const debugMark = debug.extend( strMark );

              debugMark( "Error to execute the script from the file [%s]!", strFileName );
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

          }

          if ( bEmptyContent === false ) { //Not take info for empty content files

            try {

              const strFullPathCheckSum = strContentCheckSum = SystemUtilities.hashString( strImportDataFolder + "/" + strFileName, 2, null );

              if ( importedDataRow === null ) {

                await DBImportedData.create( {
                                               FilePath: strImportDataFolder,
                                               FileName: strFileName,
                                               FullPathCheckSum: strFullPathCheckSum,
                                               ContentCheckSum: strContentCheckSum,
                                               Success: ( bSuccess ? 1 : 0 ),
                                               CreatedBy: SystemConstants._CREATED_BY_BACKEND_SYSTEM_NET
                                             } );

              }
              else {

                importedDataRow.UpdatedBy = SystemConstants._UPDATED_BY_BACKEND_SYSTEM_NET;

                await DBImportedData.update( importedDataRow, { where: { Id: importedDataRow.Id } } );

              }

            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = this.name + "." + this.alwaysExecute.name;

              const strMark = "D44D194323A5";

              const debugMark = debug.extend( strMark );

              debugMark( "Error to execute the file [%s]!", strFileName );
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

          }

        });

        bResult = true;

      }

      await loopAsync();

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.alwaysExecute.name;

      const strMark = "599C839FB8B4";

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

}