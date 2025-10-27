import { PrismaClient } from '../generated/prisma/client';

// 使用内存数据库避免文件权限问题
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: 'file:memory.db?mode=memory&cache=shared&fk=1'
    }
  }
});

export default prisma;
export { PrismaClient };