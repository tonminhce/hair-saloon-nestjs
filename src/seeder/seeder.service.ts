import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomPrismaClient } from '../extensions/CustomPrismaClient';

@Injectable()
export class SeederService implements OnModuleInit {
  private prisma: CustomPrismaClient;
  constructor(private prismaService: PrismaService) {
    this.prisma = this.prismaService.client;
  }

  async onModuleInit() {
    await this.ensureDefaultSurvey();
  }

  private async ensureDefaultSurvey() {
    const survey = await this.prisma.survey.findUnique({
      where: { id: 1 },
    });

    if (!survey) {
      await this.prisma.survey.create({
        data: {
          form_link: 'https://docs.google.com/example-default-forms/',
        },
      });
    }
  }
}
