import { IsString, IsUUID } from 'class-validator';

export class RecordWithId {
  @IsString()
  @IsUUID()
  id: string;
}
