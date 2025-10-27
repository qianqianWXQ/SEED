import { PrismaClient } from '../generated/prisma/client';
import path from 'path';

// 使用Node.js的path模块动态计算数据库文件的绝对路径
// 这样既避免硬编码的绝对路径，又能确保路径的正确性和项目的可迁移性
const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: `file:${dbPath}?mode=rwc&cache=shared&fk=1`
    }
  }
});

export default prisma;
export { PrismaClient };