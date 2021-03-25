import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Comment {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  PostUUID: string;

  @Column()
  groupNum: number;

  @Column()
  userUid: string;

  @Column()
  content: string;

  @Column()
  class: number;

  @Column()
  order: number;

  @Column({ type: 'boolean', default: false})
  isDel: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;
}