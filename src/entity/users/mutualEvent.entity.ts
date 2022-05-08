import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../users/user.entity";

@Entity("mutual_event")
export class MutualEventEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    numberOfMutualEvents: number;

    @ManyToOne(() => UserEntity, user => user.MutualEventsWith)
    from: UserEntity;

    @ManyToOne(() => UserEntity, user => user.MutualEventsTo)
    to: UserEntity;
}