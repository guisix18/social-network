import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserServices } from 'src/user/user.service';
import { UserPayload } from './models/UserPayload';
import { IUser } from './interface/user.interface';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';
import { UnauthorizedError } from './errors/unhauthorized.error';
import { BLOCKED_USER, LOGIN_ERROR } from './utils/auth.messages';

@Injectable()
export class AuthService {
  constructor(
    private readonly userServices: UserServices,
    private readonly jwtService: JwtService,
  ) {}

  login(user: IUser): UserToken {
    const payload: UserPayload = {
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userServices.findByEmail(email);

    console.log(user);

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!user.active) throw new UnauthorizedError(BLOCKED_USER);

      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        };
      }
    }

    throw new UnauthorizedError(LOGIN_ERROR);
  }
}
