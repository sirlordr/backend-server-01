
import { Router, Request, Response, NextFunction } from 'express';
import CommonUtilities from '../../../common/CommonUtilities';
import SystemUtilities from "../../../common/SystemUtilities";
import RouteService from '../../../common/database/services/RouteService';
//import { Controller, Get, Post, Param, Delete, Body, Req, Res, UseBefore } from "routing-controllers";
import {
  controller,
  //httpGet,
  httpPost,
  response,
  //requestParam,
  //requestBody,
  request,
  httpPut,
  httpGet
} from "inversify-express-utils";
import { injectable, inject } from 'inversify';
//import SecurityServiceController from '../../services/SecurityService.controller';
import CommonConstants from '../../../common/CommonConstants';
import UserServiceController from '../../services/UserService.controller';
import MiddlewareManager from "../../../common/managers/MiddlewareManager";
import { UserSessionStatus } from "../../../common/database/models/UserSessionStatus";
import I18NManager from '../../../common/managers/I18Manager';
import { ApolloError } from 'apollo-server-express';

const debug = require( 'debug' )( 'User.controller' );

//@injectable()
@controller( process.env.SERVER_ROOT_PATH + UserController._BASE_PATH )
export default class UserController {

  //AccessKind: 1 Public
  //AccessKind: 2 Authenticated
  //AccessKind: 3 Role

  //RequestKind: 1 GET
  //RequestKind: 2 POST
  //RequestKind: 3 PUT
  //RequestKind: 4 DELETE

  static readonly _TO_IOC_CONTAINER = true;

  static readonly _BASE_PATH = "/system/user";

