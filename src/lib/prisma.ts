import { PrismaClient } from '../generated/prisma/client';

// 使用绝对路径连接数据库，避免相对路径问题
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: 'file:/Users/qianqian/code/temp/zijie/seed/prisma/dev.db?mode=rwc&cache=shared&fk=1'
    }
  }
});

export default prisma;
export { PrismaClient };