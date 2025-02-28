import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";


@Entity()
export class Like {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userUid: string;

  @Column()
  Postuid: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;

}