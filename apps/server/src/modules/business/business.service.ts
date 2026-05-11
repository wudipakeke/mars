import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.businessOrder.findMany();
  }

  create(data: { title: string; content?: string }) {
    return this.prisma.businessOrder.create({ data });
  }

  update(
    id: bigint,
    data: { title?: string; content?: string; status?: number },
  ) {
    return this.prisma.businessOrder.update({ where: { id }, data });
  }

  remove(id: bigint) {
    return this.prisma.businessOrder.delete({ where: { id } });
  }
}
