import fetch from 'node-fetch';
import cluster from "cluster";

import CommonConstants from "../../CommonConstants";

import CommonUtilities from "../../CommonUtilities";
import SystemUtilities from "../../SystemUtilities";

const debug = require( 'debug' )( 'GeoMapGoogle' );

export default class GeoMapGoogle {

  static async geocodeServiceUsingAddress( serviceOptions: any,
                                           addressList:string[],
                                           bParseGeocodeResponse: boolean,
                                           logger: any ): Promise<any> {

    let result = [];

    try {

      //const toList = CommonUtilities.trimArray( strAddress.split( "," ) );

      for ( const strAddress of addressList ) {

        const options = {
                          method: 'GET',
                        };

        const strURL = serviceOptions.host + "?language=en&address=" + encodeURI( strAddress ) + "&key=" + serviceOptions.auth.api_key;

        const geocodeResult = await fetch( strURL,
                                           options );

        const jsonResult = await geocodeResult.json();

        if ( bParseGeocodeResponse ) {

          result.push( ( await GeoMapGoogle.parseGeocodeResponse( [ jsonResult ], logger ) )[ 0 ] );

        }
        else {

          result.push( jsonResult );

        }

        if ( process.env.ENV === "dev" ) {

          let debugMark = debug.extend( '2C8909BB4B8F' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
          debugMark( geocodeResult );

        }

      }

      //result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.geocodeServiceUsingAddress.name;

      const strMark = "0469A568C80F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async geocodeServiceUsingLatAndLng( serviceOptions: any,
                                             pointList: [
                                                          {
                                                            latitude: string,
                                                            longitude: string
                                                          }
                                                        ],
                                             bParseGeocodeResponse: boolean,
                                             logger: any ): Promise<any> {

    let result = [];

    try {

      for ( const point of pointList ) {

        const options = {
                          method: 'GET',
                        };

        const geocodeResult = await fetch( serviceOptions.host + "?language=en&latlng=" + point.latitude + "," + point.longitude + "&key=" + serviceOptions.auth.api_key,
                                           options );


        if ( bParseGeocodeResponse ) {

          result.push( ( await GeoMapGoogle.parseGeocodeResponse( [ await geocodeResult.json() ], logger ) )[ 0 ] );

        }
        else {

          result.push( await geocodeResult.json() );

        }

        if ( process.env.ENV === "dev" ) {

          let debugMark = debug.extend( '2C8909BB4B8F' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
          debugMark( result );

        }

      }

      //result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.geocodeServiceUsingAddress.name;

      const strMark = "0469A568C80F" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public static async parseGeocodeResponse( geocodeDataList: any[],
                                            logger: any ): Promise<any[]> {

    let result = [];

    try {

      for ( let intIndex = 0; intIndex < geocodeDataList.length; intIndex++ ) {

        let geocodeData = geocodeDataList[ intIndex ];

        if ( geocodeData.results ) {

          geocodeData = geocodeData.results[ 0 ];

        }

        let data = null;

        if ( geocodeData.formatted_address ) {

          data = {};

          data.formattedAddress = geocodeData.formatted_address;

          data.formattedAddressParts = data.formattedAddress.split( "," );

        }

        if ( geocodeData.address_components ) {

          if ( !data ) {

            data = {};

          }

          for ( const addressComponent of geocodeData.address_components ) {

            if ( addressComponent.types ) {

              for ( const addressComponentType of addressComponent.types ) {

                if ( addressComponentType === "country" ) {

                  data.country = addressComponent.long_name;
                  data.countryShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "administrative_area_level_1" ) {

                  data.state = addressComponent.long_name;
                  data.stateShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "administrative_area_level_2" ) {

                  data.county = addressComponent.long_name;
                  data.countyShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "locality" ) {

                  data.locality = addressComponent.long_name;
                  data.localityShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "postal_code" ) {

                  data.postalCode = addressComponent.long_name;

                }
                else if ( addressComponentType === "postal_code_suffix" ) {

                  data.postalCodeSuffix = addressComponent.long_name;

                }

              }

            }

          }


        }

        if ( geocodeData.geometry &&
             geocodeData.geometry.location ) {

          if ( !data ) {

            data = {};

          }

          data.latitude = geocodeData.geometry.location.lat;
          data.longitude = geocodeData.geometry.location.lng;

        }

        if ( data ) {

          result.push( data );

        }

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseGeocodeResponse.name;

      const strMark = "241A9F30F67D" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async calcDistanceAndTimeUsingLatAndLng( serviceOptions: any,
                                                  strUnits: string, //Imperial, Metrics
                                                  originPoint: {
                                                                 latitude: string,
                                                                 longitude: string
                                                               }, //{ latitude: "1", longitude: "1" }
                                                  destinationPointList: [
                                                                          {
                                                                            latitude: string,
                                                                            longitude: string
                                                                          }
                                                                        ],
                                                  bParseDistanceResponse: boolean,
                                                  logger: any ): Promise<any> {

    let result = [];

    try {

      const options = {
                        method: 'GET',
                      };

      const strOrigins = originPoint.latitude.replace( ",", "." ) + "," + originPoint.longitude.replace( ",", "." );

      let strDestinations = "";

      for ( const point of destinationPointList ) {

        const strToLatitude = point.latitude ? point.latitude: "";
        const strToLongitude = point.longitude ? point.longitude: "";

        if ( strToLatitude &&
             strToLongitude ) {

          if ( strDestinations ) {

            strDestinations = strDestinations + "|" + strToLatitude.replace( ",", "." ) + "," + strToLongitude.replace( ",", "." );

          }
          else {

            strDestinations = strToLatitude.replace( ",", "." ) + "," + strToLongitude.replace( ",", "." );

          }

        }

      }

      const distanceResult = await fetch( serviceOptions.host +
                                          "?language=en" +
                                          "&units=" + strUnits +
                                          "&origins=" + strOrigins +
                                          "&destinations=" + strDestinations +
                                          "&key=" + serviceOptions.auth.api_key,
                                          options );


      if ( bParseDistanceResponse ) {

        result = await GeoMapGoogle.parseDistanceAndTimeResponse( await distanceResult.json(), logger );

      }
      else {

        result = await distanceResult.json();

      }

      if ( process.env.ENV === "dev" ) {

        let debugMark = debug.extend( '8A40E9E8219B' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
        debugMark( result );

      }

      //result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.calcDistanceAndTimeUsingLatAndLng.name;

      const strMark = "CB472510356B" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  static async calcDistanceAndTimeUsingAddress( serviceOptions: any,
                                                strUnits: string, //Imperial, Metrics
                                                strOriginAddress: string,
                                                destinationAddressList: string[],
                                                bParseDistanceResponse: boolean,
                                                logger: any ): Promise<any> {

    let result = [];

    try {

      const options = {
                        method: 'GET',
                      };

      let strDestinations = "";

      for ( const strDestinationAddress of destinationAddressList ) {

        if ( strDestinations ) {

          strDestinations = strDestinations + "|" + strDestinationAddress;

        }
        else {

          strDestinations = strDestinationAddress;

        }

      }

      const distanceResult = await fetch( serviceOptions.host +
                                          "?language=en" +
                                          "&units=" + strUnits +
                                          "&origins=" + strOriginAddress +
                                          "&destinations=" + strDestinations +
                                          "&key=" + serviceOptions.auth.api_key,
                                          options );


      if ( bParseDistanceResponse ) {

        result = await GeoMapGoogle.parseDistanceAndTimeResponse( await distanceResult.json(), logger );

      }
      else {

        result = await distanceResult.json();

      }

      if ( process.env.ENV === "dev" ) {

        let debugMark = debug.extend( 'A894827D6E4A' + ( cluster.worker && cluster.worker.id ? '-' + cluster.worker.id : '' ) );
        debugMark( result );

      }

      //result = true;

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.calcDistanceAndTimeUsingAddress.name;

      const strMark = "1F3F39F27847" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  public static async parseDistanceAndTimeResponse( distanceDataList: any,
                                                    logger: any ): Promise<any[]> {

    let result = [];

    try {

      for ( let intOriginIndex = 0; intOriginIndex < distanceDataList.origin_addresses.length; intOriginIndex++ ) {

        const strOrigin = distanceDataList.origin_addresses[ intOriginIndex ];

        for ( let intDestinationIndex = 0; intDestinationIndex < distanceDataList.destination_addresses.length; intDestinationIndex++ ) {

          const strDestination = distanceDataList.destination_addresses[ intDestinationIndex ];

          const distanceAndTimeInfo = distanceDataList.rows[ intOriginIndex ].elements[ intDestinationIndex ];

          if ( distanceAndTimeInfo.status === "OK" ) {

            const routeInfo = {
                                origin: strOrigin,
                                destination: strDestination,
                                ...distanceAndTimeInfo
                              }

            result.push( routeInfo );

          }
          else {

            const routeInfo = {
                                origin: "",
                                destination: "",
                                distance: {
                                            text: "",
                                            value: -1
                                          },
                                time: {
                                        text: "",
                                        value: -1
                                      },
                                status: distanceAndTimeInfo.status
                              }

            result.push( routeInfo );

          }

        }

      }

      /*
      for ( let intIndex = 0; intIndex < distanceDataList.length; intIndex++ ) {

        let geocodeData = distanceDataList[ intIndex ];

        if ( geocodeData.results ) {

          geocodeData = geocodeData.results[ 0 ];

        }

        let data = null;

        if ( geocodeData.formatted_address ) {

          data = {};

          data.formattedAddress = geocodeData.formatted_address;

          data.formattedAddressParts = data.formattedAddress.split( "," );

        }

        if ( geocodeData.address_components ) {

          if ( !data ) {

            data = {};

          }

          for ( const addressComponent of geocodeData.address_components ) {

            if ( addressComponent.types ) {

              for ( const addressComponentType of addressComponent.types ) {

                if ( addressComponentType === "country" ) {

                  data.country = addressComponent.long_name;
                  data.countryShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "administrative_area_level_1" ) {

                  data.state = addressComponent.long_name;
                  data.stateShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "administrative_area_level_2" ) {

                  data.county = addressComponent.long_name;
                  data.countyShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "locality" ) {

                  data.locality = addressComponent.long_name;
                  data.localityShort = addressComponent.short_name;

                }
                else if ( addressComponentType === "postal_code" ) {

                  data.postalCode = addressComponent.long_name;

                }
                else if ( addressComponentType === "postal_code_suffix" ) {

                  data.postalCodeSuffix = addressComponent.long_name;

                }

              }

            }

          }


        }

        if ( geocodeData.geometry &&
             geocodeData.geometry.location ) {

          if ( !data ) {

            data = {};

          }

          data.latitude = geocodeData.geometry.location.lat;
          data.longitude = geocodeData.geometry.location.lng;

        }

        if ( data ) {

          result.push( data );

        }

      }
      */

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = this.name + "." + this.parseDistanceAndTimeResponse.name;

      const strMark = "0457633EB007" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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
    public static Map<String,Object> getGeocodeData( final JSONObject jsonGeocodeData,
                                                     final ILoggerExtended localLogger,
                                                     final ILanguage localLanguage ) {


       final Map<String,Object> result = new LinkedHashMap<>();

       try {

           result.put( "formattedAddress", "" );
           result.put( "country", "" );
           result.put( "countryShort", "" );
           result.put( "state", "" );
           result.put( "stateShort", "" );
           result.put( "county", "" );
           result.put( "countyShort", "" );
           result.put( "locality", "" );
           result.put( "localityShort", "" );
           result.put( "postalCode", "" );
           result.put( "postalCodeSuffix", "" );
           result.put( "latitude", new Double( 0.0 ) );
           result.put( "longitude", new Double( 0.0 ) );

           final JSONObject jsonResults = jsonGeocodeData != null ? jsonGeocodeData.getJSONArray( "results" ).getJSONObject( 0 ) : new JSONObject();

           if ( jsonResults.has( "address_components" ) &&
                jsonResults.get( "address_components" ) instanceof JSONArray ) {

               result.put( "formattedAddress", jsonResults.has( "formatted_address" ) ? jsonResults.getString( "formatted_address" ) : "" );

               final JSONArray googleAddressComponents = jsonResults.getJSONArray( "address_components" );

               for ( int intIndex = 0; intIndex < googleAddressComponents.length(); intIndex++ ) {

                   final JSONObject jsonGoogleAddressComponent = googleAddressComponents.getJSONObject( intIndex );

                   if ( jsonGoogleAddressComponent.has( "types" ) &&
                        jsonGoogleAddressComponent.get( "types" ) instanceof JSONArray  ) {

                       final JSONArray jsonGoogleAddressComponentTypes = jsonGoogleAddressComponent.getJSONArray( "types" );

                       for ( int intIndexType = 0; intIndexType < jsonGoogleAddressComponentTypes.length(); intIndexType++ ) {

                           final String strType = jsonGoogleAddressComponentTypes.getString( intIndexType );

                           if ( strType.equalsIgnoreCase( "country" ) ) {

                               result.put( "country", jsonGoogleAddressComponent.get( "long_name" ) );
                               result.put( "countryShort", jsonGoogleAddressComponent.get( "short_name" ) );

                           }
                           else if ( strType.equalsIgnoreCase( "administrative_area_level_1" ) ) {

                               result.put( "state", jsonGoogleAddressComponent.get( "long_name" ) );
                               result.put( "stateShort", jsonGoogleAddressComponent.get( "short_name" ) );

                           }
                           else if ( strType.equalsIgnoreCase( "administrative_area_level_2" ) ) {

                               result.put( "county", jsonGoogleAddressComponent.get( "long_name" ) );
                               result.put( "countyShort", jsonGoogleAddressComponent.get( "short_name" ) );

                           }
                           else if ( strType.equalsIgnoreCase( "locality" ) ) {

                               result.put( "locality", jsonGoogleAddressComponent.get( "long_name" ) );
                               result.put( "localityShort", jsonGoogleAddressComponent.get( "short_name" ) );

                           }
                           else if ( strType.equalsIgnoreCase( "postal_code" ) ) {

                               result.put( "postalCode", jsonGoogleAddressComponent.get( "long_name" ) );

                           }
                           else if ( strType.equalsIgnoreCase( "postal_code_suffix" ) ) {

                               result.put( "postalCodeSuffix", jsonGoogleAddressComponent.get( "long_name" ) );

                           }

                       }

                   }

               }

               if ( jsonResults.has( "geometry" ) &&
                    jsonResults.get( "geometry" ) instanceof JSONObject) {

                   final JSONObject jsonGeometry = jsonResults.getJSONObject( "geometry" );

                   if ( jsonGeometry.has( "location" ) &&
                        jsonGeometry.get( "location" ) instanceof JSONObject ) {

                       final JSONObject jsonLocation = jsonGeometry.getJSONObject( "location" );

                       result.put( "latitude", jsonLocation.getDouble( "lat" ) );
                       result.put( "longitude", jsonLocation.getDouble( "lng" ) );

                   }

               }

           }

       }
       catch ( final Exception ex ) {

           if ( localLogger != null ) {

               localLogger.logException( "-1021" ,
                                         ex.getMessage(),
                                         ex );

           }

       }

       return result;

    }
    */

}
