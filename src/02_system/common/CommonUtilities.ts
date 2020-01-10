import { AccessKind, HTTPMethod } from "./CommonConstants";
import path from 'path';

const debug = require( 'debug' )( 'CommonUtilities' );

export default class CommonUtilities {

  static isNotNullOrEmpty( value: any ): boolean {

    let bResult: boolean = false;

    if ( value !== null &&
         value !== undefined &&
         ( ( ( typeof value ) !== "string" || value.trim() !== "" ) &&
           ( Array.isArray( value ) === false || value.length > 0 ) &&
           ( ( typeof value ) !== "object" || Object.keys( value ).length > 0 ) ) ) {

      bResult = true;

    }

    return bResult;

  }

  static isNullOrEmpty( value: any ): boolean {

    let bResult: boolean = false;

    if ( value === null ||
         value === undefined ||
         ( ( ( typeof value ) === "string" && value.trim() === "" ) ||
           ( Array.isArray( value ) && value.length == 0 ) ||
           ( ( typeof value ) === "object" && Object.keys( value ).length === 0 ) ) ) {

      bResult = true;

    }

    return bResult;

  }

  static getAccessKindFromString( strAccessKind: string ): AccessKind {

    let result: AccessKind;

    strAccessKind = strAccessKind.toLocaleLowerCase();

    if ( strAccessKind === "public" ) {

      result = AccessKind.Public;

    }
    else if ( strAccessKind === "authenticated" ) {

      result = AccessKind.Public;

    }
    else if ( strAccessKind === "role" ) {

      result = AccessKind.Public;

    }

    return result;

  }

  static getAccessKind( intAccessKind: number ): String {

    let strResult: string;

    if ( intAccessKind === 1 ) {

      strResult = "Public";

    }
    else if ( intAccessKind === 2 ) {

      strResult = "Authenticated";

    }
    else if ( intAccessKind === 3 ) {

      strResult = "Role";

    }

    return strResult;

  }

  static getHTTPMethodFromString( strHTTPMethod: string ): HTTPMethod {

    let result: HTTPMethod;

    strHTTPMethod = strHTTPMethod.toLocaleLowerCase();

    if ( strHTTPMethod === "get" ) {

      result = HTTPMethod.Get;

    }
    else if ( strHTTPMethod === "post" ) {

      result = HTTPMethod.Post;

    }
    else if ( strHTTPMethod === "put" ) {

      result = HTTPMethod.Put;

    }
    else if ( strHTTPMethod === "delete" ) {

      result = HTTPMethod.Delete;

    }

    return result;

  }
  static getRequestKindFromHTTPMethodString( strHTTPMethod: string ): number {

    let result: number;

    strHTTPMethod = strHTTPMethod.toLocaleLowerCase();

    if ( strHTTPMethod === "get" ) {

      result = 1;

    }
    else if ( strHTTPMethod === "post" ) {

      result = 2;

    }
    else if ( strHTTPMethod === "put" ) {

      result = 3;

    }
    else if ( strHTTPMethod === "delete" ) {

      result = 4;

    }

    return result;

  }

  static getHTTPMethodStringFromRequestKind( intRequestKind: number ): string {

    let strResult: string;

    if ( intRequestKind === 1 ) {

      strResult = "Get";

    }
    else if ( intRequestKind === 2 ) {

      strResult = "Post";

    }
    else if ( intRequestKind === 3 ) {

      strResult = "Put";

    }
    else if ( intRequestKind === 4 ) {

      strResult = "Delete";

    }

    return strResult;

  }

  static getActionStringFromRequestKind( intRequestKind: number ): string {

    let strResult: string;

    if ( intRequestKind === 1 ) {

      strResult = "Get";

    }
    else if ( intRequestKind === 2 ) {

      strResult = "Create";

    }
    else if ( intRequestKind === 3 ) {

      strResult = "Update";

    }
    else if ( intRequestKind === 4 ) {

      strResult = "Delete";

    }

    return strResult;

  }

  static getStringFromHttpMethod( httpMethod: HTTPMethod ): string {

    let strResult: string;

    if ( httpMethod === HTTPMethod.Get ) {

      strResult = "get";

    }
    else if ( httpMethod === HTTPMethod.Post ) {

      strResult = "post";

    }
    else if ( httpMethod === HTTPMethod.Put ) {

      strResult = "put";

    }
    else if ( httpMethod === HTTPMethod.Delete ) {

      strResult = "delete";

    }

    return strResult;

  }