  static readonly _ROUTE_INFO = [
                                  { Path: UserController._BASE_PATH + "/signup", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account" },
                                  //{ Path: AuthenticationController._BASE_PATH + "/signup/google", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using google account" },
                                  //{ Path: AuthenticationController._BASE_PATH + "/signup/facebook", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Create new user account using facebook account" },
                                  { Path: UserController._BASE_PATH + "/signup/activate", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Activate signup user account" },
                                  { Path: UserController._BASE_PATH + "/password/recover/code/send", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Send recover password code to registered user email or phone number" },
                                  { Path: UserController._BASE_PATH + "/password/recover", AccessKind: 1, RequestKind: 2, AllowTagAccess: "#Public#", Roles: [ "Public" ], Description: "Set the password to user account using the password recover code" },
                                  { Path: UserController._BASE_PATH + "/password/change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set the password to user using the current password" },
                                  { Path: UserController._BASE_PATH + "/email/change/token/send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change email token to the current user email or phone" },
                                  { Path: UserController._BASE_PATH + "/email/change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change email to the current user using the token" },
                                  { Path: UserController._BASE_PATH + "/phone/change/token/send", AccessKind: 2, RequestKind: 2, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Send change phone token to the current user email or phone" },
                                  { Path: UserController._BASE_PATH + "/phone/change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Change phone to the current user using the token" },
                                  { Path: UserController._BASE_PATH + "/profile", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get information about the current user" },
                                  { Path: UserController._BASE_PATH + "/profile/change", AccessKind: 2, RequestKind: 3, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Set the information about the current user, like FirstName, LastName, BirthDate" },
                                  { Path: UserController._BASE_PATH + "/session/reload", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Force reload the session information from the user, from database to cache" },
                                  { Path: UserController._BASE_PATH + "/route/allowed", AccessKind: 2, RequestKind: 1, AllowTagAccess: "#Authenticated#", Roles: [ "Authenticated" ], Description: "Get the routes allowed to current user" },
                                ]

  _controllerLogger = null;

  constructor( @inject( "appLogger" ) logger: any ) {

    this._controllerLogger = logger;

  }

  async init( logger: any ) {

    await MiddlewareManager.registerToBypassMiddlewareInterceptorsByPath( process.env.SERVER_ROOT_PATH + UserController._BASE_PATH + "/password/change" );

    await MiddlewareManager.registerToCallMiddlewareInterceptor( UserController.middlerwareInterceptorCheckRequest );

  }

  static async middlerwareInterceptorCheckRequest( strRequestKind: string,
                                                   request: any,
                                                   logger: any ):Promise<any> {

    let result = null;

    if ( strRequestKind === "rest_api" ) {

      const strLanguage = request.context ? request.context.Language: null;

      const userSessionStatus = request.context ? request.context.UserSessionStatus: null;

      if ( userSessionStatus &&
           userSessionStatus.Tag ) {

        if ( userSessionStatus.Tag.includes( "#FORCE_CHANGE_PASSSWORD#" ) ) {

          result = {
                     StatusCode: 401, //Unauthorized
                     Code: 'ERROR_USER_CHANGE_PASSWORD_REQUIRED',
                     Message: await I18NManager.translate( strLanguage, 'The user must be change the password before to continue' ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_CHANGE_PASSWORD_REQUIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The user must be change the password before to continue' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }
        else if ( userSessionStatus.Tag.includes( "#PASSSWORD_EXPIRED#" ) ) {

          result = {
                     StatusCode: 401, //Unauthorized
                     Code: 'ERROR_USER_PASSWORD_EXPIRED',
                     Message: await I18NManager.translate( strLanguage, 'The user must be change the password to before continue' ),
                     LogId: null,
                     IsError: true,
                     Errors: [
                               {
                                 Code: 'ERROR_USER_PASSWORD_EXPIRED',
                                 Message: await I18NManager.translate( strLanguage, 'The user must be change the password to before continue' ),
                                 Details: null
                               }
                             ],
                     Warnings: [],
                     Count: 0,
                     Data: []
                   }

        }

      }

    }
    else if ( strRequestKind === "graphql_api" ) {

      const strLanguage = request.context ? request.context.Language: null;

      const userSessionStatus = request.context ? request.context.UserSessionStatus: null;

      if ( userSessionStatus &&
           userSessionStatus.Tag ) {

        if ( userSessionStatus.Tag.includes( "#FORCE_CHANGE_PASSSWORD#" ) ) {

          const extensions = { StatusCode: 401, LogId: SystemUtilities.getUUIDv4() };

          result = new ApolloError(
                                    await I18NManager.translate( strLanguage, "The user must be change the password before to continue" ),
                                    "ERROR_USER_CHANGE_PASSWORD_REQUIRED",
                                    extensions
                                  );

        }
        else if ( userSessionStatus.Tag.includes( "#PASSSWORD_EXPIRED#" ) ) {

          const extensions = { StatusCode: 401, LogId: SystemUtilities.getUUIDv4() };

          result = new ApolloError(
                                    await I18NManager.translate( strLanguage, "The user must be change the password before to continue" ),
                                    "ERROR_USER_PASSWORD_EXPIRED",
                                    extensions
                                  );

        }

      }

    }

    return result;

  }

  async registerInDataBase( logger: any ) {

    try {

      for ( let routeInfo of UserController._ROUTE_INFO ) {

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

      sourcePosition.method = UserController.name + "." + this.registerInDataBase.name;

      const strMark = "68A833778764";

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
             "/signup",
             MiddlewareManager.middlewareSetContext
           )
  async signup( request: Request, response: Response ) {

    const result = await UserServiceController.signup( request,
                                                       null,
                                                       this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/signup/activate",
             MiddlewareManager.middlewareSetContext
           )
  async signupActivate( request: Request, response: Response ) {

    const result = await UserServiceController.signupActivate( request,
                                                               null,
                                                               this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover/code/send",
             MiddlewareManager.middlewareSetContext
           )
  async passwordRecoverCodeSend( request: Request, response: Response ) {

    const result = await UserServiceController.passwordRecoverCodeSend( request,
                                                                        null,
                                                                        this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/password/recover",
             MiddlewareManager.middlewareSetContext
           )
  async passwordRecover( request: Request, response: Response ) {

    const result = await UserServiceController.passwordRecover( request,
                                                                null,
                                                                this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/password/change",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async passwordChange( request: Request, response: Response ) {

    const result = await UserServiceController.passwordChange( request,
                                                               null,
                                                               this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/email/change/token/send",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
           )
  async emailChangeTokenSend( request: Request, response: Response ) {

    const result = await UserServiceController.emailChangeTokenSend( request,
                                                                     null,
                                                                     this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/email/change",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async emailChange( request: Request, response: Response ) {

    const result = await UserServiceController.emailChange( request,
                                                            null,
                                                            this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPost(
             "/phone/change/token/send",
             MiddlewareManager.middlewareSetContext,
             MiddlewareManager.middlewareCheckIsAuthenticated,
           )
  async phoneChangeTokenSend( request: Request, response: Response ) {

    const result = await UserServiceController.phoneChangeTokenSend( request,
                                                                     null,
                                                                     this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/phone/change",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async phoneChange( request: Request, response: Response ) {

    const result = await UserServiceController.phoneChange( request,
                                                            null,
                                                            this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpGet(
            "/profile",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async profile( request: Request, response: Response ) {

    const result = await UserServiceController.profile( request,
                                                        null,
                                                        this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

  @httpPut(
            "/profile/change",
            MiddlewareManager.middlewareSetContext,
            MiddlewareManager.middlewareCheckIsAuthenticated,
          )
  async profileChange( request: Request, response: Response ) {

    const result = await UserServiceController.profileChange( request,
                                                              null,
                                                              this._controllerLogger );

    response.status( result.StatusCode ).send( result );

  }

}
