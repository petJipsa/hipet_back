import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
<<<<<<< refs/remotes/origin/master
import { Post } from "./Post";
=======
import {Post} from './Post';
>>>>>>> update - sorry

@Entity()
export class Like {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userUid: string;

  @Column()
<<<<<<< refs/remotes/origin/master
  PostUid: string;
=======
  Postuid: string;
>>>>>>> update - sorry

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;

<<<<<<< refs/remotes/origin/master
  @ManyToOne(()=> Post, post => post.like) post: Post[];
=======
  @ManyToOne(() => Post, post => post.like) post: Post[]; 
>>>>>>> update - sorry
}