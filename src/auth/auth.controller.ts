import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthRequest } from './models/AuthRequest';
import { IsPublic } from './decorators/is-public.decorator';
import { UserToken } from './models/UserToken';
import { CacheManagementService } from 'src/cache/cache.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(CacheManagementService)
    private readonly cacheManagement: CacheManagementService,
  ) {}

  @IsPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Req() request: AuthRequest): Promise<string> {
    const data = this.authService.login(request.user);

    const hash = await this.cacheManagement.createSession(data.access_token);

    return hash;
  }
}
