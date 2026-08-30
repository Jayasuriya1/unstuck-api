import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateTaskStepDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    estimatedSeconds?: number;

    @IsOptional()
    @IsString()
    parentStepId?: string;

    @IsInt()
    @Min(0)
    position: number;
}