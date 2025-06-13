import { TenantProvider } from 'src/common/tenant.provider';
import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';
@EventSubscriber()
export class TenantSubscriber implements EntitySubscriberInterface {
  beforeFind(event: FindEvent<any>) {
    const tenantId = TenantProvider.tenantId();
    if (!event.queryRunner.data.ignoreTenant) {
      event.queryRunner.manager
        .createQueryBuilder()
        .andWhere(`${event.metadata.tableName}.tenant_id = :tenantId`, {
          tenantId,
        });
    }
  }
}
