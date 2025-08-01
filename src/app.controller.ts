import {Controller, Get, Render, Res} from '@nestjs/common';

@Controller()
export class AppController {

  @Get()
  @Render('auth')
  getAuthBasic() {
    return {};
  }

  @Get('auth')
  @Render('auth')
  getAuth() {
    return {};
  }

  @Get('forgotPassword')
  @Render('forgotPassword')
  getForgotPassword() {
    return {};
  }

  @Get('recoverySent')
  @Render('recoverySent')
  getRecoverySent() {
    return {};
  }

  @Get('user')
  @Render('user')
  getUser() {
    return {};
  }



  @Get('addUser')
  @Render('addUser')
  getAddUser() {
    return {};
  }


  @Get('groupView')
  @Render('groupView')
  getGroupView() {
    return {};
  }


  @Get('serviceView')
  @Render('serviceView')
  getServiceView() {
    return {};
  }

  @Get('resourceView')
  @Render('resourceView')
  getResourceView() {
    return {};
  }
}