  static isValidTimeZone( tz: any ) {

    let bResult = false;

    try {

      if ( !Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone ) {

        throw 'Time zones are not available in this environment';

      }

      if ( tz ) {

        Intl.DateTimeFormat( undefined, { timeZone:  tz } ).format( new Date() );
        //let debugMark = debug.extend( '39AE8190588D' );
        //debugMark( "Valid!!" );
        bResult = true;

      }

    }
    catch ( ex ) {

      //let debugMark = debug.extend( 'BDA1708B1AAE' );
      //debugMark( "Invalid!!" );
      //return false;

    }

    return bResult;

  }

  static getCurrentTimeZoneId(): string {

    let strResult = "";

    if ( CommonUtilities.isNotNullOrEmpty( process.env.TZ ) &&
         CommonUtilities.isValidTimeZone( process.env.TZ ) ) {

      strResult = process.env.TZ;

    }
    else {

      strResult = Intl && Intl.DateTimeFormat().resolvedOptions().timeZone;

    }

    return strResult;

  }

  static getCurrentLanguage(): string {

    let strResult = "";

    if ( CommonUtilities.isNotNullOrEmpty( process.env.LANG ) ) {

      strResult = process.env.LANG;

    }
    else {

      strResult = "en_US"; //English of USA

    }

    return strResult;

  }

  static async asyncForEach( array: [],
                             callback: any ) {

    for ( let index = 0; index < array.length; index++ ) {

      await callback( array[ index ], index, array );

    }

  }

  static checkObjectWithFunctionDefined( objectToTest: any,
                                         functionName: string ): boolean {

    let bResult = false;

    if ( this.isNotNullOrEmpty( objectToTest ) &&
         typeof objectToTest[ functionName ] == 'function' ) {

      bResult = true;

    }

    return bResult;

  }

  static getSourceCodePosition( intFormat: number = 0 ): any {

    /*
    Error:
      at Function.getSourceCodePosition (/home/dsistemas/Escritorio/Node_JS/26-10-2019/backend-server-01/src/system/common/common.utilities.ts:190:21)
      at /home/dsistemas/Escritorio/Node_JS/26-10-2019/backend-server-01/src/server.ts:76:34
      at Generator.next (<anonymous>)
      at fulfilled (/home/dsistemas/Escritorio/Node_JS/26-10-2019/backend-server-01/src/server.ts:5:58)
    */
    let result = null;

    //let strMethodName = "";
    let strFile = "";
    let strFunctionName: string = null;
    let intLine = -1;
    let intColumn = -1;

    try {

      const stack = new Error().stack;

      //let debugMark = debug.extend( 'B4FC6014F2E3' );
      //debugMark( "%O", stack );

      // package.json => build: --async-stack-trace node build/server.js And tsconfig.json => "target": "es2018"
      const strPosition = stack.split( "\n" )[ 2 ].split( ":" );

      strFile = strPosition[ 0 ].trim();

      if ( strFile.indexOf( "(" ) !== -1 ) {

        strFunctionName = strFile.substr( 0, strFile.indexOf( "(" ) - 1 );

        if ( strFunctionName.startsWith( "at" ) ) {

          strFunctionName = strFunctionName.replace( "at", "" ).trim();

        }

        strFile = strFile.substr( strFile.indexOf( "(" ) + 1 );

      }
      else {

        strFunctionName = strFile.substr( 0, strFile.indexOf( "at" ) - 1 );
        strFile = strFile.substr( strFile.indexOf( "at " ) + 3 ).trim();

      }

      if ( strPosition.length >= 1 ) {

        intLine = parseInt( strPosition[ 1 ] );

      }

      if ( strPosition.length >= 2 ) {

        intColumn = parseInt( strPosition[ 2 ] );

      }

    }
    catch ( error ) {

      const strMark = "F0FCDAA2D175";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );

    }

    if ( intFormat == 0 ) {

      const strFuncName = strFunctionName ? strFunctionName + ":" : "";

      result = `${strFile}:${strFuncName}${intLine}:${intColumn}`;

    }
    else {

      result = {
                 file: strFile,
                 line: intLine,
                 column: intColumn,
                 function: strFunctionName ? strFunctionName: "Unknown"
               };

    }

