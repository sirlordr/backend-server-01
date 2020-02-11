import cluster from 'cluster';

import {
  //Router,
  Request,
  Response,
  //NextFunction
} from 'express';
import {
  controller,
  //httpGet,
  httpPost,
  //response,
  //requestParam,
  //requestBody,
  //request
} from "inversify-express-utils";
import {
  //injectable,
  inject
} from 'inversify';

import CommonConstants from '../../../common/CommonConstants';

import CommonUtilities from '../../../common/CommonUtilities';
import SystemUtilities from "../../../common/SystemUtilities";

//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import RouteService from '../../../common/database/services/RouteService';
import SecurityServiceController from '../../services/SecurityService.controller';
import MiddlewareManager from '../../../common/managers/MiddlewareManager';

const debug = require( 'debug' )( 'Authentication.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + AuthenticationController._BASE_PATH )
export default class AuthenticationController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/system/security/authentication";

  static readonly _ROUTE_INFO = [
                                  { Path: AuthenticationController._BASE_PATH + "/login", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create a new authentication token using credentials" },
                                  { Path: AuthenticationController._BASE_PATH + "/logout", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Made the authentication token invalid" },
                                  { Path: AuthenticationController._BASE_PATH + "/token/check", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Check if authentication token is valid" }
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async init( logger: any ) {

    await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( process.env.SERVER_ROOT_PATH + AuthenticationController._BASE_PATH + "/logout" );
    await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( process.env.SERVER_ROOT_PATH + AuthenticationController._BASE_PATH + "/token/check" );

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of AuthenticationController._ROUTE_INFO ) {

        await RouteService.createOrUpdateRouteAndRoles( routeInfo.AccessKind,
                                                        routeInfo.RequestKind,
                                                        routeInfo.Path, //Path
                                                        routeInfo.AllowTagAccess,
                                                        routeInfo.Roles as any,
                                                        routeInfo.Description,
                                                        null,
                                                        logger );

      }

    }
    catch ( error ) {

      const sourcePosition = CommonUtilities.getSourceCodePosition( 1 );

      sourcePosition.method = AuthenticationController.name + "." + this.registerInDataBase.name;

      const strMark = "89E2AABC167A" + ( cluster.worker && cluster.worker.id ? "-" + cluster.worker.id : "" );

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

  @httpPost(
             "/login",
             MiddlewareManager.middlewareSetContext
           )
  async login( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await SecurityServiceController.login( context.Language,
                                                          context.TimeZoneId,
                                                          context.SourceIPAddress,
                                                          context.FrontendId,
                                                          request.body.Username,
                                                          request.body.Password,
                                                          null,
                                                          context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/logout",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async logout( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await SecurityServiceController.logout( context.Language,
                                                           context.Authorization,
                                                           null,
                                                           context.Logger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/token/check",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated
           )
  async tokenCheck( request: Request, response: Response ) {

    const context = ( request as any ).context;

    const result = await SecurityServiceController.tokenCheck( context.Language,
                                                               context.Authorization,
                                                               null,
                                                               context.Logger );

    response.status( result.StatusCode ).send( result );

  }

}