import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostEntity } from '../entities/post.entity';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../common/errors/types/NotFoundError';

@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto): Promise<PostEntity> {
    const  { authorEmail } = createPostDto;
    delete createPostDto.authorEmail;
    const user = await this.prisma.user.findUnique({
      where: { email: authorEmail }
    });

    if (!user) { throw new NotFoundError('Author not found') }
    const data: Prisma.PostCreateInput = {
      ...createPostDto,
      author: { connect: { email: authorEmail }}
    };

    return this.prisma.post.create({ data });
  }

  async findAll(): Promise<PostEntity[]> {
    const posts = await this.prisma.post.findMany({
      include: { author: true }
    });

    if (!posts) { throw new NotFoundError('Post não encontrado')};
    
    return posts;
  }

  async findOne(id: number): Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!post) { throw new NotFoundError('Post não encontrado')};
    
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<PostEntity> {
    const post = await this.prisma.post.findUnique({
      where: { id }}
    );
    if (!post) { throw new NotFoundError('Post não encontrado')};
    
    const { authorEmail } = updatePostDto;
    if (!authorEmail) {
      return this.prisma.post.update({
        data: updatePostDto,
        where: { id }
      })
    }

    delete updatePostDto.authorEmail;

    const user = await this.prisma.user.findUnique({
      where: { email: authorEmail }
    });

    if (!user) {
      throw new NotFoundError('Author nor found.');
    }

    const data: Prisma.PostUpdateInput = {
      ...updatePostDto,
      author: {
        connect: { email: authorEmail }
      }
    };

    return this.prisma.post.update({
      where: { id },
      data,
      //Para incluir campos na resposta
      include: { author: { select: { name: true}}}
    });
  }

  async remove(id: number): Promise<PostEntity> {
    return this.prisma.post.delete({
      where: {
        id,
      },
    });
  }
}
