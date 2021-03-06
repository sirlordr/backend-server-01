import SystemUtilities from "../../02_system/common/SystemUtilities";

import CommonTest from "./CommonTest";

export default class UserTestV1 {

  static async test_profile_at_less_one_role( headers: any,
                                              rolesToTest: string[],
                                              strCode: string,
                                              strTest: string,
                                              strFileName: string,
                                              bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userRequestServiceV1.callGetProfile( headers, {} );

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          const currentRoles = result.output.body.Data[ 0 ].Role.split( "," );

          for ( let intRoleToTestIndex = 0; intRoleToTestIndex < rolesToTest.length; intRoleToTestIndex++ ) {

            const strRoleToTest = rolesToTest[ intRoleToTestIndex ];

            for ( let intCurrentRoleIndex = 0; intCurrentRoleIndex < currentRoles.length; intCurrentRoleIndex++ ) {

              const strCurrentRole = currentRoles[ intCurrentRoleIndex ];

              if ( strCurrentRole.startsWith( strRoleToTest ) ) {

                bResult = true;
                break;

              }

            }

            if ( bResult ) {

              break;

            }

          }

        }
        else {

          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_profile_all_roles( headers: any,
                                       rolesToTest: string[],
                                       strCode: string,
                                       strTest: string,
                                       strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userRequestServiceV1.callGetProfile( headers, {} );

      const resultOfTest = []; //rolesToTest[ intRoleToTestIndex ]

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        const currentRoles = result.output.body.Data[ 0 ].Role.split( "," );

        for ( let intRoleToTestIndex = 0; intRoleToTestIndex < rolesToTest.length; intRoleToTestIndex++ ) {

          const strRoleToTest = rolesToTest[ intRoleToTestIndex ];

          for ( let intCurrentRoleIndex = 0; intCurrentRoleIndex < currentRoles.length; intCurrentRoleIndex++ ) {

            const strCurrentRole = currentRoles[ intCurrentRoleIndex ];

            if ( strCurrentRole.startsWith( strRoleToTest ) ) {

              if ( resultOfTest.includes( strRoleToTest ) === false ) {

                resultOfTest.push( rolesToTest[ intRoleToTestIndex ] );

              }

            }

          }

        }

        bResult = resultOfTest.length === rolesToTest.length;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_change_password( headers: any,
                                     userData: any,
                                     strCode: string,
                                     strTest: string,
                                     strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userRequestServiceV1.callChangePassword( headers,
                                                                               userData );

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_searchUser( headers: any,
                                params: any,
                                strCode: string,
                                strTest: string,
                                strFileName: string,
                                intConditionType: number,
                                intCount: number ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userRequestServiceV1.callSearchUser( headers,
                                                                           params );

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( intConditionType === 0 ) {       //<=

          bResult = result.output.body.Count <= intCount;

        }
        else if ( intConditionType === 1 ) {  //>=

          bResult = result.output.body.Count >= intCount;

        }
        else if ( intConditionType === 2 ) {  //===

          bResult = result.output.body.Count === intCount;

        }
        else if ( intConditionType === 3 ) {  //!==

          bResult = result.output.body.Count !== intCount;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_searchCountUser( headers: any,
                                     params: any,
                                     strCode: string,
                                     strTest: string,
                                     strFileName: string,
                                     intConditionType: number,
                                     intCount: number ): Promise<boolean> {

    let bResult = false;

    try {

      const result = await CommonTest.userRequestServiceV1.callSearchCountUser( headers,
                                                                                params );


      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( intConditionType === 0 ) {       //<=

          bResult = result.output.body.Data[ 0 ].Count <= intCount;

        }
        else if ( intConditionType === 1 ) {  //>=

          bResult = result.output.body.Data[ 0 ].Count >= intCount;

        }
        else if ( intConditionType === 2 ) {  //===

          bResult = result.output.body.Data[ 0 ].Count === intCount;

        }
        else if ( intConditionType === 3 ) {  //!==

          bResult = result.output.body.Data[ 0 ].Count !== intCount;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_deleteUser( headers: any,
                                userData: any,
                                strCode: string,
                                strTest: string,
                                strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      let userRequest = {} as any;

      if ( userData.Id ) {

        userRequest.Id = userData.Id;

      }
      else if ( userData.Name ) {

        userRequest.Name = userData.Name;

      }

      let result = await CommonTest.userRequestServiceV1.callDeleteUser( headers, userRequest ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null; //"ERROR_CANNOT_DELETE_USER"
      CommonTest.saveOutput( strFileName, result.output ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_deleteBulkUser( headers: any,
                                    userData: any,
                                    strCode: string,
                                    strTest: string,
                                    strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      let result = await CommonTest.userRequestServiceV1.callDeleteBulkUser( headers,
                                                                            userData ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null; //"ERROR_CANNOT_DELETE_USER"
      CommonTest.saveOutput( strFileName, result.output ); //"test_deleteUser_by_name_" +  userRequest.Name + "_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_disableBulkUser( headers: any,
                                     userData: any,
                                     strCode: string,
                                     strTest: string,
                                     strFileName: string,
                                     bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      let result = await CommonTest.userRequestServiceV1.callDisableBulkUser( headers,
                                                                              userData );

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

        if ( bIsFail === false ) {

          for ( let intIndex = 0; intIndex < result.output.body.Data.length; intIndex++ ) {

            if ( !result.output.body.Data[ intIndex ].Details.DisabledBy ||
                 !result.output.body.Data[ intIndex ].Details.DisabledAt ) {

              bResult = false;
              break;

            }

          }

        }

      }

    }
    catch ( error ) {

      bResult = false;

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_enableBulkUser( headers: any,
                                    userData: any,
                                    strCode: string,
                                    strTest: string,
                                    strFileName: string,
                                    bIsFail: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      let result = await CommonTest.userRequestServiceV1.callEnableBulkUser( headers, userData );

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

        if ( bIsFail === false) {

          for ( let intIndex = 0; intIndex < result.output.body.Data.length; intIndex++ ) {

            if ( result.output.body.Data[ intIndex ].Details.DisabledBy ||
                 result.output.body.Data[ intIndex ].Details.DisabledAt ) {

              bResult = false;
              break;

            }

          }

        }

      }

    }
    catch ( error ) {

      bResult = false;

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_moveBulkUser( headers: any,
                                  userData: any,
                                  strCode: string,
                                  strTest: string,
                                  strFileName: string ): Promise<boolean> {

    let bResult = false;

    try {

      let result = await CommonTest.userRequestServiceV1.callMoveBulkUser( headers, userData ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input );
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null;
      CommonTest.saveOutput( strFileName, result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user01_at_TestL01( headers: any,
                                                  strCode: string,
                                                  strTest: string,
                                                  strFileName: string ): Promise<boolean> {

    let bResult = null;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user01@TestL01";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#";
      userRequest.Business.Tag = "#UserTestV1#";
      userRequest.sysUserGroup.Create = false;    //No request create
      userRequest.sysUserGroup.Name = "TestL01";  //This group not exists
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user01@TestL01_fail"
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null; //"ERROR_USER_GROUP_NOT_FOUND"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user01@TestL01_fail"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user98_at_TestL98( headers: any,
                                                  strCode: string,
                                                  strTest: string,
                                                  strFileName: string,
                                                  bIsFail: boolean,
                                                  bCreateUserGroup: boolean,
                                                  bMustBeEmptyRoleAndTag: boolean,
                                                  bCheckGroupName: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user98@TestL98";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.Tag = "#Tag01#,#Tag02#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.Business.Role = "#Role01#,#Role02#";
      userRequest.Business.Tag = "#Tag01#,#Tag02#,#UserTestV1#";
      userRequest.sysUserGroup.Create = bCreateUserGroup;    //Ask to create
      userRequest.sysUserGroup.Id = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.ShortId = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.Name = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.Role = "#Master_L01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.sysUserGroup.Tag = "#Tag11#,#Tag12#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.sysUserGroup.Business.Tag = "#Tag11#,#Tag12#,#UserTestV1#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user98_at_TestL98_success"
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null; //"SUCCESS_USER_CREATE"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user98_at_TestL98_success"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          CommonTest.user98_at_TestL98_data = result.output.body.Data[ 0 ];

          if ( bMustBeEmptyRoleAndTag ) {

            if ( //!CommonTest.user98_at_TestL98_data.Role &&
                CommonTest.checkTokens( CommonTest.user98_at_TestL98_data.Role, "#Master_L01#" ) === false &&
                !CommonTest.user98_at_TestL98_data.Tag &&
                //!CommonTest.user98_at_TestL98_data.sysUserGroup.Role &&
                CommonTest.checkTokens( CommonTest.user98_at_TestL98_data.sysUserGroup.Role, "#Master_L01#" ) === false &&
                !CommonTest.user98_at_TestL98_data.sysUserGroup.Tag &&
                CommonTest.user98_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
                CommonTest.user98_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#,#UserTestV1#" &&
                ( bCheckGroupName === false || CommonTest.user98_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) ) {

              CommonTest.user98_at_TestL98_data.Password = userRequest.Password;
              bResult = true;

            }

          }
          else {

            //const local = CommonTest.user98_at_TestL98_data;

            if ( //CommonTest.user98_at_TestL98_data.Role === "#Master_L01#" &&
                CommonTest.checkTokens( CommonTest.user98_at_TestL98_data.Role, "#Master_L01#" ) &&
                CommonTest.user98_at_TestL98_data.Tag === "#Tag01#,#Tag02#" &&
                //CommonTest.user98_at_TestL98_data.sysUserGroup.Role === "#Master_L01#" &&
                CommonTest.checkTokens( CommonTest.user98_at_TestL98_data.sysUserGroup.Role, "#Master_L01#" ) &&
                CommonTest.user98_at_TestL98_data.sysUserGroup.Tag === "#Tag11#,#Tag12#" &&
                CommonTest.user98_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
                CommonTest.user98_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#,#UserTestV1#" &&
                ( bCheckGroupName === false || CommonTest.user98_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) ) {

              CommonTest.user98_at_TestL98_data.Password = userRequest.Password;
              bResult = true;

            }

          }

        }
        else {

          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user97_at_TestL98( headers: any,
                                                  strCode: string,
                                                  strTest: string,
                                                  strFileName: string,
                                                  bIsFail: boolean,
                                                  bCreateUserGroup: boolean,
                                                  bMustBeEmptyRoleAndTag: boolean,
                                                  bCheckGroupName: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user97@TestL98";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.Tag = "#Tag01#,#Tag02#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.Business.Role = "#Role01#,#Role02#";
      userRequest.Business.Tag = "#Tag01#,#Tag02#,#UserTestV1#";
      userRequest.sysUserGroup.Create = bCreateUserGroup;    //Ask to create
      userRequest.sysUserGroup.Id = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.ShortId = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.Name = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.Role = "#Master_L01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.sysUserGroup.Tag = "#Tag11#,#Tag12#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.sysUserGroup.Business.Tag = "#Tag01#,#Tag02#,#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user98_at_TestL98_success"
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null; //"SUCCESS_USER_CREATE"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user98_at_TestL98_success"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          CommonTest.user97_at_TestL98_data = result.output.body.Data[ 0 ];

          if ( bMustBeEmptyRoleAndTag ) {

            if ( //!CommonTest.user97_at_TestL98_data.Role &&
                CommonTest.checkTokens( CommonTest.user97_at_TestL98_data.Role, "#Master_L01#" ) === false &&
                !CommonTest.user97_at_TestL98_data.Tag &&
                //!CommonTest.user97_at_TestL98_data.sysUserGroup.Role &&
                CommonTest.checkTokens( CommonTest.user97_at_TestL98_data.sysUserGroup.Role, "#Master_L01#" ) === false &&
                !CommonTest.user97_at_TestL98_data.sysUserGroup.Tag &&
                CommonTest.user97_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
                CommonTest.user97_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#,#UserTestV1#" &&
                ( bCheckGroupName === false || CommonTest.user97_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) ) {

              CommonTest.user97_at_TestL98_data.Password = userRequest.Password;
              bResult = true;

            }

          }
          else {

            if ( //user97_at_TestL97_data.Role === "#Master_L01#" &&
                CommonTest.checkTokens( CommonTest.user97_at_TestL98_data.Role, "#Master_L01#" ) &&
                CommonTest.user97_at_TestL98_data.Tag === "#Tag01#,#Tag02#" &&
                //user97_at_TestL97_data.sysUserGroup.Role === "#Master_L01#" &&
                CommonTest.checkTokens( CommonTest.user97_at_TestL98_data.sysUserGroup.Role, "#Master_L01#" ) &&
                CommonTest.user97_at_TestL98_data.sysUserGroup.Tag === "#Tag11#,#Tag12#" &&
                CommonTest.user97_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
                CommonTest.user97_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#" &&
                ( bCheckGroupName === false || CommonTest.user97_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) ) {

              CommonTest.user97_at_TestL98_data.Password = userRequest.Password;
              bResult = true;

            }

          }

        }
        else {

          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user96_at_TestL98( headers: any,
                                                  strCode: string,
                                                  strTest: string,
                                                  strFileName: string,
                                                  bIsFail: boolean,
                                                  bCreateUserGroup: boolean,
                                                  bMustBeEmptyRoleAndTag: boolean,
                                                  bCheckGroupName: boolean ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user96@TestL98";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.Tag = "#Tag01#,#Tag02#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.Business.Role = "#Role01#,#Role02#";
      userRequest.Business.Tag = "#Tag01#,#Tag02#,#UserTestV1#";
      userRequest.sysUserGroup.Create = bCreateUserGroup;    //Ask to create
      userRequest.sysUserGroup.Id = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.ShortId = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.Name = null; //Create a group with name of user98@TestL98
      userRequest.sysUserGroup.Role = "#Master_L01#"; //This role can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.sysUserGroup.Tag = "#Tag11#,#Tag12#"; //This tag can be ignored if bMustBeEmptyRoleAndTag === true
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strFileName, result.input ); //"test_createUser_user98_at_TestL98_success"
      result && result.output ? result.output.expected = { Code: strCode, Test: strTest }: null; //"SUCCESS_USER_CREATE"
      CommonTest.saveOutput( strFileName, result.output ); //"test_createUser_user98_at_TestL98_success"

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === strCode ) {

        if ( bIsFail === false ) {

          CommonTest.user96_at_TestL98_data = result.output.body.Data[ 0 ];

          if ( bMustBeEmptyRoleAndTag ) {

            if ( //!CommonTest.user96_at_TestL98_data.Role &&
                CommonTest.checkTokens( CommonTest.user96_at_TestL98_data.Role, "#Master_L01#" ) === false &&
                !CommonTest.user96_at_TestL98_data.Tag &&
                //!CommonTest.user96_at_TestL98_data.sysUserGroup.Role &&
                CommonTest.checkTokens( CommonTest.user96_at_TestL98_data.sysUserGroup.Role, "#Master_L01#" ) === false &&
                !CommonTest.user96_at_TestL98_data.sysUserGroup.Tag &&
                CommonTest.user96_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
                CommonTest.user96_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#,#UserTestV1#" &&
                ( bCheckGroupName === false || CommonTest.user96_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) ) {

              CommonTest.user96_at_TestL98_data.Password = userRequest.Password;
              bResult = true;

            }

          }
          else {

            if ( //user96_at_TestL97_data.Role === "#Master_L01#" &&
                CommonTest.checkTokens( CommonTest.user96_at_TestL98_data.Role, "#Master_L01#" ) &&
                CommonTest.user96_at_TestL98_data.Tag === "#Tag01#,#Tag02#" &&
                //user96_at_TestL97_data.sysUserGroup.Role === "#Master_L01#" &&
                CommonTest.checkTokens( CommonTest.user96_at_TestL98_data.sysUserGroup.Role, "#Master_L01#" ) &&
                CommonTest.user96_at_TestL98_data.sysUserGroup.Tag === "#Tag11#,#Tag12#" &&
                CommonTest.user96_at_TestL98_data.Business.Role === "#Role01#,#Role02#" &&
                CommonTest.user96_at_TestL98_data.Business.Tag === "#Tag01#,#Tag02#" &&
                ( bCheckGroupName === false || CommonTest.user96_at_TestL98_data.sysUserGroup.Name === "user98@TestL98" ) ) {

              CommonTest.user96_at_TestL98_data.Password = userRequest.Password;
              bResult = true;

            }

          }

        }
        else {

          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user01_at_TestL01_success( headers: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user01@TestL01";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#"; //This roles must be NOT ignored
      userRequest.Tag = "#Tag11#,#Tag12#"; //This tags must be NOT ignored
      userRequest.Business.Role = "#Role01#,#Role02#";
      userRequest.Business.Tag = "#Tag01#,#Tag02#,#UserTestV1#";
      userRequest.sysUserGroup.Create = true;    //Ask to create
      userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
      userRequest.sysUserGroup.Role = "";  //This roles must be NOT ignored
      userRequest.sysUserGroup.Tag = ""; //This tags must be NOT ignored
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_createUser_user01_at_TestL01_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_CREATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_createUser_user01_at_TestL01_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_CREATE" ) {

        CommonTest.user01_at_TestL01_data = result.output.body.Data[ 0 ];

        if ( //CommonTest.user01_at_TestL01_data.Role === "#Master_L01#" &&
            CommonTest.checkTokens( CommonTest.user01_at_TestL01_data.Role, "#Master_L01#" ) &&
            CommonTest.user01_at_TestL01_data.Tag === "#Tag11#,#Tag12#" &&
            //!CommonTest.user01_at_TestL01_data.sysUserGroup.Role &&
            CommonTest.checkTokens( CommonTest.user01_at_TestL01_data.sysUserGroup.Role, "#Master_L01#" ) === false &&
            !CommonTest.user01_at_TestL01_data.sysUserGroup.Tag &&
            CommonTest.user01_at_TestL01_data.Business.Role === "#Role01#,#Role02#" &&
            CommonTest.user01_at_TestL01_data.Business.Tag === "#Tag01#,#Tag02#,#UserTestV1#" &&
            CommonTest.user01_at_TestL01_data.sysUserGroup.Name === "TestL01" ) {

          CommonTest.user01_at_TestL01_data.Password = userRequest.Password;
          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user01_at_TestL02_success( headers: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Id = null;
      userRequest.Name = "user01@TestL02";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L03#+#GName:TestL01#+#GName:TestL02#+#GName:TestL56#+#GName:TestL46#";
      userRequest.Business.Role = "#Role10#,#Role11#";
      userRequest.Business.Tag = "#Tag10#,#Tag11#,#UserTestV1#";
      userRequest.sysUserGroup.Create = false;         //Ask to create
      userRequest.sysUserGroup.Name = "TestL02";       //This group must exists
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_createUser_user01_at_TestL02_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_CREATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_createUser_user01_at_TestL02_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_CREATE" ) {

        CommonTest.user01_at_TestL02_data = result.output.body.Data[ 0 ];
        CommonTest.user01_at_TestL02_data.Password = userRequest.Password;
        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user02_at_TestL02_success( headers: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Id = null;
      userRequest.Name = "user02@TestL02";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L03#+#GName:TestL01#+#GName:TestL02#"; //<---- This roles must be ignored
      userRequest.Tag = "#Tag01#"; //<---- This tag must be ignored
      userRequest.Business.Role = "#Role20#,#Role21#"; //<---- This roles must be ignored
      userRequest.Business.Tag = "#Tag20#,#Tag21#,#UserTestV1#"; //<---- This roles must be ignored
      userRequest.sysUserGroup.Create = false;         //Ask to create
      userRequest.sysUserGroup.Name = "TestL02";       //This group must exists
      userRequest.sysUserGroup.Role = "#Administrator#,#BManager_L99#"; //<---- This roles must be ignored
      userRequest.sysUserGroup.Tag = "#Tag02#"; //<---- This tag must be ignored
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#"; //<---- This roles must be ignored
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_createUser_user02_at_TestL02_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_CREATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_createUser_user02_at_TestL02_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_CREATE" ) {

        CommonTest.user02_at_TestL02_data = result.output.body.Data[ 0 ];

        if ( CommonTest.user02_at_TestL02_data.Name === "user02@TestL02" &&
            CommonTest.user02_at_TestL02_data.sysUserGroup.Name === "TestL02" &&
            //!CommonTest.user02_at_TestL02_data.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL02_data.Role, "#Master_L03#+#GName:TestL01#+#GName:TestL02#" ) === false &&
            !CommonTest.user02_at_TestL02_data.Tag &&
            //!CommonTest.user02_at_TestL02_data.sysUserGroup.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL02_data.sysUserGroup.Role, "#Administrator#,#BManager_L99#" ) === false &&
            !CommonTest.user02_at_TestL02_data.sysUserGroup.Tag ) {

          CommonTest.user02_at_TestL02_data.Password = userRequest.Password;
          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user01_at_TestL01_again_fail( headers: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user01@TestL01";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#";
      userRequest.Tag = "#Tag11#,#Tag12#";
      userRequest.Business.Role = "#Role01#,#Role02#";
      userRequest.Business.Tag = "#Tag01#,#Tag02#,#UserTestV1#";
      userRequest.sysUserGroup.Create = false;    //Ask to create
      userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
      userRequest.sysUserGroup.Role = "#Administrator#,#BManager_L99#";
      userRequest.sysUserGroup.Tag = "#Tag01#,#Tag02#";
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( "test_createUser_user01_at_TestL01_again_fail", result.input );
      result && result.output ? result.output.expected = { Code: "ERROR_USER_NAME_ALREADY_EXISTS", Test: strTest }: null;
      CommonTest.saveOutput( "test_createUser_user01_at_TestL01_again_fail", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "ERROR_USER_NAME_ALREADY_EXISTS" ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user_group_TestL01_again_fail( headers: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = SystemUtilities.hashString( SystemUtilities.getUUIDv4(), 1, null );
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#";
      userRequest.Tag = "#Tag11#,#Tag12#";
      userRequest.Business.Role = "#Role01#,#Role02#";
      userRequest.Business.Tag = "#Tag01#,#Tag02#,#UserTestV1#";
      userRequest.sysUserGroup.Create = true;    //Ask to create
      userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
      userRequest.sysUserGroup.Role = "#Administrator#,#BManager_L99#";
      userRequest.sysUserGroup.Tag = "#Tag01#,#Tag02#";
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_createUser_user_group_TestL01_again_fail", result.input );
      result && result.output ? result.output.expected = { Code: "ERROR_USER_GROUP_ALREADY_EXISTS", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_createUser_user_group_TestL01_again_fail", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "ERROR_USER_GROUP_ALREADY_EXISTS" ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user02_at_TestL02_fail( headers: any, strTest: string ): Promise<boolean> {

    let bResult = null;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      //userRequestFull.Id = null;
      userRequest.Name = "user02@TestL02";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#,#Administrator#,#BManarageL01#"; //<--- This roles ignored
      userRequest.sysUserGroup.Create = false;      //No request to create, This request must be fail
      userRequest.sysUserGroup.Name = "TestL02";    //This group not exists
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_createUser_user02_at_TestL02_fail", result.input );
      result && result.output ? result.output.expected = { Code: "ERROR_CANNOT_CREATE_USER", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_createUser_user02_at_TestL02_fail", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "ERROR_CANNOT_CREATE_USER" ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user02_at_TestL01_success( headers: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user02@TestL01";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role is ignored
      userRequest.Tag = "#Tag01#,#Tag02#"; //<-- This tag is ignored
      userRequest.Business.Role = "#Role03#,#Role04#";
      userRequest.Business.Tag = "#Tag03#,#Tag04#,#UserTestV1#";
      userRequest.sysUserGroup.Create = false;
      userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
      userRequest.sysUserGroup.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role is ignored
      userRequest.sysUserGroup.Tag = "#Tag01#,#Tag02#"; //<-- This tag is ignored
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_createUser_user02_at_TestL01_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_CREATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_createUser_user02_at_TestL01_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_CREATE" ) {

        CommonTest.user02_at_TestL01_data = result.output.body.Data[ 0 ];

        if ( //!CommonTest.user02_at_TestL01_data.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL01_data.Role, "#Master_L01#,#Administrator#,#BManager_L99#" ) === false &&
            !CommonTest.user02_at_TestL01_data.Tag &&
            //!CommonTest.user02_at_TestL01_data.sysUserGroup.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL01_data.sysUserGroup.Role, "#Master_L01#,#Administrator#,#BManager_L99#" ) === false &&
            !CommonTest.user02_at_TestL01_data.sysUserGroup.Tag &&
            userRequest.Business.Role === "#Role03#,#Role04#" &&
            userRequest.Business.Tag === "#Tag03#,#Tag04#,#UserTestV1#" ) {

          CommonTest.user02_at_TestL01_data.Password = userRequest.Password;
          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_createUser_user03_at_TestL01_fail( headers: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull }; //Copy original information

      userRequest.Name = "user03@TestL01";
      userRequest.Password = "12345678";
      userRequest.Role = "#Master_L01#";
      userRequest.Business.Role = "#Role03#,#Role04#";
      userRequest.Business.Tag = "#Tag03#,#Tag04#,#UserTestV1#";
      userRequest.sysUserGroup.Create = false;
      userRequest.sysUserGroup.Name = "TestL01";    //This group not exists
      userRequest.sysUserGroup.Business.Tag = "#UserTestV1#";
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      const result = await CommonTest.userRequestServiceV1.callCreateUser( headers, userRequest ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_createUser_user03_at_TestL01_fail", result.input );
      result && result.output ? result.output.expected = { Code: "ERROR_FORBIDDEN_ACCESS", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_createUser_user03_at_TestL01_fail", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "ERROR_FORBIDDEN_ACCESS" ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user02_at_TestL02_success( headers: any, userData: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = "user99@TestL01";
      userRequest.Password = "123456789";
      userRequest.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role must be ignored
      userRequest.Tag = "#Tag01#";  //<-- This tag must be ignored
      userRequest.Comment = "Update success";
      userRequest.sysPerson = userData.sysPerson;
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
      userRequest.sysUserGroup = {} as any;
      userRequest.sysUserGroup.Create = false;
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
      userRequest.sysUserGroup.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role must be ignored
      userRequest.sysUserGroup.Tag = "#Tag01#";  //<-- This tag must be ignored
      userRequest.Business = userData.Business;
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user02_at_TestL02_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_UPDATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user02_at_TestL02_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

        CommonTest.user02_at_TestL02_data = result.output.body.Data[ 0 ];

        if ( CommonTest.user02_at_TestL02_data.Name === "user99@TestL01" &&
            CommonTest.user02_at_TestL02_data.sysUserGroup.Name === "TestL01" &&
            //!CommonTest.user02_at_TestL02_data.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL02_data.Role, "#Master_L01#,#Administrator#,#BManager_L99#" ) === false &&
            !CommonTest.user02_at_TestL02_data.Tag &&
            //!CommonTest.user02_at_TestL02_data.sysUserGroup.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL02_data.sysUserGroup.Role, "#Master_L01#,#Administrator#,#BManager_L99#" ) === false &&
            !CommonTest.user02_at_TestL02_data.sysUserGroup.Tag ) {

            CommonTest.user02_at_TestL02_data.Password = userRequest.Password;
            bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user02_at_TestL02_fail( headers: any, userData: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = "user01@TestL01";
      userRequest.Password = "123456789";
      userRequest.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role is ignored
      userRequest.Tag = "#Tag01#";  //<-- This tag is ignored
      userRequest.Comment = "Update success";
      userRequest.sysPerson = userData.sysPerson;
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
      userRequest.sysUserGroup = {} as any;
      userRequest.sysUserGroup.Create = false;
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
      userRequest.sysUserGroup.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role is ignored
      userRequest.sysUserGroup.Tag = "#Tag11#";  //<-- This tag is ignored
      userRequest.Business = userData.Business;

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user02_at_TestL02_fail", result.input );
      result && result.output ? result.output.expected = { Code: "ERROR_USER_NAME_ALREADY_EXISTS", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user02_at_TestL02_fail", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "ERROR_USER_NAME_ALREADY_EXISTS" ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user99_at_TestL01_success( headers: any, userData: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = "user02@TestL02";
      userRequest.Password = "123456789";
      userRequest.ForceChangePassword = 1;
      userRequest.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role must be ignored
      userRequest.Tag = "#Tag01#";  //<-- This tag must be ignored
      userRequest.Comment = "Update success";
      userRequest.sysPerson = userData.sysPerson;
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
      userRequest.sysUserGroup = {} as any;
      userRequest.sysUserGroup.Create = false;
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL02";    //This group already exists
      userRequest.sysUserGroup.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role must be ignored
      userRequest.sysUserGroup.Tag = "#Tag01#";  //<-- This tag must be ignored
      userRequest.Business = userData.Business;
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user99_at_TestL01_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_UPDATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user99_at_TestL01_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

        CommonTest.user02_at_TestL02_data = result.output.body.Data[ 0 ];

        if ( CommonTest.user02_at_TestL02_data.Name === "user02@TestL02" &&
            CommonTest.user02_at_TestL02_data.sysUserGroup.Name === "TestL02" &&
            //!CommonTest.user02_at_TestL02_data.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL02_data.Role, "#Master_L01#,#Administrator#,#BManager_L99#" ) === false &&
            !CommonTest.user02_at_TestL02_data.Tag &&
            //!CommonTest.user02_at_TestL02_data.sysUserGroup.Role &&
            CommonTest.checkTokens( CommonTest.user02_at_TestL02_data.sysUserGroup.Role, "#Master_L01#,#Administrator#,#BManager_L99#" ) === false &&
            !CommonTest.user02_at_TestL02_data.sysUserGroup.Tag ) {

          CommonTest.user02_at_TestL02_data.Password = userRequest.Password;
          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user01_at_TestL01_success( headers: any, userData: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      //let userRequest = {} as any;
      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = "user99@TestL02";
      userRequest.Password = "123456789";
      userRequest.Comment = "Update user success. The group is new 1";
      userRequest.sysPerson = userData.sysPerson; //Copy old person data
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName + " 1";
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName + " 2";
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 104";
      userRequest.sysUserGroup = {} as any;  //Create new group
      userRequest.sysUserGroup.Create = true;    //Ask to create
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL02";    //This group not exists
      userRequest.sysUserGroup.Role = "";
      userRequest.sysUserGroup.Tag = "";
      userRequest.Business = userData.Business;

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user01_at_TestL01_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_UPDATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user01_at_TestL01_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

        CommonTest.user01_at_TestL01_data = result.output.body.Data[ 0 ];

        if ( CommonTest.user01_at_TestL01_data.Name === "user99@TestL02" &&
             CommonTest.user01_at_TestL01_data.sysUserGroup.Name === "TestL02" ) {

          CommonTest.user01_at_TestL01_data.Password = userRequest.Password;
          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user01_at_TestL01_fail( headers: any, userData: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      //let userRequest = {} as any;
      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = userData.Name;
      userRequest.Password = "12345678";
      userRequest.Role = "#Administrator#"; //<--- This role is ignored
      userRequest.Comment = "Update user success. The group is new 1";
      userRequest.sysPerson = userData.sysPerson; //Copy old person data
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName + " 1";
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName + " 2";
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 104";
      userRequest.sysUserGroup = {} as any;  //Create new group
      userRequest.sysUserGroup.Create = false;    //Ask to create
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL01";    //This group must exists
      userRequest.sysUserGroup.Role = "#Administrator#"; //<--- This role is ignored
      userRequest.sysUserGroup.Tag = "";
      userRequest.Business = userData.Business;
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user01_at_TestL01_fail", result.input );
      result && result.output ? result.output.expected = { Code: "ERROR_USER_NOT_VALID", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user01_at_TestL01_fail", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "ERROR_USER_NOT_VALID" ) {

        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user99_at_TestL02_fail( headers: any, userData: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      //let userRequest = {} as any;
      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = "user01@TestL01";
      userRequest.Password = "12345678";
      userRequest.Role = null;
      userRequest.Comment = "Update user success. The group is new 2";
      userRequest.sysPerson = userData.sysPerson;
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
      userRequest.sysUserGroup = {} as any;
      userRequest.sysUserGroup.Create = true;    //Ask to create, Must be fail
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
      userRequest.sysUserGroup.Role = "";
      userRequest.sysUserGroup.Tag = "";
      userRequest.Business = userData.Business;
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be fail

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user02_at_TestL02_fail", result.input );
      result && result.output ? result.output.expected = { Code: "ERROR_USER_GROUP_ALREADY_EXISTS", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user02_at_TestL02_fail", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "ERROR_USER_GROUP_ALREADY_EXISTS" ) {

        //user_at_test01_data = result.output.body.Data[ 0 ];
        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user99_at_TestL02_success( headers: any, userData: any, strTest: string ): Promise<boolean> {

    let bResult = false;

    try {

      //let userRequest = {} as any;
      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = "user01@TestL01";
      userRequest.Password = "123456789";
      userRequest.Role = "#Master_L01#"; //This role must be NOT ignored
      userRequest.Tag = "#Tag01#"; //This tag must be NOT ignored
      userRequest.SessionsLimit = 1;
      userRequest.Comment = "Update success";
      userRequest.sysPerson = userData.sysPerson;
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
      userRequest.sysUserGroup = {} as any;
      userRequest.sysUserGroup.Create = false;
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL01";    //This group already exists
      userRequest.sysUserGroup.Role = ""; //This role must be NOT ignored
      userRequest.sysUserGroup.Tag = ""; //This tag must be NOT ignored
      userRequest.Business = userData.Business;
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user99_at_TestL02_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_UPDATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user99_at_TestL02_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

        CommonTest.user01_at_TestL01_data = result.output.body.Data[ 0 ];

        if ( CommonTest.user01_at_TestL01_data.Name === "user01@TestL01" &&
            CommonTest.user01_at_TestL01_data.sysUserGroup.Name === "TestL01" &&
            CommonTest.checkTokens( CommonTest.user01_at_TestL01_data.Role, "#Master_L01#" ) &&
            //!CommonTest.user01_at_TestL01_data.Role &&
            !CommonTest.user01_at_TestL01_data.sysUserGroup.Role &&
            !CommonTest.user01_at_TestL01_data.sysUserGroup.Tag ) {

          CommonTest.user01_at_TestL01_data[ "Password" ] = userRequest.Password; //Save the current password to make login later
          bResult = true;

        }

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

  static async test_updateUser_user02_at_TestL01_success( headers: any, userData: any, strTest: String ): Promise<boolean> {

    let bResult = false;

    try {

      const userRequest = { ... CommonTest.userRequestFull } as any; //Copy original information

      userRequest.Notify = "";
      userRequest.Avatar = "";
      userRequest.Id = userData.Id;
      userRequest.ShortId = "";
      userRequest.ExpireAt = "";
      userRequest.Name = "user02@TestL01";
      userRequest.Password = "123456789";
      userRequest.Role = "#Master_L01#,#Administrator#,#BManager_L99#"; //<-- This role is ignored
      userRequest.Tag = "#Tag01#";  //<-- This tag is ignored
      userRequest.Comment = "Update success";
      userRequest.sysPerson = userData.sysPerson;
      userRequest.sysPerson.FirstName = userRequest.sysPerson.FirstName.replace( " 1", "" );
      userRequest.sysPerson.LastName = userRequest.sysPerson.LastName.replace( " 2", "" );
      userRequest.sysPerson.Address = "1625 s walnut street, wa 98233, suite 102";
      userRequest.sysUserGroup = {} as any;
      userRequest.sysUserGroup.Create = false;
      userRequest.sysUserGroup.Id = "";
      userRequest.sysUserGroup.ShortId = "";
      userRequest.sysUserGroup.Name = "TestL02";    //This group already exists
      userRequest.sysUserGroup.Role = "";
      userRequest.sysUserGroup.Tag = "";
      userRequest.Business = userData.Business;
      userRequest.sysPerson.Business.Tag = "#UserTestV1#";

      let result = await CommonTest.userRequestServiceV1.callUpdateUser( headers, userRequest ); //This request must be success

      result.input.Test = strTest;
      CommonTest.saveInput( strTest + "_test_updateUser_user02_at_TestL01_success", result.input );
      result && result.output ? result.output.expected = { Code: "SUCCESS_USER_UPDATE", Test: strTest }: null;
      CommonTest.saveOutput( strTest + "_test_updateUser_user02_at_TestL01_success", result.output );

      if ( result &&
           result.output &&
           result.output.body &&
           result.output.body.Code === "SUCCESS_USER_UPDATE" ) {

        CommonTest.user02_at_TestL01_data = result.output.body.Data[ 0 ];
        CommonTest.user02_at_TestL01_data.Password = userRequest.Password;
        bResult = true;

      }

    }
    catch ( error ) {

      CommonTest.consoleLog( "Error", error );

    }

    return bResult;

  }

}
