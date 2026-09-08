import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { GoogleGenAI } from '@google/genai';

import {
    InjectRepository,
} from '@nestjs/typeorm';

import {
    IsNull,
    Repository,
} from 'typeorm';

import { Task } from '../tasks/entities/task.entity.js';

import {
    TaskStep,
    TaskStepStatus,
} from '../task-steps/entities/task-step.entity.js';

import {
    MAX_CHILDREN_BY_OVERWHELM,
    MAX_STEP_DEPTH,
} from '../task-steps/task-step.constants.js';

import {
    deconstructionSchema,
} from './schemas/deconstruction.schema.js';


@Injectable()
export class AiService {
    private readonly ai: GoogleGenAI;

    constructor(
        private readonly configService: ConfigService,

        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,

        @InjectRepository(TaskStep)
        private readonly stepRepository: Repository<TaskStep>,
    ) {
        this.ai = new GoogleGenAI({
            apiKey:
                this.configService.getOrThrow<string>(
                    'GEMINI_API_KEY',
                ),
        });
    }


    // ----------------------------------------
    // Task-level AI breakdown
    // ----------------------------------------

    async deconstructTask(
        userId: string,
        taskId: string,
    ) {
        // 1. Verify task ownership

        const task =
            await this.taskRepository.findOne({
                where: {
                    id: taskId,
                    userId,
                },
            });

        if (!task) {
            throw new NotFoundException(
                'Task not found',
            );
        }


        // 2. Check whether task was already
        //    broken down by AI

        if (task.aiDeconstructed) {
            throw new BadRequestException(
                'This task has already been broken down by AI',
            );
        }


        // 3. Get maximum number of AI steps

        const overwhelmLevel =
            task.overwhelmLevel as keyof typeof MAX_CHILDREN_BY_OVERWHELM;

        const maxChildren =
            MAX_CHILDREN_BY_OVERWHELM[
            overwhelmLevel
            ];


        // 4. Ask Gemini

        const response =
            await this.ai.models.generateContent({
                model: 'gemini-3.1-flash-lite',

                contents: `
You are helping an overwhelmed user break down a task.

Task:
"${task.title}"

Description:
"${task.description ?? 'No description provided'}"

Overwhelm level:
${task.overwhelmLevel} out of 5

Suggest at most ${maxChildren} useful steps.

Rules:
- Write each step as a natural, clear action.
- Start with a strong action verb.
- Give enough context so the user knows exactly what to do.
- Each step should contain one meaningful action.
- Do not make steps unnecessarily tiny.
- Avoid vague phrases such as "work on", "handle", or "deal with".
- Avoid unnecessary technical jargon.
- A user should understand the step without reading the task description.
- Keep each step concise, usually one sentence.
- Suggest a realistic estimated time for each action.
- estimatedSeconds must be a positive integer.
- Do not explain anything.
- Return only the requested JSON structure.
`,

                config: {
                    responseMimeType:
                        'application/json',

                    responseSchema:
                        deconstructionSchema,
                },
            });


        // 5. Check Gemini response

        if (!response.text) {
            throw new Error(
                'Gemini returned an empty response',
            );
        }


        // 6. Parse response

        const result =
            JSON.parse(response.text);


        const suggestedSteps =
            result.steps.slice(
                0,
                maxChildren,
            );


        // 7. Delete existing top-level steps

        await this.stepRepository.delete({
            taskId,
            parentStepId: IsNull(),
        });


        // 8. Create new AI steps

        const newSteps =
            suggestedSteps.map(
                (
                    suggestedStep: {
                        title: string;
                        estimatedSeconds: number;
                    },
                    index: number,
                ) =>
                    this.stepRepository.create({
                        title:
                            suggestedStep.title,

                        description: null,

                        status:
                            TaskStepStatus.PENDING,

                        estimatedSeconds:
                            suggestedStep.estimatedSeconds,

                        actualSeconds: null,

                        depth: 1,

                        position: index,

                        taskId,

                        parentStepId: null,

                        aiDeconstructed: false,
                    }),
            );


        // 9. Save new steps

        const savedSteps =
            await this.stepRepository.save(
                newSteps,
            );


        // 10. Mark task as AI deconstructed

        task.aiDeconstructed = true;

        await this.taskRepository.save(
            task,
        );


        return savedSteps;
    }


