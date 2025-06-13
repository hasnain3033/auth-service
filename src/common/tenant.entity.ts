// src/common/tenant.entity.ts
import { ManyToOne, Column, BeforeInsert } from 'typeorm';
import { Developer } from '../entities/developer.entity';
import { TenantProvider } from './tenant.provider';

export abstract class TenantScoped {
  /** FK → developer who owns the row ( = tenant ) */
  @ManyToOne(() => Developer, { onDelete: 'CASCADE' })
  tenant!: Developer;

  @Column('uuid')
  tenantId!: string;

  /** Auto-fill before insert */
  @BeforeInsert()
  setTenant() {
    // pulled from AsyncLocalStorage per-request (see §2)
    this.tenantId = TenantProvider.tenantId();
  }
}
