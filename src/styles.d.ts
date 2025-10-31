// CSS模块类型声明
// 解决TypeScript无法识别CSS导入的问题
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// 支持直接导入CSS文件的副作用
declare module '*.css' {
  const content: any;
  export default content;
}