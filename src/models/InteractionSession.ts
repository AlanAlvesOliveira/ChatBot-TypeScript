import { Table, Column, Model, AutoIncrement, Default, AllowNull, Unique, PrimaryKey, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'interactions', // ou o nome da sua tabela
    timestamps: false, // desativa os campos padrão createdAt e updatedAt
    paranoid: false // desativa o soft delete (campo deletedAt)
})
export class Interaction extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @AllowNull(false)
    @Column(DataType.STRING(10))
    tipoFila!: string;

    @AllowNull(true)
    @Column(DataType.STRING(50))
    statusAntigo!: string | null;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    sessionStatus!: string;

    @AllowNull(true)
    @Column(DataType.STRING(255))
    messageId!: string | null;

    @AllowNull(true)
    @Column(DataType.DATE)
    lastInteractionDate!: Date | null;

    @AllowNull(true)
    @Column(DataType.STRING(100))
    ipServidor!: string | null;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    idInteraction!: string;

    @AllowNull(true)
    @Default(false)
    @Column(DataType.BOOLEAN)
    enviouAlertaFaltaInteracao!: boolean;

    @AllowNull(false)
    @Default(DataType.NOW)
    @Column(DataType.DATE(6))
    createdAt!: Date;

    @AllowNull(true)
    @Default(0)
    @Column(DataType.INTEGER)
    countAnswerError!: number;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    contactId!: string;

    @AllowNull(true)
    @Unique
    @Column(DataType.STRING(100))
    composedSessionId!: string | null;

    @AllowNull(true)
    @Column(DataType.TEXT)
    citsmart!: string | null;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    channelOrigem!: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    beneficiario!: string | null;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    accountId!: string;
}