import fs from "fs";
//import { promises as fsPromises } from "fs";
//import os from "os";
import path from "path";
//import appRoot from "app-root-path";
import cluster from "cluster";

import CommonConstants from "../CommonConstants";

import SystemUtilities from "../SystemUtilities";
import CommonUtilities from "../CommonUtilities";

const debug = require( "debug" )( "ApplicationServerTaskManager" );

export default class ApplicationServerTaskManager {

  private static _taskList: {};

  static async _scan( directory: any,
                      params: any,
                      logger: any ): Promise<any> {

    try {

      const files = fs.readdirSync( directory )
                      .filter( file => fs.lstatSync( path.join( directory, file ) ).isFile() )
                      .filter( file => file.indexOf( "." ) !== 0 && ( file.slice( -3 ) === ".js" || file.slice( -3 ) === ".ts" ) );

      const dirs = fs.readdirSync( directory )
                     .filter( file => fs.lstatSync( path.join( directory, file ) ).isDirectory() );

      for ( const file of files ) {

        if ( path.join( directory, file ) !== __filename ) {

          const importModule = await import( path.join( directory, file ) );

          if ( CommonUtilities.isNotNullOrEmpty( importModule ) &&
               CommonUtilities.isNotNullOrEmpty( importModule.default ) ) {

            const task = new importModule.default();

            if ( task.Name ) {

              if ( await task.init( params, logger ) ) {

                const debugMark = debug.extend( "7C251F624690" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

                if ( cluster.isMaster ) {

                  debugMark( "Added task with name: %s, in master process", task.Name );

                }
                else {

                  debugMark( "Added task with name: %s, in worker process with id: %s", task.Name, cluster.worker.id );

                }

                this._taskList[ task.Name ] = task;

              }

            }

          }

        }

      }

      for ( const dir of dirs ) {

        if ( dir !== "template" &&
             dir !== "disabled" &&
             dir.startsWith( "disabled_" ) === false  ) {

          await this._scan( path.join( directory, dir ),
                            params,
                            logger );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this._scan.name;

      const strMark = "0AEF93E1CFBE" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  }

  static async runTasks( params: any,
                         logger: any ): Promise<void> {

    try {

      const debugMark = debug.extend( "B67A7EEF31A1" );

      const runTasksCallback = async function () {

        debugMark( "Running tasks..." );

        const taskNameList = Object.keys( ApplicationServerTaskManager._taskList );

        for ( let intTaskIndex = 0; intTaskIndex < taskNameList.length; intTaskIndex++ ) {

          const task = ApplicationServerTaskManager._taskList[ taskNameList[ intTaskIndex ] ];

          if ( task ) {

            try {

              if ( !task.canRunTask ||
                   await task.canRunTask( params, logger ) ) {

                debugMark( "Init of run task %s", task.Name );

                await task.runTask( params, logger );

                debugMark( "Finish of run task %s", task.Name );

              }


            }
            catch ( error ) {

              const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

              sourcePosition.method = ApplicationServerTaskManager.name + "." + ApplicationServerTaskManager.runTasks.name;

              const strMark = "633CA1A8F43E" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

              const debugMark = debug.extend( strMark );

              debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
              debugMark( "Error time: [%s]", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
              debugMark( "Catched on: %O", sourcePosition );

              error.mark = strMark;
              error.logId = SystemUtilities.getUUIDv4();

              if ( logger &&
                  typeof logger.error === "function" ) {

                error.catchedOn = sourcePosition;
                logger.error( error );

              }

            }

          }

        }

        const initNextLoop = SystemUtilities.getRandomIntegerRangeFromString( process.env.TASK_REPEAT_INTERVAL || "random:8000:15000" );

        debugMark( "Next tasks running in %s seconds", initNextLoop / 1000 );

        setTimeout( runTasksCallback,
                    initNextLoop );

      }

      const initDelay = SystemUtilities.getRandomIntegerRangeFromString( process.env.TASK_INIT_DELAY || "random:2000:5000" );

      debugMark( "First tasks running in %s seconds", initDelay / 1000 );

      setTimeout( runTasksCallback, initDelay );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "C2578A1C15D7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  }

  static async create( params: any,
                       logger: any ): Promise<void> {

    try {

      this._taskList = {};

      const pathToScan : any[] = JSON.parse( process.env.TASKS_PATH_TO_SCAN );

      for ( let intIndex = 0; intIndex < pathToScan.length; intIndex++ ) {

        let strPath = SystemUtilities.strBaseRunPath + pathToScan[ intIndex ];

        try {

          if ( fs.existsSync( strPath ) ) {

            await ApplicationServerTaskManager._scan( strPath,
                                     params,
                                     logger );

          }

        }
        catch ( error ) {

          const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

          sourcePosition.method = this.name + "." + this.create.name;

          const strMark = "ED1FD4AE92A7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "C2578A1C15D7" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  }

}
