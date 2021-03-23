import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Survey {

  @PrimaryGeneratedColumn()
  userNum: number;

  @Column()
  answer: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: string;
}