import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @Min(1)
    @Max(5)
    overwhelmLevel: number;
}