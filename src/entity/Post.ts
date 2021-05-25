<<<<<<< refs/remotes/origin/master
import {Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import {Like} from './Like'
=======
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Like} from './Like';
>>>>>>> update - sorry

@Entity()
export class Post {

  @PrimaryGeneratedColumn('uuid')
  UUID: string;

  @Column()
  userUid: string;

  @Column({ default: 0 })
  like: number;

  @Column({ default: 0 })
  view: number;

  @Column()
  description: string;

  @Column()
  mediaName: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: string;

<<<<<<< refs/remotes/origin/master
  @OneToMany(() => Like, like => like.post) likes: Like[];
=======
  @OneToMany(() => Like, like => like.post) likes: Like[]; 
>>>>>>> update - sorry
}