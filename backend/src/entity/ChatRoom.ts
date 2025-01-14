import { AfterLoad, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ChatMessage } from "./ChatMessage";
import { UserChatRoom } from "./UserChatRoom";

export enum ChatRoomType {
  ONE_TO_ONE = 'one2one',
  PUBLIC = 'public'
}

@Entity()
export class ChatRoom {

  public avatar: string = '/static/chat/group_room.png';

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 255,
    unique: true
  })
  name: string;

  @Column({
    type: 'enum',
    enum: ChatRoomType,
    default: ChatRoomType.PUBLIC
  })
  type: ChatRoomType;

  @CreateDateColumn()
  createdAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  @OneToMany(() => UserChatRoom, (member) => member.room)
  members: UserChatRoom[];

  @OneToMany(() => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

}