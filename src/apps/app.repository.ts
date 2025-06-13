import { DataSource } from 'typeorm';
import { Provider } from '@nestjs/common';
import { TenantAwareRepository } from '../common/tenant-aware.repository';
import { App } from 'src/entities/app.entity';

/** Injection token – keeps the type system happy */
export const APP_REPOSITORY = 'APP_REPOSITORY';

/**
 * Factory that returns a Repository<User> extended
 * with tenant-aware helpers (findSafe, saveForTenant, …).
 */
export const appRepositoryProvider: Provider = {
  provide: APP_REPOSITORY,
  useFactory: (dataSource: DataSource) => {
    return dataSource.getRepository(App).extend(TenantAwareRepository);
  },
  inject: [DataSource],
};
