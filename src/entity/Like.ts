import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Like {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userUid: string;

  @Column()
  PostUUID: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;
}