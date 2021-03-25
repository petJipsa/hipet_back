import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class PostTag {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  PostUUID: string;

  @Column()
  tagNum: string;
}