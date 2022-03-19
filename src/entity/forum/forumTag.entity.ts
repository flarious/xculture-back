import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { TagEntity } from "../tags/tag.entity";
import { ForumEntity } from "./forum.entity";

@Entity("forum_tag")
export class ForumTagEntity {
    @PrimaryGeneratedColumn({name: "forumTag_id"})
    id: number;

    @ManyToOne(() => ForumEntity, forum => forum.tags)
    forum: ForumEntity;

    @ManyToOne(() => TagEntity, tag => tag.forumTagUsages)
    tag: TagEntity;

}