    // ----------------------------------------
    // Step-level AI breakdown
    // ----------------------------------------

    async deconstructTaskStep(
        userId: string,
        taskId: string,
        stepId: string,
    ) {
        // 1. Verify task ownership

        const task =
            await this.taskRepository.findOne({
                where: {
                    id: taskId,
                    userId,
                },
            });

        if (!task) {
            throw new NotFoundException(
                'Task not found',
            );
        }


        // 2. Verify step belongs to task

        const step =
            await this.stepRepository.findOne({
                where: {
                    id: stepId,
                    taskId,
                },
            });

        if (!step) {
            throw new NotFoundException(
                'Task step not found',
            );
        }


        // 3. Check whether THIS step was
        //    already broken down by AI

        if (step.aiDeconstructed) {
            throw new BadRequestException(
                'This item has already been broken down by AI',
            );
        }


        // 4. Check maximum depth

        if (step.depth >= MAX_STEP_DEPTH) {
            throw new BadRequestException(
                `Cannot deconstruct a step at depth ${MAX_STEP_DEPTH}`,
            );
        }


        // 5. Calculate maximum children

        const overwhelmLevel =
            task.overwhelmLevel as keyof typeof MAX_CHILDREN_BY_OVERWHELM;

        const maxChildren =
            MAX_CHILDREN_BY_OVERWHELM[
            overwhelmLevel
            ];


        // 6. Ask Gemini

        const response =
            await this.ai.models.generateContent({
                model: 'gemini-3.1-flash-lite',

                contents: `
You are helping an overwhelmed user break down one difficult task.

Parent step:
"${step.title}"

Overwhelm level:
${task.overwhelmLevel} out of 5

Current depth:
${step.depth}

Suggest at most ${maxChildren} child actions.

Rules:
- Write each step as a natural, clear action.
- Start with a strong action verb.
- Give enough context so the user knows exactly what to do.
- Each step should contain one meaningful action.
- Do not make steps unnecessarily tiny.
- Avoid vague phrases such as "work on", "handle", or "deal with".
- Avoid unnecessary technical jargon.
- A user should understand the step without reading the parent step.
- Keep each step concise, usually one sentence.
- Suggest a realistic estimated time for each action.
- estimatedSeconds must be a positive integer.
- Do not explain anything.
- Return only the requested JSON structure.
`,

                config: {
                    responseMimeType:
                        'application/json',

                    responseSchema:
                        deconstructionSchema,
                },
            });


        // 7. Check Gemini response

        if (!response.text) {
            throw new Error(
                'Gemini returned an empty response',
            );
        }


        // 8. Parse response

        const result =
            JSON.parse(response.text);


        const suggestedSteps =
            result.steps.slice(
                0,
                maxChildren,
            );


        // 9. Delete existing direct children

        await this.stepRepository.delete({
            taskId,
            parentStepId: step.id,
        });


        // 10. Create new AI children

        const newSteps =
            suggestedSteps.map(
                (
                    suggestedStep: {
                        title: string;
                        estimatedSeconds: number;
                    },
                    index: number,
                ) =>
                    this.stepRepository.create({
                        title:
                            suggestedStep.title,

                        description: null,

                        status:
                            TaskStepStatus.PENDING,

                        estimatedSeconds:
                            suggestedStep.estimatedSeconds,

                        actualSeconds: null,

                        depth:
                            step.depth + 1,

                        position: index,

                        taskId,

                        parentStepId:
                            step.id,

                        aiDeconstructed: false,
                    }),
            );


        // 11. Save children

        const savedSteps =
            await this.stepRepository.save(
                newSteps,
            );


        // 12. Mark THIS step as AI deconstructed

        step.aiDeconstructed = true;

        await this.stepRepository.save(
            step,
        );


        return savedSteps;
    }
}