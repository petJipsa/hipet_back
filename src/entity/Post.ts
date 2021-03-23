import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Post {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userNum: number;

  @Column({ default: 0 })
  like: number;

  @Column()
  property: number;

  @Column()
  media: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: string;
}