import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export default class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "varchar",
    })
    name: string

    @Column({
        type: "varchar",
        unique: true
    })
    email: string

    @Column({
        type: "varchar",
    })
    password: string

    @Column({
        type: "varchar",
        nullable: true
    })
    resetPasswordToken: string

    @Column({
        type: "timestamp",
        nullable: true
    })
    passwordResetAt: Date

    @Column({
        type: "timestamp",
        nullable: true
    })
    resetPasswordTokenExpiresAt: Date

    @CreateDateColumn()
    createdAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}