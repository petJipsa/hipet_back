import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Like {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userNum: number;

  @Column()
  postNum: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;
}