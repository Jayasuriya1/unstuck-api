import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { AiService } from './ai.service.js';

import { DeconstructStepDto } from './dto/deconstruct-step.dto.js';
import { DeconstructTaskDto } from './dto/deconstruct-task.dto.js';

@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
  ) {}

  @Post('deconstruct-task')
  @UseGuards(JwtAuthGuard)
  deconstructTask(
    @Req()
    request: Request & {
      user: {
        userId: string;
        email: string;
      };
    },
    @Body() dto: DeconstructTaskDto,
  ) {
    return this.aiService.deconstructTask(
      request.user.userId,
      dto.taskId,
    );
  }

  @Post('deconstruct')
  @UseGuards(JwtAuthGuard)
  deconstructStep(
    @Req()
    request: Request & {
      user: {
        userId: string;
        email: string;
      };
    },
    @Body() dto: DeconstructStepDto,
  ) {
    return this.aiService.deconstructTaskStep(
      request.user.userId,
      dto.taskId,
      dto.stepId,
    );
  }
}