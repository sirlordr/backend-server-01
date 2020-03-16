//import os from "os";
import cluster from "cluster";

import Discover from '@dashersw/node-discover';
//import uuidv4 from 'uuid/v4';

import CommonConstants from "../CommonConstants";

import CommonUtilities from "../CommonUtilities";
import SystemUtilities from "../SystemUtilities";

const debug = require( 'debug' )( 'NetworkLeaderManager' );

export default class NetworkLeaderManager {

  static currentInstance: any = null;

  static async create( logger: any ): Promise<any> {

    let result = null;

    try {

      let debugMark = debug.extend( "AA21700D550C" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ) );

      await new Promise<any>( function( resolve, reject ) {

        result = new Discover();

        let bResolvePending = true;

        result.on( "promotion", function () {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          SystemUtilities.isNetworkLeader = true;
          SystemUtilities.isNetworkLeaderAt = dateTime;
          process.env.IS_NETWORK_LEADER = "1";

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "I was promoted to network leader." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "I was promoted to network leader." );

          bResolvePending ? resolve() : null;
          bResolvePending = false;

        });

        result.on( "demotion", function () {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          SystemUtilities.isNetworkLeader = false;
          SystemUtilities.isNetworkLeaderAt = dateTime;
          process.env.IS_NETWORK_LEADER = "1";

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "I was demoted from being a network leader." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "I was demoted from being a network leader." );

          bResolvePending ? resolve() : null;
          bResolvePending = false;

        });

        result.on( "added", function ( obj: any ) {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "A new node has been added." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "A new network node instance has been added. %O", obj );

          //bResolvePending ? resolve() : null;
          //bResolvePending = false;

        });

        result.on( "removed", function ( obj: any ) {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "A node has been removed." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "%s: A network node instance has been removed. %O", obj );

          //bResolvePending ? resolve() : null;
          //bResolvePending = false;

        });

        result.on( "master", function ( obj: any ) {

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          if ( logger &&
               typeof logger.info === "function" ) {

            logger.info( "A new network leader is in control." );

          }

          debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
          debugMark( "A new network leader is in control. %O", obj );

          bResolvePending ? resolve() : null;
          bResolvePending = false;

        });

      });

      if ( result ) {

        await new Promise<any>( function( resolve, reject ) {

          let bResolvePending = true;

          let bSuccessJoinNetworkLeader = false;

          bSuccessJoinNetworkLeader = result.join( "networkLeader", function ( data: any ) {

            const dateTime = SystemUtilities.getCurrentDateAndTime();

            debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Channel networkLeader received command %s", data.command );

            if ( data.command === "getCurrentInfo" ) {

              if ( SystemUtilities.isNetworkLeader ) {

                debugMark( "Sending network leader current info %O", SystemUtilities.info );

                result.send( "networkLeader", {
                                                command: "currentInfo",
                                                info: SystemUtilities.info
                                              } );

              }

            }
            else if ( data.command === "currentInfo" &&
                      data.info ) {

              debugMark( "Network leader info received %O", data.info );
              debugMark( "Current info %O", SystemUtilities.info );

              if ( SystemUtilities.isDateAndTimeBeforeAt( data.info.release, SystemUtilities.info.release ) ) {

                result.promote();

                //Wait for 5 seconds to promoted
                setTimeout(
                            () => {
                                    bResolvePending ? resolve(): null;
                                    bResolvePending = false;
                                  },
                            5000
                          );

              }
              else {

                bResolvePending ? resolve() : null;
                bResolvePending = false;

              }

            }
            else {

              bResolvePending ? resolve() : null;
              bResolvePending = false;

            }

          });

          const dateTime = SystemUtilities.getCurrentDateAndTime();

          if ( bSuccessJoinNetworkLeader ) {

            debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Success to join to networkLeader channel." );

            if ( SystemUtilities.isNetworkLeader === false ) {

              result.send( "networkLeader", { command: "getCurrentInfo" } );

              //Wait for 7 seconds to promoted
              setTimeout(
                          () => {
                                  bResolvePending ? resolve(): null;
                                  bResolvePending = false;
                                },
                          7000
                        );

            }
            else {

              bResolvePending ? resolve(): null;
              bResolvePending = false;

            }

          }
          else {

            debugMark( "%s", dateTime.format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
            debugMark( "Failed to join to networkLeader channel." );

            bResolvePending ? resolve(): null;
            bResolvePending = false;

          }

        });

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "02B23FBC8D15" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

}