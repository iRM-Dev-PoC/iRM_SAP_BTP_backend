import { isEmpty } from 'rxjs';

export class AuthDto {
  username: string;
  password: string;
  privilleges: string[];
}
