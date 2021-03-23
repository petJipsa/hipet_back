import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  profile: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ default: 0 })
  following: number;

  @Column({ default: 0 })
  follower: number;

  @Column({ default: 0 })
  like: number;

  @Column({ default: 'none' })
  Oauth: string;
}