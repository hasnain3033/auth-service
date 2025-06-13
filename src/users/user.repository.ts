import { DataSource } from 'typeorm';
import { Provider } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { TenantAwareRepository } from '../common/tenant-aware.repository';

/** Injection token – keeps the type system happy */
export const USER_REPOSITORY = 'USER_REPOSITORY';

/**
 * Factory that returns a Repository<User> extended
 * with tenant-aware helpers (findSafe, saveForTenant, …).
 */
export const userRepositoryProvider: Provider = {
  provide: USER_REPOSITORY,
  useFactory: (dataSource: DataSource) => {
    return dataSource.getRepository(User).extend(TenantAwareRepository);
  },
  inject: [DataSource],
};
