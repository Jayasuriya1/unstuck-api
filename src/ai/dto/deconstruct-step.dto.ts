import { IsUUID } from 'class-validator';

export class DeconstructStepDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  stepId: string;
}