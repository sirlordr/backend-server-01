import cluster from 'cluster';

import {
  //Router,
  Request,
  Response,
  //NextFunction
} from 'express';
//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  //httpPost,
  //response,
  //requestParam,
  //requestBody,
  //request,
  httpGet
} from "inversify-express-utils";
import { inject } from 'inversify';

import CommonConstants from '../../../../../../02_system/common/CommonConstants';

import CommonUtilities from '../../../../../../02_system/common/CommonUtilities';
import SystemUtilities from '../../../../../../02_system/common/SystemUtilities';

//import I18NManager from '../../../../../../02_system/common/managers/I18Manager';
import MiddlewareManager from '../../../../../../02_system/common/managers/MiddlewareManager';
import I18NManager from '../../../../../../02_system/common/managers/I18Manager';

import SYSRouteService from '../../../../../../02_system/common/database/master/services/SYSRouteService';

//import Dev798ServicesController from '../../../../services/v1/Dev798Service.controller';

const debug = require( 'debug' )( 'Dev798.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + Dev798Controller._BASE_PATH )
export default class Dev798Controller {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/v1/business/dev798/example";

  static readonly _ROUTE_INFO = [
                                  { Path: Dev798Controller._BASE_PATH + "/", Action: "v1.business.dev798.example.get", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Example dev000 end point" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of Dev798Controller._ROUTE_INFO ) {

        await SYSRouteService.createOrUpdateRouteAndRoles( routeInfo.AccessKind,
                                                           routeInfo.RequestKind,
                                                           routeInfo.Path, //Path
                                                           routeInfo.Action,
                                                           routeInfo.AllowTagAccess,
                                                           routeInfo.Roles as any,
                                                           routeInfo.Description,
                                                           null,
                                                           logger );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = Dev798Controller.name + "." + this.registerInDataBase.name;

      const strMark = "7E7D37A39A79" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  @httpGet(
            "/",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated
          )
  async getDev000Example( request: Request, response: Response ) {

    const context = ( request as any ).context;

    let strLanguage = context.Language;

    const result = {
                     StatusCode: 200, //Ok
                     Code: 'SUCCESS_DEV798_EXAMPLE',
                     Message: await I18NManager.translate( strLanguage, 'Success get the information' ),
                     Mark: '78B2E1117534' + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" ),
                     LogId: null,
                     IsError: false,
                     Errors: [],
                     Warnings: [],
                     Count: 1,
                     Data: [
                             {
                               Example: "Dev798"
                             }
                           ]
                   };

    /*
    const result = await Dev798ServicesController.getDev798Example( request,
                                                                    response,
                                                                    null,
                                                                    this._controllerLogger || context.Logger );
                                                                    */

    response.status( result.StatusCode ).send( result );

  }

}