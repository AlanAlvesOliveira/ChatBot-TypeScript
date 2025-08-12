import { Table, Column, Model, AutoIncrement, Default, AllowNull, Unique, PrimaryKey, DataType } from 'sequelize-typescript';

@Table({
    tableName: 'sessions', // ou o nome da sua tabela
    timestamps: false, // desativa os campos padrão createdAt e updatedAt
    paranoid: false // desativa o soft delete (campo deletedAt)
})
export class Interaction extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @AllowNull(true)
    @Unique
    @Column(DataType.STRING(100))
    composedSessionId!: string | null;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    idInteraction!: string;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    sessionStatus!: string;

    @AllowNull(true)
    @Column(DataType.STRING(50))
    statusAntigo!: string | null;

    @AllowNull(true)
    @Column(DataType.STRING(255))
    messageId!: string | null;

    @AllowNull(true)
    @Column(DataType.STRING(100))
    ipServidor!: string | null;

    @AllowNull(false)
    @Column(DataType.STRING(10))
    tipoFila!: string;

    @AllowNull(false)
    @Default(false)
    @Column(DataType.BOOLEAN)
    aguardandoResposta!: boolean;

    @AllowNull(true)
    @Default(false)
    @Column(DataType.BOOLEAN)
    enviouAlertaFaltaInteracao!: boolean;

    @AllowNull(true)
    @Default(0)
    @Column(DataType.INTEGER)
    countAnswerError!: number;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    contactId!: string;

    @AllowNull(false)
    @Column(DataType.STRING(255))
    accountId!: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    dadosClient!: string | null;

    @AllowNull(true)
    @Column(DataType.TEXT)
    citsmart!: string | null;


    @AllowNull(true)
    @Column(DataType.TEXT)
    beneficiario!: string | null;

    @AllowNull(false)
    @Column(DataType.STRING(50))
    channelOrigem!: string;

    @AllowNull(false)
    @Default(DataType.NOW)
    @Column(DataType.DATE)
    createdAt!: Date;

    @AllowNull(true)
    @Column(DataType.DATE)
    lastInteractionDate!: Date | null;

}