import { Body, Controller, Get, Post, UseGuards, Req } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

class CredsDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
}

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("signup")
  signup(@Body() body: CredsDto) {
    return this.auth.signup(body.email, body.password);
  }

  @Post("login")
  login(@Body() body: CredsDto) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: any) {
    return req.user;
  }
}