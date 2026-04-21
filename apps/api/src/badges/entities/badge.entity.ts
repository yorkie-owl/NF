import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'u_badges' })
export class BadgeEntity {
  @PrimaryColumn({ name: 'code', type: 'varchar', length: 32 })
  code!: string;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'description', type: 'varchar', length: 200, nullable: true })
  description!: string | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl!: string | null;
}
