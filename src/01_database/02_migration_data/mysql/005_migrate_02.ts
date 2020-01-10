//import uuidv4 from 'uuid/v4';
//import moment from 'moment-timezone';
//import os from 'os';
import CommonUtilities from '../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../02_system/common/SystemUtilities';
import CommonConstants from '../../../02_system/common/CommonConstants';
//import Hashes from 'jshashes';

const debug = require( 'debug' )( '005_migrate_02' );

//Example file migrate files using code
export default class Migrate {

  static async migrateUp( dbConnection: any, logger: any ): Promise<any> {

    let bSuccess = false;
    let bEmptyContent = true;

    try {

      /*
      const strId = SystemUtilities.getUUIDv4();

      const strShortId = SystemUtilities.hashString( strId, 2, null );

      const strValues = "'" + strId + "','" + strShortId + "','Group01','#Administrator#','Group test created with migration','backend@system.net','" + moment().format() + "'";

      const strSQL = `Insert Into \`UserGroup\`( Id, ShortId, Name, Role, Comment, CreatedBy, CreatedAt ) Values( ${strValues} )`;

      await dbConnection.execute( strSQL );

      bSuccess = true;
      bEmptyContent = false;
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.migrateUp.name;

      const strMark = "6C9E8CDB8358";

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

    return { bSuccess, bEmptyContent };

  }

}