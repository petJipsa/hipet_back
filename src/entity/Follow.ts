import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Follow {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userNum: number;

  @Column()
  follow: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;
}