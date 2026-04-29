import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { User } from "../entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException("Email already registered");
    const hash = await bcrypt.hash(password, 10);
    const user = await this.users.save(this.users.create({ email, password_hash: hash, role: "user" }));
    return this.issueToken(user);
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");
    return this.issueToken(user);
  }

  private issueToken(user: User) {
    const token = this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}