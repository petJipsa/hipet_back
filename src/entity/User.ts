import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column()
  profile: string;

  @Column()
  name: string;

  @Column({ default: 0 })
  following: number;

  @Column({ default: 0 })
  follower: number;

  @Column({ default: 0 })
  like: number;

  @Column()
  provider: string;
}