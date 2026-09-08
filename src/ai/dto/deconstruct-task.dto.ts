import { IsUUID } from 'class-validator';

export class DeconstructTaskDto {
  @IsUUID()
  taskId: string;

//   @IsUUID()
//   stepId: string;
}