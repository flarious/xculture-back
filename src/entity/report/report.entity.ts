import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('report')              // create a table name events
export class ReportEntity {
    
        @PrimaryGeneratedColumn({ name: "report_id" })
        id: number;


        @Column()
        report_categories: string;


        @Column()
        Add_Detail: string;


        @Column()
        User_ID: number;


        @Column()
        Target_ID: number;


        @Column()
        Target_Type: string;


}