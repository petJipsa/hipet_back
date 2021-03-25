import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class HashTag {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  content: string;
}