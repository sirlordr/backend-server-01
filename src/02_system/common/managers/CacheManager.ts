import CommonUtilities from "../CommonUtilities";
import Redlock from "redlock";
//import uuidv4 from 'uuid/v4';
import SystemUtilities from "../SystemUtilities";
import CommonConstants from "../CommonConstants";

const debug = require( 'debug' )( 'CacheManager' );

export default class CacheManager {

  static currentInstance: any = null;

  static async create( logger: any ): Promise<any> {

    let redisClient = null;

    try {

      redisClient = await require( "ioredis" ).createClient( { port: process.env.REDIS_SERVER_PORT,
                                                               host: process.env.REDIS_SERVER_IP,
                                                               password: process.env.REDIS_SERVER_PASSWORD } );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.create.name;

      const strMark = "39FEEE47CC45";

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

    return redisClient;

  }

  static async lockResource( redisClient: any = CacheManager.currentInstance,
                             strResourceName: string,
                             intTTL: number,
                             intRetryCount: number = 12,
                             intRetryDelay: number = 5 * 1000,
                             logger: any ): Promise<any> {

    let result: any = null;

    try {

      const redlock = new Redlock(
        // you should have one client for each independent redis node
        // or cluster
        [ redisClient ],
        {
            // the expected clock drift; for more details
            // see http://redis.io/topics/distlock
            driftFactor: 0.01, // time in ms

            // the max number of times Redlock will attempt
            // to lock a resource before erroring
            retryCount:  intRetryCount, //12

            // the time in ms between attempts
            retryDelay:  intRetryDelay, //1000 * 5, // time in ms

            // the max time in ms randomly added to retries
            // to improve performance under high contention
            // see https://www.awsarchitectureblog.com/2015/03/backoff.html
            retryJitter:  2000  // time in ms
        }

      );

      result = await redlock.lock( strResourceName, intTTL ); //Try for 1 minute

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.lockResource.name;

      const strMark = "FDDE29A4E794";

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

  static async unlockResource( redLock: any,
                               logger: any ): Promise<boolean> {

    let bResult : boolean;

    try {

      await redLock.unlock();

      let debugMark = debug.extend( "DAD04DE7C94F" );

      debugMark( "%s", SystemUtilities.getCurrentDateAndTime().format( CommonConstants._DATE_TIME_LONG_FORMAT_01 ) );
      debugMark( `Success unlock the redis resource` );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.unlockResource.name;

      const strMark = "95A71EC38900";

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

  static async setData( strKeyName: String,
                        keyData: any,
                        logger: any ) {

    try {

      await CacheManager.currentInstance.set( strKeyName,
                                              keyData );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.setData.name;

      const strMark = "9CEDB846E59A";

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

  static async setDataWithTTL( strKeyName: String,
                               keyData: any,
                               intTTL: number,
                               logger: any ) {

    try {

      await CacheManager.currentInstance.set( strKeyName,
                                              keyData,
                                              "EX",
                                              intTTL );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.setDataWithTTL.name;

      const strMark = "5771EB786591";

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

  static async getData( strKeyName: String,
                        logger: any ):Promise<any> {

    let result = null;

    try {

      result = await CacheManager.currentInstance.get( strKeyName );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getData.name;

      const strMark = "A60AFEB4BD531";

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

  static async deleteData( strKeyName: String,
                           logger: any ):Promise<any> {

    let result = null;

    try {

      result = await CacheManager.currentInstance.del( strKeyName );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.getData.name;

      const strMark = "69489A614583";

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