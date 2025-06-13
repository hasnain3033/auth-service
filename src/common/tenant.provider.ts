import { AsyncLocalStorage } from 'node:async_hooks';
const als = new AsyncLocalStorage<{ tenantId: string }>();

export const TenantProvider = {
  run<T>(tenantId: string, fn: () => T) {
    return als.run({ tenantId }, fn);
  },
  tenantId(): string {
    const store = als.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.tenantId;
  },
};
