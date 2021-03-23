import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Media {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  path: string;

  @Column()
  postNum: number;
}