    return result;

  }

  static deleteObjectFields( dataObject: any, fieldNamesToRemove: string[], logger: any ): any {

    let result = dataObject;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( dataObject ) ) {

        result = Object.assign( {}, dataObject );

        fieldNamesToRemove.map( ( strFieldName: string, intIndex: number ) => {

          delete result[ strFieldName ];

        } );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.deleteObjectFields.name;

      const strMark = "1DFC6EF03869";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static parseJSON( strJSONToParse: string, logger: any ): any {

    let result = {}; //Safe empty object

    try {

      result = JSON.parse( strJSONToParse );

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseJSON.name;

      const strMark = "D72A94FD3E4B";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4();

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static parseArray( strListToParse: string = "", logger: any ): any {

    let result = []; //Safe empty array

    try {

      result = strListToParse !== null ? strListToParse.split( "," ) : [];

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseArray.name;

      const strMark = "76DCD9E795FB";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return result;

  }

  static isInMultiSimpleList( strList1: string,
                              strDivisor: string,
                              strList2: string,
                              bSensibleCase: boolean,
                              logger: any ): boolean {

    let bResult = false;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( strList1 ) &&
           CommonUtilities.isNotNullOrEmpty( strList2 ) ) {

        const strLocalList1 = bSensibleCase == false ? strList1.toLowerCase() : strList1;

        const list2 = bSensibleCase == false ? strList2.toLowerCase().split( strDivisor ) : strList2.split( strDivisor );

        for ( let strItem of list2 ) {

          if ( strLocalList1.includes( strItem ) ) {

            bResult = true;
            break;

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.isInMultiSimpleList.name;

      const strMark = "94B310399AF5";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return bResult;

  }
  static isInList( list1: string[],
                   list2: string[],
                   logger: any ): boolean {

    let bResult = false;

    try {

      if ( CommonUtilities.isNotNullOrEmpty( list1 ) &&
           CommonUtilities.isNotNullOrEmpty( list2 ) ) {

        for ( let strItem of list1 ) {

          if ( list2.includes( strItem ) ) {

            bResult = true;
            break;

          }

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.isInList.name;

      const strMark = "4AB0242741A9";

      const debugMark = debug.extend( strMark );

      debugMark( "Error message: [%s]", error.message ? error.message : "No error message available" );
      debugMark( "Catched on: %O", sourcePosition );

      error.mark = strMark;
      //error.logId = SystemUtilities.getUUIDv4(); //Circular reference not allowed and not like import the uuid library dependence

      if ( logger && typeof logger.error === "function" ) {

        error.catchedOn = sourcePosition;
        logger.error( error );

      }

    }

    return bResult;

  }

  static clearSpecialChars( data: string, strSpecialChars = `!@#$^&%*()+=-[]\/\\{}|:<>?,."'_` ):string {

    let result = data;

    for ( let i = 0; i < strSpecialChars.length; i++ ) {

      result = result.replace( new RegExp( "\\" + strSpecialChars[ i ], "gi" ), "" );

    }

    return result;

  }

  static unaccent( src: string ): string {

    let s: string = src; //"À,Á,Â,Ä,È,É,Ê,Ë,Ì,Í,Î,Ï,Ò,Ó,Ô,Ö,Ù,Ú,Û,Ü,à,á,â,ä,è,é,ê,ë,ì,í,î,ï,ò,ó,ô,ö,ù,ú,û,ü";

    s = s.replace( new RegExp( "[àáâä]", "g" ), "a" );
    s = s.replace( new RegExp( "[èéêë]", "g" ), "e" );
    s = s.replace( new RegExp( "[ìíîï]", "g" ), "i" );
    s = s.replace( new RegExp( "[òóôö]", "g" ), "o" );
    s = s.replace( new RegExp( "[ùúûü]", "g" ), "u" );

    s = s.replace( new RegExp( "[ÀÁÂÄ]", "g" ), "A" );
    s = s.replace( new RegExp( "[ÈÉÊË]", "g" ), "E" );
    s = s.replace( new RegExp( "[ÌÍÎÏ]", "g" ), "I" );
    s = s.replace( new RegExp( "[ÒÓÔÖ]", "g" ), "O" );
    s = s.replace( new RegExp( "[ÙÚÛÜ]", "g" ), "U" );

    return s;

  }

  static getFileExtension( strFileName: string ): string {

    return path.extname( strFileName );

  }

}