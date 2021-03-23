import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Comment {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  postNum: number;

  @Column()
  groupNum: number;

  @Column()
  userNum: number;

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