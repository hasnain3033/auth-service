import { DataSource } from 'typeorm';
import { Provider } from '@nestjs/common';
import { TenantAwareRepository } from 'src/common/tenant-aware.repository';
import { Session } from 'src/entities/session.entity';

/** Injection token – keeps the type system happy */
export const SESSION_REPOSITORY = 'SESSION_REPOSITORY';

/**
 * Factory that returns a Repository<User> extended
 * with tenant-aware helpers (findSafe, saveForTenant, …).
 */
export const sessionRepositoryProvider: Provider = {
  provide: SESSION_REPOSITORY,
  useFactory: (dataSource: DataSource) => {
    return dataSource.getRepository(Session).extend(TenantAwareRepository);
  },
  inject: [DataSource],
};
