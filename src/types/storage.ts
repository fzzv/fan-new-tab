export interface Serializer<T> {
  read: (raw: string) => T;
  write: (value: T) => string;
}

export interface SerializerAsync<T> {
  read: (raw: string) => Promise<T> | T;
  write: (value: T) => Promise<string> | string;
}

/**
 * 序列化器
 */
export const StorageSerializers: Record<'boolean' | 'object' | 'number' | 'any' | 'string' | 'map' | 'set' | 'date', Serializer<any>> = {
  boolean: {
    read: (v: any) => v === 'true',
    write: (v: any) => String(v),
  },
  object: {
    read: (v: any) => JSON.parse(v),
    write: (v: any) => JSON.stringify(v),
  },
  number: {
    read: (v: any) => Number.parseFloat(v),
    write: (v: any) => String(v),
  },
  any: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  string: {
    read: (v: any) => v,
    write: (v: any) => String(v),
  },
  map: {
    read: (v: any) => new Map(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from((v as Map<any, any>).entries())),
  },
  set: {
    read: (v: any) => new Set(JSON.parse(v)),
    write: (v: any) => JSON.stringify(Array.from(v as Set<any>)),
  },
  date: {
    read: (v: any) => new Date(v),
    write: (v: any) => v.toISOString(),
  },
};

export interface StorageOptions<T> {
  /**
   * 存储区域
   * sync 同步功能处于启用状态，数据会同步到谷歌账号
   * local 数据会存储在本地，并会在用户移除扩展程序时清除
   * managed 由管理策略控制，受管理的存储空间是政策安装的扩展程序的只读存储空间，由系统管理员使用开发者定义的架构和企业政策进行管理
   * session 数据保存在内存中。如果停用、重新加载或更新扩展程序，以及在浏览器重启时，系统都会清除存储空间
   */
  area?: 'sync' | 'local' | 'managed' | 'session';
  /**
   * 是否浅响应
   */
  shallow?: boolean;
  /**
   * 初始化数据
   */
  writeDefaults?: boolean;
  /**
   * 合并默认值
   */
  mergeDefaults?: boolean | ((storageValue: T, defaults: T) => T);
  /**
   * 监听 storage 变化，触发更新
   */
  listenToStorageChanges?: boolean;
  /**
   * 序列化器
   */
  serializer?: Serializer<T> | SerializerAsync<T>;
  /**
   * 错误处理
   */
  onError?: (error: unknown) => void;
}

/**
 * 异步存储
 */
export interface StorageLikeAsync {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

/**
 * 同步存储
 */
export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}
