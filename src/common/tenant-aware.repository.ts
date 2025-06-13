import { FindManyOptions, FindOptionsWhere, Repository } from 'typeorm';
import { TenantProvider } from './tenant.provider';

export class TenantAwareRepository<T> extends Repository<T> {
  findOneSafe(where: FindOptionsWhere<T>) {
    return this.findOne({
      where: { ...where, tenantId: TenantProvider.tenantId() } as any,
    });
  }
  findSafe(opts?: FindManyOptions<T>) {
    return this.find({
      ...opts,
      where: {
        ...(opts?.where || {}),
        tenantId: TenantProvider.tenantId(),
      } as any,
    });
  }
}
