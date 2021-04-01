import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Post } from "./Post";

@Entity()
export class Like {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  userUid: string;

  @Column()
  PostUid: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;

  @ManyToOne(()=> Post, post => post.like) post: Post[];
}