import { DataSource } from 'typeorm';
import { Provider } from '@nestjs/common';
import { TenantAwareRepository } from '../common/tenant-aware.repository';
import { Otp } from 'src/entities/otp.entity';

/** Injection token – keeps the type system happy */
export const OTP_REPOSITORY = 'OTP_REPOSITORY';

/**
 * Factory that returns a Repository<User> extended
 * with tenant-aware helpers (findSafe, saveForTenant, …).
 */
export const otpRepositoryProvider: Provider = {
  provide: OTP_REPOSITORY,
  useFactory: (dataSource: DataSource) => {
    return dataSource.getRepository(Otp).extend(TenantAwareRepository);
  },
  inject: [DataSource],
};
