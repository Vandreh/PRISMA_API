import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UserEntity } from "../entities/user.entity";

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        try {
            const user = await this.prisma.user.create({
                data: createUserDto
            });
            
            return user;
            
        } catch (error) {
            throw new HttpException(
                {
                status: HttpStatus.BAD_REQUEST,
                error: error.message,
              }, HttpStatus.BAD_REQUEST, {
                cause: error
              });
        }
    }

    async findAll(): Promise<UserEntity[]> {
        const users = await this.prisma.user.findMany()
        return users;
    }

    async findOne(id: number): Promise<UserEntity> {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });

        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const updateUser = await this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });

        return updateUser;
    }

    async remove(id: number): Promise<UserEntity> {
        const deleteUser = await this.prisma.user.delete({
            where: { id },
        });

        return deleteUser;
    }
}
