import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Follow {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userUid: string;

  @Column()
  follow: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;
}