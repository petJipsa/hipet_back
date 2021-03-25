import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Post {

  @PrimaryGeneratedColumn('uuid')
  UUID: string;

  @Column()
  userUid: string;

  @Column({ default: 0 })
  like: number;

  @Column()
  property: number;

  @Column()
  media: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: string;
}