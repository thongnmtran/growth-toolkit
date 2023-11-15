import { Cacher } from '../cacher';
import { AnyFunction, AnyKey } from '../types';

export class ModuleStore<ModuleMapType extends Record<AnyKey, AnyFunction>> {
  moduleMap: ModuleMapType = {} as never;
  cacher = new Cacher();

  constructor() {
    this.getModule = this.getModule.bind(this);
    this.register = this.register.bind(this);
    this.loadModuleMap = this.loadModuleMap.bind(this);
    this.setModuleMap = this.setModuleMap.bind(this);
  }

  register<KeyType extends keyof ModuleMapType>(
    key: KeyType,
    moduleProvider: ModuleMapType[KeyType]
  ) {
    this.moduleMap[key] = moduleProvider;
  }

  loadModuleMap(moduleMap: Partial<ModuleMapType>) {
    Object.assign(this.moduleMap, moduleMap);
  }

  setModuleMap(moduleMap: ModuleMapType) {
    this.moduleMap = moduleMap;
  }

  /**
   * export const getStore = ModuleStore.inst.getModule;
   */
  getModule<KeyType extends keyof ModuleMapType>(
    key: KeyType,
    ...args: Parameters<ModuleMapType[KeyType]>
  ): ReturnType<ModuleMapType[KeyType]> {
    const params = { key, args };
    return this.cacher.call(
      ({ key, args }: typeof params) => this.moduleMap[key]?.(...args),
      [
        {
          key,
          args,
        },
      ]
    );
  }
}
